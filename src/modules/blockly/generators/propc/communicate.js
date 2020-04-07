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

/**
 * @fileoverview Generating C for communicate blocks
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */

'use strict';

import Blockly from 'blockly/core.js';

import {colorPalette} from '../propc.js';
import {getDefaultProfile, getProjectInitialState} from '../../../project.js';


// ------------------ Terminal Console Blocks ----------------------------------

/**
 * Console Print block definition
 * @type {{
 *  init: Blockly.Blocks.console_print.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.console_print = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_PRINT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField('Terminal print text');
    this.appendDummyInput()
        .appendField('then a new line')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'ck_nl');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Print code generator
 * @return {string}
 */
Blockly.propc.console_print = function() {
  const text = Blockly.propc.valueToCode(
      this, 'MESSAGE', Blockly.propc.ORDER_ATOMIC);
  const checkbox = this.getFieldValue('ck_nl');

  let code = 'print(' + text.replace(/%/g, '%%') + ');\n';
  if (checkbox === 'TRUE') {
    code += 'print("\\r");\n';
  }
  return code;
};

/**
 * Console Print Variables block definition
 * @type {{init: Blockly.Blocks.console_print_variables.init, helpUrl: string}}
 */
Blockly.Blocks.console_print_variables = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_PRINT_VARIABLES_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('VALUE')
        .appendField('Terminal print number')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([
          ['Decimal', 'DEC'],
          ['Hexadecimal', 'HEX'],
          ['Binary', 'BIN'],
          ['ASCII Character', 'CHAR'],
        ]), 'FORMAT');
    this.appendDummyInput()
        .appendField('then a new line')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'ck_nl');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Print Variables code generator
 * @return {string}
 */
Blockly.propc.console_print_variables = function() {
  let value = Blockly.propc.valueToCode(
      this, 'VALUE', Blockly.propc.ORDER_ATOMIC);
  const format = this.getFieldValue('FORMAT');
  const checkbox = this.getFieldValue('ck_nl');

  let code = 'print(';
  if (checkbox !== 'TRUE') {
    if (format === 'BIN') {
      code += '"%b"';
    } else if (format === 'HEX') {
      code += '"%x"';
    } else if (format === 'DEC') {
      code += '"%d"';
    } else {
      code += '"%c"';
    }
  } else {
    if (format === 'BIN') {
      code += '"%b\\r"';
    } else if (format === 'HEX') {
      code += '"%x\\r"';
    } else if (format === 'DEC') {
      code += '"%d\\r"';
    } else {
      code += '"%c\\r"';
    }
  }
  if (format === 'CHAR') {
    if (!(value.length === 3 && value[0] === '\'' && value[2] === '\'')) {
      if (value !== value.replace(/[^0-9]+/g, '')) {
        value = '(' + value + ' & 0xFF)';
      } else if (!(0 < parseInt(value) && parseInt(value) < 256)) {
        value = '(' + value + ' & 0xFF)';
      }
    }

    code += ', ' + value + ');\n';
  } else {
    code += ', ' + value + ');\n';
  }
  return code;
};

/**
 * Console Print Multiple block definition
 *
 * @type {{
 *  init: Blockly.Blocks.console_print_multiple.init,
 *  saveConnections: Blockly.Blocks.console_print_multiple.saveConnections,
 *  compose: Blockly.Blocks.console_print_multiple.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (function(*): Blockly.Block),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.console_print_multiple.onchange,
 *  domToMutation: Blockly.Blocks.console_print_multiple.domToMutation
 *  }}
 */
Blockly.Blocks.console_print_multiple = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_PRINT_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal print');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
        .appendField('text');
    this.appendValueInput('PRINT1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('decimal number');
    this.appendDummyInput('NEWLINE')
        .appendField('then a new line')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'ck_nl');
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
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    const divs = [];
    const places = [];
    const digits = [];
    container.setAttribute('options', JSON.stringify(this.optionList_));
    for (let fv = 0; fv < this.optionList_.length; fv++) {
      divs.push(this.getFieldValue('DIV' + fv) || '0');
      places.push(this.getFieldValue('PLACE' + fv) || '');
      digits.push(this.getFieldValue('DIGIT' + fv) || '');
    }
    container.setAttribute('divisors', JSON.stringify(divs));
    if (this.specDigits_) {
      container.setAttribute('places', JSON.stringify(places));
      container.setAttribute('digits', JSON.stringify(digits));
    }
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    if (this.getInput('PRINT0')) {
      this.removeInput('PRINT0');
    }
    if (this.getInput('PRINT1')) {
      this.removeInput('PRINT1');
    }
    if (this.getInput('NEWLINE')) {
      this.removeInput('NEWLINE');
    }
    const value = JSON.parse(container.getAttribute('options'));
    const divs = JSON.parse(container.getAttribute('divisors'));
    this.optionList_ = value;

    let places = [];
    let digits = [];
    this.specDigits_ = false;
    if (container.getAttribute('places') || container.getAttribute('digits')) {
      this.specDigits_ = true;
      places = JSON.parse(container.getAttribute('places'));
      digits = JSON.parse(container.getAttribute('digits'));
    }

    for (let i = 0; i < this.optionList_.length; i++) {
      let label = 'decimal number';
      let chk = 'Number';
      if (this.optionList_[i] === 'str') {
        label = 'text';
        chk = 'String';
      } else if (this.optionList_[i] === 'char') {
        label = 'ASCII character';
      } else if (this.optionList_[i] === 'hex') {
        label = 'hexadecimal number';
      } else if (this.optionList_[i] === 'bin') {
        label = 'binary number';
      }
      if (this.optionList_[i] === 'float' && !this.specDigits_) {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'DIV' + i);
        this.setFieldValue(divs[i], 'DIV' + i);
      } else if (this.optionList_[i] === 'float' && this.specDigits_) {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'DIV' + i)
            .appendField('digits')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'DIGIT' + i)
            .appendField('places')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'PLACE' + i);
        this.setFieldValue(divs[i] || '100', 'DIV' + i);
        this.setFieldValue(places[i] || '', 'PLACE' + i);
        this.setFieldValue(digits[i] || '', 'DIGIT' + i);
      } else if (this.specDigits_ && (this.optionList_[i] === 'hex' ||
                    this.optionList_[i] === 'dec' ||
                    this.optionList_[i] === 'bin')) {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i)
            .appendField('digits')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'DIGIT' + i);
        this.setFieldValue(digits[i] || '', 'DIGIT' + i);
      } else {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i);
      }
    }
    if (this.type === 'console_print_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('then a new line')
          .appendField(new Blockly.FieldCheckbox('FALSE'), 'ck_nl');
    } else if (this.type === 'xbee_print_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('then a carriage return')
          .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_nl');
    } else if (this.type === 'string_sprint_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('store in')
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    }
  },
  decompose: function(workspace) {
    let containerBlock = workspace.newBlock('console_print_container');
    let subBlock = 'console_print_';
    if (this.type === 'console_print_multiple' ||
                this.type === 'oled_print_multiple' ||
                this.type === 'epaper_print_multiple' ||
                this.type === 'debug_lcd_print_multiple' ||
                this.type === 'parallel_lcd_print_multiple' ||
                this.type === 'heb_print_multiple') {
      containerBlock.initSvg();
      containerBlock.setFieldValue(
          (this.specDigits_ ? 'TRUE' : 'FALSE'), 'PLACES');
    } else if (this.type === 'string_sprint_multiple') {
      containerBlock = workspace.newBlock('string_sprint_container');
      containerBlock.initSvg();
      containerBlock.setFieldValue(
          (this.specDigits_ ? 'TRUE' : 'FALSE'), 'PLACES');
      subBlock = 'string_scan_';
    } else {
      containerBlock = workspace.newBlock('serial_print_container');
      containerBlock.initSvg();
    }

    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.optionList_.length; i++) {
      const optionBlock = workspace.newBlock(
          subBlock + this.optionList_[i]);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Delete everything.
    let i = 0;
    let printInput;
    const digits = [];
    const places = [];
    const divs = [];
    while (this.getInput('PRINT' + i)) {
      digits[i] = this.getFieldValue('DIGIT' + i);
      places[i] = this.getFieldValue('PLACE' + i);
      divs[i] = this.getFieldValue('DIV' + i);
      this.removeInput('PRINT' + i);
      i++;
    }
    const ckNl = this.getFieldValue('ck_nl');
    if (this.getInput('NEWLINE')) {
      this.removeInput('NEWLINE');
    }

    i = 0;
    this.optionList_.length = 0;
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    this.specDigits_ = containerBlock.getFieldValue('PLACES') === 'TRUE';
    let label = '';
    let chk = '';
    while (clauseBlock) {
      chk = 'Number';
      const tCheck = clauseBlock.type.split('_');
      if (tCheck[2] === 'dec') {
        this.optionList_.push('dec');
        label = 'decimal number';
      } else if (tCheck[2] === 'hex') {
        this.optionList_.push('hex');
        label = 'hexadecimal number';
      } else if (tCheck[2] === 'bin') {
        this.optionList_.push('bin');
        label = 'binary number';
      } else if (tCheck[2] === 'char') {
        this.optionList_.push('char');
        label = 'ASCII character';
      } else if (tCheck[2] === 'str') {
        this.optionList_.push('str');
        chk = 'String';
        label = 'text';
      }
      // Reconnect any child blocks.
      if (tCheck[2] === 'float' && !this.specDigits_) {
        this.optionList_.push('float');
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'DIV' + i);
        this.setFieldValue(divs[i] || '100', 'DIV' + i);
      } else if (tCheck[2] === 'float' && this.specDigits_) {
        this.optionList_.push('float');
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'DIV' + i)
            .appendField('digits')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'DIGIT' + i)
            .appendField('places')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'PLACE' + i);
        this.setFieldValue(divs[i] || '100', 'DIV' + i);
        this.setFieldValue(places[i] || '', 'PLACE' + i);
        this.setFieldValue(digits[i] || '', 'DIGIT' + i);
      } else if (this.specDigits_ && (this.optionList_[i] === 'hex' ||
                    this.optionList_[i] === 'dec' ||
                    this.optionList_[i] === 'bin')) {
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i)
            .appendField('digits')
            .appendField(new Blockly.FieldTextInput('', function(text) {
              text = text.replace(/O/ig, '0').replace(/[^0-9]*/g, '');
              return text || '';
            }), 'DIGIT' + i);
        this.setFieldValue(digits[i] || '', 'DIGIT' + i);
      } else {
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i);
      }

      if (clauseBlock.valueConnection_) {
        printInput.connection.connect(clauseBlock.valueConnection_);
      }
      i++;
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }// End while

    if (this.type === 'console_print_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('then a new line')
          .appendField(new Blockly.FieldCheckbox(ckNl || 'FALSE'), 'ck_nl');
    } else if (this.type === 'xbee_print_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('then a carriage return')
          .appendField(new Blockly.FieldCheckbox(ckNl || 'TRUE'), 'ck_nl');
    } else if (this.type === 'string_sprint_multiple') {
      this.appendDummyInput('NEWLINE')
          .appendField('store in')
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (clauseBlock) {
      const printInput = this.getInput('PRINT' + i);
      clauseBlock.valueConnection_ =
                    printInput && printInput.connection.targetConnection;
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
      i++;
    }
  },
  onchange: function() {
    let warnTxt = null;
    if (this.workspace && this.optionList_.length < 1) {
      warnTxt = 'Terminal print multiple must have at least one term.';
    }
    this.setWarningText(warnTxt);
  },
};

/**
 * Console Print Container block definition
 * @type {{init: Blockly.Blocks.console_print_container.init}}
 */
Blockly.Blocks.console_print_container = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('send');
    this.appendStatementInput('STACK');
    this.appendDummyInput()
        .appendField('specify digits')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'PLACES');
    this.contextMenu = false;
  },
};

/**
 * Serial Print Container block definition
 * @type {{init: Blockly.Blocks.serial_print_container.init}}
 */
Blockly.Blocks.serial_print_container = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('send');
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },
};

/**
 * String Sprint Container block definition
 * @type {{init: Blockly.Blocks.string_sprint_container.init}}
 */
Blockly.Blocks.string_sprint_container = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('string');
    this.appendStatementInput('STACK');
    this.appendDummyInput()
        .appendField('specify digits')
        .appendField(new Blockly.FieldCheckbox('FALSE'), 'PLACES');
    this.contextMenu = false;
  },
};

/**
 * Console Print Decimal block definition
 * @type {{init: Blockly.Blocks.console_print_dec.init}}
 */
Blockly.Blocks.console_print_dec = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_dec') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('decimal number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print Hexadecimal block definition
 * @type {{init: Blockly.Blocks.console_print_hex.init}}
 */
Blockly.Blocks.console_print_hex = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_hex') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('hexadecimal number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print Binary block definition
 * @type {{init: Blockly.Blocks.console_print_bin.init}}
 */
Blockly.Blocks.console_print_bin = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_bin') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('binary number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print String block defintion
 * @type {{init: Blockly.Blocks.console_print_str.init}}
 */
Blockly.Blocks.console_print_str = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_str') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('text');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print Character block definition
 * @type {{init: Blockly.Blocks.console_print_char.init}}
 */
Blockly.Blocks.console_print_char = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_char') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('ASCII character');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print Float block definition
 * @type {{init: Blockly.Blocks.console_print_float.init}}
 */
