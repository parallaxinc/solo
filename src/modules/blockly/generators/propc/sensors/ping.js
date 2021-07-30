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


// ---------------- Ping))) Sensor Blocks -------------------------------------

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {getDefaultProfile} from '../../../../project';

/**
 * Ping Sensor
 * @type {{
 *  init: Blockly.Blocks.sensor_ping.init,
 *  addPinMenu: Blockly.Blocks.sensor_ping.addPinMenu,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  setToOther: Blockly.Blocks.sensor_ping.setToOther,
 *  domToMutation: Blockly.Blocks.sensor_ping.domToMutation
 *  }}
 */
Blockly.Blocks.sensor_ping = {
  helpUrl: Blockly.MSG_PING_HELPURL,

  /**
   * Initialize the ping sensor block
   */
  init: function() {
    this.setTooltip(Blockly.MSG_SENSOR_PING_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Ping))) distance in')
        .appendField(new Blockly.FieldDropdown([
          ['inches', '_inches'],
          ['cm', '_cm'],
          ['\u00B5s', ''],
        ]),
        'UNIT');

    // Mutation. Use a variable to identify the pir
    this.pinChoices = ['PIN'];
    this.otherPin = [false];

    this.addPinMenu('PIN', null, 0);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
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
 */
Blockly.propc.sensor_ping = function() {
  let pin;
  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue(this.pinChoices[0]);
  }
  const unit = this.getFieldValue('UNIT');

  if (!this.disabled) {
    Blockly.propc.definitions_['include ping'] = '#include "ping.h"';
  }

  const code = 'ping' + unit + '(' + pin + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};
