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

//
//
//
//
// ------------------ 4x4 Keypad Blocks ----------------------------------------
//
//
//
//

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {buildConstantsList, verifyBlockTypeEnabled} from './sensors_common';
import {getDefaultProfile} from '../../../../project';

/**
 * 4x4 Keypad Initialization block
 */
Blockly.Blocks.keypad_initialize = {
  helpUrl: Blockly.MSG_KEYPAD_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_KEYPAD_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    // Prepare the Pn dropdown list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  /**
   * This is a called from within the updateConstMenu method.
   *
   * @description This method is called as a finalizer in the updateConstMenu() call. This
   * call is by reference to the method defined in the 'sound_impact_run' block. That method
   * calls setPinMenus with no parameters, which basically renders this method useless.
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue = '', newValue = '') {
    const profile = getDefaultProfile();
    const m = [];
    for (let i = 0; i < 8; i++) {
      m[i] = this.getFieldValue('P' + i.toString(10));
    }
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    const pinConstantList = this.userDefinedConstantsList_.map(function(value) {
      return [value, value];
    });
    this.appendDummyInput('PINS')
        .appendField('4x4 Keypad initialize PINS left')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P0')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P1')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P2')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P3')
        .appendField('|')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P4')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P5')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P6')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P7')
        .appendField('right');
    for (let i = 0; i < 8; i++) {
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, 'P' + i.toString(10));
      } else if (m[i]) {
        this.setFieldValue(m[i], 'P' + i.toString(10));
      }
    }
  },
};

/**
 * Keypad Initialization C code generator
 * @return {string}
 */
Blockly.propc.keypad_initialize = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    const kp = [];
    for (let k = 0; k < 8; k++) {
      kp[k] = this.getFieldValue('P' + k);
      if (profile.digital.toString().indexOf(kp[k] + ',' + kp[k]) === -1) {
        kp[k] = 'MY_' + kp[k];
      }
    }
    let keypadVars = 'int __rowPins[] = {' + kp[0] + ', ' + kp[1] + ', ' +
        kp[2] + ', ' + kp[3] + '};\n';
    keypadVars += 'int __colPins[] = {' + kp[4] + ', ' + kp[5] + ', ' +
        kp[6] + ', ' + kp[7] + '};\n';
    keypadVars += 'int __buttonVals[] = {1, 2, 3, \'A\', 4, 5, 6, \'B\', 7,' +
        ' 8, 9, \'C\', \'*\', 0, \'#\', \'D\'};\n';
    Blockly.propc.definitions_['keypad_lib'] = '#include "keypad.h"';
    Blockly.propc.global_vars_['keypad_pins'] = keypadVars;
    Blockly.propc.setups_['keypad_init'] =
        'keypad_setup(4, 4, __rowPins, __colPins, __buttonVals);';
  }
  return '';
};

/**
 * Scan the keyboard
 */
Blockly.Blocks.keypad_read = {
  helpUrl: Blockly.MSG_KEYPAD_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_KEYPAD_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('4x4 Keypad');
    this.setOutput(true, null);
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('keypad_initialize')) {
      this.setWarningText('WARNING: You must use a keypad ' +
          ' \ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.keypad_read = function() {
  if (!verifyBlockTypeEnabled('keypad_initialize')) {
    return '// ERROR: Missing Keypad initialize block!';
  } else {
    return ['keypad_read()', Blockly.propc.ORDER_ATOMIC];
  }
};