Blockly.Blocks.console_print_float = {
  init: function() {
    let myColor = 'protocols';
    if (this.type === 'string_scan_float') {
      myColor = 'math';
    }
    this.setColour(colorPalette.getColor(myColor));
    this.appendDummyInput()
        .appendField('floating point number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Console Print Multiple code generator
 *
 * @return {string}
 */
Blockly.propc.console_print_multiple = function() {
  let code = '';
  let initBlock = null;
  let errorString = '';
  let p = '';
  let handle;
  let conn;

  switch (this.type) {
    case 'console_print_multiple':
      code += 'print("';
      break;

    case 'serial_print_multiple':
      initBlock = 'Serial initialize';
      errorString = '// ERROR: Serial is not initialized!\n';
      p = '';
      if (this.ser_pins.length > 0) {
        p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
      }
      if (this.getInput('SERPIN')) {
        p = this.getFieldValue('SER_PIN')
            .replace(',', '_')
            .replace(/None/g, 'N');
      }
      code += 'dprint(fdser' + p + ', "';
      break;

    case 'debug_lcd_print_multiple':
      initBlock = 'Serial LCD initialize';
      errorString = '// ERROR: LCD is not initialized!\n';
      code += 'dprint(serial_lcd, "';
      break;

    case 'parallel_lcd_print_multiple':
      initBlock = 'Parallel LCD initialize';
      errorString = '// ERROR: LCD is not initialized!\n';
      code += 'dprint(parallel_lcd, "';
      break;

    case 'oled_print_multiple':
      initBlock = 'OLED initialize';
      errorString = '// ERROR: OLED is not initialized!\n';
      code += 'drawPrint(oledc, "';
      break;

    case 'epaper_print_multiple':
      initBlock = 'ePaper initialize';
      errorString = '// ERROR: ePaper is not initialized!\n';
      code += 'drawPrint(ePaper, "';
      break;

    case 'xbee_print_multiple':
      initBlock = 'XBee initialize';
      errorString = '// ERROR: XBEE is not initialized!\n';
      code += 'dprint(xbee, "';
      break;

    case 'heb_print_multiple':
      code += 'oledprint("';
      break;

    case 'string_sprint_multiple':
      p = Blockly.propc.variableDB_.getName(
          this.getFieldValue('VAR'),
          Blockly.VARIABLE_CATEGORY_NAME);
      Blockly.propc.vartype_[p] = 'char *';
      code += 'sprint(' + p + ', "';
      break;

    case 'wx_print_multiple':
      initBlock = 'WX initialize';
      errorString = '// ERROR: WX is not initialized!\n';

      // if (window.project.boardType.name === 'heb-wx') {
      if (getProjectInitialState().boardType.name === 'heb-wx') {
        initBlock = null;
      }
      handle = Blockly.propc.variableDB_.getName(
          this.getFieldValue('HANDLE'),
          Blockly.VARIABLE_CATEGORY_NAME);
      conn = this.getFieldValue('CONNECTION');
      code += 'wifi_print(' + conn + ', ' + handle + ', "';
      break;
  }

  let varList = '';
  let orIt = '';
  let i = 0;
  while (this.getInput('PRINT' + i)) {
    let digitsPlaces = this.getFieldValue('DIGIT' + i) || '';
    if (this.getFieldValue('PLACE' + i) &&
        this.getFieldValue('PLACE' + i) !== '') {
      digitsPlaces += '.' + this.getFieldValue('PLACE' + i);
    }
    if (digitsPlaces !== '') {
      digitsPlaces = '0' + digitsPlaces;
    }
    if (this.getFieldValue('TYPE' + i).includes('hexadecimal number')) {
      code += '%' + digitsPlaces + 'x';
      orIt = '0x0';
    } else if (this.getFieldValue('TYPE' + i).includes('decimal number')) {
      code += '%' + digitsPlaces + 'd';
      orIt = '0';
    } else if (this.getFieldValue('TYPE' + i).includes('binary number')) {
      code += '%' + digitsPlaces + 'b';
      orIt = '0b0';
    } else if (this.getFieldValue('TYPE' + i).includes('text')) {
      code += '%s';
      orIt = '" "';
    } else if (this.getFieldValue('TYPE' + i).includes('ASCII character')) {
      code += '%c';
      orIt = '32';
    } else if (this.getFieldValue('TYPE' + i)
        .includes('float point  divide by')) {
      code += '%' + digitsPlaces + 'f';
      orIt = '0';
    }

    if (!this.getFieldValue('TYPE' + i).includes('float point  divide by')) {
      varList += ', ' + (Blockly.propc.valueToCode(
          this,
          'PRINT' + i,
          Blockly.propc.ORDER_NONE).replace(/%/g, '%%') || orIt);
    } else {
      varList += ', ((float) ' + (Blockly.propc.valueToCode(
          this,
          'PRINT' + i,
          Blockly.propc.ORDER_NONE) || orIt) +
                    ') / ' + this.getFieldValue('DIV' + i) + '.0';
    }
    i++;
  }
  if (this.getFieldValue('ck_nl') === 'TRUE') {
    code += '\\r';
  }
  code += '"' + varList + ');\n';

  // TODO: Replace .getAllBlocks() with getAllBlocksByType()
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks(false).toString();
  if (initBlock && allBlocks.indexOf(initBlock) === -1) {
    code = errorString;
  }
  if (this.type === 'wx_print_multiple' &&
      allBlocks.indexOf('Simple WX') > -1) {
    code = '// ERROR: You cannot use Advanced WX blocks with Simple WX blocks!';
  }

  // if (window.project.boardType.name === 'heb-wx' &&
  if (getProjectInitialState().boardType.name === 'heb-wx' &&
      this.type === 'wx_print_multiple') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }

  return code;
};

/**
 * Console Scan Text block definition
 * @type {{init: Blockly.Blocks.console_scan_text.init, helpUrl: string}}
 */
Blockly.Blocks.console_scan_text = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_SCAN_TEXT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal receive text store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Scan Text code generator
 * @return {string}
 */
Blockly.propc.console_scan_text = function() {
  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);
  Blockly.propc.vartype_[data] = 'char *';

  if (data !== '') {
    return 'getStr(' + data + ', 128);\n';
  } else {
    return '';
  }
};

/**
 * Console Scan Number block definition
 * @type {{init: Blockly.Blocks.console_scan_number.init, helpUrl: string}}
 */
Blockly.Blocks.console_scan_number = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_SCAN_NUMBER_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal receive')
        .appendField(new Blockly.FieldDropdown([
          ['number (32-bit integer)', 'NUMBER'],
          ['byte (ASCII character)', 'BYTE'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Scan Number code generator
 * @return {string}
 */
Blockly.propc.console_scan_number = function() {
  const type = this.getFieldValue('TYPE');
  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);

  let code = '';

  if (data !== '') {
    if (type === 'NUMBER') {
      code += 'scan("%d", &' + data + ');\n';
    } else {
      code += data + ' = getChar();\n';
    }
    return code;
  } else {
    return '';
  }
};

/**
 * Console Newline block definition
 * @type {{init: Blockly.Blocks.console_newline.init, helpUrl: string}}
 */
Blockly.Blocks.console_newline = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_NEWLINE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal new line');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Newline code generator
 * @return {string}
 */
Blockly.propc.console_newline = function() {
  return 'term_cmd(CR);\n';
};


/**
 * Console Close block definition
 * @type {{init: Blockly.Blocks.console_close.init, helpUrl: string}}
 */
Blockly.Blocks.console_close = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_CLOSE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal close');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Close code generator
 * @return {string}
 */
Blockly.propc.console_close = function() {
  // Blockly.propc.serial_terminal_ = true;
  if (!this.disabled) {
    Blockly.propc.setups_['terminal_close'] = 'simpleterm_close();\n';
  }
  return '';
};

/**
 * Console Clear block definition
 * @type {{init: Blockly.Blocks.console_clear.init, helpUrl: string}}
 */
Blockly.Blocks.console_clear = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_CLEAR_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal clear screen');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console Clear code generator
 * @return {string}
 */
Blockly.propc.console_clear = function() {
  return 'term_cmd(CLS);\n';
};

/**
 * Console MoveToPosition block definition
 * @type {{init: Blockly.Blocks.console_move_to_position.init, helpUrl: string}}
 */
Blockly.Blocks.console_move_to_position = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSOLE_MOVE_TO_POSITION_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Terminal set cursor to row');
    this.appendValueInput('ROW')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('column');
    this.appendValueInput('COLUMN')
        .setCheck('Number');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Console MoveToPosition code generator
 * @return {string}
 */
Blockly.propc.console_move_to_position = function() {
  let row = Blockly.propc.valueToCode(this, 'ROW', Blockly.propc.ORDER_NONE);
  let column = Blockly.propc.valueToCode(
      this, 'COLUMN', Blockly.propc.ORDER_NONE);

  if (Number(row) < 0) {
    row = 0;
  } else if (Number(row) > 255) {
    row = 255;
  }

  if (Number(column) < 0) {
    column = 0;
  } else if (Number(column) > 255) {
    column = 255;
  }

  return 'term_cmd(CRSRXY, ' + column + ', ' + row + ');\n';
};

// ----------------------- Serial Protocol Blocks ------------------------------

/**
 * Serial Open block definition
 * @type {{
 *  init: Blockly.Blocks.serial_open.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_open.onchange,
 *  setToOther: Blockly.Blocks.serial_open.setToOther,
 *  domToMutation: Blockly.Blocks.serial_open.domToMutation,
 *  setToMode: Blockly.Blocks.serial_open.setToMode
 *  }}
 */
Blockly.Blocks.serial_open = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SERIAL_OPEN_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('PIN_SETUP')
        .appendField('Serial initialize RX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat([['31', '31'], ['None', 'None']])),
        'RXPIN')
        .appendField('TX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat([['30', '30'], ['None', 'None']])),
        'TXPIN');
    this.appendDummyInput('BAUD_RATE')
        .appendField('baud')
        .appendField(new Blockly.FieldDropdown([
          ['2400', '2400'],
          ['4800', '4800'],
          ['9600', '9600'],
          ['19200', '19200'],
          ['38400', '38400'],
          ['57600', '57600'],
          ['115200', '115200'],
          ['other', 'other'],
        ], function(br) {
          if (br === 'other') {
            // eslint-disable-next-line no-invalid-this
            this.otherBaud = true;
          }
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setToOther(br);
        }), 'BAUD');
    this.appendDummyInput('MODE')
        .appendField('mode')
        .appendField(
            new Blockly.FieldDropdown([
              ['standard', 'standard'],
              ['other', 'other'],
            ], function(value) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setToMode(value);
            }), 'TYPE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.otherBaud = false;
    this.otherMode = false;
  },
  setToOther: function(br) {
    if (br === 'other' || this.otherBaud === true) {
      if (!br || br === 'other') {
        br = '1200';
      }
      this.otherBaud = true;
      if (this.getInput('BAUD_RATE')) {
        this.removeInput('BAUD_RATE');
      }
      this.appendDummyInput('BAUD_RATE')
          .appendField('baud')
          .appendField(new Blockly.FieldNumber(br, null, null, 1), 'BAUD');
      this.moveInputBefore('BAUD_RATE', 'MODE');
    }
  },
  setToMode: function(details) {
    if (details === 'other') {
      details = ['FALSE', 'FALSE', 'FALSE', 'FALSE'];
    }
    if (details !== 'standard') {
      if (this.getInput('MODE')) {
        this.removeInput('MODE');
      }
      this.appendDummyInput('MODE')
          .appendField('invert RX')
          .appendField(new Blockly.FieldCheckbox(details[0]), 'ck_bit0')
          .appendField('invert TX')
          .appendField(new Blockly.FieldCheckbox(details[1]), 'ck_bit1')
          .appendField('open-drain')
          .appendField(new Blockly.FieldCheckbox(details[2]), 'ck_bit2')
          .appendField('remove TX echo')
          .appendField(new Blockly.FieldCheckbox(details[3]), 'ck_bit3');
      this.otherMode = true;
    }
  },
  mutationToDom: function() {
    let container;
    if (this.otherBaud || this.otherMode) {
      container = document.createElement('mutation');
    }
    if (this.otherBaud) {
      container.setAttribute('baud', this.getFieldValue('BAUD') || '1200');
    }
    if (this.otherMode) {
      for (let k = 0; k < 4; k++) {
        container.setAttribute(
            'ck_bit' + k.toString(10),
            this.getFieldValue('ck_bit' + k.toString(10)) || 'FALSE');
      }
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    const br = xmlElement.getAttribute('baud');
    if (br !== undefined) {
      this.otherBaud = true;
      this.setToOther(br);
    }
    const checkBits = ['FALSE', 'FALSE', 'FALSE', 'FALSE'];
    let otherMode = false;
    for (let k = 0; k < 4; k++) {
      const checkBit = xmlElement.getAttribute('ck_bit' + k.toString(10));
      if (checkBit) {
        otherMode = true;
        checkBits[k] = checkBit;
      }
    }
    if (otherMode) {
      this.setToMode(checkBits);
    }
  },
  onchange: function(event) {
    // only monitor changes to serial init blocks
    if (event && (
      event.name === 'RXPIN' ||
      event.name === 'TXPIN' ||
      event.type == Blockly.Events.BLOCK_CREATE ||
      event.blockId === this.id)) {
      const warnText = [];
      const rxPin = this.getFieldValue('RXPIN');
      const txPin = this.getFieldValue('TXPIN');

      // check to see if pin 30 or 31 was used without using the
      // Terminal close block
      if ((rxPin === '31' || txPin === '30') &&
          Blockly.getMainWorkspace()
              .getBlocksByType('console_close', false).length > 0) {
        warnText.push('WARNING: DO NOT use pins 30 or 31 without using' +
            ' the Terminal close block!');
      }

      // check to see if RX and TX are the same pin
      if (rxPin === txPin) {
        warnText.push('WARNING: RX and TX should use different pins!');
      }

      // warn if multiple serial protocol instances are sharing
      const allSerialInitBlocks =
          Blockly.getMainWorkspace().getBlocksByType('serial_open', false);
      for (let i = 0; i < allSerialInitBlocks.length; i++) {
        if (this.id !== allSerialInitBlocks[i].id) {
          const rxPin2 = allSerialInitBlocks[i].getFieldValue('RXPIN');
          const txPin2 = allSerialInitBlocks[i].getFieldValue('TXPIN');
          if (rxPin2 !== 'None' &&
                            (rxPin2 === rxPin || rxPin2 === txPin)) {
            warnText.push('WARNING: Serial RX/TX pins should not be shared!');
          }
          if (txPin2 !== 'None' &&
                            (txPin2 === rxPin || txPin2 === txPin)) {
            warnText.push('WARNING: Serial RX/TX pins should not be shared!');
          }
        }
      }
      this.setWarningText(
          warnText.length === 0 ? null : warnText.sortedUnique().join('\n'));
    }
  },
};

/**
 * Serial Open code generator
 * @return {string}
 */
Blockly.propc.serial_open = function() {
  const rxPin = this.getFieldValue('RXPIN').replace('None', '-1');
  const txPin = this.getFieldValue('TXPIN').replace('None', '-1');
  const rxLabel = this.getFieldValue('RXPIN').replace('None', 'N');
  const txLabel = this.getFieldValue('TXPIN').replace('None', 'N');
  let mode = '0b';
  for (let k = 3; k > -1; k--) {
    mode += ((this.getFieldValue(
        'ck_bit' + k.toString(10)) || 'FALSE') === 'TRUE' ? '1' : '0');
  }
  const baud = this.getFieldValue('BAUD');

  if (!this.disabled) {
    Blockly.propc.definitions_['include fdserial'] = '#include "fdserial.h"';
    Blockly.propc.definitions_['var fdserial' + rxLabel + '_' + txLabel] =
        'fdserial *fdser' + rxLabel + '_' + txLabel + ';';
    Blockly.propc.setups_['setup_fdserial' + rxLabel + '_' + txLabel] =
        'fdser' + rxLabel + '_' + txLabel + ' = fdserial_open(' + rxPin +
        ', ' + txPin + ', ' + mode + ', ' + baud + ');';
  }
  return '';
};

/**
 * Serial Send Text block definition
 * @type {{
 *  init: Blockly.Blocks.serial_send_text.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_send_text.onchange,
 *  domToMutation: Blockly.Blocks.serial_send_text.domToMutation,
 *  updateSerPin: Blockly.Blocks.serial_send_text.updateSerPin
 *  }}
 */
Blockly.Blocks.serial_send_text = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_SEND_TEXT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial transmit')
        .appendField(new Blockly.FieldDropdown([
          ['text', 'TEXT'],
          ['decimal number', 'INT'],
          ['hexadecimal number', 'HEX'],
          ['binary number', 'BIN'],
          ['ASCII character', 'BYTE'],
        ]), 'TYPE');
    this.appendValueInput('VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
    this.ser_pins = [];
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.getInput('SERPIN')) {
      container.setAttribute('serpin', this.getFieldValue('SER_PIN'));
    }
    container.setAttribute('pinmenu', JSON.stringify(this.ser_pins));
    container.setAttribute('type', this.getFieldValue('TYPE'));
    return container;
  },
  domToMutation: function(xmlElement) {
    if (xmlElement.getAttribute('serpin')) {
      this.ser_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
      this.updateSerPin();
    }
  },
  updateSerPin: function(newPinList) {
    if (this.getInput('SERPIN')) {
      this.removeInput('SERPIN'); // WHY??
    }
    let pinList = this.ser_pins;
    if (newPinList) {
      pinList = newPinList;
    }
    if (pinList.length > 1 && !this.isInFlyout) {
      this.appendDummyInput('SERPIN')
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField('RXTX')
          .appendField(new Blockly.FieldDropdown(
              pinList.map(function(value) {
                // return an array of arrays built from the original array.
                return [value, value];
              })), 'SER_PIN');
      if (this.getInput('PRINT0')) {
        this.moveInputBefore('SERPIN', 'PRINT0');
      } else if (this.getInput('OPTION0')) {
        this.moveInputBefore('SERPIN', 'OPTION0');
      }
    }
  },
  onchange: function(event) {
    // Filter events for only 'serial_open' blocks or deletion events or
    // changes to the serial_print_multiple block
    if (event &&
        (event.type == Blockly.Events.BLOCK_CREATE ||
         event.type == Blockly.Events.BLOCK_DELETE ||
         event.name === 'RXPIN' ||
         event.name === 'TXPIN' ||
         (event.blockId === this.id &&
          this.type === 'serial_print_multiple') )) {
      let warnText = null;
      let serialPinList = [];
      const serialInitBlocks =
          Blockly.getMainWorkspace().getBlocksByType('serial_open');
      if (serialInitBlocks.length === 0) {
        warnText = 'WARNING: You must use a Serial\ninitialize block at the' +
            ' beginning of your program!';
      } else {
        // scan the 'serial_open' blocks and build a pin list
        for (let i = 0; i < serialInitBlocks.length; i++) {
          serialPinList.push(serialInitBlocks[i].getFieldValue('RXPIN') + ',' +
                        serialInitBlocks[i].getFieldValue('TXPIN'));
        }
        serialPinList = serialPinList.sortedUnique();

        // determine if anything has changed in the list of serial pins
        // https://stackoverflow.com/questions/1187518/how-to-get-the-difference-between-two-arrays-in-javascript
        const oldValue =
            this.ser_pins.filter((x) => !serialPinList.includes(x));
        const newValue =
            serialPinList.filter((x) => !this.ser_pins.includes(x));
        const currentValue =
            (this.getField('SER_PIN') ? this.getFieldValue('SER_PIN') : null);

        // if there are changes to the list of pins, update the menu
        if ((oldValue.length > 0 || newValue.length > 0)) {
          this.updateSerPin(serialPinList);
        }

        // if the selected value changed, select the new value
        if (oldValue.length === 1 &&
            currentValue &&
            oldValue[0] === currentValue &&
            newValue.length === 1 &&
            newValue[0] &&
            // make sure this doesn't fire in an invalid state
            this.getField('SER_PIN').textContent_) {
          this.setFieldValue(newValue[0], 'SER_PIN');
        }

        // update the variable that stores the list of pins
        this.ser_pins = serialPinList;

        if (this.type === 'serial_print_multiple' && this.workspace &&
                        this.optionList_.length < 1) {
          warnText = 'Serial transmit multiple must have at least one term.';
        }
      }
      this.setWarningText(warnText);
    }
  },
};

/**
 * Serial Send Text code generator
 * @return {string}
 */
Blockly.propc.serial_send_text = function() {
  let p = '';
  if (this.ser_pins.length > 0) {
    p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
  }
  if (this.getInput('SERPIN')) {
    p = this.getFieldValue('SER_PIN').replace(',', '_').replace(/None/g, 'N');
  }
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial initialize') === -1) {
    return '// ERROR: Serial is not initialized!\n';
  } else {
    const type = this.getFieldValue('TYPE');
    let data = Blockly.propc.valueToCode(
        this, 'VALUE', Blockly.propc.ORDER_ATOMIC) || '0';

    if (type === 'BYTE') {
      if (!(data.length === 3 && data[0] === '\'' && data[2] === '\'')) {
        if (data !== data.replace(/[^0-9]+/g, '')) {
          data = '(' + data + ' & 0xFF)';
        } else if (!(0 < parseInt(data) && parseInt(data) < 256)) {
          data = '(' + data + ' & 0xFF)';
        }
      }

      return 'fdserial_txChar(fdser' + p + ', ' + data + ');\n';
    } else if (type === 'INT') {
      return 'dprint(fdser' + p + ', "%d\\r", ' + data + ');\n';
    } else if (type === 'HEX') {
      return 'dprint(fdser' + p + ', "%x\\r", ' + data + ');\n';
    } else if (type === 'BIN') {
      return 'dprint(fdser' + p + ', "%b\\r", ' + data + ');\n';
    } else {
      let code = 'dprint(fdser' + p + ', "%s\\r", ' +
          data.replace(/%/g, '%%') + ');\n';
      code += 'while(!fdserial_txEmpty(fdser' + p + '));\n';
      code += 'pause(5);\n';

      return code;
    }
  }
};

/**
 * Serial Receive Text block definition
 * @type {{
 *  init: Blockly.Blocks.serial_receive_text.init,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_receive_text.onchange,
 *  domToMutation: *,
 *  updateSerPin: (
 *        Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      | Blockly.Blocks.wx_scan_multiple.updateSerPin
 *      | Blockly.Blocks.string_scan_multiple.updateSerPin
 *      | Blockly.Blocks.serial_send_text.updateSerPin)
 *  }}
 */
Blockly.Blocks.serial_receive_text = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_RECEIVE_TEXT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial receive')
        .appendField(new Blockly.FieldDropdown([
          ['text', 'TEXT'],
          ['decimal number', 'INT'],
          ['hexadecimal number', 'HEX'],
          ['binary number', 'BIN'],
          ['ASCII character', 'BYTE'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
    this.ser_pins = [];
  },
  mutationToDom: Blockly.Blocks['serial_send_text'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_send_text'].domToMutation,
  updateSerPin: Blockly.Blocks['serial_send_text'].updateSerPin,
  onchange: Blockly.Blocks['serial_send_text'].onchange,
};

/**
 * Serial Receive Text code generator
 * @return {string}
 */
Blockly.propc.serial_receive_text = function() {
  let p = '';
  if (this.ser_pins.length > 0) {
    p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
  }
  if (this.getInput('SERPIN')) {
    p = this.getFieldValue('SER_PIN')
        .replace(',', '_')
        .replace(/None/g, 'N');
  }
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial initialize') === -1) {
    return '// ERROR: Serial is not initialized!\n';
  } else {
    const data = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VALUE'),
        Blockly.VARIABLE_CATEGORY_NAME);

    const type = this.getFieldValue('TYPE');

    if (type === 'BYTE') {
      return data + ' = fdserial_rxChar(fdser' + p + ');\n';
    } else if (type === 'INT') {
      return 'dscan(fdser' + p + ', "%d", &' + data + ');\n';
    } else if (type === 'BIN') {
      return 'dscan(fdser' + p + ', "%b", &' + data + ');\n';
    } else if (type === 'HEX') {
      return 'dscan(fdser' + p + ', "%x", &' + data + ');\n';
    } else {
      Blockly.propc.vartype_[data] = 'char *';

      return 'dscan(fdser' + p + ', "%s", ' + data + ');\n';
    }
  }
};

/**
 * Serial Status block definition
 * @type {{
 *  init: Blockly.Blocks.serial_status.init,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_status.onchange,
 *  domToMutation: *,
 *  updateSerPin: (
 *        Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      | Blockly.Blocks.wx_scan_multiple.updateSerPin
 *      | Blockly.Blocks.string_scan_multiple.updateSerPin
 *      | Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      |*)
 *  }}
 */
Blockly.Blocks.serial_status = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_STATUS_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial')
        .appendField(new Blockly.FieldDropdown([
          ['characters are recieved', 'rxReady'],
          ['recieved character count', 'rxCount'],
          ['peek at first recieved character', 'rxPeek'],
          ['transmit buffer empty', 'txEmpty'],
        ]), 'TYPE');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setWarningText(null);
    this.ser_pins = [];
  },
  mutationToDom: Blockly.Blocks['serial_send_text'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_send_text'].domToMutation,
  updateSerPin: Blockly.Blocks['serial_send_text'].updateSerPin,
  onchange: Blockly.Blocks['serial_send_text'].onchange,
};

/**
 * Serial Status code generator
 * @return {string|[string, number]}
 */
Blockly.propc.serial_status = function() {
  let p = '';
  if (this.ser_pins.length > 0) {
    p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
  }
  if (this.getInput('SERPIN')) {
    p = this.getFieldValue('SER_PIN')
        .replace(',', '_')
        .replace(/None/g, 'N');
  }
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial initialize') === -1) {
    return '// ERROR: Serial is not initialized!\n';
  } else {
    const type = this.getFieldValue('TYPE');
    return ['fdserial_' + type + '(fdser' + p + ')', Blockly.propc.ORDER_NONE];
  }
};

