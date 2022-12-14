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

// --------------- EEPROM Memory Blocks ---------------------------------------

import Blockly from 'blockly/core';
import {colorPalette} from '../propc';


/**
 *
 * @type {{init: Blockly.Blocks.eeprom_read.init, helpUrl: string}}
 */
Blockly.Blocks.eeprom_read = {
  helpUrl: Blockly.MSG_EEPROM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_EEPROM_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.appendValueInput('ADDRESS')
        .setCheck('Number')
        .appendField('EEPROM read')
        .appendField(new Blockly.FieldDropdown([
          ['number', 'NUMBER'],
          ['text', 'TEXT'],
          ['byte', 'BYTE'],
        ]),
        'TYPE')
        .appendRange('R,0,7675,0')
        .appendField('from address');
    this.appendDummyInput()
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.eeprom_read = function() {
  const type = this.getFieldValue('TYPE');
  const address = Blockly.propc.valueToCode(
      this, 'ADDRESS', Blockly.propc.ORDER_ATOMIC) || '0';
  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'), Blockly.VARIABLE_CATEGORY_NAME);
  let code = '';

  if (data !== '') {
    if (type === 'BYTE') {
      code += data + ' = ee_getByte( 32768 + constrainInt(' + address +
          ', 0, 7675));\n';
    } else if (type === 'NUMBER') {
      code += data + ' = ee_getInt( 32768 + constrainInt(' + address +
          ', 0, 7675));\n';
    } else {
      if (!this.disabled) {
        Blockly.propc.global_vars_['i2c_eeBffr'] = 'char __eeBffr[1];';
        Blockly.propc.global_vars_['i2c_eeIdx'] = 'int __eeIdx = 0;';
        Blockly.propc.vartype_[data] = 'char *';
      }
      code += '// Get the string from EEPROM one character at a time until' +
          ' it finds the end of the string.\n__eeIdx = 0;\n';
      code += 'while(__eeIdx < 128) {\n  ee_getStr(__eeBffr, 1, (32768 +' +
          ' constrainInt(' + address + ', 0, 7675)) + __eeIdx);\n';
      code += data + '[__eeIdx] = __eeBffr[0];\nif(' + data +
          '[__eeIdx] == 0) break;\n  __eeIdx++;\n}\n';
      code += 'if(__eeIdx >= 128) ' + data + '[127] = 0;\n';
    }
  }
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.eeprom_write.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.eeprom_write.domToMutation,
 *  setOutputType_: Blockly.Blocks.eeprom_write.setOutputType_
 * }}
 */
Blockly.Blocks.eeprom_write = {
  helpUrl: Blockly.MSG_EEPROM_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_EEPROM_WRITE_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.appendValueInput('DATA')
        .setCheck(null)
        .appendField('EEPROM write')
        .appendField(new Blockly.FieldDropdown([
          ['number', 'NUMBER'],
          ['text', 'TEXT'],
          ['byte', 'BYTE']],
        function(type) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setOutputType_(type);
        }),
        'TYPE');

    this.appendValueInput('ADDRESS')
        .appendRange('R,0,7675,0')
        .setCheck('Number')
        .appendField('to address');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setOutputType_(this.getFieldValue('DATA'));
  },

  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('type', this.getFieldValue('TYPE'));
    return container;
  },

  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    let savedType = container.getAttribute('type');
    if (!savedType) {
      savedType = null;
    }
    this.setOutputType_(savedType || null);
  },

  setOutputType_: function(type) {
    let setType = 'Number';
    if (type === 'TEXT') {
      setType = 'String';
    }
    if (type === null || type === 'null') {
      setType = null;
    }
    this.getInput('DATA').setCheck(setType);
  },
};


/**
 * Generate C source code for the eeprom_write block
 *
 * @return {string}
 */
Blockly.propc.eeprom_write = function() {
  const type = this.getFieldValue('TYPE');
  const address = Blockly.propc.valueToCode(this, 'ADDRESS', Blockly.propc.ORDER_ATOMIC);
  let data = Blockly.propc.valueToCode(this, 'DATA', Blockly.propc.ORDER_ATOMIC) || '';

  let code = '';
  if (data !== '') {
    if (type === 'BYTE') {
      if (!(data.length === 3 && data[0] === '\'' && data[2] === '\'')) {
        if (data !== data.replace(/[^0-9]+/g, '')) {
          data = '(' + data + ' & 0xFF)';
        } else if (!(0 < parseInt(data) && parseInt(data) < 256)) {
          data = '(' + data + ' & 0xFF)';
        }
      }

      code += 'ee_putByte(' + data + ', (32768 + constrainInt(' + address + ', 0, 7675)) );\n';
    } else if (type === 'NUMBER') {
      code += 'ee_putInt(' + data + ', (32768 + constrainInt(' + address + ', 0, 7675)) );\n';
    } else {
      code += 'ee_putStr(' + data + ', ((int) strlen(' + data +
          ') + 1), (32768 + constrainInt(' + address + ', 0, 7675)) );\n';
    }
  }

  return code;
};
