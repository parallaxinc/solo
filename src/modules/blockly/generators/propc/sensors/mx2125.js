/*
 *   TERMS OF USE: MIT License
 *
 *   Permission is hereby granted, free of charge, to any person obtaining a
 *   copy of this software and associated documentation files (the "Software"),
 *   to deal in the Software without restriction, including without limitation
 *   the rights to use, copy, modify, merge, publish, distribute, sublicense,
 *   and/or sell copies of the Software, and to permit persons to whom the
 *   Software is furnished to do so, subject to the following conditions:
 *
 *   The above copyright notice and this permission notice shall be included in
 *   all copies or substantial portions of the Software.
 *
 *   THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *   IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *   FITNESS FOR A PARTICULAR PURPOSE AND NONINFINGEMENT. IN NO EVENT SHALL
 *   THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *   LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 *   FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 *   DEALINGS IN THE SOFTWARE.
 */

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {getDefaultProfile} from '../../../../project';

// -------------Memsic Tilt/Accel (MX2125 Module) -------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.MX2125_acceleration_xaxis.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string, setToOther: *,
 *  domToMutation: *
 *  }}
 */
Blockly.Blocks.MX2125_acceleration_xaxis = {
  helpUrl: Blockly.MSG_MEMSIC_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MX2125_ACCELERATION_XAXIS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.chan = ['x', 'X'];
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    if (this.type.indexOf('yaxis') > -1) {
      this.chan = ['y', 'Y'];
    }
    this.pinChoices = ['PIN' + this.chan[1]];
    this.res = ['acceleration', 'accel'];
    if (this.type.indexOf('tilt') > -1) {
      this.res = ['tilt', 'tilt'];
    }
    this.addPinMenu('Memsic ' + this.res[0] + ' ' + this.chan[0] +
        '-axis PIN', null, 0);
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },

  /**
   * Add a pin to the block configuration
   * @param {string} label
   * @param {boolean} moveBefore
   * @param {number} pinOpt is an index into the pins array
   */
  addPinMenu: function(label, moveBefore, pinOpt) {
    const profile = getDefaultProfile();
    this.appendDummyInput('SET_PIN')
        .appendField(label, 'LABEL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat([['other', 'other']]),
            function(op) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setToOther(op, moveBefore, pinOpt);
            }), this.pinChoices[pinOpt]);
    this.moveBefore = moveBefore;
    this.otherPin[pinOpt] = false;
  },

  /**
   * Set the pin to default 'other' as defined in the board type profile
   * @param {string} op
   * @param {boolean} moveBefore
   * @param {number} pinOpt
   */
  setToOther: function(op, moveBefore, pinOpt) {
    if (op === 'other') {
      const profile = getDefaultProfile();
      this.otherPin[pinOpt] = true;
      const label = this.getFieldValue('LABEL');
      if (this.getInput('SET_PIN')) {
        this.removeInput('SET_PIN');
      }
      this.appendValueInput(this.pinChoices[pinOpt])
          .appendField(label)
          .setCheck('Number')
          .appendRange('A,' + profile.digital.toString());
      if (moveBefore) {
        this.moveInputBefore(this.pinChoices[pinOpt], moveBefore);
      } else {
        const currBlockTimeout = this;
        setTimeout(function() {
          currBlockTimeout.render();
        }, 200);
      }
    }
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      // TODO: verify that otherPin is in fact a boolean
      container.setAttribute('otherpin' +
          pinOpt, this.otherPin[pinOpt].toString());
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      const op = xmlElement.getAttribute('otherpin' + pinOpt);
      if (op === 'true') {
        this.setToOther('other', this.moveBefore, pinOpt);
      }
    }
  },
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.MX2125_acceleration_xaxis = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['include_mx2125'] = '#include "mx2125.h"';
  }
  let pin = '0';
  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, 'PIN' + this.chan[1], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue('PIN' + this.chan[1]);
  }
  return ['mx_' + this.res[1] + '(' + pin + ')', Blockly.propc.ORDER_NONE];
};

/**
 * Alias MX2125_acceleration_yaxis block to the MX2125_acceleration_xaxis block
 * @type {{
 *    init: Blockly.Blocks.MX2125_acceleration_xaxis.init,
 *    addPinMenu: *,
 *    mutationToDom: *,
 *    helpUrl: string,
 *    setToOther: *,
 *    domToMutation: *
 *  }}
 */
Blockly.Blocks.MX2125_acceleration_yaxis =
    Blockly.Blocks.MX2125_acceleration_xaxis;

/**
 * Alias the MX2125_acceleration_yaxis C code generator to the
 * MX2125_acceleration_xaxis object
 * @type {function(): (string|number)[]}
 */
Blockly.propc.MX2125_acceleration_yaxis =
    Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_tilt_xaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_xaxis = Blockly.propc.MX2125_acceleration_xaxis;
Blockly.Blocks.MX2125_tilt_yaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_yaxis = Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_rotation = {
  helpUrl: Blockly.MSG_MEMSIC_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MX2125_ROTATION_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PINX', 'PINY'];
    this.otherPin = [false, false];
    this.addPinMenu('Memsic rotation x-axis PIN', 'YAXIS', 0);
    this.addPinMenu('y-axis PIN', 'XAXIS', 1);
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },
  /**
   * Add a pin to the block configuration
   * @param {string} label
   * @param {boolean} moveBefore
   * @param {number} pinOpt is an index into the pins array
   */
  addPinMenu: function(label, moveBefore, pinOpt) {
    const profile = getDefaultProfile();
    this.appendDummyInput('SET_PIN')
        .appendField(label, 'LABEL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat([['other', 'other']]),
            function(op) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setToOther(op, moveBefore, pinOpt);
            }), this.pinChoices[pinOpt]);
    this.moveBefore = moveBefore;
    this.otherPin[pinOpt] = false;
  },

  /**
   * Set the pin to default 'other' as defined in the board type profile
   * @param {string} op
   * @param {boolean} moveBefore
   * @param {number} pinOpt
   */
  setToOther: function(op, moveBefore, pinOpt) {
    if (op === 'other') {
      const profile = getDefaultProfile();
      this.otherPin[pinOpt] = true;
      const label = this.getFieldValue('LABEL');
      if (this.getInput('SET_PIN')) {
        this.removeInput('SET_PIN');
      }
      this.appendValueInput(this.pinChoices[pinOpt])
          .appendField(label)
          .setCheck('Number')
          .appendRange('A,' + profile.digital.toString());
      if (moveBefore) {
        this.moveInputBefore(this.pinChoices[pinOpt], moveBefore);
      } else {
        const currBlockTimeout = this;
        setTimeout(function() {
          currBlockTimeout.render();
        }, 200);
      }
    }
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      // TODO: verify that otherPin is in fact a boolean
      container.setAttribute('otherpin' +
          pinOpt, this.otherPin[pinOpt].toString());
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      const op = xmlElement.getAttribute('otherpin' + pinOpt);
      if (op === 'true') {
        this.setToOther('other', this.moveBefore, pinOpt);
      }
    }
  },
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.MX2125_rotation = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['include_mx2125'] = '#include "mx2125.h"';
  }
  const pinVal = ['0', '0'];
  for (let i = 0; i < this.pinChoices.length; i++) {
    if (this.otherPin[i]) {
      pinVal[i] = Blockly.propc.valueToCode(
          this, this.pinChoices[i], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
      pinVal[i] = this.getFieldValue(this.pinChoices[i]);
    }
  }
  const code = 'mx_rotate(' + pinVal[0] + ', ' + pinVal[1] + ')';
  return [code, Blockly.propc.ORDER_NONE];
};
