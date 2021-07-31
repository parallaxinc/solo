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

// ---------------- ColorPal Color Sensor Blocks -----------------------

/**
 * ColorPAL Enable
 * @type {{
 *  init: Blockly.Blocks.colorpal_enable.init,
 *  onPinSet: Blockly.Blocks.colorpal_enable.onPinSet,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.colorpal_enable.onchange
 * }}
 */
Blockly.Blocks.colorpal_enable = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_COLORPAL_ENABLE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal initialize PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital, function(myPin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().onPinSet(myPin);
            }), 'IO_PIN');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.colorPalPin = this.getFieldValue('IO_PIN');
    this.onPinSet();
  },
  onchange: function(event) {
    this.colorPalPin = this.getFieldValue('IO_PIN');
    // only fire when a block got deleted or created
    if (event && (event.type == Blockly.Events.BLOCK_CREATE ||
        event.type == Blockly.Events.BLOCK_DELETE)) {
      this.onPinSet(null);
    }
  },
  onPinSet: function(myPin) {
    const oldPin = this.colorPalPin;
    this.colorPalPin = myPin;
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let x = 0; x < allBlocks.length; x++) {
      const func = allBlocks[x].colorpalPins;
      const fund = allBlocks[x].onchange;
      if (func && myPin) {
        func.call(allBlocks[x], oldPin, myPin);
        if (fund) {
          fund.call(allBlocks[x], {xml: true});
        }
      } else if (func) {
        func.call(allBlocks[x]);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_enable = function() {
  const pin = this.getFieldValue('IO_PIN');
  if (!this.disabled) {
    Blockly.propc.definitions_['colorpal'] = '#include "colorpal.h"';
    Blockly.propc.global_vars_['colorpal' + pin] = 'colorPal *cpal' + pin + ';';
    Blockly.propc.setups_['colorpal' + pin] = 'cpal' + pin +
        ' = colorPal_open(' + pin + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.colorpal_get_colors_raw.init,
 *  colorpalPins: Blockly.Blocks.colorpal_get_colors_raw.colorpalPins,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.colorpal_get_colors_raw.onchange,
 *  domToMutation: Blockly.Blocks.colorpal_get_colors_raw.domToMutation,
 *  updateCpin: Blockly.Blocks.colorpal_get_colors_raw.updateCpin
 *  }}
 */
Blockly.Blocks.colorpal_get_colors_raw = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_RAW_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal raw colors store R in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'R_STORAGE');
    this.appendDummyInput()
        .appendField('G in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'G_STORAGE');
    this.appendDummyInput()
        .appendField('B in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'B_STORAGE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.cp_pins = [];
    this.warnFlag = 0;
    this.colorpalPins();
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.getInput('CPIN')) {
      container.setAttribute('cpin', this.getFieldValue('CP_PIN'));
    }
    container.setAttribute('pinmenu', JSON.stringify(this.cp_pins));
    return container;
  },

  domToMutation: function(xmlElement) {
    let cpin = xmlElement.getAttribute('cpin');
    this.cp_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
    if (Array.isArray(this.cp_pins)) {
      this.cp_pins = this.cp_pins.map(function(value) {
        return value[0];
      });
    }
    if (cpin === 'null') {
      cpin = null;
    }
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (cpin) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(
              this.cp_pins.map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      this.setFieldValue(cpin, 'CP_PIN');
    }
  },

  colorpalPins: function(oldPin, newPin) {
    let currentPin = '-1';
    if (this.cp_pins.length > 0) {
      currentPin = this.cp_pins[0];
    }
    this.cp_pins.length = 0;
    if (this.getInput('CPIN')) {
      currentPin = this.getFieldValue('CP_PIN');
    }
    this.updateCpin();
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (this.cp_pins.length > 1) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(this.cp_pins
              .map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      if (currentPin === oldPin || oldPin === null) {
        this.setFieldValue(newPin, 'CP_PIN');
      } else {
        if (this.getInput('CPIN') && currentPin !== '-1') {
          this.setFieldValue(currentPin, 'CP_PIN');
        }
      }
    }
  },

  updateCpin: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    this.cp_pins.length = 0;
    for (let x = 0; x < allBlocks.length; x++) {
      if (allBlocks[x].type === 'colorpal_enable') {
        const cp = allBlocks[x].colorPalPin ||
            allBlocks[x].getFieldValue('IO_PIN');
        if (cp) {
          this.cp_pins.push(cp);
        }
      }
    }
    this.cp_pins = this.cp_pins.sortedUnique();
  },
  onchange: function(event) {
    if (event) {
      // only fire when a block got deleted or created,
      // the CP_PIN field was changed
      if (event.type == Blockly.Events.BLOCK_CREATE ||
          event.type == Blockly.Events.BLOCK_DELETE ||
          (event.name === 'CP_PIN' && event.blockId === this.id) ||
          this.warnFlag > 0) {
        const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('ColorPal initialize') === -1) {
          this.setWarningText('WARNING: You must use a ColorPal\ninitialize' +
              ' block at the beginning of your program!');
        } else {
          this.setWarningText(null);
          this.warnFlag--;
          if (this.getInput('CPIN')) {
            let allCpPins = '';
            for (let x = 0; x < allBlocks.length; x++) {
              if (allBlocks[x].type === 'colorpal_enable') {
                allCpPins += (allBlocks[x].colorPalPin ||
                    allBlocks[x].getFieldValue('IO_PIN')) + ',';
              }
            }
            if (allCpPins.indexOf(this.getFieldValue('CP_PIN')) === -1) {
              this.setWarningText(
                  'WARNING: You must use choose a new PIN for this block!');
              // let all changes through long enough to ensure
              // this is set properly.
              this.warnFlag = allBlocks.length * 3;
            }
          }
        }
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_get_colors_raw = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('ColorPal initialize') === -1) {
    return '// ERROR: Missing colorPal initialize block!';
  } else {
    const r = Blockly.propc.variableDB_.getName(
        this.getFieldValue('R_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const g = Blockly.propc.variableDB_.getName(
        this.getFieldValue('G_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const b = Blockly.propc.variableDB_.getName(
        this.getFieldValue('B_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    let p = '0';
    if (this.cp_pins.length > 0) {
      p = this.cp_pins[0];
    }
    if (this.getInput('CPIN')) {
      p = this.getFieldValue('CP_PIN');
    }
    return 'colorPal_getRGB(cpal' + p + ', &' + r + ', &' + g +
        ', &' + b + ');';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.colorpal_get_colors.init,
 *  colorpalPins: (
 *    Blockly.Blocks.colorpal_get_colors_raw.colorpalPins |
 *    Blockly.Blocks.colorpal_get_colors_raw.colorpalPins
 *    ),
 *  mutationToDom: *,
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: *,
 *  updateCpin: (
 *    Blockly.Blocks.colorpal_get_colors_raw.updateCpin |
 *    Blockly.Blocks.colorpal_get_colors_raw.updateCpin
 *    )
 *  }}
 */
Blockly.Blocks.colorpal_get_colors = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal store color in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'COLOR');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.cp_pins = [];
    this.warnFlag = 0;
    this.colorpalPins();
  },
  // mutationToDom: Blockly.Blocks['colorpal_get_colors_raw'].mutationToDom,
  // domToMutation: Blockly.Blocks['colorpal_get_colors_raw'].domToMutation,
  // colorpalPins: Blockly.Blocks['colorpal_get_colors_raw'].colorpalPins,
  // updateCpin: Blockly.Blocks['colorpal_get_colors_raw'].updateCpin,
  // onchange: Blockly.Blocks['colorpal_get_colors_raw'].onchange,

  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.getInput('CPIN')) {
      container.setAttribute('cpin', this.getFieldValue('CP_PIN'));
    }
    container.setAttribute('pinmenu', JSON.stringify(this.cp_pins));
    return container;
  },

  domToMutation: function(xmlElement) {
    let cpin = xmlElement.getAttribute('cpin');
    this.cp_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
    if (Array.isArray(this.cp_pins)) {
      this.cp_pins = this.cp_pins.map(function(value) {
        return value[0];
      });
    }
    if (cpin === 'null') {
      cpin = null;
    }
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (cpin) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(
              this.cp_pins.map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      this.setFieldValue(cpin, 'CP_PIN');
    }
  },

  colorpalPins: function(oldPin, newPin) {
    let currentPin = '-1';
    if (this.cp_pins.length > 0) {
      currentPin = this.cp_pins[0];
    }
    this.cp_pins.length = 0;
    if (this.getInput('CPIN')) {
      currentPin = this.getFieldValue('CP_PIN');
    }
    this.updateCpin();
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (this.cp_pins.length > 1) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(this.cp_pins
              .map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      if (currentPin === oldPin || oldPin === null) {
        this.setFieldValue(newPin, 'CP_PIN');
      } else {
        if (this.getInput('CPIN') && currentPin !== '-1') {
          this.setFieldValue(currentPin, 'CP_PIN');
        }
      }
    }
  },

  updateCpin: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    this.cp_pins.length = 0;
    for (let x = 0; x < allBlocks.length; x++) {
      if (allBlocks[x].type === 'colorpal_enable') {
        const cp = allBlocks[x].colorPalPin ||
            allBlocks[x].getFieldValue('IO_PIN');
        if (cp) {
          this.cp_pins.push(cp);
        }
      }
    }
    this.cp_pins = this.cp_pins.sortedUnique();
  },

  onchange: function(event) {
    if (event) {
      // only fire when a block got deleted or created,
      // the CP_PIN field was changed
      if (event.type == Blockly.Events.BLOCK_CREATE ||
          event.type == Blockly.Events.BLOCK_DELETE ||
          (event.name === 'CP_PIN' && event.blockId === this.id) ||
          this.warnFlag > 0) {
        const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('ColorPal initialize') === -1) {
          this.setWarningText('WARNING: You must use a ColorPal\ninitialize' +
              ' block at the beginning of your program!');
        } else {
          this.setWarningText(null);
          this.warnFlag--;
          if (this.getInput('CPIN')) {
            let allCpPins = '';
            for (let x = 0; x < allBlocks.length; x++) {
              if (allBlocks[x].type === 'colorpal_enable') {
                allCpPins += (allBlocks[x].colorPalPin ||
                    allBlocks[x].getFieldValue('IO_PIN')) + ',';
              }
            }
            if (allCpPins.indexOf(this.getFieldValue('CP_PIN')) === -1) {
              this.setWarningText(
                  'WARNING: You must use choose a new PIN for this block!');
              // let all changes through long enough to ensure
              // this is set properly.
              this.warnFlag = allBlocks.length * 3;
            }
          }
        }
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_get_colors = function() {
  // TODO: Use getBlockByType() here
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks(false).toString();
  if (allBlocks.indexOf('ColorPal initialize') === -1) {
    return '// ERROR: Missing colorPal initialize block!';
  } else {
    const colorVar = Blockly.propc.variableDB_.getName(
        this.getFieldValue('COLOR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    if (!this.disabled) {
      Blockly.propc.global_vars_['colorpal_rr'] = 'int cpRR = 0;';
      Blockly.propc.global_vars_['colorpal_gg'] = 'int cpGG = 0;';
      Blockly.propc.global_vars_['colorpal_bb'] = 'int cpBB = 0;';
    }

    let p = '0';
    if (this.cp_pins.length > 0) {
      p = this.cp_pins[0];
    }
    if (this.getInput('CPIN')) {
      p = this.getFieldValue('CP_PIN');
    }

    return 'colorPal_getRGB(cpal' + p + ', &cpRR, &cpGG, &cpBB);\n\t' +
        colorVar + ' = colorPalRRGGBB(cpRR, cpGG, cpBB);';
  }
};
