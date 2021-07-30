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
import {getDefaultProfile, getProjectInitialState} from '../../../../project';
import {colorPalette} from '../../propc';

// ---------- Sony TV Remote (Using 40 kHz IR sensor) Blocks -----------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sirc_get.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  setToOther: *,
 *  domToMutation: *
 *  }}
 */
Blockly.Blocks.sirc_get = {
  helpUrl: Blockly.MSG_SONY_REMOTE_HELPURL,
  init: function() {
    const project = getProjectInitialState();
    this.setTooltip(Blockly.MSG_SIRC_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    if (project.boardType.name === 'heb-wx') {
      this.appendDummyInput()
          .appendField('Sony Remote value received');
    } else {
      this.addPinMenu('Sony Remote value received from PIN', null, 0);
    }
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
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
 */
Blockly.propc.sirc_get = function() {
  const project = getProjectInitialState();
  let pin = '0';
  if (project.boardType.name === 'heb-wx') {
    pin = '23';
  } else if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, 'PIN', Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue('PIN');
  }
  if (!this.disabled) {
    Blockly.propc.definitions_['sirc'] = '#include "sirc.h"';
    Blockly.propc.setups_['sirc'] = 'sirc_setTimeout(70);';
  }
  const code = 'sirc_button(' + pin + ')';
  return [code, Blockly.propc.ORDER_NONE];
};