/**
 * Serial Print Multiple block definition
 * @type {{
 *  init: Blockly.Blocks.serial_print_multiple.init,
 *  saveConnections: (
 *        Blockly.Blocks.console_print_multiple.saveConnections
 *      | Blockly.Blocks.serial_scan_multiple.saveConnections
 *      | Blockly.Blocks.graph_output.saveConnections
 *      | Blockly.Blocks.math_arithmetic.saveConnections
 *      | Blockly.Blocks.string_var_length.saveConnections
 *      | Blockly.Blocks.controls_if.saveConnections
 *      |*),
 *  compose: Blockly.Blocks.serial_print_multiple.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (
 *         Blockly.Blocks.procedures_defnoreturn.decompose
 *      | (function(*): Blockly.Block)
 *      | (function(*): Blockly.Block)
 *      | (function(*): Blockly.Block)
 *      | Blockly.Blocks.math_arithmetic.decompose
 *      | Blockly.Blocks.string_var_length.decompose
 *      |*),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_print_multiple.onchange,
 *  domToMutation: Blockly.Blocks.serial_print_multiple.domToMutation,
 *  updateSerPin: (
 *      Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      | Blockly.Blocks.wx_scan_multiple.updateSerPin
 *      | Blockly.Blocks.string_scan_multiple.updateSerPin
 *      | Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      |*)
 *  }}
 */
Blockly.Blocks.serial_print_multiple = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_PRINT_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial transmit');
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
    this.setWarningText(null);
    this.ser_pins = [];
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    const divs = [];
    container.setAttribute('pinmenu', JSON.stringify(this.ser_pins));
    container.setAttribute('options', JSON.stringify(this.optionList_));
    for (let fv = 0; fv < this.optionList_.length; fv++) {
      divs.push(this.getFieldValue('DIV' + fv) || '0');
    }
    container.setAttribute('divisors', JSON.stringify(divs));
    if (this.getInput('SERPIN')) {
      container.setAttribute('serpin', this.getFieldValue('SER_PIN'));
    }
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    if (container.getAttribute('serpin')) {
      this.ser_pins = JSON.parse(container.getAttribute('pinmenu'));
      this.updateSerPin();
    }
    if (this.getInput('PRINT0')) {
      this.removeInput('PRINT0');
    }
    if (this.getInput('PRINT1')) {
      this.removeInput('PRINT1');
    }
    if (this.getInput('NEWLINE')) {
      this.removeInput('NEWLINE');
    }
    const value = JSON.parse(container.getAttribute('options'));
    const divs = JSON.parse(container.getAttribute('divisors'));
    this.optionList_ = value;
    for (let i = 0; i < this.optionList_.length; i++) {
      let label = 'decimal number';
      let chk = 'Number';
      if (this.optionList_[i] === 'str') {
        label = 'text';
        chk = 'String';
      } else if (this.optionList_[i] === 'char') {
        label = 'ASCII character';
      } else if (this.optionList_[i] === 'hex') {
        label = 'hexadecimal number';
      } else if (this.optionList_[i] === 'bin') {
        label = 'binary number';
      }
      if (this.optionList_[i] === 'float') {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'DIV' + i);
        this.setFieldValue(divs[i], 'DIV' + i);
      } else {
        this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i);
      }
    }
  },
  decompose: Blockly.Blocks['console_print_multiple'].decompose,
  compose: function(containerBlock) {
    // Delete everything.
    let i = 0;
    let printInput;
    while (this.getInput('PRINT' + i)) {
      this.removeInput('PRINT' + i);
      i++;
    }
    i = 0;
    this.optionList_.length = 0;
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let label = '';
    let chk = '';
    while (clauseBlock) {
      chk = 'Number';
      if (clauseBlock.type === 'console_print_dec') {
        this.optionList_.push('dec');
        label = 'decimal number';
      } else if (clauseBlock.type === 'console_print_hex') {
        this.optionList_.push('hex');
        label = 'hexadecimal number';
      } else if (clauseBlock.type === 'console_print_bin') {
        this.optionList_.push('bin');
        label = 'binary number';
      } else if (clauseBlock.type === 'console_print_char') {
        this.optionList_.push('char');
        label = 'ASCII character';
      } else if (clauseBlock.type === 'console_print_str') {
        this.optionList_.push('str');
        chk = 'String';
        label = 'text';
      }
      // Reconnect any child blocks.
      if (clauseBlock.type === 'console_print_float') {
        this.optionList_.push('float');
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField('float point  divide by', 'TYPE' + i)
            .appendField(new Blockly.FieldNumber(
                '100', null, null, 1), 'DIV' + i);
      } else {
        printInput = this.appendValueInput('PRINT' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .setCheck(chk)
            .appendField(label, 'TYPE' + i);
      }

      if (clauseBlock.valueConnection_) {
        printInput.connection.connect(clauseBlock.valueConnection_);
      }
      i++;
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
  },
  updateSerPin: Blockly.Blocks['serial_send_text'].updateSerPin,
  saveConnections: Blockly.Blocks['console_print_multiple'].saveConnections,
  onchange: Blockly.Blocks['serial_send_text'].onchange,
};

Blockly.propc.serial_print_multiple = Blockly.propc.console_print_multiple;

/**
 * Serial Scan Multiple block definition
 * @type {{
 *  init: Blockly.Blocks.serial_scan_multiple.init,
 *  saveConnections: Blockly.Blocks.serial_scan_multiple.saveConnections,
 *  updateShape_: Blockly.Blocks.serial_scan_multiple.updateShape_,
 *  compose: Blockly.Blocks.serial_scan_multiple.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (function(*): Blockly.Block),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.serial_scan_multiple.onchange,
 *  domToMutation: Blockly.Blocks.serial_scan_multiple.domToMutation,
 *  updateSerPin: (
 *        Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      | Blockly.Blocks.wx_scan_multiple.updateSerPin
 *      | Blockly.Blocks.string_scan_multiple.updateSerPin
 *      | Blockly.Blocks.serial_send_text.updateSerPin
 *      | Blockly.Blocks.xbee_scan_multiple.updateSerPin
 *      | *)
 *  }}
 */
Blockly.Blocks.serial_scan_multiple = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_SCAN_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial receive');
    this.optionList_ = ['dec', 'char'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator([
      'console_print_dec',
      'console_print_hex',
      'console_print_bin',
      'console_print_float',
      'console_print_char',
    ]));
    this.setWarningText(null);
    this.ser_pins = [];
    this.scanAfter = '';
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('pinmenu', JSON.stringify(this.ser_pins));
    container.setAttribute('options', JSON.stringify(this.optionList_));
    container.setAttribute('scanafter', this.scanAfter);
    container.setAttribute(
        'prefix',
        this.setPrefix_ ? this.getFieldValue('CONNECTION') : '');
    if (this.getInput('SERPIN')) {
      container.setAttribute('serpin', this.getFieldValue('SER_PIN'));
    }
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    const serpin = container.getAttribute('serpin');
    if (serpin) {
      this.ser_pins = JSON.parse(container.getAttribute('pinmenu'));
      this.updateSerPin();
    }
    this.scanAfter = container.getAttribute('scanafter') || '';
    this.optionList_ = JSON.parse(container.getAttribute('options'));
    if (this.setPrefix_) {
      this.setPrefix_(container.getAttribute('prefix') || '');
    }
    this.updateShape_();
  },
  decompose: function(workspace) {
    // Populate the mutator's dialog with this block's components.
    let cBlock = 'serial_scan_container';
    let subBlock = 'console_print_';
    if (this.type === 'string_scan_multiple' ||
        this.type === 'string_sprint_multiple') {
      cBlock = 'string_scan_container';
      subBlock = 'string_scan_';
    }
    const containerBlock = workspace.newBlock(cBlock);
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.optionList_.length; i++) {
      const optionBlock = workspace.newBlock(
          subBlock + this.optionList_[i]);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    if (this.type === 'string_scan_multiple' &&
        this.scanAfter && this.scanAfter.indexOf('After') > -1) {
      containerBlock.setFieldValue(this.scanAfter, 'SCAN_START');
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Reconfigure this block based on the mutator dialog's components.
    this.scanAfter = containerBlock.getFieldValue('SCAN_START');
    let optionBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    this.optionList_.length = 0;
    const data = [];
    while (optionBlock) {
      const obt = optionBlock.type.split('_');
      const obl = obt.length - 1;
      this.optionList_.push(obt[obl]);
      // collect the values of the fields that have been stored in
      // the option blocks in the mutator
      data.push([optionBlock.varName_, optionBlock.floatMult_]);
      optionBlock = optionBlock.nextConnection &&
                    optionBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Restore field values
    for (let i = 0; i < data.length; i++) {
      if (data[i][0]) {
        this.setFieldValue(data[i][0], 'CPU' + i);
      }
      if (data[i][1]) {
        this.setFieldValue(data[i][1], 'MULT' + i);
      }
    }
  },
  saveConnections: function(containerBlock) {
    let optionBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    // Capture and store any field values before the input is removed/deleted
    while (optionBlock) {
      optionBlock.varName_ = this.getFieldValue('CPU' + i);
      optionBlock.floatMult_ = this.getFieldValue('MULT' + i);
      i++;
      optionBlock = optionBlock.nextConnection &&
                    optionBlock.nextConnection.targetBlock();
    }
  },
  updateSerPin: Blockly.Blocks['serial_send_text'].updateSerPin,
  updateShape_: function() {
    // Delete everything.
    let i = 0;
    while (this.getInput('OPTION' + i)) {
      this.removeInput('OPTION' + i);
      i++;
    }
    // Capture and disconnect a connected block
    let connectedBlock = null;
    if (this.getInput('SCAN_AFTER')) {
      connectedBlock = this.getInput('SCAN_AFTER').connection.targetBlock();
      if (connectedBlock) {
        connectedBlock.outputConnection.disconnect();
      }
      this.removeInput('SCAN_AFTER');
    }
    // Rebuild block.
    for (i = 0; i < this.optionList_.length; i++) {
      const type = this.optionList_[i];
      let label = 'store ASCII character in';
      if (type === 'dec') {
        label = 'store decimal number in';
      } else if (type === 'hex') {
        label = 'store hexadecimal number in';
      } else if (type === 'bin') {
        label = 'store binary number in';
      }
      if (type === 'float') {
        this.appendDummyInput('OPTION' + i)
            .appendField('store float point \u2715')
            .appendField(new Blockly.FieldDropdown(
                Blockly.DROPDOWN_MULTIPLIER), 'MULT' + i)
            .appendField('in', 'TYPE' + i);
        this.setFieldValue('100', 'MULT' + i);
      } else {
        this.appendDummyInput('OPTION' + i)
            .appendField(label, 'TYPE' + i);
      }
      this.getInput('OPTION' + i)
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_GET_ITEM), 'CPU' + i);
    }
    if (this.scanAfter === 'AfterStr') {
      this.appendValueInput('SCAN_AFTER')
          .appendField('start after text');
      // .setCheck('String');
    } else if (this.scanAfter === 'AfterPos') {
      this.appendValueInput('SCAN_AFTER')
          .appendField('start from position');
      // .setCheck('Number');
    }
    // Reconnect a previously connected block
    if (connectedBlock && this.getInput('SCAN_AFTER')) {
      connectedBlock.outputConnection.connect(
          this.getInput('SCAN_AFTER').connection);
    }
  },
  onchange: Blockly.Blocks['serial_send_text'].onchange,
};

/**
 * Serial Scan Container block definition
 * @type {{init: Blockly.Blocks.serial_scan_container.init}}
 */
Blockly.Blocks.serial_scan_container = {
  // Container.
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('receive');
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },
};

/**
 * Serial Scan Multiple code generator
 * @return {string}
 */
Blockly.propc.serial_scan_multiple = function() {
  let p = '';
  if (this.ser_pins.length > 0) {
    p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
  }
  if (this.getInput('SERPIN')) {
    p = this.getFieldValue('SER_PIN').replace(',', '_').replace(/None/g, 'N');
  }
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial initialize') > -1) {
    let code = 'dscan(fdser' + p + ', "';
    let varList = '';
    let codeAdd = '';
    let i = 0;
    while (this.getFieldValue('CPU' + i)) {
      if (this.getFieldValue('TYPE' + i).includes('store decimal number')) {
        code += '%d';
      } else if (this.getFieldValue(
          'TYPE' + i).includes('store ASCII character')) {
        code += '%c';
      } else if (this.getFieldValue(
          'TYPE' + i).includes('store hexadecimal number')) {
        code += '%x';
      } else if (this.getFieldValue(
          'TYPE' + i).includes('store binary number')) {
        code += '%b';
      } else if (this.getFieldValue('TYPE' + i) === 'in') {
        code += '%f';
      }
      if (this.getFieldValue('TYPE' + i) === 'in') {
        varList += ', &__fpBuf' + i;
        codeAdd += Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
        codeAdd += ' = (int) (__fpBuf' + i + ' * ' +
            this.getFieldValue('MULT' + i) + ');\n';
        if (!this.disabled) {
          Blockly.propc.global_vars_['floatPointScanBuffer' + i] =
              'float __fpBuf' + i + ';';
        }
      } else {
        varList += ', &' + Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
      }
      i++;
    }
    code += '"' + varList + ');\n' + codeAdd;
    return code;
  } else {
    return '// ERROR: Serial is not initialized!\n';
  }
};

/**
 * Serial Transmit block definition
 * @type {{
 *  init: Blockly.Blocks.serial_tx.init,
 *  helpUrl: string
 *  }}
 *  @deprecated
 */
Blockly.Blocks.serial_tx = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_TX_TOOLTIP);
    this.setColour('#FF8800');
    this.appendDummyInput()
        .appendField('Serial transmit')
        .appendField(new Blockly.FieldDropdown([
          ['number (32-bit integer)', 'INT'],
          ['byte (ASCII character)', 'BYTE'],
        ]), 'TYPE');
    this.appendValueInput('VALUE')
        .setCheck(null);
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText('WARNING: This block has been deprecated\nand may not' +
        ' work correctly!\nPlease use one of the blocks\navailable' +
        ' in the menu.');
  },
};

/**
 * Serial Transmit code generator
 * @return {string}
 * @deprecated
 */
Blockly.propc.serial_tx = function() {
  return '// ERROR: This block has been deprecated, please' +
      ' use a different serial transmit block!\n';
};

/**
 * Serial Receive block definition
 * @type {{
 *  init: Blockly.Blocks.serial_rx.init,
 *  helpUrl: string
 *  }}
 *  @deprecated
 */
Blockly.Blocks.serial_rx = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SERIAL_RX_TOOLTIP);
    this.setColour('#FF8800');
    this.appendDummyInput()
        .appendField('Serial receive')
        .appendField(new Blockly.FieldDropdown([
          ['number (32-bit integer)', 'INT'],
          ['byte (ASCII character)', 'BYTE'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText('WARNING: This block has been deprecated\nand may' +
        ' not work correctly!\nPlease use one of the blocks\navailable' +
        ' in the menu.');
  },
};

/**
 * Serial Receive code generator
 * @return {string}
 * @deprecated
 */
Blockly.propc.serial_rx = function() {
  return '// ERROR: This block has been deprecated, please use' +
      ' a different serial receive block!\n';
};

// --------------- Shift In/Out Blocks ----------------------------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.shift_in.init,
 *  setPinMenus: Blockly.Blocks.shift_in.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: Blockly.Blocks.shift_in.updateConstMenu
 *  }}
 */
Blockly.Blocks.shift_in = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    const shiftBytes = [];
    for (let t = 2; t < 33; t++) {
      shiftBytes.push([t.toString(10), t.toString(10)]);
    }
    this.setTooltip(Blockly.MSG_SHIFT_IN_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('shift in')
        .appendField(new Blockly.FieldDropdown(shiftBytes), 'BITS')
        .appendField('bits')
        .appendField(new Blockly.FieldDropdown([
          ['MSB first', 'MSB'],
          ['LSB first', 'LSB'],
        ]),
        'MODE')
        .appendField(new Blockly.FieldDropdown([
          ['before clock', 'PRE'],
          ['after clock', 'POST'],
        ]),
        'ORDER');
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.updateConstMenu();
  },
  updateConstMenu: function(oldValue, newValue) {
    this.userDefinedConstantsList_ = [];
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let i = 0; i < allBlocks.length; i++) {
      if (allBlocks[i].type === 'constant_define') {
        let vName = allBlocks[i].getFieldValue('CONSTANT_NAME');
        if (vName === oldValue && newValue) {
          vName = newValue;
        }
        if (vName) {
          this.userDefinedConstantsList_.push(vName);
        }
      }
    }
    this.userDefinedConstantsList_ =
        this.userDefinedConstantsList_.sortedUnique();
    this.setPinMenus(oldValue, newValue);
  },
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('DATA');
    const m2 = this.getFieldValue('CLK');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('DATA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  // returns an array of arrays built from the original array.
                  return [value, value];
                }))),
        'DATA')
        .appendField('CLK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  // returns an array of arrays built from the original array.
                  return [value, value];
                }))),
        'CLK');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'DATA');
    } else if (m1) {
      this.setFieldValue(m1, 'DATA');
    }

    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'CLK');
    } else if (m2) {
      this.setFieldValue(m2, 'CLK');
    }
  },
};

/**
 * Shift In C code generator
 * @return {[string, number]}
 */
Blockly.propc.shift_in = function() {
  const profile = getDefaultProfile();
  let dPin = this.getFieldValue('DATA');
  let cPin = this.getFieldValue('CLK');
  const bits = this.getFieldValue('BITS');
  const mode = this.getFieldValue('MODE');
  const ord = this.getFieldValue('ORDER');

  if (profile.digital.toString().indexOf(dPin + ',' + dPin) === -1) {
    dPin = 'MY_' + dPin;
  }
  if (profile.digital.toString().indexOf(cPin + ',' + cPin) === -1) {
    cPin = 'MY_' + cPin;
  }

  return [
    'shift_in(' + dPin + ', ' + cPin + ', ' + mode + ord + ', ' + bits + ')',
    Blockly.propc.ORDER_NONE,
  ];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.shift_out.init,
 *  setPinMenus: *,
 *  helpUrl: string,
 *  updateConstMenu: *
 * }}
 */
Blockly.Blocks.shift_out = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    const shiftBytes = [];
    for (let t = 2; t < 33; t++) {
      shiftBytes.push([t.toString(10), t.toString(10)]);
    }
    this.setTooltip(Blockly.MSG_SHIFT_OUT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('shift out the')
        .appendField(new Blockly.FieldDropdown(
            shiftBytes), 'BITS')
        .appendField('lowest bits of');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['MSB first', 'MSBFIRST'],
          ['LSB first', 'LSBFIRST'],
        ]), 'MODE');
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: Blockly.Blocks['shift_in'].setPinMenus,
};

/**
 * Shift Out c code generator
 * @return {string}
 */
Blockly.propc.shift_out = function() {
  const profile = getDefaultProfile();
  const bits = this.getFieldValue('BITS');
  const mode = this.getFieldValue('MODE');
  let dPin = this.getFieldValue('DATA');
  let cPin = this.getFieldValue('CLK');
  const val = Blockly.propc.valueToCode(
      this, 'VALUE', Blockly.propc.ORDER_NONE) || '0';

  if (profile.digital.toString().indexOf(dPin + ',' + dPin) === -1) {
    dPin = 'MY_' + dPin;
  }
  if (profile.digital.toString().indexOf(cPin + ',' + cPin) === -1) {
    cPin = 'MY_' + cPin;
  }

  return 'shift_out(' + dPin + ', ' + cPin + ', ' + mode + ', ' + bits +
      ', ' + val + ');\n';
};

