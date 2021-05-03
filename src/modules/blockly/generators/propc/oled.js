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


// -------------- OLED Display blocks ------------------------------------------
import Blockly from 'blockly/core';
import {colorPalette} from '../propc';
import {getDefaultProfile} from '../../../project';
import {isExperimental} from '../../../utility';

/**
 * OLED Initialization
 * @type {{
 *  init: Blockly.Blocks.oled_initialize.init,
 *  setPinMenus: Blockly.Blocks.oled_initialize.setPinMenus,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.oled_initialize = {
  init: function() {
    this.resetPinLabel = 'RES';
    if (this.type === 'oled_initialize') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_initialize') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
      this.resetPinLabel = 'RST';
    }
    this.setTooltip(Blockly.MSG_OLED_INITIALIZE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    // Field order DIN, CLK, CS, D/C, RES
    this.appendDummyInput('PINS');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const mv = ['DIN', 'CLK', 'CS', 'DC', 'RES'];
    const m = [
      this.getFieldValue('DIN'),
      this.getFieldValue('CLK'),
      this.getFieldValue('CS'),
      this.getFieldValue('DC'),
      this.getFieldValue('RES'),
    ];
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    const pinsConstantsList = this.userDefinedConstantsList_.map(
        function(value) {
          return [value, value];
        });
    this.appendDummyInput('PINS')
        .appendField(this.displayKind + ' initialize')
        .appendField('DIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)), 'DIN')
        .appendField('CLK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)), 'CLK')
        .appendField('CS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)), 'CS')
        .appendField('D/C')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)), 'DC')
        .appendField(this.resetPinLabel)
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinsConstantsList)), 'RES');
    if (this.myType === 'ePaper') {
      this.getInput('PINS')
          .appendField('BUSY')
          .appendField(new Blockly.FieldDropdown(
              profile.digital.concat(pinsConstantsList)), 'BUSY');
    }
    for (let i = 0; i < 5; i++) {
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, mv[i]);
      } else if (m[i]) {
        this.setFieldValue(m[i], mv[i]);
      }
    }
  },
};

/**
 * OLED Initialization C code generator
 * @return {string}
 */
Blockly.propc.oled_initialize = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    const pin = [
      this.getFieldValue('DIN'),
      this.getFieldValue('CLK'),
      this.getFieldValue('CS'),
      this.getFieldValue('DC'),
      this.getFieldValue('RES'),
    ];
    let devType = 'ssd1331';
    let devWidthHeight = ', 96, 64';
    if (this.myType === 'ePaper') {
      devType = 'il3820';
      devWidthHeight = ', 128, 296';
      pin.push(this.getFieldValue('BUSY'));
    }
    for (let i = 0; i < pin.length; i++) {
      if (profile.digital.toString().indexOf(pin[i] + ',' + pin[i]) === -1) {
        pin[i] = 'MY_' + pin[i];
      }
    }
    if (!this.disabled) {
      Blockly.propc.global_vars_[
          this.myType + 'global'] = 'screen *' + this.myType + ';';
      Blockly.propc.definitions_[
          this.myType + 'tools'] = '#include "' + devType + '.h"';

      // Determine if this init block is inside of a function being
      // called by a new processor block
      const myRootBlock = this.getRootBlock();
      let myRootBlockName = null;
      let cogStartBlock = null;
      if (myRootBlock.type === 'procedures_defnoreturn') {
        myRootBlockName = Blockly.propc.variableDB_.getName(
            myRootBlock.getFieldValue('NAME'),
            Blockly.Procedures.NAME_TYPE,
        );

        // TODO: Refactor with getBlocksByTye
        for (let k = 0;
          k < Blockly.getMainWorkspace().getAllBlocks().length; k++) {
          const tempBlock = Blockly.getMainWorkspace().getAllBlocks(false)[k];
          if (tempBlock.type === 'procedures_callnoreturn' &&
              tempBlock.getRootBlock().type === 'cog_new') {
            if (Blockly.propc.variableDB_.getName(
                ((tempBlock.getFieldValue('NAME')).
                    split('\u201C'))[1].slice(0, -1),
                Blockly.Procedures.NAME_TYPE) === myRootBlockName) {
              cogStartBlock = myRootBlockName;
            }
          }
        }
      }

      // Keep this experimental for now.
      if (cogStartBlock && isExperimental.indexOf('volatile') > -1) {
        Blockly.propc.cog_setups_[this.myType] =
            [cogStartBlock, this.myType + ' = ' +
            devType + '_init(' + pin.join(', ') + devWidthHeight + ');\n'];
      } else {
        Blockly.propc.setups_[this.myType] = this.myType + ' = ' +
            devType + '_init(' + pin.join(', ') + devWidthHeight + ');\n';
      }
    }
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_font_loader.init,
 *  helpUrl: string
 * }}
 */
