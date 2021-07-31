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
import {getDefaultProfile} from '../../../../project';
import {colorPalette} from '../../propc';

// --------------Accelerometer (MMA7455 Module) Blocks--------------------

/**
 * MMA7455 Initialization
 * @type {{
 *  init: Blockly.Blocks.MMA7455_init.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.MMA7455_init = {
  helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_MMA7455_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Accelerometer initialize CS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINZ')
        .appendField('DATA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINX')
        .appendField('CLK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINY');

    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.MMA7455_init = function() {
  const pinx = this.getFieldValue('PINX');
  const piny = this.getFieldValue('PINY');
  const pinz = this.getFieldValue('PINZ');

  if (!this.disabled) {
    Blockly.propc.definitions_['include_mma7455'] = '#include "mma7455.h"';
    Blockly.propc.global_vars_['mma_7455_tempVars'] = 'short int __tmpX,' +
        ' __tmpY, __tmpZ;';
    Blockly.propc.setups_['mma_7455'] = 'MMA7455_init(' +
        pinx + ', ' + piny + ', ' + pinz + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.MMA7455_acceleration.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.MMA7455_acceleration.onchange
 *  }}
 */
Blockly.Blocks.MMA7455_acceleration = {
  helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MMA7455_ACCELERATION_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Accelerometer store x-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'X_VAR')
        .appendField(' y-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'Y_VAR')
        .appendField(' z-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'Z_VAR');

    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Accelerometer initialize') === -1) {
      this.setWarningText('WARNING: You must use an Accelerometer\ninitialize' +
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
Blockly.propc.MMA7455_acceleration = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Accelerometer initialize') === -1) {
    code += '// ERROR: Missing Accelerometer initialize block!';
  } else {
    const xStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('X_VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    const yStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Y_VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    const zStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Z_VAR'), Blockly.VARIABLE_CATEGORY_NAME);

    code += 'MMA7455_getxyz10(&__tmpX, &__tmpY, &__tmpZ);\n';
    code += xStorage + ' = (int) __tmpX;\n' + yStorage + ' = (int) __tmpY;\n' +
        zStorage + ' = (int) __tmpZ;\n';
  }
  return code;
};