// --------------- Serial LCD Blocks ------------------------------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_init.init,
 *  setPinMenus: Blockly.Blocks.debug_lcd_init.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.debug_lcd_init = {
  helpUrl: Blockly.MSG_SERIAL_LCD_HELPURL,
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
    const m = this.getFieldValue('PIN');
    const b = this.getFieldValue('BAUD');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('Serial LCD initialize PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  // returns an array of arrays built from the original array.
                  return [value, value];
                }))),
        'PIN')
        .appendField('baud')
        .appendField(new Blockly.FieldDropdown([
          ['2400', '2400'],
          ['9600', '9600'],
          ['19200', '19200'],
        ]),
        'BAUD');
    this.setFieldValue(b, 'BAUD');
    if (m && m === oldValue && newValue) {
      this.setFieldValue(newValue, 'PIN');
    } else if (m) {
      this.setFieldValue(m, 'PIN');
    }
  },
};

/**
 * Debug LCD Init
 * @return {string}
 */
Blockly.propc.debug_lcd_init = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    let dropdownPin = this.getFieldValue('PIN');
    if (profile.digital.toString()
        .indexOf(dropdownPin + ',' + dropdownPin) === -1) {
      dropdownPin = 'MY_' + dropdownPin;
    }
    const baud = this.getFieldValue('BAUD');

    Blockly.propc.global_vars_['setup_debug_lcd'] = 'serial *serial_lcd;';
    Blockly.propc.setups_['setup_debug_lcd'] =
        'serial_lcd  = serial_open(' + dropdownPin + ', ' +
        dropdownPin + ', 0, ' + baud + ');';
  }

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial LCD initialize') === -1) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    return 'writeChar(serial_lcd, 22);\npause(5);\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_music_note.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.debug_lcd_music_note.onchange
 * }}
 */
Blockly.Blocks.debug_lcd_music_note = {
  helpUrl: Blockly.MSG_SERIAL_LCD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DEBUG_LCD_MUSIC_NOTE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial LCD play note')
        .appendField(new Blockly.FieldDropdown([
          ['C', '223'],
          ['C#', '224'],
          ['D', '225'],
          ['D#', '226'],
          ['E', '227'],
          ['F', '228'],
          ['F#', '229'],
          ['G', '230'],
          ['G#', '231'],
          ['A', '220'],
          ['A#', '221'],
          ['B', '222'],
          ['no note (rest)', '232'],
        ]), 'NOTE')
        .appendField('octave')
        .appendField(new Blockly.FieldDropdown([
          ['3rd', '215'],
          ['4th', '216'],
          ['5th', '217'],
          ['6th', '218'],
          ['7th', '219'],
        ]), 'OCTAVE')
        .appendField('length')
        .appendField(new Blockly.FieldDropdown([
          ['whole (2 s)', '214'],
          ['half (1 s)', '213'],
          ['quarter (500 ms)', '212'],
          ['eigth (250 ms)', '211'],
          ['sixteenth (125 ms)', '210'],
          ['thirty-second (63 ms)', '209'],
          ['sixty-fourth (31 ms)', '208'],
        ]), 'LENGTH');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('LCD initialize') === -1) {
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
Blockly.propc.debug_lcd_music_note = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Serial LCD initialize') === -1) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    const dropdownNote = this.getFieldValue('NOTE');
    const dropdownOctave = this.getFieldValue('OCTAVE');
    const dropdownLength = this.getFieldValue('LENGTH');

    let code = '';
    code += 'writeChar(serial_lcd, ' + dropdownOctave + ');\n';
    code += 'writeChar(serial_lcd, ' + dropdownLength + ');\n';
    code += 'writeChar(serial_lcd, ' + dropdownNote + ');\n';

    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_print.init,
 *  onchange: Blockly.Blocks.debug_lcd_print.onchange
 * }}
 */
Blockly.Blocks.debug_lcd_print = {
  init: function() {
    this.setHelpUrl(Blockly.MSG_SERIAL_LCD_HELPURL);
    this.setTooltip(Blockly.MSG_DEBUG_LCD_PRINT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    let mt = 'Serial';
    if (this.type.indexOf('parallel') > -1) {
      mt = 'Parallel';
      this.setHelpUrl(Blockly.MSG_PARALLEL_LCD_HELPURL);
    }
    this.appendValueInput('MESSAGE')
        .setCheck('String')
        .appendField(mt + ' LCD print text ');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (
      (allBlocks.indexOf('Serial LCD initialize') === -1 &&
       this.type === 'debug_lcd_print') ||
      (allBlocks.indexOf('Parallel LCD initialize') === -1 &&
       this.type === 'parallel_lcd_print')) {
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
Blockly.propc.debug_lcd_print = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  let st = 'serial';
  if (this.type === 'parallel_lcd_print') {
    st = 'parallel';
  }
  if ((allBlocks.indexOf('Serial LCD initialize') === -1 && st === 'serial') ||
    (allBlocks.indexOf('Parallel LCD initialize') === -1 &&
        st === 'parallel')) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    const msg = Blockly.propc.valueToCode(
        this, 'MESSAGE', Blockly.propc.ORDER_NONE);
    return 'dprint(' + st + '_lcd, ' + msg.replace(/%/g, '%%') + ');\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_number.init,
 *  onchange: Blockly.Blocks.debug_lcd_number.onchange
 * }}
 */
Blockly.Blocks.debug_lcd_number = {
  init: function() {
    this.setHelpUrl(Blockly.MSG_SERIAL_LCD_HELPURL);
    this.setTooltip(Blockly.MSG_DEBUG_LCD_NUMBER_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    let mt = 'Serial';
    if (this.type.indexOf('parallel') > -1) {
      mt = 'Parallel';
      this.setHelpUrl(Blockly.MSG_PARALLEL_LCD_HELPURL);
    }
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField(mt + ' LCD print number');
    this.appendDummyInput()
        .appendField('as')
        .appendField(new Blockly.FieldDropdown([
          ['Decimal', 'DEC'],
          ['Hexadecimal', 'HEX'],
          ['Binary', 'BIN'],
        ]), 'FORMAT');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if ((allBlocks.indexOf('Serial LCD initialize') === -1 &&
        this.type === 'debug_lcd_number') ||
                (allBlocks.indexOf('Parallel LCD initialize') === -1 &&
                    this.type === 'parallel_lcd_number')) {
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
Blockly.propc.debug_lcd_number = function() {
  let code = '';
  let st = 'serial';
  if (this.type === 'parallel_lcd_print') {
    st = 'parallel';
  }
  if ((Blockly.getMainWorkspace().getBlocksByType(
      'debug_lcd_init', false).length === 0 && st === 'serial') ||
    (Blockly.getMainWorkspace().getBlocksByType(
        'parallel_lcd_init', false).length === 0 && st === 'parallel')) {
    code += '// ERROR: LCD is not initialized!\n';
  } else {
    const value = Blockly.propc.valueToCode(
        this, 'VALUE', Blockly.propc.ORDER_ATOMIC);
    const format = this.getFieldValue('FORMAT');

    code += 'dprint(' + st + '_lcd, ';
    if (format === 'BIN') {
      code += '"%b"';
    } else if (format === 'HEX') {
      code += '"%x"';
    } else {
      code += '"%d"';
    }

    code += ', ' + value + ');';
  }
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.debug_lcd_action.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.debug_lcd_action.onchange
 * }}
 */
Blockly.Blocks.debug_lcd_action = {
  helpUrl: Blockly.MSG_SERIAL_LCD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DEBUG_LCD_ACTION_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Serial LCD command')
        .appendField(new Blockly.FieldDropdown([
          ['clear screen', '12'],
          ['move cursor right', '9'],
          ['move cursor left', '8'],
          ['move cursor down', '10'],
          ['carriage return', '13'],
          ['backlight on', '17'],
          ['backlight off', '18'],
          ['display off', '21'],
          ['display on, cursor off', '22'],
          ['display on, cursor off, blink', '23'],
          ['display on, cursor on', '24'],
          ['display on, cursor on, blink', '25'],
        ]), 'ACTION');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    if (Blockly.getMainWorkspace().getBlocksByType(
        'debug_lcd_init', false).length === 0) {
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
Blockly.propc.debug_lcd_action = function() {
  if (Blockly.getMainWorkspace().getBlocksByType(
      'debug_lcd_init', false).length === 0) {
    return '// ERROR: LCD is not initialized!\n';
  } else {
    const action = this.getFieldValue('ACTION');
    let code = '';
    code += 'writeChar(serial_lcd, ' + action + ');\n';
    code += 'pause(5);\n';

    return code;
  }
};

/**
 *
 * @type {{i
 *  nit: Blockly.Blocks.debug_lcd_set_cursor.init,
 *  onchange: Blockly.Blocks.debug_lcd_set_cursor.onchange
 * }}
 */
Blockly.Blocks.debug_lcd_set_cursor = {
  init: function() {
    this.setHelpUrl(Blockly.MSG_SERIAL_LCD_HELPURL);
    this.setTooltip(Blockly.MSG_DEBUG_LCD_SET_CURSOR_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    let mt = 'Serial';
    if (this.type.indexOf('parallel') > -1) {
      mt = 'Parallel';
      this.setHelpUrl(Blockly.MSG_PARALLEL_LCD_HELPURL);
    }
    this.appendValueInput('ROW')
        .appendField(mt + ' LCD set cursor row')
        .setCheck('Number');
    this.appendValueInput('COLUMN')
        .appendField('column')
        .setCheck('Number');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if ((allBlocks.indexOf('Serial LCD initialize') === -1 &&
        this.type === 'debug_lcd_set_cursor') ||
            (allBlocks.indexOf('Parallel LCD initialize') === -1 &&
                this.type === 'parallel_lcd_set_cursor')) {
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
Blockly.propc.debug_lcd_set_cursor = function() {
  if ((Blockly.getMainWorkspace().getBlocksByType(
      'debug_lcd_init', false).length === 0 &&
      this.type === 'debug_lcd_set_cursor') ||
      (Blockly.getMainWorkspace().getBlocksByType(
          'parallel_lcd_init', false).length === 0 &&
          this.type === 'parallel_lcd_set_cursor')) {
    return '// LCD is not initialized!\n';
  } else {
    const row = Blockly.propc.valueToCode(
        this, 'ROW', Blockly.propc.ORDER_NONE);
    const column = Blockly.propc.valueToCode(
        this, 'COLUMN', Blockly.propc.ORDER_NONE);

    if (this.type === 'debug_lcd_set_cursor') {
      return 'writeChar(serial_lcd, (128 + (constrainInt(' + row +
          ', 0, 3) * 20) + constrainInt(' + column + ', 0, 19)));\n';
    } else {
      return 'lcdParallel_setCursor(parallel_lcd, ' + column +
          ', char ' + row + ');';
    }
  }
};

/**
 *
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
Blockly.Blocks.debug_lcd_print_multiple = {
  init: function() {
    this.setHelpUrl(Blockly.MSG_SERIAL_LCD_HELPURL);
    this.setTooltip(Blockly.MSG_DEBUG_LCD_PRINT_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    let mt = 'Serial';
    if (this.type.indexOf('parallel') > -1) {
      mt = 'Parallel';
      this.setHelpUrl(Blockly.MSG_PARALLEL_LCD_HELPURL);
    }
    this.appendDummyInput()
        .appendField(mt + ' LCD print');
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
      warnTxt = 'LCD print multiple must have at least one term.';
    }
    if ((Blockly.getMainWorkspace().getBlocksByType(
        'debug_lcd_init', false).length === 0 &&
        this.type === 'debug_lcd_print_multiple') ||
        (Blockly.getMainWorkspace().getBlocksByType(
            'parallel_lcd_init', false).length === 0 &&
         this.type === 'parallel_lcd_print_multiple')) {
      warnTxt = 'WARNING: You must use an LCD\ninitialize block at the' +
          ' beginning of your program!';
    }
    this.setWarningText(warnTxt);
  },
};

Blockly.propc.debug_lcd_print_multiple = Blockly.propc.console_print_multiple;

// --------------- Parallel LCD Blocks ----------------------------------------

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
    for (i = 2; i < 8; i++) {
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

Blockly.Blocks.parallel_lcd_print = Blockly.Blocks.debug_lcd_print;
Blockly.propc.parallel_lcd_print = Blockly.propc.debug_lcd_print;

Blockly.Blocks.parallel_lcd_number = Blockly.Blocks.debug_lcd_number;
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

Blockly.Blocks.parallel_lcd_set_cursor = Blockly.Blocks.debug_lcd_set_cursor;
Blockly.propc.parallel_lcd_set_cursor = Blockly.propc.debug_lcd_set_cursor;

Blockly.Blocks.parallel_lcd_print_multiple =
    Blockly.Blocks.debug_lcd_print_multiple;
Blockly.propc.parallel_lcd_print_multiple =
    Blockly.propc.console_print_multiple;

// --------------- XBee Blocks ------------------------------------------------

/**
 * XBee setup
 * @type {{
 *  init: Blockly.Blocks.xbee_setup.init,
 *  setPinMenus: Blockly.Blocks.xbee_setup.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.xbee_setup = {
  helpUrl: Blockly.MSG_XBEE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_XBEE_SETUP_TOOLTIP);
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
    const m1 = this.getFieldValue('DO_PIN');
    const m2 = this.getFieldValue('DI_PIN');
    const b = this.getFieldValue('BAUD');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('XBee initialize DI')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                }))), 'DO_PIN')
        .appendField('DO')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(function(
                value) {
              return [value, value];
            }))), 'DI_PIN')
        .appendField('baud')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['2400', '2400'],
          ['4800', '4800'],
          ['19200', '19200'],
          ['57600', '57600'],
          ['115200', '115200'],
        ]), 'BAUD');
    this.setFieldValue(b, 'BAUD');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'DO_PIN');
    } else if (m1) {
      this.setFieldValue(m1, 'DO_PIN');
    }
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'DI_PIN');
    } else if (m2) {
      this.setFieldValue(m2, 'DI_PIN');
    }
  },
};

/**
 * XBee setup c code generator
 * @return {string}
 */
Blockly.propc.xbee_setup = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    let diPin = this.getFieldValue('DI_PIN');
    let doPin = this.getFieldValue('DO_PIN');

    if (profile.digital.toString().indexOf(diPin + ',' + diPin) === -1) {
      diPin = 'MY_' + diPin;
    }
    if (profile.digital.toString().indexOf(doPin + ',' + doPin) === -1) {
      doPin = 'MY_' + doPin;
    }

    const m = [diPin, doPin, '0', this.getFieldValue('BAUD')];

    Blockly.propc.definitions_['include fdserial'] = '#include "fdserial.h"';
    Blockly.propc.global_vars_['xbee'] = 'fdserial *xbee;';
    Blockly.propc.setups_['xbee'] = 'xbee = fdserial_open(' +
        m.join(',') + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.xbee_transmit.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.xbee_transmit.onchange
 * }}
 */
Blockly.Blocks.xbee_transmit = {
  helpUrl: Blockly.MSG_XBEE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_XBEE_TRANSMIT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('XBee transmit')
        .appendField(new Blockly.FieldDropdown([
          ['text', 'TEXT'],
          ['decimal number', 'INT'],
          ['hexadecimal number', 'HEX'],
          ['binary number', 'BIN'],
          ['ASCII character', 'BYTE'],
        ]), 'TYPE');
    this.appendValueInput('VALUE')
        .setCheck(null);
    this.appendDummyInput('NEWLINE')
        .appendField('then a carriage return')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_nl');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('XBee initialize') === -1) {
      this.setWarningText('WARNING: You must use an XBee\ninitialize block' +
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
Blockly.propc.xbee_transmit = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('XBee initialize') === -1) {
    return '// ERROR: XBee is not initialized!\n';
  } else {
    const type = this.getFieldValue('TYPE');
    let data = Blockly.propc.valueToCode(
        this, 'VALUE', Blockly.propc.ORDER_ATOMIC) || '0';
    let checkbox = this.getFieldValue('ck_nl');
    if (checkbox === 'TRUE') {
      checkbox = '\\r';
    } else {
      checkbox = '';
    }

    if (type === 'BYTE') {
      if (!(data.length === 3 && data[0] === '\'' && data[2] === '\'')) {
        if (data !== data.replace(/[^0-9]+/g, '')) {
          data = '(' + data + ' & 0xFF)';
        } else if (!(0 < parseInt(data) && parseInt(data) < 256)) {
          data = '(' + data + ' & 0xFF)';
        }
      }

      return 'fdserial_txChar(xbee, ' + data + ');\n';
    } else if (type === 'INT') {
      return 'dprint(xbee, "%d' + checkbox + '", ' + data + ');\n';
    } else if (type === 'HEX') {
      return 'dprint(xbee, "%x' + checkbox + '", ' + data + ');\n';
    } else if (type === 'BIN') {
      return 'dprint(xbee, "%b' + checkbox + '", ' + data + ');\n';
    } else {
      let code = 'dprint(xbee, "%s' + checkbox + '", ' +
          data.replace(/%/g, '%%') + ');\n';
      code += 'while(!fdserial_txEmpty(xbee));\n';
      code += 'pause(5);\n';

      return code;
    }
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.xbee_receive.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.xbee_receive.onchange
 * }}
 */
Blockly.Blocks.xbee_receive = {
  helpUrl: Blockly.MSG_XBEE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_XBEE_RECEIVE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('XBee receive')
        .appendField(new Blockly.FieldDropdown([
          ['text', 'TEXT'],
          ['decimal number', 'INT'],
          ['hexadecimal number', 'HEX'],
          ['binary number', 'BIN'],
          ['ASCII character', 'BYTE'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('XBee initialize') === -1) {
      this.setWarningText('WARNING: You must use an XBee\ninitialize block' +
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
Blockly.propc.xbee_receive = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('XBee initialize') === -1) {
    return '// ERROR: XBee is not initialized!\n';
  } else {
    const data = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VALUE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const type = this.getFieldValue('TYPE');

    if (type === 'BYTE') {
      return data + ' = fdserial_rxChar(xbee);\n';
    } else if (type === 'INT') {
      return 'dscan(xbee, "%d", &' + data + ');\n';
    } else if (type === 'BIN') {
      return 'dscan(xbee, "%b", &' + data + ');\n';
    } else if (type === 'HEX') {
      return 'dscan(xbee, "%x", &' + data + ');\n';
    } else {
      Blockly.propc.vartype_[data] = 'char *';

      return 'dscan(xbee, "%s", ' + data + ');\n';
    }
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.xbee_print_multiple.init,
 *  saveConnections: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.xbee_print_multiple.onchange,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.xbee_print_multiple = {
  helpUrl: Blockly.MSG_XBEE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_XBEE_PRINT_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('XBee transmit');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
        .appendField('text');
    this.appendValueInput('PRINT1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('decimal number');
    this.appendDummyInput('NEWLINE')
        .appendField('then a carriage return')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'ck_nl');
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
    this.setWarningText(null);
  },
  mutationToDom: Blockly.Blocks['console_print_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['console_print_multiple'].domToMutation,
  decompose: Blockly.Blocks['console_print_multiple'].decompose,
  compose: Blockly.Blocks['console_print_multiple'].compose,
  saveConnections: Blockly.Blocks['console_print_multiple'].saveConnections,
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('XBee initialize') === -1) {
      this.setWarningText('WARNING: You must use a XBee\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      let warnTxt = null;
      if (this.workspace && this.optionList_.length < 1) {
        warnTxt = 'XBee transmit multiple must have at least one term.';
      }
      this.setWarningText(warnTxt);
    }
  },
};

Blockly.propc.xbee_print_multiple = Blockly.propc.console_print_multiple;

/**
 *
 * @type {{
 *  init: Blockly.Blocks.xbee_scan_multiple.init,
 *  saveConnections: *,
 *  updateShape_: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.xbee_scan_multiple.onchange,
 *  domToMutation: *,
 *  updateSerPin: Blockly.Blocks.xbee_scan_multiple.updateSerPin
 * }}
 */
Blockly.Blocks.xbee_scan_multiple = {
  helpUrl: Blockly.MSG_XBEE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_XBEE_SCAN_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('XBee receive');
    this.optionList_ = ['dec', 'char'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator([
      'console_print_dec',
      'console_print_hex',
      'console_print_bin',
      'console_print_float',
      'console_print_char',
    ]));
    this.setWarningText(null);

    // Not used, but allows this block to share functions from
    // serial_scan_multiple block
    this.ser_pins = [];
  },
  mutationToDom: Blockly.Blocks['serial_scan_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_scan_multiple'].domToMutation,
  decompose: Blockly.Blocks['serial_scan_multiple'].decompose,
  compose: Blockly.Blocks['serial_scan_multiple'].compose,
  saveConnections: Blockly.Blocks['serial_scan_multiple'].saveConnections,
  updateShape_: Blockly.Blocks['serial_scan_multiple'].updateShape_,
  updateSerPin: function() {},
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    let warnTxt = null;
    if (allBlocks.toString().indexOf('XBee initialize') === -1) {
      warnTxt = 'WARNING: You must use an XBee\ninitialize block at the' +
          ' beginning of your program!';
    }
    if (this.workspace && this.optionList_.length < 1) {
      warnTxt = 'XBee receive must have at least one search term.';
    }
    this.setWarningText(warnTxt);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.xbee_scan_multiple = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('XBee initialize') > -1) {
    let code = 'dscan(xbee, "';
    let varList = '';
    let codeAdd = '';
    let i = 0;
    while (this.getFieldValue('CPU' + i)) {
      if (this.getFieldValue('TYPE' + i).includes('store decimal number')) {
        code += '%d';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store ASCII character')) {
        code += '%c';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store hexadecimal number')) {
        code += '%x';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store binary number')) {
        code += '%b';
      } else if (this.getFieldValue('TYPE' + i) === 'in') {
        code += '%f';
      }
      if (this.getFieldValue('TYPE' + i) === 'in') {
        varList += ', &__fpBuf' + i;
        codeAdd += Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
        codeAdd += ' = (int) (__fpBuf' + i + ' * ' +
            this.getFieldValue('MULT' + i) + ');\n';
        if (!this.disabled) {
          // TODO: Document propc global vars
          Blockly.propc.global_vars_['floatPointScanBuffer' + i] =
              'float __fpBuf' + i + ';';
        }
      } else {
        varList += ', &' + Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
      }
      i++;
    }
    code += '"' + varList + ');\n' + codeAdd;
    return code;
  } else {
    return '// ERROR: XBee is not initialized!\n';
  }
};

// -------------- OLED Display blocks ------------------------------------------

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
        myRootBlockName = Blockly.propc.variableDB_.getName(myRootBlock.
            getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);

        // TODO: Refactor with getBlocksByTye
        for (let k = 0;
          k < Blockly.getMainWorkspace().getAllBlocks().length; k++) {
          const tempBlock = Blockly.getMainWorkspace().getAllBlocks()[k];

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
             devType + '_init(' + pin.join(', ') + devWidthHeight + ');'];
      } else {
        Blockly.propc.setups_[this.myType] = this.myType + ' = ' +
            devType + '_init(' + pin.join(', ') + devWidthHeight + ');';
      }
    }
  }
  return '';
};

Blockly.Blocks.epaper_initialize = Blockly.Blocks.oled_initialize;
Blockly.propc.epaper_initialize = Blockly.propc.oled_initialize;

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

Blockly.Blocks.epaper_clear_screen = Blockly.Blocks.oled_clear_screen;
Blockly.propc.epaper_clear_screen = Blockly.propc.oled_clear_screen;

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
 *
 * @return {string}
 */
Blockly.propc.epaper_update = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf(this.displayKind + ' initialize') === -1) {
    return '// ERROR: ' + this.displayKind + ' is not initialized!\n';
  } else {
    return 'updateDisplay(' + this.myType + ');\n';
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
    // First x/y coordinates
    this.appendValueInput('POINT_X')
        .setCheck('Number')
        .appendField(this.displayKind + ' draw circle at (x)');
    this.appendValueInput('POINT_Y')
        .setCheck(null)
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('(y)');
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
      color = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      if (/0x[0-9A-Fa-f]{4}/.test(color)) {
        color = color.substr(2, 6);
      }
      color = 'remapColor(0x' +
          parseInt(color, 16).toString(16) +
          ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = 'drawCircle(' + this.myType + ', ';
    if (this.getFieldValue('ck_fill') === 'TRUE') {
      code = 'fillCircle(' + this.myType + ', ';
    }
    code += pointX0 + ', ' + pointY0 + ', ' + radius + ', ' + color + ');';
    return code;
  }
};

Blockly.Blocks.epaper_draw_circle = Blockly.Blocks.oled_draw_circle;
Blockly.propc.epaper_draw_circle = Blockly.propc.oled_draw_circle;

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
      color = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      if (/0x[0-9A-Fa-f]{4}/.test(color)) {
        color = color.substr(2, 6);
      }
      color = 'remapColor(0x' +
          parseInt(color, 16).toString(16) + ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    let code = '';
    code += 'drawLine(' + this.myType + ', ' + xOne + ', ' + yOne + ', ' +
        xTwo + ', ' + yTwo + ', ' + color + ');';
    return code;
  }
};

Blockly.Blocks.epaper_draw_line = Blockly.Blocks.oled_draw_line;
Blockly.propc.epaper_draw_line = Blockly.propc.oled_draw_line;

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
      color = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      if (/0x[0-9A-Fa-f]{4}/.test(color)) {
        color = color.substr(2, 6);
      }
      color = 'remapColor(0x' + parseInt(color, 16).toString(16) +
          ', "8R8G8B", "5R6G5B")';
    } else if (this.displayKind === 'ePaper') {
      color = this.getFieldValue('COLOR_VALUE');
    }
    return 'drawPixel(' + this.myType + ', ' + pointX + ', ' +
        pointY + ', ' + color + ');';
  }
};

Blockly.Blocks.epaper_draw_pixel = Blockly.Blocks.oled_draw_pixel;
Blockly.propc.epaper_draw_pixel = Blockly.propc.oled_draw_pixel;

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
      color = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      if (/0x[0-9A-Fa-f]{4}/.test(color)) {
        color = color.substr(2, 6);
      }
      color = 'remapColor(0x' + parseInt(color, 16).toString(16) +
          ', "8R8G8B", "5R6G5B")';
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
    code += color + ');';
    return code;
  }
};

