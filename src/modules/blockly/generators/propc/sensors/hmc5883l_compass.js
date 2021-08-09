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
// -----------------------Compass (HMC5883L Module) Blocks -------------------
//
//

import Blockly from 'blockly/core';
import {getDefaultProfile} from '../../../../project';
import {colorPalette} from '../../propc';
import {verifyBlockTypeEnabled} from '../propc_common';

/**
 * HMC5883L Initialization
 */
Blockly.Blocks.HMC5883L_init = {
  helpUrl: Blockly.MSG_COMPASS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_HMC5883L_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Compass initialize SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'SCL');
    this.appendDummyInput()
        .appendField('SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'SDA');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.HMC5883L_init = function() {
  const scl = this.getFieldValue('SCL');
  const sda = this.getFieldValue('SDA');

  if (!this.disabled) {
    Blockly.propc.definitions_['HMC5883L'] = '#include "compass3d.h"';
    Blockly.propc.setups_['HMC5883L'] = 'i2c *compass_bus = i2c_newbus(' +
        scl + ', ' + sda + ', 0);\n\tcompass_init(compass_bus);';
  }
  return '';
};

/**
 *
 */
Blockly.Blocks.HMC5883L_read = {
  helpUrl: Blockly.MSG_COMPASS_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_HMC5883L_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Compass heading store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HEADING');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  /**
   * Verify that there is an init block for this read block
   */
  onchange: function() {
    // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    // if (allBlocks.indexOf('Compass initialize') === -1) {
    if (!verifyBlockTypeEnabled('HMC5883L_init')) {
      this.setWarningText('WARNING: You must use a Compass\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.HMC5883L_read = function() {
  let code = '';
  if (!verifyBlockTypeEnabled('HMC5883L_init')) {
    code += '// ERROR: Missing Compass initialize block!';
  } else {
    const storage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HEADING'),
        Blockly.VARIABLE_CATEGORY_NAME);
    if (!this.disabled) {
      Blockly.propc.global_vars_['compass_vars'] =
          'int __compX, __compY, __compZ;\nfloat __compH;\n';
    }
    code += 'compass_read(bus, &__compX, &__compY, &__compZ);\n';
    code += '__compH = atan2(((float) __compY),' +
        ' (((float) __compX)) * 180.0/PI;\n\n';
    code += 'if(__compH < 0.0) {\n\t__compH = (360.0 + __compH);\n}\n\n';
    code += '' + storage + ' = (int) __compH;';
  }
  return code;
};
