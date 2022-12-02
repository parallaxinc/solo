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
import {getDefaultProfile, getProjectInitialState} from '../../../project';
import {colorPalette} from '../propc';


// -------------- RGB LEDs (WS2812B module) blocks -----------------------------


/**
 * WS2821b Initialization
 *
 * @type {{
 *  init: Blockly.Blocks.ws2812b_init.init,
 *  onPinSet: Blockly.Blocks.ws2812b_init.onPinSet,
 *  onchange: Blockly.Blocks.ws2812b_init.onchange
 *  }}
 */
Blockly.Blocks.ws2812b_init = {
  init: function() {
    const profile = getDefaultProfile();
    let myTooltip = Blockly.MSG_WS2812B_INIT_TOOLTIP;
    let myHelpUrl = Blockly.MSG_WS2812B_HELPURL;

    if (getProjectInitialState().boardType.name === 'heb-wx') {
      myTooltip = Blockly.MSG_BADGE_RGB_INIT_TOOLTIP;
      myHelpUrl = Blockly.MSG_WS2812B_HELPURL;
    }

    this.setTooltip(myTooltip);
    this.setHelpUrl(myHelpUrl);
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    if (getProjectInitialState().boardType.name === 'heb-wx') {
      this.appendDummyInput()
          .appendField('RGB-LED set number of LEDs')
          .appendField(new Blockly.FieldNumber(
              '4', null, null, 1),
          'LEDNUM');
    } else {
      this.appendDummyInput()
          .appendField('RGB-LED initialize PIN')
          .appendField(new Blockly.FieldDropdown(
              profile.digital, function(myPin) {
                // eslint-disable-next-line no-invalid-this
                this.getSourceBlock().onPinSet(myPin);
              }), 'PIN')
          .appendField('number of LEDs')
          .appendField(new Blockly.FieldNumber(
              '4', null, null, 1),
          'LEDNUM')
          .appendField('type')
          .appendField(new Blockly.FieldDropdown(
              [['WS2812', 'WS2812']]),
          'TYPE');
      this.rgbPin = this.getFieldValue('PIN');
      this.onPinSet();
    }
  },

  onchange: function(event) {
    this.rgbPin = this.getFieldValue('PIN');
    if (event && (event.oldXml || event.xml)) {
      // only fire when a block got deleted or created
      this.onPinSet(null);
    }
  },

  onPinSet: function(myPin) {
    const oldPin = this.rgbPin;
    this.rgbPin = myPin;
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let i = 0; i < allBlocks.length; i++) {
      const func = allBlocks[i].rgbPins;
      const fund = allBlocks[i].onchange;
      if (func && myPin) {
        func.call(allBlocks[i], oldPin, myPin);
        if (fund) {
          fund.call(allBlocks[i], {xml: true});
        }
      } else if (func) {
        func.call(allBlocks[i]);
      }
    }
  },
};


/**
 * Generate C source code for the ws2812b_init block
 *
 * @return {string}
 */
Blockly.propc.ws2812b_init = function() {
  if (!this.disabled) {
    let pin = '';
    if (getProjectInitialState().boardType.name !== 'heb-wx') {
      pin = this.getFieldValue('PIN');
    }
    let num = window.parseInt(this.getFieldValue('LEDNUM')) || '4';

    if (num < 1) {
      num = 1;
    }
    if (num > 1500) {
      num = 1500;
    }

    Blockly.propc.definitions_['ws2812b_def'] = '#include "ws2812.h"';
    Blockly.propc.definitions_['ws2812b_sets' + pin] = '';
    const profile = getDefaultProfile();
    if (profile && profile.name !== 'heb-wx') {
      Blockly.propc.definitions_['ws2812b_sets' + pin] +=
          '#define RGB_PIN' + pin + '   ' + pin;
    }
    Blockly.propc.definitions_['ws2812b_sets' + pin] +=
        '\n#define RGB_COUNT' + pin + '   ' + num;
    Blockly.propc.global_vars_['ws2812b_array' + pin] =
        'ws2812 *ws2812b' + pin + ';\nint RGBleds' + pin + '[' + num + '];\n';
    Blockly.propc.setups_['ws2812b_init' + pin] =
        'ws2812b' + pin + ' = ws2812b_open();';
  }
  return '';
};