Blockly.Blocks.epaper_draw_triangle = Blockly.Blocks.oled_draw_triangle;
Blockly.propc.epaper_draw_triangle = Blockly.propc.oled_draw_triangle;

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
      color = Blockly.propc.valueToCode(
          this, 'COLOR', Blockly.propc.ORDER_NONE) || '0xFFFFFF';
      if (/0x[0-9A-Fa-f]{4}/.test(color)) {
        color = color.substr(2, 6);
      }
      color = 'remapColor(0x' + parseInt(color, 16).toString(16) +
          ', "8R8G8B", "5R6G5B")';
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
    return code + color + ');';
  }
};

Blockly.Blocks.epaper_draw_rectangle = Blockly.Blocks.oled_draw_rectangle;
Blockly.propc.epaper_draw_rectangle = Blockly.propc.oled_draw_rectangle;

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

Blockly.Blocks.epaper_text_size = Blockly.Blocks.oled_text_size;
Blockly.propc.epaper_text_size = Blockly.propc.oled_text_size;

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
    code += 'setTextColor(' + this.myType + ', ' + fontColor + ');';
    code += 'setBgColor(' + this.myType + ', ' + backgroundColor + ');';
    return code;
  }
};

Blockly.Blocks.epaper_text_color = Blockly.Blocks.oled_text_color;
Blockly.propc.epaper_text_color = Blockly.propc.oled_text_color;

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
      this.setTooltip(Blockly.MSG_OLED_GET_MAX_HEIGHT_TOOLTIP
          .replace(/Display /, this.displayKind + ' '));
      this.appendDummyInput()
          .appendField(this.displayKind + ' max height');
    } else {
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

// TODO: What in going on here? Is swapping the height & width correct?
Blockly.Blocks.oled_get_max_width = Blockly.Blocks.oled_get_max_height;
Blockly.propc.oled_get_max_width = Blockly.propc.oled_get_max_height;
Blockly.Blocks.epaper_get_max_height = Blockly.Blocks.oled_get_max_height;
Blockly.propc.epaper_get_max_height = Blockly.propc.oled_get_max_height;
Blockly.Blocks.epaper_get_max_width = Blockly.Blocks.oled_get_max_height;
Blockly.propc.epaper_get_max_width = Blockly.propc.oled_get_max_height;

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

    return 'setCursor(' + this.myType + ', ' + x + ', ' + y + ',0);';
  }
};

Blockly.Blocks.epaper_set_cursor = Blockly.Blocks.oled_set_cursor;
Blockly.propc.epaper_set_cursor = Blockly.propc.oled_set_cursor;

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
    return 'drawText(' + this.myType + ', ' + msg + ');';
  }
};

Blockly.Blocks.epaper_print_text = Blockly.Blocks.oled_print_text;
Blockly.propc.epaper_print_text = Blockly.propc.oled_print_text;

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
    return 'drawNumber(' + this.myType + ', ' + num + ', ' + type + ');';
  }
};

Blockly.Blocks.epaper_print_number = Blockly.Blocks.oled_print_number;
Blockly.propc.epaper_print_number = Blockly.propc.oled_print_number;

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

Blockly.propc.oled_print_multiple = Blockly.propc.console_print_multiple;
Blockly.Blocks.epaper_print_multiple = Blockly.Blocks.oled_print_multiple;
Blockly.propc.epaper_print_multiple = Blockly.propc.console_print_multiple;

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
      Blockly.propc.setups_['sd_card'] = 'sd_mount(' + profile.sd_card + ');';
    }
  }

  const filename = this.getFieldValue('FILENAME');
  const posX = Blockly.propc.valueToCode(
      this, 'POS_X', Blockly.propc.ORDER_NONE) || '0';
  const posY = Blockly.propc.valueToCode(
      this, 'POS_Y', Blockly.propc.ORDER_NONE) || '0';

  return 'drawBitmap(' + this.myType + ', "' + filename + '.bmp", ' +
      posX + ', ' + posY + ');';
};

Blockly.Blocks.epaper_bitmap = Blockly.Blocks.oled_bitmap;
Blockly.propc.epaper_bitmap = Blockly.propc.oled_bitmap;

// -------------- RGB LEDs (WS2812B module) blocks -----------------------------

/**
 * WS2821b Initialization
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
    if (getDefaultProfile().boardType.name !== 'heb-wx') {
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
      if (event.type == Blockly.Events.BLOCK_CREATE ||
          event.type == Blockly.Events.BLOCK_DELETE ||
          (event.name === 'RGB_PIN' && event.blockId === this.id) ||
          this.warnFlag > 0) {
        const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
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
                allRGBpins += (
                  allBlocks[i].rgbPin ||
                  allBlocks[i].getFieldValue('PIN')
                ) + ',';
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
  const code = 'RGBleds' + p + '[constrainInt(' + led + ', 1, RGB_COUNT' +
      p + ') - 1] = ' + color + ';\n';
  return code;
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
  let code = '';
  code += 'for(int __ldx = ' + start + '; __ldx <= ' + end + '; __ldx++) {';
  code += 'RGBleds' + p + '[constrainInt(__ldx, 1, RGB_COUNT' +
      p + ') - 1] = ' + color + ';}';
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
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
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

// --------------------- Simple WX Module --------------------------------------

/**
 * WX Initialization
 * @type {{
 *  init: Blockly.Blocks.wx_init.init,
 *  updateShape_: Blockly.Blocks.wx_init.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.wx_init.domToMutation
 *  }}
 */
Blockly.Blocks.wx_init = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SWX_INIT_TOOLTIP);
    const backgroundColors = new Blockly.FieldColour('#FFFFFF');
    backgroundColors.setColours(['#FFFFFF', '#000000']).setColumns(2);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX initialize')
        .appendField('mode')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal on USB', 'USB_PGM_TERM'],
          ['Terminal on WX', 'USB_PGM'],
          ['Term & Programming on WX', 'WX_ALL_COM'],
        ], function(mode) {
          if (mode === 'WX_ALL_COM') {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setFieldValue('30', 'DI');
          }
        }), 'MODE')
        .appendField(' DI')
        .appendField(new Blockly.FieldDropdown([
          ['WX Socket', '30']].concat(profile.digital),
        function(pin) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(pin);
        }), 'DI');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const pin = this.getFieldValue('DI');
    container.setAttribute('pin', pin);
    return container;
  },
  domToMutation: function(xmlElement) {
    const pin = xmlElement.getAttribute('pin');
    this.updateShape_(pin);
  },
  updateShape_: function(details) {
    const profile = getDefaultProfile();
    if (details === '30' && this.getInput('DOPIN')) {
      this.removeInput('DOPIN');
    } else if (!this.getInput('DOPIN')) {
      this.appendDummyInput('DOPIN')
          .appendField('DO')
          .appendField(new Blockly.FieldDropdown(
              profile.digital),
          'DO');
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_init = function() {
  if (!this.disabled) {
    const pinDi = this.getFieldValue('DI') || '30';
    let pinDo = this.getFieldValue('DO') || '31';
    if (pinDi === '30') {
      pinDo = '31';
    }
    const mode = this.getFieldValue('MODE') || 'WX_ALL_COM';

    let code = 'wifi_start(' + pinDo + ', ' + pinDi + ', 115200, ' + mode;
    code += ');\nwifi_setBuffer(__wxBffr, sizeof(__wxBffr));\n' +
        '__wsId = wifi_listen(WS, "/ws/a");\nwhile(!__wsHandle) {\n' +
        '  wifi_poll(&__wxEvent, &__wxId, &__wxHandle);\n' +
        '  if(__wxEvent == \'W\' && __wxId == __wsId)' +
        '  __wsHandle = __wxHandle;\n}';

    const vars = 'int __wxEvent, __wxId, __wxHandle, __wsId, __wv[15],' +
        ' __wsHandle = 0;\nchar __wxBffr[136];\n';

    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.global_vars_['wx_vars'] = vars;
    Blockly.propc.setups_['wx_init'] = code;
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_config_page.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_config_page.onchange
 * }}
 */
Blockly.Blocks.wx_config_page = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_CONFIG_PAGE_TOOLTIP);
    const backgroundColors = new Blockly.FieldColour('#FFFFFF');
    backgroundColors.setColours(['#FFFFFF', '#000000']).setColumns(2);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX configure page title')
        .appendField(new Blockly.FieldTextInput('title'), 'TITLE')
        .appendField(' background color')
        .appendField(backgroundColors, 'BKG');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString()
        .indexOf('Simple WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a Simple WX\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      let warnTxt = null;
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('WX ') === 0) {
          warnTxt = 'WARNING: You cannot use Simple WX and\nAdvanced' +
              ' WX blocks together in your project!';
        }
      }
      this.setWarningText(warnTxt);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_config_page = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    // Runs the propc generator from the init block, since it's not
    // included in the badge WX board type.
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const bkg = (this.getFieldValue('BKG') === '#FFFFFF') ? '1' : '0';
    const title = this.getFieldValue('TITLE');
    const code = 'wifi_print(WS, __wsHandle, "S,' + bkg + ',' + title + '");\n';

    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_set_widget.init,
 *  updateShape_: Blockly.Blocks.wx_set_widget.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_set_widget.onchange,
 *  domToMutation: Blockly.Blocks.wx_set_widget.domToMutation
 * }}
 */
Blockly.Blocks.wx_set_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('SET_1')
        .appendField('Simple WX configure widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
        ]), 'WIDGET')
        .appendField('to a')
        .appendField(new Blockly.FieldDropdown([
          ['Button \u2794', '0'],
          ['Switch \u2794', '1'],
          ['Slider \u2794', '2'],
          ['Send Value \u2794', '3'],
          ['Pick Color \u2794', '4'],
          ['\u2794 Show Value', '5'],
          ['\u2794 Gauge', '6'],
          ['\u2794 Bar Graph', '7'],
          ['\u2794 Show Color', '8'],
          ['\u2794 Light Bulb', '9'],
          ['Clear Widget', '10']], function(type) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_({'TYPE': type});
        }), 'TYPE')
        .appendField(' label')
        .appendField(new Blockly.FieldTextInput('label'), 'LABEL');
    this.appendDummyInput('SET_2')
        .appendField('widget color')
        .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
        .appendField(' minimum')
        .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
        .appendField(' maximum')
        .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
        .appendField(' initial value')
        .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a Simple WX\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      let warnTxt = null;
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('WX ') === 0) {
          warnTxt = 'WARNING: You cannot use Simple WX and\nAdvanced WX' +
              ' blocks together in your project!';
        }
      }
      this.setWarningText(warnTxt);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('w_type', this.getFieldValue('TYPE'));
    container.setAttribute('w_color', this.getFieldValue('COLOR'));
    container.setAttribute('w_min', this.getFieldValue('MIN'));
    container.setAttribute('w_max', this.getFieldValue('MAX'));
    container.setAttribute('w_init', this.getFieldValue('INITIAL'));

    return container;
  },
  domToMutation: function(xmlElement) {
    this.updateShape_({
      'TYPE': xmlElement.getAttribute('w_type'),
      'COLOR': xmlElement.getAttribute('w_color'),
      'MIN': xmlElement.getAttribute('w_min'),
      'MAX': xmlElement.getAttribute('w_max'),
      'INITIAL': xmlElement.getAttribute('w_init'),
    });
  },
  updateShape_: function(details) {
    let type = details['TYPE'];
    if (details['TYPE'] === undefined) {
      type = this.getFieldValue('TYPE');
    }
    let min = details['MIN'];
    if (details['MIN'] === undefined) {
      min = this.getFieldValue('MIN');
    }
    let max = details['MAX'];
    if (details['MAX'] === undefined) {
      max = this.getFieldValue('MAX');
    }
    let color = details['COLOR'];
    if (details['COLOR'] === undefined) {
      color = this.getFieldValue('COLOR');
    }
    let initial = details['INITIAL'];
    if (details['INITIAL'] === undefined) {
      initial = this.getFieldValue('INITIAL');
    }
    if (this.getInput('SET_2')) {
      this.removeInput('SET_2');
    }
    let inputPins;
    if (type !== '10') {
      this.appendDummyInput('SET_2');
      inputPins = this.getInput('SET_2');
    }
    if (type === '2' || type === '6' || type === '7') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' minimum')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
          .appendField(' maximum')
          .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
          .appendField(' initial value')
          .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    } else if (type === '1') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' off value')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
          .appendField(' on value')
          .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
          .appendField(' initial state')
          .appendField(new Blockly.FieldDropdown([
            ['on', 'on'],
            ['off', 'off'],
          ]), 'INITIAL');
    } else if (type === '0' || type === '5' || type === '9') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' initial value')
          .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    } else if (type === '8') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' initial color shown')
          .appendField(new Blockly.FieldColour('#ffffff'), 'INITIAL');
    } else if (type === '3' || type === '4') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR');
    }

    if (this.getField('TYPE') && type !== null) {
      this.setFieldValue(type, 'TYPE');
    }
    if (this.getField('MIN') && min !== null) {
      this.setFieldValue(min, 'MIN');
    }
    if (this.getField('MAX') && max !== null) {
      this.setFieldValue(max, 'MAX');
    }
    if (this.getField('COLOR') && color !== null) {
      this.setFieldValue(color, 'COLOR');
    }
    if (this.getField('INITIAL') && initial !== null) {
      this.setFieldValue(initial, 'INITIAL');
      if (type === '1' && initial === min) {
        this.setFieldValue('off', 'INITIAL');
      }
      if (type === '1' && initial === max) {
        this.setFieldValue('on', 'INITIAL');
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_set_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    // Runs the propc generator from the init block, since it's not included
    // in the badge WX board type.
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const widget = this.getFieldValue('WIDGET');
    const label = this.getFieldValue('LABEL');
    const type = this.getFieldValue('TYPE');
    const color = this.getFieldValue('COLOR').substr(1).toUpperCase();
    const min = window.parseInt(this.getFieldValue('MIN') || '0');
    const max = window.parseInt(this.getFieldValue('MAX') || '10');
    let initial;
    if (type === '8') {
      initial = (window.parseInt(
          (this.getFieldValue('INITIAL') || '#FFFFFF')
              .substr(1), 16)).toString(10);
    } else if (this.getFieldValue('INITIAL') === 'on') {
      initial = max;
    } else if (this.getFieldValue('INITIAL') === 'off') {
      initial = min;
    } else {
      initial = (window.parseInt(
          this.getFieldValue('INITIAL') || '5')).toString(10);
    }

    return 'wifi_print(WS, __wsHandle, "W,' + widget + ',' + type +
        ',' + label + ',' + min + ',' + max + ',' + initial + ',' + color +
        '");\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_send_widget.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_send_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_SEND_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField('Simple WX send');
    this.appendDummyInput()
        .appendField('to widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
        ]), 'WIDGET');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_send_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const num = Blockly.propc.valueToCode(
        this, 'NUM', Blockly.propc.ORDER_NONE);
    const widget = this.getFieldValue('WIDGET');
    return 'wifi_print(WS, __wsHandle, "D,' + widget + ',%d", ' + num + ');\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_read_widgets.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_read_widgets = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX read widgets');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_read_widgets = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    let code = '';
    code += 'wifi_print(WS, __wsHandle, "U,0");\n__wv[0] = 0;\n';
    code += 'while(__wv[0] != \'V\') {  __wv[0]++;\n  wifi_poll(&__wxEvent,' +
        ' &__wxId,';
    code += '&__wxHandle);\n  if(__wxEvent == \'W\' && __wxId == __wsId)';
    code += '__wsHandle = __wxHandle;\n   if(__wxEvent == \'D\') ';
    code += 'wifi_scan(WS, __wxHandle, "%c%d%d%d%d%d%d%d%d%d%d%d%d%d%d", ';
    code += '&__wv[0], &__wv[1], &__wv[2], &__wv[3], &__wv[4], &__wv[5],' +
        ' &__wv[6], ';
    code += '&__wv[7], &__wv[8], &__wv[9], &__wv[10], &__wv[11], &__wv[12],' +
        ' &__wv[13], &__wv[14]);\n';
    code += 'if(__wxEvent == \'X\') {__wsHandle = 0;\nwhile (!__wsHandle)';
    code += '{wifi_poll( & __wxEvent, & __wxId, & __wxHandle);\nif' +
        ' (__wxEvent == \'W\' ';
    code += '&& __wxId == __wsId) __wsHandle = __wxHandle;}break;}}';
    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_get_widget.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_get_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
          ['device horizontal tilt', '13'],
          ['device vertical tilt', '14'],
        ]), 'WIDGET')
        .appendField('value');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

