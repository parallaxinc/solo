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

//
//
// --------------- Parallel LCD Blocks ----------------------------------------
//
//

/**
 *
 * @type {{
 *  init: Blockly.Blocks.parallel_lcd_init.init,
 *  setPinMenus: Blockly.Blocks.parallel_lcd_init.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.parallel_lcd_init = {
  helpUrl: Blockly.MSG_PARALLEL_LCD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DEBUG_LCD_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const mv = [
      'COLS', 'ROWS', 'RS_PIN', 'EN_PIN',
      'DATA0', 'DATA1', 'DATA2', 'DATA3',
    ];
    const m = [];
    for (let i = 0; i < 8; i++) {
      m.push(this.getFieldValue(mv[i]));
    }
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    const pinsConstantsList = this.userDefinedConstantsList_.map(
        function(value) {
          // returns an array of arrays built from the original array.
          return [value, value];
        });
    this.appendDummyInput('PINS')
        .appendField('Parallel LCD initialize columns')
        .appendField(new Blockly.FieldNumber(
            '16', null, null, 1),
        'COLS')
        .appendField('rows')
        .appendField(new Blockly.FieldNumber(
            '2', null, null, 1),
        'ROWS')
        .appendField('RS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'RS_PIN')
        .appendField('EN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'EN_PIN')
        .appendField('D0')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'DATA0')
        .appendField('D1')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'DATA1')
        .appendField('D2')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'DATA2')
        .appendField('D3')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)),
        'DATA3');
    this.setFieldValue(m[0], mv[0]);
    this.setFieldValue(m[1], mv[1]);
    for (let i = 2; i < 8; i++) {
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, mv[i]);
      } else if (m[i]) {
        this.setFieldValue(m[i], mv[i]);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.parallel_lcd_init = function() {
  if (!this.disabled) {
    const mv = [
      'COLS', 'ROWS', 'RS_PIN', 'EN_PIN',
      'DATA0', 'DATA1', 'DATA2', 'DATA3',
    ];
    const m = [];
    for (let i = 0; i < 8; i++) {
      m.push(this.getFieldValue(mv[i]));
      if (i === 1) {
        m.push('8');
      }
    }

    Blockly.propc.definitions_['include lcdParallel'] =
        '#include "lcdParallel.h"';
    Blockly.propc.global_vars_['setup_parallel_lcd'] =
        'lcdParallel *parallel_lcd;';
    Blockly.propc.setups_['setup_parallel_lcd'] =
        'parallel_lcd = lcdParallel_init(' + m.join(',') + ');';
  }

  // TODO: Filter blocks with call to getBlocksByType.
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Parallel LCD initialize') === -1) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    return '';
  }
};

/**
 * Alias the parallel_lcd_block to the debug_lcd_print object
 * @type {{
 *    init: Blockly.Blocks.debug_lcd_print.init,
 *    onchange: Blockly.Blocks.debug_lcd_print.onchange
 *  }}
 */
Blockly.Blocks.parallel_lcd_print = Blockly.Blocks.debug_lcd_print;

/**
 * Alias the parallel_lcd_block C code generator object to the
 * debug_lcd_print object
 * @type {function(): string}
 */
Blockly.propc.parallel_lcd_print = Blockly.propc.debug_lcd_print;

/**
 * Alias the parallel_lcd_number block to the debug_lcd_number block
 * @type {{
 *    init: Blockly.Blocks.debug_lcd_number.init,
 *    onchange: Blockly.Blocks.debug_lcd_number.onchange
 *  }}
 */
Blockly.Blocks.parallel_lcd_number = Blockly.Blocks.debug_lcd_number;

/**
 * Alias the parallel_lcd_number C code generator to the
 * debug_lcd_number object
 * @type {function(): string}
 */
Blockly.propc.parallel_lcd_number = Blockly.propc.debug_lcd_number;

/**
 *
 * @type {{
 *  init: Blockly.Blocks.parallel_lcd_action.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.parallel_lcd_action.onchange
 * }}
 */
Blockly.Blocks.parallel_lcd_action = {
  helpUrl: Blockly.MSG_PARALLEL_LCD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DEBUG_LCD_ACTION_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Parallel LCD command')
        .appendField(new Blockly.FieldDropdown([
          ['Display off', 'noDisplay'],
          ['Display on', 'display'],
          ['Cursor solid', 'noBlink'],
          ['Cursor blinking', 'blink'],
          ['Cursor off', 'noCursor'],
          ['Cursor on', 'cursor'],
          ['Scroll left', 'scrollDisplayLeft'],
          ['Scroll right', 'scrollDisplayRight'],
          ['Write left to right', 'leftToRight'],
          ['Write right to left', 'rightToLeft'],
          ['Right justify text', 'autoscroll'],
          ['Left justify text', 'noAutoscroll'],
        ]), 'ACTION');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Parallel LCD initialize') === -1) {
      this.setWarningText('WARNING: You must use an LCD\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.parallel_lcd_action = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Parallel LCD initialize') === -1) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    const action = this.getFieldValue('ACTION');
    return 'lcdParallel_' + action + '(parallel_lcd);\n';
  }
};

/**
 * Alias the parallel_lcd_set_cursor block to the debug_lcd_set_cursor block
 * @type {{
 *    init: Blockly.Blocks.debug_lcd_set_cursor.init,
 *    onchange: Blockly.Blocks.debug_lcd_set_cursor.onchange
 *  }}
 */
Blockly.Blocks.parallel_lcd_set_cursor = Blockly.Blocks.debug_lcd_set_cursor;

/**
 * Alias the parallel_lcd_set_cursor C code generator object to the
 * debug_lcd_set_cursor object
 * @type {function(): string}
 */
Blockly.propc.parallel_lcd_set_cursor = Blockly.propc.debug_lcd_set_cursor;

/**
 * Alias the parallel_lcd_print_multiple block to the debug_lcd_print_multiple
 * block
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_print_multiple.init,
 *  saveConnections: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  onchange: Blockly.Blocks.debug_lcd_print_multiple.onchange,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.parallel_lcd_print_multiple =
    Blockly.Blocks.debug_lcd_print_multiple;

/**
 * Alias the parallel_lcd_print_multiple C code generator object to the
 * console_print_multiple object
 * @type {function(): string}
 */
Blockly.propc.parallel_lcd_print_multiple =
    Blockly.propc.console_print_multiple;