/**
 *
 * @type {{
 *  init: Blockly.Blocks.ws2812b_set.init,
 *  updateRGBpin: Blockly.Blocks.ws2812b_set.updateRGBpin,
 *  mutationToDom: (function(): HTMLElement),
 *  onchange: Blockly.Blocks.ws2812b_set.onchange,
 *  domToMutation: Blockly.Blocks.ws2812b_set.domToMutation,
 *  rgbPins: Blockly.Blocks.ws2812b_set.rgbPins
 * }}
 */
Blockly.Blocks.ws2812b_set = {
  init: function() {
    let myHelpUrl = Blockly.MSG_WS2812B_HELPURL;
    if (getProjectInitialState().boardType.name === 'heb-wx') {
      myHelpUrl = Blockly.MSG_BADGE_LEDS_HELPURL;
    }
    this.setHelpUrl(myHelpUrl);
    this.setTooltip(Blockly.MSG_WS2812B_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('LED')
        .setCheck('Number')
        .appendField('RGB-LED set LED number');
    this.appendValueInput('COLOR')
        .setCheck('Number')
        .appendField('to color');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
    this.rgb_pins = [];
    this.warnFlag = 0;
    if (getProjectInitialState().boardType.name !== 'heb-wx') {
      this.rgbPins();
    }
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('pinmenu', JSON.stringify(this.rgb_pins));
    if (this.getInput('RGBPIN')) {
      container.setAttribute('rgbpin', this.getFieldValue('RGB_PIN'));
    }
    return container;
  },

  domToMutation: function(xmlElement) {
    let rgbpin = xmlElement.getAttribute('rgbpin');
    this.rgb_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
    if (Array.isArray(this.rgb_pins)) {
      this.rgb_pins = this.rgb_pins.map(function(value) {
        return value[0];
      });
    }
    if (rgbpin === 'null') {
      rgbpin = null;
    }
    if (this.getInput('RGBPIN')) {
      this.removeInput('RGBPIN');
    }
    if (rgbpin) {
      this.appendDummyInput('RGBPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(
              this.rgb_pins.map(function(value) {
                return [value, value];
              })), 'RGB_PIN');
      this.setFieldValue(rgbpin, 'RGB_PIN');
    }
  },

  rgbPins: function(oldPin, newPin) {
    let currentPin = '-1';
    if (this.rgb_pins.length > 0) {
      currentPin = this.rgb_pins[0];
    }
    this.rgb_pins.length = 0;
    if (this.getInput('RGBPIN')) {
      currentPin = this.getFieldValue('RGB_PIN');
    }
    this.updateRGBpin();
    if (this.getInput('RGBPIN')) {
      this.removeInput('RGBPIN');
    }
    if (this.rgb_pins.length > 1) {
      this.appendDummyInput('RGBPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(
              this.rgb_pins.map(function(value) {
                return [value, value];
              })), 'RGB_PIN');
      if (currentPin === oldPin || oldPin === null) {
        this.setFieldValue(newPin, 'RGB_PIN');
      } else {
        if (this.getInput('RGBPIN') && currentPin !== '-1') {
          this.setFieldValue(currentPin, 'RGB_PIN');
        }
      }
    }
  },

  updateRGBpin: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    this.rgb_pins.length = 0;
    for (let i = 0; i < allBlocks.length; i++) {
      if (allBlocks[i].type === 'ws2812b_init') {
        const cp = allBlocks[i].rgbPin || allBlocks[i].getFieldValue('PIN');
        if (cp) {
          this.rgb_pins.push(cp);
        }
      }
    }
    this.rgb_pins = this.rgb_pins.sortedUnique();
  },

  onchange: function(event) {
    // Don't fire if BadgeWX
    if (event && getProjectInitialState().boardType.name !== 'heb-wx') {
      // only fire when a block got deleted or created,
      // the RGB_PIN field was changed
      if (event.type === Blockly.Events.BLOCK_CREATE ||
          event.type === Blockly.Events.BLOCK_DELETE ||
          (event.name === 'RGB_PIN' && event.blockId === this.id) ||
          this.warnFlag > 0) {
        const allBlocks = Blockly.getMainWorkspace().getAllBlocks(false);

        if (allBlocks.toString().indexOf('RGB-LED initialize') === -1) {
          this.setWarningText('WARNING: You must use an RGB-LED\ninitialize' +
              ' block at the beginning of your program!');
        } else {
          this.setWarningText(null);
          this.warnFlag--;

          if (this.getInput('RGBPIN')) {
            let allRGBpins = '';
            for (let i = 0; i < allBlocks.length; i++) {
              if (allBlocks[i].type === 'ws2812b_init') {
                allRGBpins += (allBlocks[i].rgbPin || allBlocks[i].getFieldValue('PIN')) + ',';
              }
            }

            if (allRGBpins.indexOf(this.getFieldValue('RGB_PIN')) === -1) {
              this.setWarningText('WARNING: You must use choose a new' +
                  ' PIN for this block!');
              // let all changes through long enough to ensure this
              // is set properly.
              this.warnFlag = allBlocks.length * 3;
            }
          }
        }
      }
    }
  },
};