Blockly.propc.wx_get_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const widget = this.getFieldValue('WIDGET');
    return ['__wv[' + widget + ']', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_evt_connected.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_evt_connected = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX connected');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

Blockly.propc.wx_evt_connected = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    return ['(__wxEvent != \'X\')', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_reconnect.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_reconnect = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX reconnect');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_reconnect = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    let code = '__wsId = wifi_listen(WS, "/ws/a"); __wsHandle = 0;\n';
    code += 'while(!__wsHandle) {\n  wifi_poll(&__wxEvent, &__wxId,' +
        ' &__wxHandle);\n';
    code += '  if(__wxEvent == \'W\' && __wxId == __wsId)  __wsHandle =' +
        ' __wxHandle;\n}';
    return code;
  }
};

// ---------------- Advanced WX Blocks ----------------------------------------

/**
 * WX Advanced Initialization
 * @type {{
 *  init: Blockly.Blocks.wx_init_adv.init,
 *  updateShape_: Blockly.Blocks.wx_init_adv.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_init_adv.onchange,
 *  domToMutation: Blockly.Blocks.wx_init_adv.domToMutation
 *  }}
 */
Blockly.Blocks.wx_init_adv = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_AWX_INIT_ADV_TOOLTIP);
    const backgroundColors = new Blockly.FieldColour('#FFFFFF');
    backgroundColors.setColours(['#FFFFFF', '#000000']).setColumns(2);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('WX initialize  mode')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal on USB', 'USB_PGM_TERM'],
          ['Terminal on WX', 'USB_PGM'],
          ['Term & Programming on WX', 'WX_ALL_COM'],
        ], function(mode) {
          if (mode === 'WX_ALL_COM') {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setFieldValue('30', 'DI');
          }
        }), 'MODE')
        .appendField(' DI')
        .appendField(new Blockly.FieldDropdown([
          ['WX Socket', '30']].concat(profile.digital),
        function(pin) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(pin);
        }), 'DI');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const pin = this.getFieldValue('DI');
    container.setAttribute('pin', pin);
    return container;
  },
  domToMutation: function(xmlElement) {
    const pin = xmlElement.getAttribute('pin');
    this.updateShape_(pin);
  },
  updateShape_: function(details) {
    const profile = getDefaultProfile();
    if (details === '30' && this.getInput('DOPIN')) {
      this.removeInput('DOPIN');
    } else if (!this.getInput('DOPIN')) {
      this.appendDummyInput('DOPIN')
          .appendField('DO')
          .appendField(new Blockly.FieldDropdown(
              profile.digital),
          'DO');
    }
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    let warnTxt = null;
    for (let ik = 0; ik < allBlocks.length; ik++) {
      if (allBlocks[ik].toString().indexOf('Simple WX') === 0) {
        warnTxt = 'WARNING: You cannot use Advanced WX and\nSimple WX blocks' +
            ' together in your project!';
      }
    }
    this.setWarningText(warnTxt);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_init_adv = function() {
  if (!this.disabled) {
    const pinDi = this.getFieldValue('DI') || '30';
    let pinDo = this.getFieldValue('DO') || '31';
    if (pinDi === '30') {
      pinDo = '31';
    }
    const mode = this.getFieldValue('MODE') || 'WX_ALL_COM';

    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] = 'wifi_start(' + pinDo + ', ' + pinDi +
        ', 115200, ' + mode + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_scan_multiple.init,
 *  saveConnections: *,
 *  updateShape_: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_scan_multiple.onchange,
 *  setPrefix_: Blockly.Blocks.wx_scan_multiple.setPrefix_, domToMutation: *,
 *  updateSerPin: Blockly.Blocks.wx_scan_multiple.updateSerPin
 * }}
 */
Blockly.Blocks.wx_scan_multiple = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_SCAN_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('WX scan')
        .appendField(new Blockly.FieldDropdown([
          ['POST', 'POST'],
          ['TCP', 'TCP'],
          ['Websocket', 'WS'],
          ['Command', 'CMD'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setPrefix_(action);
        }), 'CONNECTION')
        .appendField('from handle')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.appendDummyInput('PREFIX')
        .appendField('string starts with')
        .appendField(new Blockly.FieldTextInput('txt'), 'START');
    this.optionList_ = ['dec', 'char'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator([
      'console_print_dec',
      'console_print_hex',
      'console_print_bin',
      'console_print_float',
      'console_print_char',
    ]));
    this.setWarningText(null);

    // not used, but allows this block to share functions
    // from serial_scan_multiple block
    this.ser_pins = [];
  },
  setPrefix_: function(action) {
    const prefixValue = this.getFieldValue('START');
    if (this.getInput('PREFIX')) {
      this.removeInput('PREFIX');
    }
    if (action === 'POST') {
      this.appendDummyInput('PREFIX')
          .appendField('string starts with')
          .appendField(new Blockly.FieldTextInput('txt'), 'START');
      this.setFieldValue(prefixValue || '', 'START');
    }
  },
  mutationToDom: Blockly.Blocks['serial_scan_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_scan_multiple'].domToMutation,
  decompose: Blockly.Blocks['serial_scan_multiple'].decompose,
  compose: Blockly.Blocks['serial_scan_multiple'].compose,
  saveConnections: Blockly.Blocks['serial_scan_multiple'].saveConnections,
  updateShape_: Blockly.Blocks['serial_scan_multiple'].updateShape_,
  updateSerPin: function() {},
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a WX\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      let warnTxt = null;
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('Simple WX') === 0) {
          warnTxt = 'WARNING: You cannot use Advanced WX and\nSimple WX' +
              ' blocks together in your project!';
        }
      }
      if (this.optionList_ && this.workspace && this.optionList_.length < 1) {
        warnTxt = 'WX scan must have at least one search term.';
      }
      this.setWarningText(warnTxt);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_scan_multiple = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.toString().indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx') {
    const handle = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HANDLE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const conn = this.getFieldValue('CONNECTION');
    let start = this.getFieldValue('START')
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"');

    if (conn !== 'POST') {
      start = '';
    }

    let code = 'wifi_scan(' + conn + ', ' + handle + ', "' + start;
    let varList = '';
    let codeAdd = '';
    let i = 0;
    while (this.getFieldValue('CPU' + i)) {
      if (this.getFieldValue('TYPE' + i).includes('store decimal number')) {
        code += '%d';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store ASCII character')) {
        code += '%c';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store hexadecimal number')) {
        code += '%x';
      } else if (this.getFieldValue('TYPE' + i)
          .includes('store binary number')) {
        code += '%b';
      } else if (this.getFieldValue('TYPE' + i) === 'in') {
        code += '%f';
      }
      if (this.getFieldValue('TYPE' + i) === 'in') {
        varList += ', &__fpBuf' + i;
        codeAdd += Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
        codeAdd += ' = (int) (__fpBuf' + i + ' * ' +
            this.getFieldValue('MULT' + i) + ');\n';
        if (!this.disabled) {
          Blockly.propc.global_vars_['floatPointScanBuffer' + i] =
              'float __fpBuf' + i + ';';
        }
      } else {
        varList += ', &' + Blockly.propc.variableDB_.getName(
            this.getFieldValue('CPU' + i),
            Blockly.VARIABLE_CATEGORY_NAME);
      }
      i++;
    }
    code += '"' + varList + ');\n' + codeAdd;
    return code;
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_print_multiple.init,
 *  saveConnections: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.wx_print_multiple = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_PRINT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX print to')
        .appendField(new Blockly.FieldDropdown([
          ['GET', 'GET'],
          ['TCP', 'TCP'],
          ['Websocket', 'WS'],
          ['Command', 'CMD'],
        ]), 'CONNECTION')
        .appendField('handle')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
        .appendField('string');
    this.appendValueInput('PRINT1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('integer');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator([
      'console_print_str',
      'console_print_dec',
      'console_print_hex',
      'console_print_bin',
      'console_print_float',
      'console_print_char',
    ]));
    this.optionList_ = ['str', 'dec'];
    this.setWarningText(null);
  },
  mutationToDom: Blockly.Blocks['console_print_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_print_multiple'].domToMutation,
  decompose: Blockly.Blocks['console_print_multiple'].decompose,
  compose: Blockly.Blocks['serial_print_multiple'].compose,
  saveConnections: Blockly.Blocks['console_print_multiple'].saveConnections,
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

Blockly.propc.wx_print_multiple = Blockly.propc.console_print_multiple;

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_scan_string.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_scan_string.onchange,
 *  setPrefix_: (
 *      Blockly.Blocks.wx_scan_multiple.setPrefix_ |
 *      Blockly.Blocks.wx_listen.setPrefix_ |
 *      Blockly.Blocks.wx_mode.setPrefix_ |
 *      Blockly.Blocks.wx_disconnect.setPrefix_ |
 *      Blockly.Blocks.wx_scan_multiple.setPrefix_ |
 *      Blockly.Blocks.wx_listen.setPrefix_ |
 *      *
 *  ),
 *  domToMutation: Blockly.Blocks.wx_scan_string.domToMutation
 * }}
 */
Blockly.Blocks.wx_scan_string = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_SCAN_STRING_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX scan')
        .appendField(new Blockly.FieldDropdown([
          ['POST', 'POST'],
          ['Websocket', 'WS'],
          ['TCP', 'TCP'],
          ['Command', 'CMD'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setPrefix_(action);
        }), 'CONNECTION')
        .appendField('from handle')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.appendDummyInput('PREFIX')
        .appendField('string starts with')
        .appendField(new Blockly.FieldTextInput('txt'), 'START');
    this.appendDummyInput('STORE')
        .appendField('store string in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VARNAME');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
  },
  setPrefix_: Blockly.Blocks['wx_scan_multiple'].setPrefix_,
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('prefix', this.getFieldValue('CONNECTION') || '');
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    this.setPrefix_(container.getAttribute('prefix') || '');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a WX\ninitialize block at' +
          ' the beginning of your program!');
    } else {
      let warnTxt = null;
      const thisPosition = Number(this.getRelativeToSurfaceXY().y);

      if (this.getFieldValue('CONNECTION') === 'TCP') {
        warnTxt = 'You must use a WX buffer block before this\nblock and' +
            ' you must store the string in the buffer\nvariable when' +
            ' scanning a string from a TCP connection!';
      }
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('Simple WX') === 0) {
          warnTxt = 'WARNING: You cannot use Advanced WX and\nSimple WX' +
              ' blocks together in your project!';
        } else if (allBlocks[ik].type === 'wx_buffer') {
          const bufPosition = Number(allBlocks[ik].getRelativeToSurfaceXY().y);
          if (allBlocks[ik].getFieldValue('BUFFER') ===
              this.getFieldValue('VARNAME') && thisPosition > bufPosition) {
            warnTxt = null;
          }
        }
      }
      if (this.optionList_ && this.workspace && this.optionList_.length < 1) {
        warnTxt = 'WX scan must have at least one search term.';
      }
      this.setWarningText(warnTxt);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_scan_string = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const handle = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HANDLE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const conn = this.getFieldValue('CONNECTION');
    let start = this.getFieldValue('START')
        .replace(/'/g, '\\\'')
        .replace(/"/g, '\\"');
    const store = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VARNAME'),
        Blockly.VARIABLE_CATEGORY_NAME);

    Blockly.propc.vartype_[store] = 'char *';

    if (conn !== 'POST') {
      start = '';
    }

    return 'wifi_scan(' + conn + ', ' + handle + ', "' + start + '%s", &' +
        store + ');\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_send_string.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_send_string = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_SEND_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('DATA')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX send string')
        .setCheck('String');
    this.appendDummyInput()
        .appendField('handle')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_send_string = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
        (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const data = Blockly.propc.valueToCode(
        this,
        'DATA', Blockly.propc.ORDER_NONE);
    const handle = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HANDLE'),
        Blockly.VARIABLE_CATEGORY_NAME);

    return 'wifi_send(' + handle + ', ' + data + ', sizeof(' + data + '));\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_receive_string.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_receive_string = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_RECEIVE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX receive store string in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'DATA')
        .appendField('byte count in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'BYTES');
    this.appendValueInput('MAX')
        .appendField('handle')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('max bytes');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setInputsInline(false);
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_receive_string = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const data = Blockly.propc.variableDB_.getName(
        this.getFieldValue('DATA'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const handle = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HANDLE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const max = Blockly.propc.valueToCode(
        this, 'MAX', Blockly.propc.ORDER_NONE) || '64';
    const bytes = Blockly.propc.variableDB_.getName(
        this.getFieldValue('BYTES'),
        Blockly.VARIABLE_CATEGORY_NAME);

    Blockly.propc.vartype_[data] = 'char *';

    return bytes +' = wifi_recv(' + handle + ', ' + data + ', ' + max + ');\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.wx_poll.init, helpUrl: string, onchange: *}}
 */
Blockly.Blocks.wx_poll = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_POLL_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('WX poll store event in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'EVENT')
        .appendField('ID in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'ID')
        .appendField('handle in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_poll = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const id = Blockly.propc.variableDB_.getName(
        this.getFieldValue('ID'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const event = Blockly.propc.variableDB_.getName(
        this.getFieldValue('EVENT'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const handle = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HANDLE'),
        Blockly.VARIABLE_CATEGORY_NAME);

    return 'wifi_poll(&' + event + ', &' + id + ', &' + handle + ');\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_listen.init,
 *  mutationToDom: (function(): HTMLElement), helpUrl: string,
 *  onchange: *,
 *  domToMutation: Blockly.Blocks.wx_listen.domToMutation,
 *  setPrefix_: Blockly.Blocks.wx_listen.setPrefix_
 * }}
 */
Blockly.Blocks.wx_listen = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_LISTEN_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('PATH')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX connect')
        .appendField(new Blockly.FieldDropdown([
          ['HTTP', 'HTTP'],
          ['Websocket', 'WS'],
          ['TCP', 'TCP'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setPrefix_(action);
        }), 'PROTOCOL')
        .appendField('store ID in', 'TEXT')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'ID')
        .appendField('path', 'LABEL')
        .setCheck('String');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('action', this.getFieldValue('PROTOCOL') || '');
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setPrefix_(action);
  },
  setPrefix_: function(action) {
    // It takes Blocky some time to set up new variables, so this waits
    // to make sure they are ready.
    // TODO: Replace timer with asynch or promise.
    setTimeout(function() {
      const wxVariables = ['wxHandle', 'wxConnId1'];
      wxVariables.forEach(function(value) {
        if (!Blockly.getMainWorkspace().getVariable(value)) {
          Blockly.getMainWorkspace().createVariable(value);
        }
      });
      const wxVariablesHidden = ['wxConnId2', 'wxConnId3', 'wxConnId4'];
      wxVariablesHidden.forEach(function(value) {
        if (!Blockly.getMainWorkspace().getVariable(value)) {
          Blockly.getMainWorkspace().createVariable(value);
        }
      });
    }, 75);
    let tempIdVar = 'wxHandle';
    if (action === 'TCP') {
      if (!this.getInput('PORT')) {
        this.appendValueInput('PORT')
            .appendField('port')
            .setCheck('Number');
      }
      this.setFieldValue('URL', 'LABEL');
      this.setFieldValue('store handle in', 'TEXT');
    } else {
      tempIdVar = 'wxConnId1';
      if (this.getInput('PORT')) {
        this.removeInput('PORT');
      }
      this.setFieldValue('path', 'LABEL');
      this.setFieldValue('store ID in', 'TEXT');
    }
    // Again, variables have to be completely set up and available, or
    // these functions will throw errors.
    const idVariable =
        Blockly.getMainWorkspace().getVariableById(this.getFieldValue('ID'));
    if (idVariable &&
        idVariable.name ===
            (tempIdVar === 'wxHandle' ? 'wxConnId1' : 'wxHandle')) {
      setTimeout(function(a) {
        a.setFieldValue(
            Blockly.getMainWorkspace().getVariable(tempIdVar).getId(), 'ID');
      }, 125, this);
    }
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_listen = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const path = Blockly.propc.valueToCode(
        this, 'PATH', Blockly.propc.ORDER_NONE);
    const protocol = this.getFieldValue('PROTOCOL');
    const id = Blockly.propc.variableDB_.getName(
        this.getFieldValue('ID'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const port = Blockly.propc.valueToCode(
        this, 'PORT', Blockly.propc.ORDER_NONE) || '80';

    let code = '';
    if (protocol === 'TCP') {
      code += id + ' = wifi_connect(' + path + ', ' + port + ');\n';
    } else {
      code += id + ' = wifi_listen(' + protocol + ', ' + path + ');\n';
    }
    return code;
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_join.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_join.onchange
 * }}
 */
Blockly.Blocks.wx_join = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_JOIN_NETWORK_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX join network SSID')
        .appendField(new Blockly.FieldTextInput('myNetwork'), 'SSID')
        .appendField('passphrase')
        .appendField(new Blockly.FieldTextInput('passphrase'), 'PASS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a WX\ninitialize block' +
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
Blockly.propc.wx_join = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx') {
    const ssid = this.getFieldValue('SSID') || '';
    const pass = this.getFieldValue('PASS') || '';
    return 'wifi_join("' + ssid + '", "' + pass + '");\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_code.init,
 *  helpUrl: string
 * }}
 */
Blockly.Blocks.wx_code = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_CODE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX code')
        .appendField(new Blockly.FieldDropdown(
            [['ARG', '0xE6'],
              ['Connect', '0xE4'],
              ['Close', '0xE8'],
              ['Check', '0xEE'],
              ['Join', '0xEF'],
              ['Listen', '0xE7'],
              ['Path', '0xEB'],
              ['Poll', '0xEC'],
              ['Receive', '0xE9'],
              ['Reply', '0xE5'],
              ['Send', '0xEA'],
              ['Set', '0xED'],
              ['AP Mode', '0xF3'],
              ['CMD', '0xFE'],
              ['GET', '71'],
              ['HTTP', '0xF7'],
              ['POST', '80'],
              ['Station Mode', '0xF4'],
              ['Station+AP Mode', '0xF2'],
              ['TCP', '0xF5'],
              ['Websocket', '0xF6'],
              ['GPIO_DI', '1'],
              ['GPIO_DO', '3'],
              ['GPIO_RTS', '15'],
              ['GPIO_CTS', '13'],
              ['GPIO_ASC', '5'],
              ['GPIO_DBG', '2'],
              ['GPIO_PGM', '0'],
              ['Invalid Request', '1'],
              ['Invalid Argument', '2'],
              ['Wrong Argument', '3'],
              ['No free listeners', '4'],
              ['No free connection', '5'],
              ['Lookup failed', '6'],
              ['Connection failed', '7'],
              ['Send failed', '8'],
              ['Invalid state', '9'],
              ['Invalid size', '10'],
              ['Disconnected', '11'],
              ['Not implemented', '12'],
              ['Busy', '13'],
              ['Internal error', '14'],
              ['No error', '0'],
              ['Out of memory', '-1'],
              ['Undefined (NEG2)', '-2'],
              ['Timeout', '-3'],
              ['Routing problem', '-4'],
              ['Operation in progress', '-5'],
              ['Undefined (NEG6)', '-6'],
              ['Number too large', '-7'],
              ['Connection aborted', '-8'],
              ['Connection reset', '-9'],
              ['Connection closed', '-10'],
              ['Not connected', '-11'],
              ['Illegal argument', '-12'],
              ['Undefined (NEG13)', '-13'],
              ['UDP send error', '-14'],
              ['Already connected', '-15'],
              ['SSL handshake failed', '-28'],
              ['SSL application invalid', '-61']]), 'CODE');
    this.setOutput(true, 'Number');
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.wx_code = function() {
  return [this.getFieldValue('CODE'), Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_mode.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_mode.onchange,
 *  domToMutation: Blockly.Blocks.wx_mode.domToMutation,
 *  setPrefix_: Blockly.Blocks.wx_mode.setPrefix_
 * }}
 */
Blockly.Blocks.wx_mode = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_MODE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX ')
        .appendField(new Blockly.FieldDropdown([
          ['Set', 'SET'],
          ['Leave and set', 'LEAVE'],
          ['Check', 'CHECK'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setPrefix_(action);
        }), 'ACTION')
        .appendField('mode', 'BLOCKTEXT');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setInputsInline(true);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('ACTION');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setPrefix_(action);
  },
  setPrefix_: function(action) {
    if (this.getInput('CHECK')) {
      this.removeInput('CHECK');
    }
    if (action === 'LEAVE') {
      this.appendDummyInput('CHECK')
          .appendField(new Blockly.FieldDropdown([
            ['AP', 'AP'],
            ['Station + AP', 'STA_AP'],
          ]), 'MODE');
    } else if (action !== 'CHECK') {
      this.appendDummyInput('CHECK')
          .appendField(new Blockly.FieldDropdown([
            ['AP', 'AP'],
            ['Station', 'STA'],
            ['Station + AP', 'STA_AP'],
          ]), 'MODE');
    }
    if (action === 'CHECK') {
      this.setFieldValue('mode', 'BLOCKTEXT');
      this.setPreviousStatement(false, null);
      this.setNextStatement(false, null);
      this.setOutput(true, 'Number');
    } else {
      this.setFieldValue('mode to', 'BLOCKTEXT');
      this.setOutput(false);
      this.setPreviousStatement(true, 'Block');
      this.setNextStatement(true, null);
    }
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a WX\ninitialize block' +
          ' at the beginning of your program!');
    }
  },
};

/**
 *
 * @return {string|(string|number)[]}
 */
Blockly.propc.wx_mode = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx') {
    const mode = this.getFieldValue('MODE');
    const action = this.getFieldValue('ACTION');
    let code;

    if (action === 'CHECK') {
      code = ['wifi_mode(CHECK)', Blockly.propc.ORDER_NONE];
    } else if (action === 'LEAVE') {
      code = 'wifi_leave(' + mode + ');\n';
    } else {
      code = 'wifi_mode(' + mode + ');\n';
    }
    return code;
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.wx_buffer.init, helpUrl: string, onchange: *}}
 */
