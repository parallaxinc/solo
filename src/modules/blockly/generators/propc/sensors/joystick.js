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


// ---------------- 2-axis Joystick Blocks -----------------------------------

import Blockly from 'blockly/core';
import {getDefaultProfile, getProjectInitialState} from '../../../../project';
// import * as Sentry from '@sentry/browser';
import {colorPalette} from '../../propc';


/**
 * Joystick X Axis Input
 * @type {{
 *  init: Blockly.Blocks.joystick_input_yaxis.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.joystick_input_xaxis = {
  helpUrl: Blockly.MSG_JOYSTICK_HELPURL,

  init: function() {
    let profile = getDefaultProfile();

    // Trap case where profile does not define default analog pins
    if (profile.analog.length === 0) {
      const project = getProjectInitialState();
      const message = `JoystickInputYAxis: ` +
          `Empty profile analog list detected for board type ` +
          `'${project.boardType.name}'.`;
      console.log(message);
      profile = ['A0', '0'];
    }

    this.chan = this.type === 'joystick_input_yaxis' ? ['y', 'Y'] : ['x', 'X'];

    this.setTooltip(Blockly.MSG_JOYSTICK_INPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Joystick ' + this.chan[0] + '-axis A/D')
        .appendField(new Blockly.FieldDropdown(profile.analog), 'PIN' + this.chan[1]);

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 * Generate C source code for the joystick input x-axis block
 * @return {[string, number]}
 */
Blockly.propc.joystick_input_xaxis = function() {
  const pinNumber = this.getFieldValue('PIN' + this.chan[1]);

  if (!this.disabled) {
    Blockly.propc.definitions_['include abvolts'] = '#include "abvolts.h"';
  }

  const code = 'ad_in(' + pinNumber + ') * 100 / 4096';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 * Joystick Y Axis Input
 * @type {{
 *  init: Blockly.Blocks.joystick_input_yaxis.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.joystick_input_yaxis = {
  helpUrl: Blockly.MSG_JOYSTICK_HELPURL,

  init: function() {
    let profile = getDefaultProfile();

    // Trap case where profile does not define default analog pins
    if (profile.analog.length === 0) {
      const project = getProjectInitialState();
      const message = `JoystickInputYAxis: ` +
          `Empty profile analog list detected for board type ` +
          `'${project.boardType.name}'.`;
      console.log(message);
      profile = ['A0', '0'];
    }

    this.chan = this.type === 'joystick_input_yaxis' ? ['y', 'Y'] : ['x', 'X'];

    this.setTooltip(Blockly.MSG_JOYSTICK_INPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Joystick ' + this.chan[0] + '-axis A/D')
        .appendField(new Blockly.FieldDropdown(profile.analog), 'PIN' + this.chan[1]);

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 * Generate C source code for the joystick input y-axis block
 * @return {[string, number]}
 */
Blockly.propc.joystick_input_yaxis = function() {
  const pinNumber = this.getFieldValue('PIN' + this.chan[1]);

  if (!this.disabled) {
    Blockly.propc.definitions_['include abvolts'] = '#include "abvolts.h"';
  }

  return [`ad_in(${pinNumber}) * 100 / 4096`, Blockly.propc.ORDER_ATOMIC];
};