/**
 * Generate the C source code for the ws2812b_set block
 *
 * @return {string}
 */
Blockly.propc.ws2812b_set = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  this.updateRGBpin();

  if (allBlocks.toString().indexOf('RGB-LED initialize') === -1 &&
      allBlocks.toString().indexOf('RGB-LED set number') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: RGB-LED is not initialized!\n';
  }

  const led = Blockly.propc.valueToCode(this, 'LED', Blockly.propc.ORDER_NONE);
  const color = Blockly.propc.valueToCode(
      this, 'COLOR', Blockly.propc.ORDER_NONE) || '0x555555';

  let p = '0';

  if (getProjectInitialState().boardType.name === 'heb-wx') {
    p = '';
  } else {
    if (this.rgb_pins.length > 0) {
      p = this.rgb_pins[0];
    }
    if (this.getInput('RGBPIN')) {
      p = this.getFieldValue('RGB_PIN');
    }
  }

  return `RGBleds${p}[constrainInt(${led}, 1, RGB_COUNT${p}) - 1] = ${color};\n`;
};


/**
 *
 * @type {{
 *  init: Blockly.Blocks.ws2812b_set_multiple.init,
 *  updateRGBpin: (
 *      Blockly.Blocks.ws2812b_set.updateRGBpin |
 *      Blockly.Blocks.ws2812b_set.updateRGBpin),
 *  mutationToDom: *,
 *  onchange: *,
 *  domToMutation: *,
 *  rgbPins: (
 *      Blockly.Blocks.ws2812b_set.rgbPins |
 *      Blockly.Blocks.ws2812b_set.rgbPins)
 * }}
 */
Blockly.Blocks.ws2812b_set_multiple = {
  init: function() {
    let myHelpUrl = Blockly.MSG_WS2812B_HELPURL;
    if (getProjectInitialState().boardType.name === 'heb-wx') {
      myHelpUrl = Blockly.MSG_BADGE_LEDS_HELPURL;
    }
    this.setHelpUrl(myHelpUrl);
    this.setTooltip(Blockly.MSG_WS2812B_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('START')
        .setCheck('Number')
        .appendField('RGB-LED set LEDs from');
    this.appendValueInput('END')
        .setCheck('Number')
        .appendField('to');
    this.appendValueInput('COLOR')
        .setCheck('Number')
        .appendField('to color');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
    this.rgb_pins = [];
    if (getProjectInitialState().boardType.name !== 'heb-wx') {
      this.rgbPins();
    }
  },

  mutationToDom: Blockly.Blocks['ws2812b_set'].mutationToDom,

  domToMutation: Blockly.Blocks['ws2812b_set'].domToMutation,

  rgbPins: Blockly.Blocks['ws2812b_set'].rgbPins,

  updateRGBpin: Blockly.Blocks['ws2812b_set'].updateRGBpin,

  onchange: Blockly.Blocks['ws2812b_set'].onchange,
};


/**
 *
 * @return {string}
 */
Blockly.propc.ws2812b_set_multiple = function() {
  this.updateRGBpin();
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('RGB-LED initialize') === -1 &&
      allBlocks.toString().indexOf('RGB-LED set number') &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: RGB-LED is not initialized!\n';
  }

  const start = Blockly.propc.valueToCode(
      this, 'START', Blockly.propc.ORDER_NONE);
  const end = Blockly.propc.valueToCode(
      this, 'END', Blockly.propc.ORDER_NONE);
  const color = Blockly.propc.valueToCode(
      this, 'COLOR', Blockly.propc.ORDER_NONE) || '0x555555';
  let p = '0';
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    p = '';
  } else {
    if (this.rgb_pins.length > 0) {
      p = this.rgb_pins[0];
    }
    if (this.getInput('RGBPIN')) {
      p = this.getFieldValue('RGB_PIN');
    }
  }

  let code = `for(int __ldx = ${start}; __ldx <= ${end}; __ldx++) {\n`;
  code += `  RGBleds${p}[constrainInt(__ldx, 1, RGB_COUNT${p}) - 1] = ${color};\n}\n`;

  return code;
};