Blockly.Blocks.wx_buffer = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_BUFFER_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('WX buffer use variable')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_SET_ITEM), 'BUFFER')
        .appendField('set size to')
        .appendField(new Blockly.FieldNumber('64', null, null, 1), 'SIZE')
        .appendField('characters');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_buffer = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx')) {
    const size = this.getFieldValue('SIZE') || '64';
    let code = '';
    const buffer = Blockly.propc.variableDB_.getName(
        this.getFieldValue('BUFFER'),
        Blockly.VARIABLE_CATEGORY_NAME);
    code += 'wifi_setBuffer(' + buffer + ', (' + size + ' + 1));\n';
    Blockly.propc.vartype_[buffer] = 'char';
    Blockly.propc.varlength_[buffer] = size + ' + 1';
    return code;
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_disconnect.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: Blockly.Blocks.wx_disconnect.domToMutation,
 *  setPrefix_: Blockly.Blocks.wx_disconnect.setPrefix_
 * }}
 */
Blockly.Blocks.wx_disconnect = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_DISCONNECT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX disconnect')
        .appendField(new Blockly.FieldDropdown([
          ['HTTP', 'HTTP'],
          ['Websocket', 'WS'],
          ['TCP', 'TCP'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setPrefix_({'ACTION': action});
        }), 'PROTOCOL')
        .appendField('ID', 'TEXT')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_SET_ITEM), 'ID');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('PROTOCOL');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setPrefix_({'ACTION': action});
  },
  // TODO: Setup a asynch or promise to eliminate timer delay
  setPrefix_: function(details) {
    // It takes Blockly some time to set up new variables,
    // so this waits to make sure they are ready.
    setTimeout(function() {
      if (!Blockly.getMainWorkspace().getVariable('wxHandle')) {
        Blockly.getMainWorkspace().createVariable('wxHandle');
      }
      if (!Blockly.getMainWorkspace().getVariable('wxId')) {
        Blockly.getMainWorkspace().createVariable('wxId');
      }
    }, 75);
    let tempIdVar = 'wxHandle';
    if (details['ACTION'] === 'TCP') {
      this.setFieldValue('handle', 'TEXT');
    } else {
      tempIdVar = 'wxId';
      this.setFieldValue('ID', 'TEXT');
    }
    // Again, variables have to be completely set up and available,
    // or these functions will throw errors.
    setTimeout(function(a) {
      a.setFieldValue(
          Blockly.getMainWorkspace().getVariable(tempIdVar).getId(), 'ID');
    }, 125, this);
  },
  onchange: Blockly.Blocks['wx_scan_multiple'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_disconnect = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  const boardType = getProjectInitialState().boardType.name;

  if (boardType === 'heb-wx') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }
  if (allBlocks.indexOf('Simple WX initialize') === -1 &&
      (allBlocks.indexOf('WX initialize') > -1 ||
        boardType === 'heb-wx')) {
    return 'wifi_disconnect(' + Blockly.propc.variableDB_.getName(
        this.getFieldValue('ID'),
        Blockly.VARIABLE_CATEGORY_NAME) + ');\n';
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_ip.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_ip.onchange
 * }}
 */
Blockly.Blocks.wx_ip = {
  helpUrl: Blockly.MSG_AWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_AWX_GET_IP_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('WX')
        .appendField(new Blockly.FieldDropdown([
          ['Station', 'STA'],
          ['AP', 'AP'],
        ]), 'MODE')
        .appendField('IP address');
    this.setInputsInline(true);
    this.setOutput(true, 'String');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('WX initialize') === -1 &&
            getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a WX\ninitialize block' +
          ' at the beginning of your program!');
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.wx_ip = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    if (allBlocks.indexOf('Simple WX initialize') > -1) {
      // Runs the propc generator from the init block, since it's not
      // included in the badge WX board type.
      Blockly.propc.wx_init.call();
    } else {
      Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
      Blockly.propc.setups_['wx_init'] =
          'wifi_start(31, 30, 115200, WX_ALL_COM);';
    }
  }
  if (allBlocks.indexOf('WX initialize') > -1 ||
        getProjectInitialState().boardType.name === 'heb-wx') {
    const mode = this.getFieldValue('MODE');
    if (!this.disabled) {
      Blockly.propc.global_vars_['wx_ip_temp_str'] = 'char __ipStr[16];';
      let func = 'char *wifi_ip_string(int __mode)' +
          ' {int __ip[4]; char __result = ';
      func += 'wifi_ip(__mode, __ip); if(__result == \'E\') ';
      func += '{strcpy(__ipStr, "Error          ");}' +
          ' else {sprint(__ipStr, "%d.%d';
      func += '.%d.%d", __ip[0], __ip[1], __ip[2], __ip[3]);} return __ipStr;}';

      Blockly.propc.methods_['ip_address_func'] = func;
      Blockly.propc.method_declarations_['ip_address_func'] =
          'char *wifi_ip_string(int __mode);\n';
    }
    return ['wifi_ip_string(' + mode + ')', Blockly.propc.ORDER_NONE];
  } else {
    return '// ERROR: WX is not initialized!\n';
  }
};

// ---------------- Graphing Output Blocks ------------------------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.graph_output.init,
 *  saveConnections: Blockly.Blocks.graph_output.saveConnections,
 *  compose: Blockly.Blocks.graph_output.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (function(*): Blockly.Block),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.graph_output.onchange,
 *  setFieldLabels: Blockly.Blocks.graph_output.setFieldLabels,
 *  domToMutation: Blockly.Blocks.graph_output.domToMutation
 * }}
 */
Blockly.Blocks.graph_output = {
  helpUrl: Blockly.MSG_GRAPHING_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GRAPH_OUTPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Graph');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField(new Blockly.FieldTextInput('label'), 'GRAPH_LABEL0')
        .appendField('value', 'VALUE_LABEL0');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['graph_dec']));
    this.optionList_ = ['dec'];
    this.graph_labels_ = [];
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('options', JSON.stringify(this.optionList_));
    let m = 'S';
    if (this.getFieldValue('VALUE_LABEL0') === 'value (X1)') {
      m = 'X';
    }
    container.setAttribute('mode', m);
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    const value = JSON.parse(container.getAttribute('options'));
    const mode = container.getAttribute('mode');
    const graphLabels = [
      ' (X1)', ' (Y1)',
      ' (X2)', ' (Y2)',
      ' (X3)', ' (Y3)',
      ' (X4)', ' (Y4)',
      ' (X5)', ' (Y5)',
    ];
    let vl = '';
    this.optionList_ = value;
    for (let i = 0; i < this.optionList_.length; i++) {
      if (this.getInput('PRINT' + i)) {
        this.removeInput('PRINT' + i);
      }
      if (mode === 'X') {
        vl = graphLabels[i];
      }
      this.appendValueInput('PRINT' + i)
          .setAlign(Blockly.ALIGN_RIGHT)
          .appendField(new Blockly.FieldTextInput('label'), 'GRAPH_LABEL' + i)
          .appendField('value' + vl, 'VALUE_LABEL' + i);
    }
  },
  setFieldLabels: function(mode) {
    let j = 0;
    const graphLabels = [
      ' (X1)', ' (Y1)',
      ' (X2)', ' (Y2)',
      ' (X3)', ' (Y3)',
      ' (X4)', ' (Y4)',
      ' (X5)', ' (Y5)',
    ];
    while (this.getFieldValue('VALUE_LABEL' + j)) {
      if (mode === 'X') {
        this.setFieldValue('value' + graphLabels[j], 'VALUE_LABEL' + j);
      } else {
        this.setFieldValue('value', 'VALUE_LABEL' + j);
      }
      j++;
    }
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('graphing_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let index = 0; index < this.optionList_.length; index++) {
      const optionBlock = workspace.newBlock('graph_dec');
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    let i = 0;
    this.graph_labels_ = null;
    this.graph_labels_ = [];
    while (this.getFieldValue('GRAPH_LABEL' + i)) {
      this.graph_labels_.push(this.getFieldValue('GRAPH_LABEL' + i));
      i++;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Delete everything.
    let i = 0;
    let graphLabels = ['', '', '', '', '', '', '', '', '', ''];
    if (this.getFieldValue('VALUE_LABEL0') === 'value (X1)') {
      graphLabels = [
        ' (X1)', ' (Y1)',
        ' (X2)', ' (Y2)',
        ' (X3)', ' (Y3)',
        ' (X4)', ' (Y4)',
        ' (X5)', ' (Y5)',
      ];
    }
    while (this.getInput('PRINT' + i)) {
      this.removeInput('PRINT' + i);
      i++;
    }
    i = 0;
    this.optionList_.length = 0;
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      this.optionList_.push('dec');

      const printInput = this.appendValueInput('PRINT' + i)
          .setAlign(Blockly.ALIGN_RIGHT)
          .setCheck('Number')
          .appendField(new Blockly.FieldTextInput('label'), 'GRAPH_LABEL' + i)
          .appendField('value' + graphLabels[i], 'VALUE_LABEL' + i);

      if (clauseBlock.valueConnection_) {
        printInput.connection.connect(clauseBlock.valueConnection_);
      }
      i++;

      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
    i = this.graph_labels_.length;
    for (i = 0; i < this.graph_labels_.length; i++) {
      if (this.getFieldValue('GRAPH_LABEL' + i)) {
        this.setFieldValue(this.graph_labels_[i], 'GRAPH_LABEL' + i);
      }
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (clauseBlock) {
      const printInput = this.getInput('PRINT' + i);
      clauseBlock.valueConnection_ =
                    printInput && printInput.connection.targetConnection;
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
      i++;
    }
    i = 0;
    this.graph_labels_ = null;
    this.graph_labels_ = [];
    while (this.getFieldValue('GRAPH_LABEL' + i)) {
      this.graph_labels_.push(this.getFieldValue('GRAPH_LABEL' + i));
      i++;
    }
  },
  onchange: function() {
    const allBlocks =
        Blockly.getMainWorkspace().getBlocksByType('graph_settings', false);
    let graphInitBlock = null;
    if (allBlocks.length > 0) {
      graphInitBlock = allBlocks[0];
    }
    if (!graphInitBlock) {
      this.setWarningText('WARNING: You must use a Graph\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      if (this.workspace && this.optionList_.length < 1) {
        this.setWarningText('Graphing output must have at least one value.');
      } else {
        if (this.optionList_.length > 10) {
          this.setWarningText('Graphing output only supports up to 10 values.');
        } else {
          this.setWarningText(null);
        }
      }
      let i = 0;
      while (this.getFieldValue('VALUE_LABEL' + i)) {
        i++;
      }
      if (i % 2 === 1 &&
          graphInitBlock.getFieldValue('YSETTING').indexOf('XY') > -1) {
        this.setWarningText(
            'Number of values must be EVEN when graphing an x/y series!');
      }
    }
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.graphing_container.init}}
 */
Blockly.Blocks.graphing_container = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('send');
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.graph_dec.init}}
 */
Blockly.Blocks.graph_dec = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('value');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.graph_output = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Graph initialize') > -1) {
    let code = 'print("%u';
    let varList = '';
    let i = 0;
    while (Blockly.propc.valueToCode(
        this, 'PRINT' + i, Blockly.propc.ORDER_NONE)) {
      code += ',%d';
      varList += ', ' + Blockly.propc.valueToCode(
          this, 'PRINT' + i, Blockly.propc.ORDER_NONE || '0');
      i++;
      if (i > 10) {
        break;
      }
    }
    code += '\\r", (CNT >> 16)' + varList + ');\n';

    return code;
  } else {
    return '// ERROR: Graphing is not initialized!';
  }
};

/**
 *
 * @type {
 *  {init: Blockly.Blocks.graph_settings.init,
 *  setGraphMode: Blockly.Blocks.graph_settings.setGraphMode,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.graph_settings.domToMutation,
 *  addRanges: Blockly.Blocks.graph_settings.addRanges
 * }}
 */
