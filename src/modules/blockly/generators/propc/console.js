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


// ------------------ Terminal Console Blocks ----------------------------------

import Blockly from 'blockly/core';
import {colorPalette} from '../propc';
import {getProjectInitialState} from '../../../project';


/**
 * Console Print block definition
 *
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
 *
 * @return {string}
 */
Blockly.propc.console_print = function() {
  const text = Blockly.propc.valueToCode(this, 'MESSAGE', Blockly.propc.ORDER_ATOMIC);
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
 *
 * @return {string}
 */
Blockly.propc.console_print_variables = function() {
  let value = Blockly.propc.valueToCode(this, 'VALUE', Blockly.propc.ORDER_ATOMIC);
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
      clauseBlock.valueConnection_ = printInput && printInput.connection.targetConnection;
      clauseBlock = clauseBlock.nextConnection && clauseBlock.nextConnection.targetBlock();
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
        if (typeof this.ser_pins[0] === 'string') {
          p = this.ser_pins[0].replace(',', '_').replace(/None/g, 'N');
        }
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

    // Get the resulting code from Blockly core
    const result = Blockly.propc.valueToCode(this, 'PRINT' + i, Blockly.propc.ORDER_NONE) || orIt;

    if (!this.getFieldValue('TYPE' + i).includes('float point  divide by')) {
      varList += ', ' + result;
    } else {
      varList += ', ((float) ' + result + ') / ' +
          this.getFieldValue('DIV' + i) + '.0';
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

  if (getProjectInitialState().boardType.name === 'heb-wx' &&
      this.type === 'wx_print_multiple') {
    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.setups_['wx_init'] =
        'wifi_start(31, 30, 115200, WX_ALL_COM);';
  }

  return code;
};


/**
 * Console Print Container block definition
 */
Blockly.Blocks.console_print_container = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 * Console Print Decimal block definition
 */
Blockly.Blocks.console_print_dec = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 */
Blockly.Blocks.console_print_hex = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 */
Blockly.Blocks.console_print_bin = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 * Console Print String block definition
 */
Blockly.Blocks.console_print_str = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 */
Blockly.Blocks.console_print_char = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
 */
Blockly.Blocks.console_print_float = {
  helpUrl: Blockly.MSG_TERMINAL_HELPURL,

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