/**
 *
 * @type {{
 *  init: Blockly.Blocks.ws2812b_update.init,
 *  updateRGBpin: (
 *      Blockly.Blocks.ws2812b_set.updateRGBpin |
 *      Blockly.Blocks.ws2812b_set.updateRGBpin
 *  ),
 *  mutationToDom: *,
 *  onchange: *,
 *  domToMutation: *,
 *  rgbPins: (
 *      Blockly.Blocks.ws2812b_set.rgbPins |
 *      Blockly.Blocks.ws2812b_set.rgbPins
 *  )
 * }}
 */
Blockly.Blocks.ws2812b_update = {
  init: function() {
    let myHelpUrl = Blockly.MSG_WS2812B_HELPURL;
    if (getProjectInitialState().boardType.name === 'heb-wx') {
      myHelpUrl = Blockly.MSG_BADGE_LEDS_HELPURL;
    }
    this.setHelpUrl(myHelpUrl);
    this.setTooltip(Blockly.MSG_WS2812B_UPDATE_TOOLTIP);
    this.appendDummyInput()
        .appendField('RGB-LED update LEDs');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
    this.rgb_pins = [];
    this.setColour(colorPalette.getColor('protocols'));
    if (getProjectInitialState().boardType.name !== 'heb-wx') {
      this.rgbPins();
    }
  },

  mutationToDom: Blockly.Blocks['ws2812b_set'].mutationToDom,

  domToMutation: Blockly.Blocks['ws2812b_set'].domToMutation,

  rgbPins: Blockly.Blocks['ws2812b_set'].rgbPins,

  updateRGBpin: Blockly.Blocks['ws2812b_set'].updateRGBpin,

  onchange: Blockly.Blocks['ws2812b_set'].onchange,
};


/**
 *
 * @return {string}
 */
Blockly.propc.ws2812b_update = function() {
  this.updateRGBpin();
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks(false).toString();
  if (allBlocks.indexOf('RGB-LED initialize') === -1 &&
      allBlocks.toString().indexOf('RGB-LED set number')) {
    if (getProjectInitialState().boardType.name !== 'heb-wx') {
      return '// ERROR: RGB-LED is not initialized!\n';
    } else if (!this.disabled) {
      Blockly.propc.definitions_['ws2812b_def'] = '#include "ws2812.h"';
      Blockly.propc.definitions_['ws2812b_sets'] = '#define RGB_COUNT   4';
      Blockly.propc.global_vars_['ws2812b_array'] =
          'ws2812 *ws2812b;\nint RGBleds[4];\n';
      Blockly.propc.setups_['ws2812b_init'] = 'ws2812b = ws2812b_open();';
    }
  }
  let p = '';
  if (getProjectInitialState().boardType.name !== 'heb-wx') {
    if (this.rgb_pins.length > 0) {
      p = this.rgb_pins[0];
    }
    if (this.getInput('RGBPIN')) {
      p = this.getFieldValue('RGB_PIN');
    }
  }
  return 'ws2812_set(ws2812b' + p + ', RGB_PIN' + p + ', RGBleds' +
      p + ', RGB_COUNT' + p + ');\n';
};