Blockly.Blocks.graph_settings = {
  helpUrl: Blockly.MSG_GRAPHING_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GRAPH_SETTINGS_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Graph initialize  keep')
        .appendField(new Blockly.FieldNumber('40', null, null, 1), 'XAXIS')
        .appendField('seconds of data')
        .appendField(new Blockly.FieldDropdown([
          ['time series- autoscale', 'AUTO'],
          ['time series- ranged', 'FIXED'],
          ['x/y series- autoscale', 'AUTOXY'],
          ['x/y series- ranged', 'FIXEDXY'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setGraphMode(action);
        }), 'YSETTING');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  setGraphMode: function(s) {
    let mode = 'S';
    if (s.indexOf('XY') > -1) {
      mode = 'X';
    }
    if (this.getInput('RANGES')) {
      this.removeInput('RANGES');
    }
    if (s.indexOf('FIXED') > -1) {
      this.addRanges(s);
    }

    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let j = 0; j < allBlocks.length; j++) {
      if (allBlocks[j].type === 'graph_output') {
        const func = allBlocks[j].setFieldLabels;
        func.call(allBlocks[j], mode);
      }
    }
  },
  addRanges: function(s) {
    if (s === 'FIXED') {
      this.appendDummyInput('RANGES')
          .appendField('y-axis minimum', 'LABELMIN')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'YMIN')
          .appendField(' maximum', 'LABELMAX')
          .appendField(new Blockly.FieldNumber('100', null, null, 1), 'YMAX');
    } else {
      this.appendDummyInput('RANGES')
          .appendField('x-axis min')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'XMIN')
          .appendField(' max')
          .appendField(new Blockly.FieldNumber('100', null, null, 1), 'XMAX')
          .appendField(' y-axis min')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'YMIN')
          .appendField(' max')
          .appendField(new Blockly.FieldNumber('100', null, null, 1), 'YMAX');
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('scaling', this.getFieldValue('YSETTING'));
    return container;
  },
  domToMutation: function(container) {
    if (container.getAttribute('scaling') === 'FIXED') {
      this.addRanges();
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.graph_settings = function() {
  return '';
};

// ---------------- I2C Protocol Blocks ---------------------------------------

/**
 * I2C Send
 * @type {{
 *  init: Blockly.Blocks.i2c_send.init,
 *  mutationToDom: (function(): HTMLElement),
 *  setPinMenus: Blockly.Blocks.i2c_send.setPinMenus,
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.i2c_send.domToMutation,
 *  checkI2cPins: Blockly.Blocks.i2c_send.checkI2cPins,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_send = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_SEND_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('i\u00B2c controller send');
    this.appendValueInput('DATA')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('data')
        .appendField(new Blockly.FieldNumber('2', null, null, 1), 'COUNT')
        .appendField(new Blockly.FieldDropdown([
          ['bytes MSB first', '-1'],
          ['bytes LSB first', '1'],
        ]), 'ORDER');
    this.appendValueInput('ADDR')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['register length 1 byte', '1'],
          ['register length 2 bytes', '2'],
          ['register length 3 bytes', '3'],
          ['register length 4 bytes', '4'],
        ]), 'ADDRCOUNT');
    this.appendValueInput('DEVICE')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('device address');
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.pinWarn = null;
    // this.checkI2cPins(null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('SDA');
    const m2 = this.getFieldValue('SCL');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('bus SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, pin, null);
            }), 'SDA')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, null, pin);
            }), 'SCL');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SDA');
    } else if (m1) {
      this.setFieldValue(m1, 'SDA');
    }
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.pinWarn) {
      container.setAttribute('pinwarn', this.pinWarn);
    }
    return container;
  },
  domToMutation: function(container) {
    const warnTxt = container.getAttribute('pinwarn') || null;
    this.pinWarn = warnTxt;
    this.setWarningText(warnTxt);
  },
  checkI2cPins: function(action, zda, zcl) {
    const sda = zda || this.getFieldValue('SDA');
    const scl = zcl || this.getFieldValue('SCL');
    const warnTxt = 'WARNING: Both SDA and SCL must be equal to \nSDA and ' +
        'SCL on other blocks if sharing \nan i\u00B2c bus, or both must be ' +
        'different\nif on separate i\u00B2c busses, and SDA and SCL must be ' +
        'different from each other!';
    this.pinWarn = null;

    if (action === null) {
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
      let func = null;
      for (let i = 0; i < allBlocks.length; i++) {
        func = allBlocks[i].checkI2cPins;
        if (func) {
          const xda = allBlocks[i].getFieldValue('SDA');
          const xcl = allBlocks[i].getFieldValue('SCL');
          if (((sda === scl) || (xda === sda && xcl !== scl) ||
                            (xda !== sda && xcl === scl) ||
                            (xda === scl && xcl !== sda) ||
                            (xcl === sda && xda !== scl)) &&
                            allBlocks[i] !== this &&
                            allBlocks[i].type !== 'i2c_busy') {
            this.pinWarn = warnTxt;
          }
        }
      }
      for (let i = 0; i < allBlocks.length; i++) {
        func = allBlocks[i].checkI2cPins;
        if (func) {
          func.call(allBlocks[i], (this.pinWarn ? true : false));
        }
        func = allBlocks[i].setSdaPins;
        if (func && sda !== this.getFieldValue('SDA')) {
          func.call(allBlocks[i], sda, this.getFieldValue('SDA'));
        }
        func = allBlocks[i].setSclPins;
        if (func && scl !== this.getFieldValue('SCL')) {
          func.call(allBlocks[i], scl, this.getFieldValue('SCL'));
        }
      }
    } else if (action === true) {
      this.pinWarn = warnTxt;
    } else if (action === false) {
      this.pinWarn = null;
    }
    this.setWarningText(this.pinWarn);
  },
};

/**
 * I2C Send C code generator
 * @return {string}
 */
Blockly.propc.i2c_send = function() {
  // TODO: Please document the following line of code.
  let code = (this.pinWarn ? '// ' + this.pinWarn.replace(/\n/g, '') : '');

  const sda = this.getFieldValue('SDA');
  let mode = '0';
  const scl = this.getFieldValue('SCL');
  const order = this.getFieldValue('ORDER');
  const adct = this.getFieldValue('ADDRCOUNT');
  let val = Blockly.propc.valueToCode(
      this, 'DATA', Blockly.propc.ORDER_NONE) || '0';
  const cnt = this.getFieldValue('COUNT') || '1';
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE) || '0';
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < allBlocks.length; i++) {
    if (allBlocks[i].type === 'i2c_mode') {
      const xcl = allBlocks[i].getFieldValue('SCL');
      if (xcl === scl) {
        mode = allBlocks[i].getFieldValue('MODE');
      }
    }
  }

  if (!this.disabled) {
    const profile = getDefaultProfile();
    let s1 = '';
    let s2 = '';
    if (profile.digital.toString().indexOf(sda + ',' + sda) === -1) {
      s1 = 'MY_';
    }
    if (profile.digital.toString().indexOf(scl + ',' + scl) === -1) {
      s2 = 'MY_';
    }
    Blockly.propc.definitions_['i2c_init' + sda] = 'i2c *i2c' + sda + ';';
    Blockly.propc.setups_['i2c_init' + sda] =
        'i2c' + sda + ' = i2c_newbus(' + s2 + scl + ', ' + s1 + sda +
        ', ' + mode + ');';
  }

  let bufCode = '';
  let dType = 'Number';
  const connBlock = this.getInput('DATA').connection.targetBlock();
  if (connBlock) {
    const connOutput = connBlock.outputConnection.check_;
    if (connOutput && connOutput.toString().indexOf('String') > -1) {
      dType = 'String';
    }
    if (connBlock.type === 'variables_get') {
      let bType = connBlock.inputList['0'].fieldRow['0'].variable_.name;
      bType = Blockly.propc.vartype_[
          Blockly.propc.variableDB_.getName(
              bType,
              Blockly.VARIABLE_CATEGORY_NAME)
      ];
      if (bType) {
        if (bType.indexOf('char') > -1) {
          dType = 'String';
        }
      }
    }
  }

  if (dType === 'Number') {
    Blockly.propc.definitions_['i2c_Buf'] =
        'unsigned char i2cBuf[4] = {0, 0, 0, 0};';
    switch (cnt) {
      default:
        // falls through
      case '4':
        bufCode += 'i2cBuf[3] = (' + val + ' >> 24) & 255; ';
        // falls through
      case '3':
        bufCode += 'i2cBuf[2] = (' + val + ' >> 16) & 255; ';
        // falls through
      case '2':
        bufCode += 'i2cBuf[1] = (' + val + ' >> 8) & 255; ';
        // falls through
      case '1':
        bufCode += 'i2cBuf[0] = (' + val + ') & 255;';
        break;
    }
    val = 'i2cBuf';
  }

  code += bufCode;
  code += 'i2c_out(i2c' + sda + ', ' + devc + ' & 0x7F, ' + addr;
  code += ', ' + adct + ', ' + val + ', ' +
      order.replace(/1/g, '') + cnt + ');\n';

  return code;
};

/**
 * I2C Receive
 * @type {{
 *  init: Blockly.Blocks.i2c_receive.init,
 *  mutationToDom: *,
 *  setPinMenus: Blockly.Blocks.i2c_receive.setPinMenus,
 *  helpUrl: string,
 *  domToMutation: *,
 *  checkI2cPins: (
 *      Blockly.Blocks.i2c_send.checkI2cPins |
 *      Blockly.Blocks.i2c_send.checkI2cPins),
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_receive = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_RECEIVE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('i\u00B2c controller receive');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('data')
        .appendField(new Blockly.FieldNumber('2', null, null, 1), 'COUNT')
        .appendField(new Blockly.FieldDropdown([
          ['bytes MSB first', '-1'],
          ['bytes LSB first', '1'],
        ]), 'ORDER');
    this.appendValueInput('ADDR')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['register length 1 byte', '1'],
          ['register length 2 bytes', '2'],
          ['register length 3 bytes', '3'],
          ['register length 4 bytes', '4'],
        ]), 'ADDRCOUNT');
    this.appendValueInput('DEVICE')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('device address');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldDropdown([
          ['as Decimal', 'int'],
          ['as String', 'str'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_SET_ITEM), 'VAR');
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.pinWarn = null;
    // this.checkI2cPins(null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('SDA');
    const m2 = this.getFieldValue('SCL');
    const ct = this.getFieldValue('COUNT');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('bus SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, pin, null);
            }), 'SDA')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, null, pin);
            }), 'SCL');
    this.setFieldValue(ct, 'COUNT');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SDA');
    } else if (m1) {
      this.setFieldValue(m1, 'SDA');
    }
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: Blockly.Blocks['i2c_send'].mutationToDom,
  domToMutation: Blockly.Blocks['i2c_send'].domToMutation,
  checkI2cPins: Blockly.Blocks['i2c_send'].checkI2cPins,
};

/**
 * I2C Receive C code generator
 * @return {string}
 */
Blockly.propc.i2c_receive = function() {
  let code = (this.pinWarn ? '// ' + this.pinWarn.replace(/\n/g, '') : '');
  const sda = this.getFieldValue('SDA');
  let mode = '0';
  const scl = this.getFieldValue('SCL');
  const order = this.getFieldValue('ORDER');
  const adct = this.getFieldValue('ADDRCOUNT');
  const type = this.getFieldValue('TYPE');
  let val = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  const cnt = this.getFieldValue('COUNT') || '1';
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE) || '0';
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < allBlocks.length; i++) {
    if (allBlocks[i].type === 'i2c_mode') {
      const xcl = allBlocks[i].getFieldValue('SCL');
      if (xcl === scl) {
        mode = allBlocks[i].getFieldValue('MODE');
      }
    }
  }

  if (!this.disabled) {
    const profile = getDefaultProfile();
    let s1 = '';
    let s2 = '';
    if (profile.digital.toString().indexOf(sda + ',' + sda) === -1) {
      s1 = 'MY_';
    }
    if (profile.digital.toString().indexOf(scl + ',' + scl) === -1) {
      s2 = 'MY_';
    }
    Blockly.propc.definitions_['i2c_init' + sda] = 'i2c *i2c' + sda + ';';
    Blockly.propc.setups_['i2c_init' + sda] =
        'i2c' + sda + ' = i2c_newbus(' + s2 + scl + ', ' + s1 +
        sda + ', ' + mode + ');';
  }

  let bufCode = val + ' = ';
  if (type === 'str') {
    Blockly.propc.vartype_[val] = 'char *';
    bufCode = '';
  } else {
    Blockly.propc.definitions_['i2c_Buf'] =
        'unsigned char i2cBuf[4] = {0, 0, 0, 0};';
    val = 'i2cBuf';
    bufCode += '(';
    switch (cnt) {
      default:
        // falls through
      case '4':
        bufCode += '(i2cBuf[3] << 24) | ';
        // falls through
      case '3':
        bufCode += '(i2cBuf[2] << 16) | ';
        // falls through
      case '2':
        bufCode += '(i2cBuf[1] << 8) | ';
        // falls through
      case '1':
        bufCode += 'i2cBuf[0]';
        break;
    }
    bufCode += ');\n';
  }

  code += 'i2c_in(i2c' + sda + ', ' + devc + ' & 0x7F, ' + addr;
  code += ', ' + adct + ', ' + val + ', ' +
      order.replace(/1/g, '') + cnt + ');\n';
  code += bufCode;
  return code;
};

/**
 * I2C Mode
 * @type {{
 *  init: Blockly.Blocks.i2c_mode.init,
 *  setPinMenus: Blockly.Blocks.i2c_mode.setPinMenus,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.i2c_mode.onchange,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_mode = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_MODE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('PINS');
    this.warnFlag = 0;
    this.pinWarn = null;
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m2 = this.getFieldValue('SCL');
    const ct = this.getFieldValue('MODE');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('i\u00B2c controller set mode')
        .appendField(new Blockly.FieldDropdown([
          ['normal (open-collector)', '0'],
          ['push-pull', '1'],
        ]), 'MODE')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                }))), 'SCL');
    this.setFieldValue(ct, 'MODE');
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  onchange: function(event) {
    // only fire when a block got deleted or created, the SCL field was changed
    if (event &&
        (event.type == Blockly.Events.BLOCK_CREATE ||
            event.type == Blockly.Events.BLOCK_DELETE ||
            event.name === 'SCL' || event.name === 'SDA' ||
            event.blockId === this.id || this.warnFlag > 0)) {
      // TODO: Supply missing parameter in call to getAllBlocks.
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
      this.warnFlag--;
      let sda = null;
      this.pinWarn = 'WARNING: SCL on this block must match SCL on at least' +
          ' one i\u00B2c receive or i\u00B2c send block!';
      for (let i = 0; i < allBlocks.length; i++) {
        if (allBlocks[i].type === 'i2c_send' ||
            allBlocks[i].type === 'i2c_receive') {
          if (allBlocks[i].getFieldValue('SCL') === this.getFieldValue('SCL')) {
            if (sda && sda !== allBlocks[i].getFieldValue('SDA')) {
              this.pinWarn = 'WARNING: Both SDA and SCL must match SDA and' +
                  ' SCL on other i\u00B2c blocks if sharing ';
              this.pinWarn += 'an i\u00B2c bus, or both must be different' +
                  ' if on separate i\u00B2c busses!';
              sda = '-1';
            } else {
              sda = allBlocks[i].getFieldValue('SDA');
              this.pinWarn = null;
            }
          }
          if (allBlocks[i].getFieldValue('SCL') ===
              allBlocks[i].getFieldValue('SDA')) {
            this.pinWarn = 'WARNING: SDA and SCL cannot be on the same pin!';
            i = allBlocks.length + 1;
          }
        }
        this.setWarningText(this.pinWarn);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.i2c_mode = function() {
  return '';
};

/**
 * I2C Busy
 * @type {{
 *  init: Blockly.Blocks.i2c_busy.init,
 *  mutationToDom: *,
 *  setPinMenus: Blockly.Blocks.i2c_busy.setPinMenus,
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: *,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_busy = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_BUSY_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('DEVICE')
        .setCheck('Number')
        .appendField('i\u00B2c controller is device at address');
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.pinWarn = null;
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m2 = this.getFieldValue('SCL');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('busy  SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                }))), 'SCL');
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: Blockly.Blocks['i2c_send'].mutationToDom,
  domToMutation: Blockly.Blocks['i2c_send'].domToMutation,
  onchange: Blockly.Blocks['i2c_mode'].onchange,
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.i2c_busy = function() {
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';
  if (this.pinWarn) {
    return '// ' + this.pinWarn;
  } else {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    let sda = '0';
    for (let i = 0; i < allBlocks.length; i++) {
      if ((allBlocks[i].type === 'i2c_send' ||
          allBlocks[i].type === 'i2c_receive') &&
          allBlocks[i].getFieldValue('SCL') === this.getFieldValue('SCL')) {
        sda = allBlocks[i].getFieldValue('SDA');
      }
    }
    return [
      'i2c_busy(i2c' + sda + ', ' + devc + ')',
      Blockly.propc.ORDER_ATOMIC,
    ];
  }
};

// ---------------- String Handling Blocks -------------------------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.string_scan_multiple.init,
 *  saveConnections: *,
 *  updateShape_: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  domToMutation: *,
 *  updateSerPin: Blockly.Blocks.string_scan_multiple.updateSerPin
 * }}
 */
Blockly.Blocks.string_scan_multiple = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_SCAN_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('scan string')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HANDLE');
    this.setMutator(new Blockly.Mutator([
      'string_scan_dec',
      'string_scan_hex',
      'string_scan_bin',
      'string_scan_float',
      'string_scan_char',
    ]));
    this.optionList_ = ['dec', 'char'];
    this.updateShape_();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setWarningText(null);
    // not used, but allows this block to share functions
    // from serial_scan_multiple block
    this.ser_pins = [];
  },
  mutationToDom: Blockly.Blocks['serial_scan_multiple'].mutationToDom,
  domToMutation: Blockly.Blocks['serial_scan_multiple'].domToMutation,
  decompose: Blockly.Blocks['serial_scan_multiple'].decompose,
  compose: Blockly.Blocks['serial_scan_multiple'].compose,
  saveConnections: Blockly.Blocks['serial_scan_multiple'].saveConnections,
  updateShape_: Blockly.Blocks['serial_scan_multiple'].updateShape_,
  updateSerPin: function() {},
};

/**
 *
 * @type {{init: Blockly.Blocks.string_scan_container.init}}
 */
Blockly.Blocks.string_scan_container = {
  // Container.
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('scan string for');
    this.appendStatementInput('STACK');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['from beginning', ' '],
          ['after text', 'AfterStr'],
          // ["starting at position", "AfterPos"]
        ]), 'SCAN_START');
    this.contextMenu = false;
  },
};

Blockly.Blocks.string_scan_str = Blockly.Blocks.console_print_str;
Blockly.Blocks.string_scan_dec = Blockly.Blocks.console_print_dec;
Blockly.Blocks.string_scan_hex = Blockly.Blocks.console_print_hex;
Blockly.Blocks.string_scan_bin = Blockly.Blocks.console_print_bin;
Blockly.Blocks.string_scan_float = Blockly.Blocks.console_print_float;
Blockly.Blocks.string_scan_char = Blockly.Blocks.console_print_char;

/**
 *
 * @return {string}
 */
Blockly.propc.string_scan_multiple = function() {
  let stringFrom = (Blockly.propc.valueToCode(
      this, 'SCAN_AFTER', Blockly.propc.ORDER_NONE)).trim() || '';
  if (this.scanAfter && this.scanAfter.length > 3 && stringFrom) {
    stringFrom = stringFrom + ', ';
  }
  let code = 'sscan' + (stringFrom !== '' ? this.scanAfter : '');
  code += '(' + Blockly.propc.variableDB_.getName(
      this.getFieldValue('HANDLE'),
      Blockly.VARIABLE_CATEGORY_NAME) + ', ' + stringFrom + '"';
  let varList = '';
  let codeAdd = '';
  let i = 0;
  while (this.getFieldValue('CPU' + i)) {
    if (this.getFieldValue('TYPE' + i).includes('store decimal number')) {
      code += '%d';
    } else if (this.getFieldValue('TYPE' + i)
        .includes('store ASCII character')) {
      code += '%c';
    } else if (this.getFieldValue('TYPE' + i)
        .includes('store hexadecimal number')) {
      code += '%x';
    } else if (this.getFieldValue('TYPE' + i).includes('store binary number')) {
      code += '%b';
    } else if (this.getFieldValue('TYPE' + i) === 'in') {
      code += '%f';
    }
    if (this.getFieldValue('TYPE' + i) === 'in') {
      varList += ', &__fpBuf' + i;
      codeAdd += Blockly.propc.variableDB_.getName(
          this.getFieldValue('CPU' + i),
          Blockly.VARIABLE_CATEGORY_NAME);
      codeAdd += ' = (int) (__fpBuf' + i + ' * ' +
          this.getFieldValue('MULT' + i) + ');\n';
      if (!this.disabled) {
        Blockly.propc.global_vars_['floatPointScanBuffer' + i] =
            'float __fpBuf' + i + ';';
      }
    } else {
      varList += ', &' + Blockly.propc.variableDB_.getName(
          this.getFieldValue('CPU' + i),
          Blockly.VARIABLE_CATEGORY_NAME);
    }
    i++;
  }
  code += '"' + varList + ');\n' + codeAdd;
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.string_sprint_multiple.init,
 *  saveConnections: *,
 *  compose: *,
 *  mutationToDom: *,
 *  decompose: *,
 *  helpUrl: string,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.string_sprint_multiple = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_SPRINT_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('create string from');
    this.appendValueInput('PRINT0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('String')
        .appendField('text');
    this.appendValueInput('PRINT1')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('decimal number');
    this.appendDummyInput('NEWLINE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(false);
    this.setMutator(new Blockly.Mutator([
      'string_scan_str',
      'string_scan_dec',
      'string_scan_hex',
      'string_scan_bin',
      'string_scan_float',
      'string_scan_char',
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
};

Blockly.propc.string_sprint_multiple = Blockly.propc.console_print_multiple;
