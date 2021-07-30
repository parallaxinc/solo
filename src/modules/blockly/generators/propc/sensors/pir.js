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

/**
 * Pyroelectric ("Passive") InfraRed Sensor (PIR Sensor)
 *
 * @type {{
 *  init: Blockly.Blocks.PIR_Sensor.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  setToOther: *,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.PIR_Sensor = {
  helpUrl: Blockly.MSG_PIR_HELPURL,

  /**
   * Initialize the PIR block
   */
  init: function() {
    this.setTooltip(Blockly.MSG_PIR_SENSOR_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    this.addPinMenu('PIR sensor PIN', null, 0);
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },

  /**
   * Mutaion to DOM element
   * @return {HTMLElement}
   */
  mutationToDom: function() {
    const container = document.createElement('mutation');
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      // TODO: verify that otherPin is in fact a boolean
      container.setAttribute('otherpin' +
          pinOpt, this.otherPin[pinOpt].toString());
    }
    return container;
  },

  /**
   * DOM element to mutation
   * @param {HTMLElement} xmlElement
   */
  domToMutation: function(xmlElement) {
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      const op = xmlElement.getAttribute('otherpin' + pinOpt);
      if (op === 'true') {
        this.setToOther('other', this.moveBefore, pinOpt);
      }
    }
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

  // setToOther: Blockly.Blocks['sensor_ping'].setToOther,
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
};

/**
 * Emit C source code for the block
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.PIR_Sensor = function() {
  let pin = '0';

  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this,
        this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue(this.pinChoices[0]);
  }
  return ['input(' + pin + ')', Blockly.propc.ORDER_ATOMIC];
};