Blockly.Blocks.oled_font_loader = {
  helpUrl: Blockly.MSG_OLED_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_OLED_FONT_LOADER_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Display font loader (EEPROM only)');
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_font_loader = function() {
  Blockly.propc.definitions_['oledfonts'] = '#include "oledc_fontLoader.h"';
  return 'oledc_fontLoader();';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_clear_screen.init,
 *  onchange: Blockly.Blocks.oled_clear_screen.onchange
 * }}
 */
Blockly.Blocks.oled_clear_screen = {
  init: function() {
    if (this.type === 'oled_clear_screen') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_clear_screen') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_CLEAR_SCREEN_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField(this.displayKind + ' command')
        .appendField(new Blockly.FieldDropdown([
          ['clear screen', 'CLS'],
          ['sleep', 'SLEEP'],
          ['wake', 'WAKE'],
          ['invert colors', 'INV'],
          ['normal colors', 'NORMAL'],
          ['orient pins up', 'O-UP'],
          ['orient pins down', 'O-DOWN'],
          ['orient pins left', 'O-LEFT'],
          ['orient pins right', 'O-RIGHT'],
        ]), 'CMD');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
      this.setWarningText('WARNING: You must use an ' + this.displayKind +
          '\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_clear_screen = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const cmd = this.getFieldValue('CMD');

    let code = '';
    if (cmd === 'CLS') {
      code += 'clearDisplay(' + this.myType + ');\n';
    } else if (cmd === 'WAKE') {
      code += 'sleepWakeDisplay(' + this.myType + ', 0);\n';
    } else if (cmd === 'SLEEP') {
      code += 'sleepWakeDisplay(' + this.myType + ', 1);\n';
    } else if (cmd === 'INV') {
      code += 'invertDisplay(' + this.myType + ', 1);\n';
    } else if (cmd === 'NORMAL') {
      code += 'invertDisplay(' + this.myType + ', 0);\n';
    } else if (cmd === 'O-UP') {
      code += 'setDisplayRotation(' + this.myType + ', 0);\n';
    } else if (cmd === 'O-DOWN') {
      code += 'setDisplayRotation(' + this.myType + ', 2);\n';
    } else if (cmd === 'O-LEFT') {
      code += 'setDisplayRotation(' + this.myType + ', 1);\n';
    } else if (cmd === 'O-RIGHT') {
      code += 'setDisplayRotation(' + this.myType + ', 3);\n';
    }
    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_draw_circle.init,
 *  onchange: *
 * }}
 */
Blockly.Blocks.oled_draw_circle = {
  init: function() {
    if (this.type === 'oled_draw_circle') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_draw_circle') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_DRAW_CIRCLE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    // Center the circle at these coordinates
    this.appendValueInput('POINT_X')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw circle at (x)');
    this.appendValueInput('POINT_Y')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    // The size of the circle
    this.appendValueInput('RADIUS')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('radius');

    // Color picker control
    if (this.displayKind === 'OLED') {
      this.appendValueInput('COLOR')
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField('color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('COLOR')
          .appendField('color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'COLOR_VALUE');
    }
    // Fill the circle if checked
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('fill')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_fill');

    // Other details
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 * Generate the C source code for the OLED circle block
 * @return {string}
 */
Blockly.propc.oled_draw_circle = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const pointX0 = Blockly.propc.valueToCode(
        this, 'POINT_X', Blockly.propc.ORDER_NONE);
    const pointY0 = Blockly.propc.valueToCode(
        this, 'POINT_Y', Blockly.propc.ORDER_NONE);
    const radius = Blockly.propc.valueToCode(
        this, 'RADIUS', Blockly.propc.ORDER_NONE);

    let color = 0;

    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      // Get a string representation of the color value
      const colorString = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';

      let colorHexString = '';
      if (colorString.substr(0, 2) === '0x' &&
          /0x[0-9A-Fa-f]{4}/.test(colorString)) {
        // Get the 6 digits of the RRGGBB color value
        colorHexString = colorString.substr(2, 6);
        color = 'remapColor(0x' +
            parseInt(colorHexString, 16).toString(16) +
            ', "8R8G8B", "5R6G5B")';
      } else {
        // The color value is a variable name of a function call. Pass it on
        color = `remapColor(${colorString},"8R8G8B", "5R6G5B")`;
      }
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = 'drawCircle(' + this.myType + ', ';
    if (this.getFieldValue('ck_fill') === 'TRUE') {
      code = 'fillCircle(' + this.myType + ', ';
    }
    code += pointX0 + ', ' + pointY0 + ', ' + radius + ', ' + color + ');\n';
    return code;
  }
};

/**
 *
 * @type {{
 * init: Blockly.Blocks.oled_draw_line.init,
 * onchange: *
 *}}
 */
Blockly.Blocks.oled_draw_line = {
  init: function() {
    if (this.type === 'oled_draw_line') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_draw_line') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_DRAW_LINE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('X_ONE')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw line from 1 (x)');
    this.appendValueInput('Y_ONE')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    this.appendValueInput('X_TWO')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('to 2 (x)');
    this.appendValueInput('Y_TWO')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    if (this.displayKind === 'OLED') {
      this.appendValueInput('COLOR')
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField('color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('COLOR')
          .appendField('color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'COLOR_VALUE');
    }
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_draw_line = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    // Beginning and ending line coordinates
    const xOne = Blockly.propc.valueToCode(
        this, 'X_ONE', Blockly.propc.ORDER_NONE);
    const yOne = Blockly.propc.valueToCode(
        this, 'Y_ONE', Blockly.propc.ORDER_NONE);
    const xTwo = Blockly.propc.valueToCode(
        this, 'X_TWO', Blockly.propc.ORDER_NONE);
    const yTwo = Blockly.propc.valueToCode(
        this, 'Y_TWO', Blockly.propc.ORDER_NONE);

    let color = 0;
    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      const colorString = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      let colorHexString = '';
      if (colorString.substr(0, 2) === '0x' &&
          /0x[0-9A-Fa-f]{4}/.test(colorString)) {
        // Get the 6 digits of the RRGGBB color value
        colorHexString = colorString.substr(2, 6);
        color = 'remapColor(0x' +
            parseInt(colorHexString, 16).toString(16) +
            ', "8R8G8B", "5R6G5B")';
      } else {
        // The color value is a variable name of a function call. Pass it on
        color = `remapColor(${colorString},"8R8G8B", "5R6G5B")`;
      }
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = '';
    code += 'drawLine(' + this.myType + ', ' + xOne + ', ' + yOne + ', ' +
        xTwo + ', ' + yTwo + ', ' + color + ');\n';
    return code;
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.oled_draw_pixel.init, onchange: *}}
 */
Blockly.Blocks.oled_draw_pixel = {
  init: function() {
    if (this.type === 'oled_draw_pixel') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_draw_pixel') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_DRAW_PIXEL_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('X_AXIS')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw pixel at');
    this.appendValueInput('Y_AXIS')
        .setCheck('Number')
        .appendField(',');
    if (this.displayKind === 'OLED') {
      this.appendValueInput('COLOR')
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField('color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('COLOR')
          .appendField('color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'COLOR_VALUE');
    }
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_draw_pixel = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const pointX = Blockly.propc.valueToCode(
        this, 'X_AXIS', Blockly.propc.ORDER_ATOMIC);
    const pointY = Blockly.propc.valueToCode(
        this, 'Y_AXIS', Blockly.propc.ORDER_ATOMIC);
    let color = 0;
    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      // Get a string representation of the color value
      const colorString = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';

      let colorHexString = '';
      if (colorString.substr(0, 2) === '0x' &&
          /0x[0-9A-Fa-f]{4}/.test(colorString)) {
        // Get the 6 digits of the RRGGBB color value
        colorHexString = colorString.substr(2, 6);
        color = 'remapColor(0x' +
            parseInt(colorHexString, 16).toString(16) +
            ', "8R8G8B", "5R6G5B")';
      } else {
        // The color value is a variable name of a function call. Pass it on
        color = `remapColor(${colorString},"8R8G8B", "5R6G5B")`;
      }
      // color = Blockly.propc.valueToCode(
      //     this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      // if (/0x[0-9A-Fa-f]{4}/.test(color)) {
      //   color = color.substr(2, 6);
      // }
      // color = 'remapColor(0x' + parseInt(color, 16).toString(16) +
      //     ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    return 'drawPixel(' + this.myType + ', ' + pointX + ', ' +
        pointY + ', ' + color + ');\n';
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.oled_draw_triangle.init, onchange: *}}
 */
Blockly.Blocks.oled_draw_triangle = {
  init: function() {
    if (this.type === 'oled_draw_triangle') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_draw_triangle') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_DRAW_TRIANGLE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    // First x/y coordinates
    this.appendValueInput('POINT_X0')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw triangle at 1 (x)');
    this.appendValueInput('POINT_Y0')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    // Second x/y coordinates
    this.appendValueInput('POINT_X1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('2 (x)');
    this.appendValueInput('POINT_Y1')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    // Third x/y coordinates
    this.appendValueInput('POINT_X2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('3 (x)');
    this.appendValueInput('POINT_Y2')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    // Color picker control
    if (this.displayKind === 'OLED') {
      this.appendValueInput('COLOR')
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField('color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('COLOR')
          .appendField('color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'COLOR_VALUE');
    }
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('fill')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_fill');
    // Other details
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_draw_triangle = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const pointX0 = Blockly.propc.valueToCode(
        this, 'POINT_X0', Blockly.propc.ORDER_NONE);
    const pointY0 = Blockly.propc.valueToCode(
        this, 'POINT_Y0', Blockly.propc.ORDER_NONE);
    const pointX1 = Blockly.propc.valueToCode(
        this, 'POINT_X1', Blockly.propc.ORDER_NONE);
    const pointY1 = Blockly.propc.valueToCode(
        this, 'POINT_Y1', Blockly.propc.ORDER_NONE);
    const pointX2 = Blockly.propc.valueToCode(
        this, 'POINT_X2', Blockly.propc.ORDER_NONE);
    const pointY2 = Blockly.propc.valueToCode(
        this, 'POINT_Y2', Blockly.propc.ORDER_NONE);
    let color = 0;
    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      const colorString = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      let colorHexString = '';
      if (colorString.substr(0, 2) === '0x' &&
          /0x[0-9A-Fa-f]{4}/.test(colorString)) {
        // Get the 6 digits of the RRGGBB color value
        colorHexString = colorString.substr(2, 6);
        color = 'remapColor(0x' +
            parseInt(colorHexString, 16).toString(16) +
            ', "8R8G8B", "5R6G5B")';
      } else {
        // The color value is a variable name of a function call. Pass it on
        color = `remapColor(${colorString},"8R8G8B", "5R6G5B")`;
      }
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = 'drawTriangle(';
    if (this.getFieldValue('ck_fill') === 'TRUE') {
      code = 'fillTriangle(';
    }
    code += this.myType + ', ';
    code += pointX0 + ', ' + pointY0 + ', ';
    code += pointX1 + ', ' + pointY1 + ', ';
    code += pointX2 + ', ' + pointY2 + ', ';
    code += color + ');\n';
    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_draw_rectangle.init,
 *  onchange: *
 * }}
 */
Blockly.Blocks.oled_draw_rectangle = {
  init: function() {
    if (this.type === 'oled_draw_rectangle') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_draw_rectangle') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_DRAW_RECTANGLE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.appendValueInput('POINT_X')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw rectangle at (x)');
    this.appendValueInput('POINT_Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
    this.appendValueInput('RECT_WIDTH')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('width');
    this.appendValueInput('RECT_HEIGHT')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('height');
    this.appendValueInput('RECT_ROUND')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('roundness');
    // Color picker control
    if (this.displayKind === 'OLED') {
      this.appendValueInput('COLOR')
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField('color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('COLOR')
          .appendField('color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'COLOR_VALUE');
    }
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('fill')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_fill');

    // Other details
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_draw_rectangle = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const pointX = Blockly.propc.valueToCode(
        this, 'POINT_X', Blockly.propc.ORDER_NONE);
    const pointY = Blockly.propc.valueToCode(
        this, 'POINT_Y', Blockly.propc.ORDER_NONE);
    const width = Blockly.propc.valueToCode(
        this, 'RECT_WIDTH', Blockly.propc.ORDER_NONE);
    const height = Blockly.propc.valueToCode(
        this, 'RECT_HEIGHT', Blockly.propc.ORDER_NONE);
    const corners = Blockly.propc.valueToCode(
        this, 'RECT_ROUND', Blockly.propc.ORDER_NONE);
    let color = 0;
    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      const colorString = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      let colorHexString = '';
      if (colorString.substr(0, 2) === '0x' &&
          /0x[0-9A-Fa-f]{4}/.test(colorString)) {
        // Get the 6 digits of the RRGGBB color value
        colorHexString = colorString.substr(2, 6);
        color = 'remapColor(0x' +
            parseInt(colorHexString, 16).toString(16) +
            ', "8R8G8B", "5R6G5B")';
      } else {
        // The color value is a variable name of a function call. Pass it on
        color = `remapColor(${colorString},"8R8G8B", "5R6G5B")`;
      }

      // color = Blockly.propc.valueToCode(
      //     this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      // if (/0x[0-9A-Fa-f]{4}/.test(color)) {
      //   color = color.substr(2, 6);
      // }
      // color = 'remapColor(0x' + parseInt(color, 16).toString(16) +
      //     ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = 'drawRoundRect(';
    if (this.getFieldValue('ck_fill') === 'TRUE') {
      code = 'fillRoundRect(';
    }
    code += this.myType + ', ' + pointX + ', ' + pointY + ', ' + width +
        ', ' + height + ', ';
    if (corners === '0') {
      code = code.replace(/RoundRect\(/g, 'Rect(');
    } else {
      code += corners + ', ';
    }
    return code + color + ');\n';
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.oled_text_size.init, onchange: *}}
 */
Blockly.Blocks.oled_text_size = {
  init: function() {
    if (this.type === 'oled_text_size') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_text_size') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_TEXT_SIZE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField(this.displayKind + ' text size')
        .appendField(new Blockly.FieldDropdown([
          ['small', 'SMALL'],
          ['medium', 'MEDIUM'],
          ['large', 'LARGE'],
        ]), 'size_select')
        .appendField('font')
        .appendField(new Blockly.FieldDropdown([
          ['sans', 'FONT_SANS'],
          ['serif', 'FONT_SERIF'],
          ['script', 'FONT_SCRIPT'],
          ['bubble', 'FONT_BUBBLE'],
        ]), 'font_select');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_text_size = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const size = this.getFieldValue('size_select');
    const font = this.getFieldValue('font_select');

    let code = '';
    code += 'setTextSize(' + this.myType + ', ' + size + ');\n';
    code += 'setTextFont(' + this.myType + ', ' + font + ');\n';
    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_text_color.init,
 *  onchange: *
 * }}
 */
Blockly.Blocks.oled_text_color = {
  init: function() {
    if (this.type === 'oled_text_color') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_text_color') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_TEXT_COLOR_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    if (this.displayKind === 'OLED') {
      this.appendValueInput('FONT_COLOR')
          .setCheck('Number')
          .appendField('OLED font color');
      this.appendValueInput('BACKGROUND_COLOR')
          .setCheck('Number')
          .appendField('font background color');
    } else if (this.displayKind === 'ePaper') {
      this.appendDummyInput('FONT_COLOR')
          .appendField('ePaper font color        ')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'FONT_COLOR_VALUE');
      this.appendDummyInput('BACKGROUND_COLOR')
          .appendField('font background color')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldDropdown([
            ['black', '0'],
            ['white', '1'],
            ['invert', '2'],
          ]), 'BACKGROUND_COLOR_VALUE');
    }
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_text_color = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    let fontColor = 0;
    let backgroundColor = 0;

    if (this.displayKind === 'OLED') {
      if (!this.disabled) { // Ensure header file is included
        Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
      }
      fontColor = Blockly.propc.valueToCode(
          this, 'FONT_COLOR', Blockly.propc.ORDER_NONE);
      backgroundColor = Blockly.propc.valueToCode(
          this, 'BACKGROUND_COLOR', Blockly.propc.ORDER_NONE);

      // Get the hex font color if one is provided
      if (/0x[0-9A-Fa-f]{4}/.test(fontColor)) {
        fontColor = fontColor.substr(2, 6);
      }

      // Remap the font color
      fontColor = 'remapColor(0x' +
          parseInt(fontColor, 16).toString(16) + ', "8R8G8B", "5R6G5B")';

      if (/0x[0-9A-Fa-f]{4}/.test(backgroundColor)) {
        backgroundColor = backgroundColor.substr(2, 6);
      }

      // Remap the background color
      backgroundColor = 'remapColor(0x' +
          parseInt(backgroundColor, 16).toString(16) + ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      fontColor = this.getFieldValue('FONT_COLOR_VALUE');
      backgroundColor = this.getFieldValue('BACKGROUND_COLOR_VALUE');
    }
    let code = '';
    code += 'setTextColor(' + this.myType + ', ' + fontColor + ');\n';
    code += 'setBgColor(' + this.myType + ', ' + backgroundColor + ');\n';
    return code;
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.oled_get_max_height.init}}
 */
Blockly.Blocks.oled_get_max_height = {
  init: function() {
    if (this.type.split('_')[0] === 'oled') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type.split('_')[0] === 'epaper') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    if (this.type.split('_')[3] === 'height') {
      // Compute the maximum display height
      this.setTooltip(Blockly.MSG_OLED_GET_MAX_HEIGHT_TOOLTIP
          .replace(/Display /, this.displayKind + ' '));
      this.appendDummyInput()
          .appendField(this.displayKind + ' max height');
    } else {
      // Compute the maximum display width
      this.setTooltip(Blockly.MSG_OLED_GET_MAX_WIDTH_TOOLTIP
          .replace(/Display /, this.displayKind + ' '));
      this.appendDummyInput()
          .appendField(this.displayKind + ' max width');
    }
    this.setColour(colorPalette.getColor('protocols'));
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

// noinspection JSSuspiciousNameCombination
/**
 * Alias the oled_get_max_width block to the oled_get_max_height block
 * @type {{init: Blockly.Blocks.oled_get_max_height.init}}
 * @description The oled_get_max_height block is capable of computing the
 * display height and width. This alias abstracts the max width.
 */
Blockly.Blocks.oled_get_max_width = Blockly.Blocks.oled_get_max_height;


/**
 *
 * @return {[string, number]|[string, number]}
 */
Blockly.propc.oled_get_max_height = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return ['0', Blockly.propc.ORDER_NONE];
  } else {
    let code = 'getDisplayWidth(';
    if (this.type.split('_')[3] === 'height') code = 'getDisplayHeight(';
    return [code + this.myType + ')', Blockly.propc.ORDER_NONE];
  }
};

// noinspection JSSuspiciousNameCombination
/**
 * Alias the oled_get_max_width C code generator to the oled_get_max_height
 * object
 * @type {function(): ((string|number)[])}
 * @description The oled_get_max_height object is capable of generating
 * C source code for either of the maximum display height or the maximum
 * display width.
 */
Blockly.propc.oled_get_max_width = Blockly.propc.oled_get_max_height;

/**
 *
 * @type {{init: Blockly.Blocks.oled_set_cursor.init, onchange: *}}
 */
Blockly.Blocks.oled_set_cursor = {
  init: function() {
    if (this.type === 'oled_set_cursor') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_set_cursor') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_SET_CURSOR_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.appendValueInput('X_POS')
        .setCheck('Number')
        .appendField(this.displayKind + ' set cursor to (x)');
    this.appendValueInput('Y_POS')
        .setCheck('Number')
        .appendField('(y)');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_set_cursor = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    // Get user input
    const x = Blockly.propc.valueToCode(
        this, 'X_POS', Blockly.propc.ORDER_NONE);
    const y = Blockly.propc.valueToCode(
        this, 'Y_POS', Blockly.propc.ORDER_NONE);

    return 'setCursor(' + this.myType + ', ' + x + ', ' + y + ',0);\n';
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.oled_print_text.init, onchange: *}}
 */
Blockly.Blocks.oled_print_text = {
  init: function() {
    if (this.type === 'oled_print_text') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_print_text') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_PRINT_TEXT_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField(this.displayKind + ' print text ');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_print_text = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const msg = Blockly.propc.valueToCode(
        this, 'MESSAGE', Blockly.propc.ORDER_NONE);
    return 'drawText(' + this.myType + ', ' + msg + ');\n';
  }
};


/**
 *
 * @type {{init: Blockly.Blocks.oled_print_number.init, onchange: *}}
 */
Blockly.Blocks.oled_print_number = {
  init: function() {
    if (this.type === 'oled_print_number') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_print_number') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_PRINT_NUMBER_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.appendValueInput('NUMIN')
        .setCheck('Number')
        .appendField(this.displayKind + ' print number ');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['Decimal', 'DEC'],
          ['Hexadecimal', 'HEX'],
          ['Binary', 'BIN'],
        ]), 'type');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.oled_print_number = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    const num = Blockly.propc.valueToCode(
        this, 'NUMIN', Blockly.propc.ORDER_NONE);
    const type = this.getFieldValue('type');
    return 'drawNumber(' + this.myType + ', ' + num + ', ' + type + ');\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.oled_print_multiple.init,
 *  saveConnections: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  onchange: Blockly.Blocks.oled_print_multiple.onchange,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.oled_print_multiple = {
  init: function() {
    let myTooltip = Blockly.MSG_OLED_PRINT_MULTIPLE_TOOLTIP;
    let myHelpUrl = Blockly.MSG_OLED_HELPURL;
    this.myDevice = 'OLED';
    if (this.type === 'heb_print_multiple') {
      myTooltip = Blockly.MSG_HEB_PRINT_MULTIPLE_TOOLTIP;
      myHelpUrl = Blockly.MSG_BADGE_DISPLAY_HELPURL;
      this.myDevice = 'Display';
    } else if (this.type === 'epaper_print_multiple') {
      myHelpUrl = Blockly.MSG_EPAPER_HELPURL;
      this.myDevice = 'ePaper';
    }
    this.setTooltip(myTooltip.replace(/Display /, this.myDevice + ' '));
    this.setHelpUrl(myHelpUrl);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField(this.myDevice + ' print');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
        .appendField('text');
    this.appendValueInput('PRINT1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('decimal number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setMutator(new Blockly.Mutator([
      'console_print_str',
      'console_print_dec',
      'console_print_hex',
      'console_print_bin',
      'console_print_float',
      'console_print_char',
    ]));
    this.optionList_ = ['str', 'dec'];
    this.specDigits_ = false;
    this.setWarningText(null);
  },
  mutationToDom: Blockly.Blocks['console_print_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['console_print_multiple'].domToMutation,
  decompose: Blockly.Blocks['console_print_multiple'].decompose,
  compose: Blockly.Blocks['console_print_multiple'].compose,
  saveConnections: Blockly.Blocks['console_print_multiple'].saveConnections,
  onchange: function() {
    let warnTxt = null;
    if (this.workspace && this.optionList_.length < 1) {
      warnTxt = this.myDevice + ' print multiple must have at least one term.';
    }
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf(this.myDevice + ' initialize') === -1 &&
        this.type !== 'heb_print_multiple') {
      warnTxt = 'WARNING: You must use an ' + this.myDevice + '\ninitialize' +
          ' block at the beginning of your program!';
    }
    this.setWarningText(warnTxt);
  },
};

/**
 * Alias the oled_print_multiple C code generator object to the
 * console_print_multiple object
 * @type {function(): string}
 */
Blockly.propc.oled_print_multiple = Blockly.propc.console_print_multiple;

/**
 *
 * @type {{init: Blockly.Blocks.oled_bitmap.init, onchange: *}}
 */
Blockly.Blocks.oled_bitmap = {
  init: function() {
    if (this.type === 'oled_bitmap') {
      this.myType = 'oledc';
      this.displayKind = 'OLED';
      this.setHelpUrl(Blockly.MSG_OLED_HELPURL);
    } else if (this.type === 'epaper_bitmap') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_BITMAP_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField(this.displayKind + ' draw BMP image')
        .appendField(new Blockly.FieldTextInput('filename', function(fn) {
          fn = fn.replace(/[^A-Z0-9a-z_]/g, '').toLowerCase();
          if (fn.length > 8) {
            fn = fn.substring(0, 7);
          }
          return fn;
        }), 'FILENAME');
    this.appendValueInput('POS_X')
        .appendField('at (x)');
    this.appendValueInput('POS_Y')
        .appendField('(y)');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 * OLED bitmap C code generator
 * @return {string}
 */
Blockly.propc.oled_bitmap = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    let initFound = false;
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf(this.displayKind + ' initialize') === -1) {
      return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
    }
    for (let i = 0; i < allBlocks.length; i++) {
      if (allBlocks[i].type === 'sd_init') {
        initFound = true;
      }
    }
    if (!initFound) {
      Blockly.propc.setups_['sd_card'] = 'sd_mount(' + profile.sd_card + ');\n';
    }
  }

  const filename = this.getFieldValue('FILENAME');
  const posX = Blockly.propc.valueToCode(
      this, 'POS_X', Blockly.propc.ORDER_NONE) || '0';
  const posY = Blockly.propc.valueToCode(
      this, 'POS_Y', Blockly.propc.ORDER_NONE) || '0';

  return 'drawBitmap(' + this.myType + ', "' + filename + '.bmp", ' +
      posX + ', ' + posY + ');\n';
};
/**
 *
 * @type {{
 *  init: Blockly.Blocks.epaper_update.init,
 *  onchange: *
 * }}
 */
Blockly.Blocks.epaper_update = {
  init: function() {
    if (this.type === 'epaper_update') {
      this.setHelpUrl(Blockly.MSG_EPAPER_HELPURL);
      this.myType = 'ePaper';
      this.displayKind = 'ePaper';
    }
    this.setTooltip(Blockly.MSG_OLED_UPDATE_TOOLTIP
        .replace(/Display /, this.displayKind + ' '));
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField(this.displayKind + ' update');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['oled_clear_screen'].onchange,
};

/**
 * Update the display
 * @return {string}
 */
Blockly.propc.epaper_update = function() {
  // TODO: Replace the getAllBlocks call with a call to retrieve only the
  //  initialize blocks
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks(false).toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    return 'updateDisplay(' + this.myType + ');\n';
  }
};


// /* E-PAPER */
//
Blockly.Blocks.epaper_initialize = Blockly.Blocks.oled_initialize;
Blockly.propc.epaper_initialize = Blockly.propc.oled_initialize;

Blockly.Blocks.epaper_clear_screen = Blockly.Blocks.oled_clear_screen;
Blockly.propc.epaper_clear_screen = Blockly.propc.oled_clear_screen;

Blockly.Blocks.epaper_draw_circle = Blockly.Blocks.oled_draw_circle;
Blockly.propc.epaper_draw_circle = Blockly.propc.oled_draw_circle;

Blockly.Blocks.epaper_draw_line = Blockly.Blocks.oled_draw_line;
Blockly.propc.epaper_draw_line = Blockly.propc.oled_draw_line;

Blockly.Blocks.epaper_draw_pixel = Blockly.Blocks.oled_draw_pixel;
Blockly.propc.epaper_draw_pixel = Blockly.propc.oled_draw_pixel;

Blockly.Blocks.epaper_draw_triangle = Blockly.Blocks.oled_draw_triangle;
Blockly.propc.epaper_draw_triangle = Blockly.propc.oled_draw_triangle;

Blockly.Blocks.epaper_draw_rectangle = Blockly.Blocks.oled_draw_rectangle;
Blockly.propc.epaper_draw_rectangle = Blockly.propc.oled_draw_rectangle;

Blockly.Blocks.epaper_text_size = Blockly.Blocks.oled_text_size;
Blockly.propc.epaper_text_size = Blockly.propc.oled_text_size;

Blockly.Blocks.epaper_text_color = Blockly.Blocks.oled_text_color;
Blockly.propc.epaper_text_color = Blockly.propc.oled_text_color;


Blockly.Blocks.epaper_get_max_height = Blockly.Blocks.oled_get_max_height;
Blockly.propc.epaper_get_max_height = Blockly.propc.oled_get_max_height;

// noinspection JSSuspiciousNameCombination
Blockly.Blocks.epaper_get_max_width = Blockly.Blocks.oled_get_max_height;

// noinspection JSSuspiciousNameCombination
Blockly.propc.epaper_get_max_width = Blockly.propc.oled_get_max_height;

Blockly.Blocks.epaper_set_cursor = Blockly.Blocks.oled_set_cursor;
Blockly.propc.epaper_set_cursor = Blockly.propc.oled_set_cursor;

Blockly.Blocks.epaper_print_text = Blockly.Blocks.oled_print_text;
Blockly.propc.epaper_print_text = Blockly.propc.oled_print_text;

Blockly.Blocks.epaper_print_number = Blockly.Blocks.oled_print_number;
Blockly.propc.epaper_print_number = Blockly.propc.oled_print_number;

Blockly.Blocks.epaper_print_multiple = Blockly.Blocks.oled_print_multiple;
Blockly.propc.epaper_print_multiple = Blockly.propc.console_print_multiple;

Blockly.Blocks.epaper_bitmap = Blockly.Blocks.oled_bitmap;
Blockly.propc.epaper_bitmap = Blockly.propc.oled_bitmap;

