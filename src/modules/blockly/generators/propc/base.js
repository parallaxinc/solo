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
 * @fileoverview Generating C for sensor blocks
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */
'use strict';

import Blockly from 'blockly/core';

import {getDefaultProfile} from '../../../project';
import {colorPalette} from '../propc';

/**
 * Use this to create a module-level incrementing variable, which makes
 * each instance of custom code unique.
 * @type {number}
 */
Blockly.propc.cCode = 0;

/**
 * Math Number
 * @type {{
 *  init: Blockly.Blocks.math_number.init,
 *  mutationToDom: (function(): HTMLElement),
 *  onchange: Blockly.Blocks.math_number.onchange,
 *  domToMutation: Blockly.Blocks.math_number.domToMutation,
 *  getRangeArray: (function(): [string, number, number, number]),
 *  updateShape: Blockly.Blocks.math_number.updateShape
 *  }}
 * @description
 * The Number block that can mutate to show a range or if a value is out
 * bounds or not available. Gets values from the block its connected to by
 * looking for a range property string. The string must start with
 * S, R, or A, and hold a comma-separated set of values. 'S' and 'R' are for
 * a range, with 'S' invoking a UI slider. The first number is the minimum
 * allowed value, the second is the maximum allowed value, and the third is a
 * dummy start value. If the range is within +/- 1000, the block will display
 * it. A warning is thrown if a value entered is out of range. The 'A' argument
 * takes a comma-separated list of allowed values (think PINS), and throws a
 * warning if an illegal value is entered.
 */
Blockly.Blocks.math_number = {
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
      this.setColour(colorPalette.getColor('math'));
    } else {
      this.setHelpUrl(Blockly.MSG_VALUES_HELPURL);
      this.setColour(colorPalette.getColor('programming'));
    }
    this.setTooltip(Blockly.MSG_MATH_NUMBER_TOOLTIP);
    this.appendDummyInput('MAIN')
        .appendField(new Blockly.FieldNumber(
            '0', null, null, 1),
        'NUM');
    this.setOutput(true, 'Number');
    this.lastBlockText = ' ';
    this.lastFieldType = 'number';
    this.warnTxt = null;
    this.connectedBlockId = null;
  },
  onchange: function(event) {
    if (event &&
        (event.type === Blockly.Events.CHANGE ||
         event.type === Blockly.Events.MOVE) &&
        (event.blockId === this.id ||
         event.blockId === this.connectedBlockId)) {
      this.updateShape();
    }
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute(
        'blocktext',
        this.getFieldValue('TITLE') || '');
    container.setAttribute('warntext', this.warnTxt || '');
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    this.lastBlockText = container.getAttribute('blocktext') || '';
    this.warnTxt = container.getAttribute('warntext') || null;
    const value = this.getFieldValue('NUM');
    if (this.getInput('MAIN')) {
      this.removeInput('MAIN');
    }
    if (this.lastBlockText === '') {
      this.appendDummyInput('MAIN')
          .appendField(new Blockly.FieldNumber(
              value, null, null, 1), 'NUM');
    } else {
      this.appendDummyInput('MAIN')
          .appendField(new Blockly.FieldNumber(
              value, null, null, 1),
          'NUM')
          .appendField(this.lastBlockText, 'TITLE');
    }
    this.setWarningText(this.warnTxt);
  },
  getRangeArray: function() {
    const range = ['N', -100, 100, Number(this.getFieldValue('NUM'))];
    if (this.outputConnection && this.outputConnection.targetBlock()) {
      const connectingBlock = this.outputConnection.targetBlock();
      const fieldListing = connectingBlock.getInputWithBlock(this).getRange();
      if (fieldListing) {
        const rangeValues = fieldListing.split(',');
        range[0] = rangeValues[0];
        if (rangeValues[0] === 'S' || rangeValues[0] === 'R') {
          range[1] = Number(rangeValues[1]);
          range[2] = Number(rangeValues[2]);
        } else if (rangeValues[0] === 'A') {
          for (let idx = 4; idx < rangeValues.length - 3; idx++) {
            range[idx] = Number(rangeValues[idx - 3]);
          }
        }
      }
    }
    return range;
  },
  updateShape: function(rangeArray) {
    let fieldType = 'number';
    let blockText = '';
    let warnText = null;
    const range = rangeArray || this.getRangeArray();
    let fieldToAdd = new Blockly.FieldNumber(
        range[3].toString(10), null, null, 1);
    this.connectedBlockId = null;
    const connectedBlock = this.outputConnection.targetBlock();
    if (connectedBlock) {
      this.connectedBlockId = connectedBlock.id;
    }

    if (range[0] === 'R') {
      if (range[3] < range[1]) {
        warnText = Blockly.Msg.MATH_NUMBER_RANGE_TOO_LARGE_WARNING +
            range[1].toString(10);
      } else if (range[3] > range[2]) {
        warnText = Blockly.Msg.MATH_NUMBER_RANGE_TOO_SMALL_WARNING +
            range[2].toString(10);
      }
      if ((range[3] < range[1] || range[3] > range[2]) &&
          Math.abs(range[1] - range[2]) <= 10000000) {
        if (range[2] >= 2147483647) {
          blockText = '(\u2265 ' + range[0].toString(10) + ')';
        } else if (range[1] <= -2147483647) {
          blockText = '(\u2264' + range[1].toString(10) + ')';
        } else if (Math.abs(range[1]) === Math.abs(range[2])) {
          blockText = '(+/- ' + Math.abs(range[1]).toString(10) + ')';
        } else {
          blockText = '(' +
              range[1].toString(10) +
              ' to ' +
              range[2].toString(10) + ')';
        }
      }
    } else if (range[0] === 'A') {
      let warnMsg = true;
      for (let idx = 4; idx < (range.length - 3); idx++) {
        if (range[3] === Number(range[idx])) {
          warnMsg = false;
          break;
        }
      }
      if (warnMsg) {
        warnText = Blockly.Msg.MATH_NUMBER_RANGE_VALUE_INVALID_WARNING;
      }
    } else if (range[0] === 'S') {
      fieldType = 'slider';
      if (range[3] > range[2]) {
        range[3] = range[2];
      }
      if (range[3] < range[1]) {
        range[3] = range[1];
      }

      fieldToAdd = new Blockly.FieldRange(
          range[3].toString(10),
          range[1].toString(10),
          range[2].toString(10));
    }
    if (this.lastBlockText !== blockText || this.lastFieldType !== fieldType) {
      this.lastBlockText = blockText;
      this.lastFieldType = fieldType;
      if (this.getInput('MAIN')) {
        this.removeInput('MAIN');
      }
      if (blockText === '') {
        this.appendDummyInput('MAIN')
            .appendField(fieldToAdd, 'NUM');
      } else {
        this.appendDummyInput('MAIN')
            .appendField(fieldToAdd, 'NUM')
            .appendField(blockText, 'TITLE');
      }
    }
    this.warnTxt = warnText;
    this.setWarningText(warnText);
  },
};

/**
 * C code generator for the Math Number block
 * @return {[number, *]}
 */
Blockly.propc.math_number = function() {
  // Numeric value.
  const code = window.parseInt(this.getFieldValue('NUM'));
  // -4.abs() returns -4 in Dart due to strange order of operation choices.
  // -4 is actually an operator and a number.  Reflect this in the order.
  const order = code < 0 ?
      Blockly.propc.ORDER_UNARY_PREFIX : Blockly.propc.ORDER_ATOMIC;
  return [code, order];
};

/**
 * Basic math functions
 * @type {{
 *  init: Blockly.Blocks.math_arithmetic.init,
 *  saveConnections: Blockly.Blocks.math_arithmetic.saveConnections,
 *  compose: Blockly.Blocks.math_arithmetic.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (function(*): Blockly.Block),
 *  domToMutation: Blockly.Blocks.math_arithmetic.domToMutation
 *  }}
 */
Blockly.Blocks.math_arithmetic = {
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_MATH_ARITHMETIC_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['+', ' + '],
          ['\u2212', ' - '],
          ['\u00D7', ' * '],
          ['\u00F7', ' / '],
          ['% (remainder after division)', ' % '],
          ['^ (raise to the power of)', ' p ']]), 'OP');
    this.setInputsInline(true);
    this.myChildren_ = 'B';

    // Field is unreferenced in the project
    // this.myConnection_ = null;

    this.setMutator(new Blockly.Mutator(['math_arithmatic_term']));
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('terms', this.myChildren_);
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    this.myChildren_ = container.getAttribute('terms');
    if (this.myChildren_.charCodeAt(0) > 'B'.charCodeAt(0)) {
      for (let i = 'C'.charCodeAt(0);
        i <= this.myChildren_.charCodeAt(0);
        i++) {
        this.appendValueInput(String.fromCharCode(i))
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown([
              ['+', ' + '],
              ['\u2212', ' - '],
              ['\u00D7', ' * '],
              ['\u00F7', ' / '],
              ['% (remainder after division)', ' % '],
              ['^ (raise to the power of)', ' p '],
            ]), 'OP' + String.fromCharCode(i));
      }
    }
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('math_arithmatic_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    if (this.myChildren_.charCodeAt(0) > 'B'.charCodeAt(0)) {
      for (let i = 'C'.charCodeAt(0);
        i <= this.myChildren_.charCodeAt(0);
        i++) {
        const optionBlock = workspace.newBlock('math_arithmatic_term');
        optionBlock.initSvg();
        connection.connect(optionBlock.previousConnection);
        connection = optionBlock.nextConnection;
      }
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Delete everything.
    let i = 'C'.charCodeAt(0);
    while (this.getInput(String.fromCharCode(i))) {
      this.removeInput(String.fromCharCode(i));
      i++;
    }

    i = 'C'.charCodeAt(0);
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    while (clauseBlock) {
      // Reconnect any child blocks.
      const termInput = this.appendValueInput(String.fromCharCode(i))
          .setCheck('Number')
          .appendField(new Blockly.FieldDropdown([
            ['+', ' + '],
            ['\u2212', ' - '],
            ['\u00D7', ' * '],
            ['\u00F7', ' / '],
            ['% (remainder after division)', ' % '],
            ['^ (raise to the power of)', ' p ']]),
          'OP' + String.fromCharCode(i));
      if (clauseBlock.valueConnection_) {
        termInput.connection.connect(clauseBlock.valueConnection_);
      }
      i++;
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
    this.myChildren_ = String.fromCharCode(i - 1);
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let x = 'C'.charCodeAt(0);
    while (clauseBlock) {
      const termInput = this.getInput(String.fromCharCode(x));
      clauseBlock.valueConnection_ =
          termInput && termInput.connection.targetConnection;
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
      x++;
    }
  },
};

/**
 * A block to hold arithmetic blocks
 * @type {{
 *  init: Blockly.Blocks.math_arithmatic_container.init}}
 */
Blockly.Blocks.math_arithmatic_container = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('Math');
    this.appendDummyInput()
        .appendField('  term');
    this.appendDummyInput()
        .appendField('  term');
    this.setInputsInline(false);
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },
};

/**
 * Arithmetic term block
 * @type {{init: Blockly.Blocks.math_arithmatic_term.init}}
 */
Blockly.Blocks.math_arithmatic_term = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('term');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 * Arithmetic
 * @return {[string, number]}
 */
Blockly.propc.math_arithmetic = function() {
  const operator = [this.getFieldValue('OP')];
  const argument = [Blockly.propc.valueToCode(
      this,
      'A',
      Blockly.propc.ORDER_MULTIPLICATIVE) || '0'];
  argument.push(Blockly.propc.valueToCode(
      this,
      'B',
      Blockly.propc.ORDER_MULTIPLICATIVE) || '0');
  let code = '';

  // We're looking at the characters from C to Z - why?
  for (let k = 'C'.charCodeAt(0); k <= 'Z'.charCodeAt(0); k++) {
    if (Blockly.propc.valueToCode(
        this,
        String.fromCharCode(k),
        Blockly.propc.ORDER_MULTIPLICATIVE)) {
      operator.push(this.getFieldValue('OP' + String.fromCharCode(k)));
      argument.push(Blockly.propc.valueToCode(
          this,
          String.fromCharCode(k),
          Blockly.propc.ORDER_MULTIPLICATIVE));
    } else {
      operator.push('');
      argument.push('');
    }
  }
  operator.push('');

  for (let k = 0; k < 26; k++) {
    if (operator[k] === ' p ') {
      code += 'pow(' + argument[k] + ', ';
    } else {
      if (k > 0) {
        let pEnds = '';
        let theOp = k - 1;
        while (theOp > -1) {
          if (operator[theOp] === ' p ') {
            pEnds += ')';
          } else {
            break;
          }
          theOp--;
        }
        code += argument[k] + pEnds + operator[k];
      } else {
        code += argument[k];
        code += operator[k];
      }
    }
  }
  return [code, Blockly.propc.ORDER_NONE];
};

/**
 * Mathematical limit block
 * @type {{init: Blockly.Blocks.math_limit.init, helpUrl: string}}
 */
Blockly.Blocks.math_limit = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MATH_LIMIT_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('A')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['highest of', ' > '],
          ['lowest of', ' < '],
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField('and');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 * C code generator block
 * @return {[string, number]}
 */
Blockly.propc.math_limit = function() {
  const operator = this.getFieldValue('OP');
  const argument0 = Blockly.propc.valueToCode(
      this,
      'A',
      Blockly.propc.ORDER_ASSIGNMENT) || '0';
  const argument1 = Blockly.propc.valueToCode(
      this,
      'B',
      Blockly.propc.ORDER_ASSIGNMENT) || '0';

  const code = '(' + argument0 + operator + argument1 + ' ? ' +
      argument0 + ' : ' + argument1 + ')';
  return [code, Blockly.propc.ORDER_ASSIGNMENT];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.math_crement.init
 *  }}
 */
Blockly.Blocks.math_crement = {
  // Increment/decrement
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_MATH_CREMENT_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('VAR')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['decrement', '--'],
          ['increment', '++'],
        ]), 'OP');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.math_crement = function() {
  const operator = this.getFieldValue('OP');
  const variable = Blockly.propc.valueToCode(
      this,
      'VAR',
      Blockly.propc.ORDER_UNARY_PREFIX) || '0';

  return variable + operator + ';\n';
};

/**
 * Math - Random number generator
 *
 * @type {{init: Blockly.Blocks.math_random.init}}
 */
Blockly.Blocks.math_random = {
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_MATH_RANDOM_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('A')
        .setCheck('Number')
        .appendField('random number from');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField('to');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.math_random = function() {
  const arg1 = Blockly.propc.valueToCode(
      this,
      'A',
      Blockly.propc.ORDER_ATOMIC) || '1';
  const arg2 = Blockly.propc.valueToCode(
      this,
      'B',
      Blockly.propc.ORDER_ATOMIC) || '100';

  return ['random(' + arg1 + ', ' + arg2 + ')', Blockly.propc.ORDER_NONE];
};

/**
 * Bitwise operators
 * @type {{
 *  init: Blockly.Blocks.math_bitwise.init, helpUrl: string
 *  }}
 */
Blockly.Blocks.math_bitwise = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MATH_BITWISE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['& (bitwise AND)', ' & '],
          ['| (bitwise OR)', ' | '],
          ['^ (bitwise XOR)', ' ^ '],
          ['>> (bitwise right shift)', ' >> '],
          ['<< (bitwise left shift)', ' << '],
        ]), 'OP');
    this.appendValueInput('B')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 * C code generator for Math Bitwise operators
 * @return {[string, number]}
 */
Blockly.propc.math_bitwise = function() {
  const argument0 = Blockly.propc.valueToCode(
      this,
      'A',
      Blockly.propc.ORDER_NONE);
  const argument1 = Blockly.propc.valueToCode(
      this,
      'B',
      Blockly.propc.ORDER_NONE);
  const operator = this.getFieldValue('OP');
  const code = argument0 + operator + argument1;

  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 * Basic delay block
 * @type {{
 *  init: Blockly.Blocks.base_delay.init, helpUrl: string
 *  }}
 */
Blockly.Blocks.base_delay = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_BASE_DELAY_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendValueInput('DELAY_TIME', 'Number')
        .appendField('pause (ms)')
        .setCheck('Number');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * C code generator for the Basic Delay block
 * @return {string}
 */
Blockly.propc.base_delay = function() {
  const delayTime = Blockly.propc.valueToCode(
      this,
      'DELAY_TIME',
      Blockly.propc.ORDER_ATOMIC) || '1000';
  const unit = 'pause'; // this.getFieldValue("UNIT") || "pause";
  return unit + '(' + delayTime + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.string_type_block.init, helpUrl: string}}
 */
Blockly.Blocks.string_type_block = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_TYPE_BLOCK_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('\u201C')
        .appendField(new Blockly.FieldTextInput('Hello'), 'TEXT')
        .appendField('\u201D');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'String');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.string_type_block = function() {
  const text = this.getFieldValue('TEXT').replace(/"/g, '\\"');
  const code = '"' + text + '"';

  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.char_type_block.init, helpUrl: string}}
 */
Blockly.Blocks.char_type_block = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CHAR_TYPE_BLOCK_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    const charMenu = [['32 - space', '32']];

    // Loop through the remaining ASCII characters
    for (let k = 33; k < 127; k++) {
      charMenu.push([
        k.toString(10) + ' - ' + String.fromCharCode(k),
        k.toString(10),
      ]);
    }

    // Add special ASCII characters
    charMenu.push(['7 - bell', '7']);
    charMenu.push(['10 - line feed', '10']);
    charMenu.push(['11 - tab', '11']);
    charMenu.push(['13 - carriage return', '13']);
    charMenu.push(['127 - delete', '127']);

    this.appendDummyInput()
        .appendField('character')
        .appendField(new Blockly.FieldDropdown(charMenu), 'CHAR');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 * C code generator
 * @return {[string | null, number]}
 */
Blockly.propc.char_type_block = function() {
  const code = this.getFieldValue('CHAR');
  return [code, Blockly.propc.ORDER_NONE];
};

/**
 * Music Note block
 * @type {{
 *  init: Blockly.Blocks.music_note.init, helpUrl: string
 *  }}
 */
Blockly.Blocks.music_note = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MUSIC_NOTE_BLOCK_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('music note')
        .appendField(new Blockly.FieldDropdown([
          ['C', '2093.00'],
          ['C♯/D♭', '2217.46'],
          ['D', '2349.32'],
          ['D♯/E♭', '2489.02'],
          ['E', '2637.02'],
          ['F', '2793.83'],
          ['F♯/G♭', '2959.96'],
          ['G', '3135.96'],
          ['G♯/A♭', '3322.44'],
          ['A', '3520.00'],
          ['A♯/B♭', '3729.31'],
          ['B', '3951.07'],
        ]), 'NOTE')
        .appendField('octave')
        .appendField(new Blockly.FieldDropdown([
          ['1st', '0.015625'],
          ['2nd', '0.03125'],
          ['3rd', '0.0625'],
          ['4th', '0.125'],
          ['5th', '0.25'],
          ['6th', '0.5'],
          ['7th', '1'],
          ['8th', '2'],
        ]), 'OCTAVE');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.music_note = function() {
  const note = (Math.round(
      parseFloat(this.getFieldValue('NOTE')) *
            parseFloat(this.getFieldValue('OCTAVE'))
  )).toString(10);
  return [note, Blockly.propc.ORDER_NONE];
};

/**
 * System Counter
 * @type {{init: Blockly.Blocks.system_counter.init}}
 */
Blockly.Blocks.system_counter = {
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SYSTEM_COUNTER_TOOLTIP);
    if (profile.description === 'Other Propeller Boards') {
      this.setHelpUrl(Blockly.MSG_SYSTEM_HELPURL);
      this.setColour(colorPalette.getColor('system'));
    } else {
      this.setColour(colorPalette.getColor('programming'));
      this.setHelpUrl(Blockly.MSG_VALUES_HELPURL);
    }
    this.appendDummyInput()
        .appendField('system')
        .appendField(new Blockly.FieldDropdown([
          ['counter', 'CNT'],
          ['clock frequency', 'CLKFREQ'],
        ]), 'CMD');
    this.setOutput(true, 'Number');
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.system_counter = function() {
  const code = this.getFieldValue('CMD');
  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.waitcnt.init, helpUrl: string}}
 */
Blockly.Blocks.waitcnt = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_WAITCNT_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendValueInput('TARGET')
        .setCheck('Number')
        .appendField('Wait until');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.waitcnt = function() {
  const target = Blockly.propc.valueToCode(
      this,
      'TARGET',
      Blockly.propc.ORDER_NONE);

  // Return code fragment
  return 'waitcnt(' + target + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.register_set.init, helpUrl: string}}
 */
Blockly.Blocks.register_set = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_REGISTER_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendValueInput('TARGET')
        .setCheck('Number')
        .appendField('cog')
        .appendField(new Blockly.FieldDropdown([
          ['pin output', 'OUTA'],
          ['pin direction', 'DIRA'],
          ['counter A', 'CTRA'],
          ['counter B', 'CTRB'],
          ['frequency A', 'FRQA'],
          ['frequency B', 'FRQB'],
          ['phase accumulator A', 'PHSA'],
          ['phase accumulator B', 'PHSB'],
        ]), 'CMD')
        .appendField('register =');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.register_set = function() {
  const target = Blockly.propc.valueToCode(
      this,
      'TARGET',
      Blockly.propc.ORDER_NONE);
  const register = this.getFieldValue('CMD');
  return register + ' = ' + target + ';\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.register_get.init, helpUrl: string}}
 */
Blockly.Blocks.register_get = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_REGISTER_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendDummyInput()
        .appendField('cog')
        .appendField(new Blockly.FieldDropdown([
          ['pin input', 'INA'],
          ['pin output', 'OUTA'],
          ['pin direction', 'DIRA'],
          ['counter A', 'CTRA'],
          ['counter B', 'CTRB'],
          ['frequency A', 'FRQA'],
          ['frequency B', 'FRQB'],
          ['phase accumulator A', 'PHSA'],
          ['phase accumulator B', 'PHSB'],
        ]), 'CMD')
        .appendField('register');
    this.setOutput(true, 'Number');
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.register_get = function() {
  const code = this.getFieldValue('CMD');
  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.wait_pin.init, helpUrl: string}}
 */
Blockly.Blocks.wait_pin = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_WAIT_PIN_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendValueInput('PIN')
        .setCheck('Number')
        .appendField('wait until')
        .appendField(new Blockly.FieldDropdown([
          ['PIN', '(1 << x)'],
          ['pin mask', 'x'],
        ]), 'PINTYPE');
    this.appendValueInput('STATE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'waitpeq'],
          ['is not', 'waitpne'],
        ]), 'FUNC');
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, 'Block');
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wait_pin = function() {
  const pinValue = Blockly.propc.valueToCode(
      this,
      'PIN',
      Blockly.propc.ORDER_NONE) || '0';
  const pinState = Blockly.propc.valueToCode(
      this,
      'STATE',
      Blockly.propc.ORDER_NONE) || '0';
  const pinType = this.getFieldValue('PINTYPE');
  const pinFunction = this.getFieldValue('FUNC');

  return pinFunction + '(' + pinType
      .replace('1', pinState)
      .replace('x', pinValue) + ', ' +
      pinType.replace('x', pinValue) + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.custom_code.init, helpUrl: string}}
 * @deprecated Use the "User Defined Code block, located in the Control menu
 */
Blockly.Blocks.custom_code = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CUSTOM_CODE_TOOLTIP);
    this.setColour('#FF8800');
    this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
        ' with a "User defined code" block from the Control menu.');
    this.appendDummyInput()
        .appendField('user code')
        .appendField(new Blockly.FieldTextInput(''), 'CODE')
        .appendField('in')
        .appendField(new Blockly.FieldDropdown([
          ['main', 'main'],
          ['setup', 'setup'],
          ['definitions', 'definitions'],
          ['includes', 'includes'],
        ]), 'LOC');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.custom_code = function() {
  const loc = this.getFieldValue('LOC');
  const usr = this.getFieldValue('CODE');
  let code = '';

  if (loc === 'includes') {
    Blockly.definitions_['cCode' + Blockly.propc.cCode] = usr;
  } else if (loc === 'setup') {
    Blockly.propc.setups_['cCode' + Blockly.propc.cCode] = usr;
  } else if (loc === 'definitions') {
    Blockly.propc.global_vars_['cCode' + Blockly.propc.cCode] = usr;
  } else {
    code = usr;
  }
  Blockly.propc.cCode++;
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.string_var_length.init,
 *  saveConnections: Blockly.Blocks.string_var_length.saveConnections,
 *  updateShape_: Blockly.Blocks.string_var_length.updateShape_,
 *  compose: Blockly.Blocks.string_var_length.compose,
 *  mutationToDom: (function(): HTMLElement),
 *  decompose: (function(*): Blockly.Block),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.string_var_length.onchange,
 *  domToMutation: Blockly.Blocks.string_var_length.domToMutation,
 *  updateConstMenu: Blockly.Blocks.string_var_length.updateConstMenu
 * }}
 */
Blockly.Blocks.string_var_length = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_VAR_LENGTH_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.setInputsInline(false);
    this.appendDummyInput()
        .appendField('String variable set size of');
    this.optionList_ = ['var'];
    this.userDefinedConstantsList_ = ['MYVALUE'];
    this.setMYVALUEconstantValue = false;
    this.updateConstMenu();
    this.updateShape_();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(
        [
          'string_var_length_var',
          'string_var_length_con',
        ]));
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('options', JSON.stringify(this.optionList_));
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    let value = JSON.parse(container.getAttribute('options'));
    if (!value || value === []) {
      value = [];
      for (let i = 0;
        i < parseInt(container.getAttribute('vars') || '1'); i++) {
        value.push('var');
      }
    }
    this.optionList_ = value;
    this.updateConstMenu();
    this.updateShape_();
  },
  decompose: function(workspace) {
    // Populate the mutator's dialog with this block's components.
    const containerBlock = workspace.newBlock('string_var_length_container');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.optionList_.length; i++) {
      const optionBlock = workspace.newBlock(
          'string_var_length_' + this.optionList_[i]);
      optionBlock.initSvg();
      connection.connect(optionBlock.previousConnection);
      connection = optionBlock.nextConnection;
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Reconfigure this block based on the mutator dialog's components.
    let optionBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    this.optionList_.length = 0;
    const fieldData = [];
    while (optionBlock) {
      const obt = optionBlock.type.split('_');
      const obl = obt.length - 1;
      this.optionList_.push(obt[obl]);
      // collect the values of the fields that have been stored in the
      // option blocks in the mutator
      fieldData.push([optionBlock.varName_, optionBlock.varLen_]);
      optionBlock = optionBlock.nextConnection &&
                    optionBlock.nextConnection.targetBlock();
    }
    this.updateConstMenu();
    this.updateShape_();

    // Restore field values
    for (let i = 0; i < fieldData.length; i++) {
      if (fieldData[i][0]) {
        this.setFieldValue(fieldData[i][0], 'VAR_NAME' + i);
      }
      if (fieldData[i][1]) {
        this.setFieldValue(fieldData[i][1], 'VAR_LEN' + i);
      }
    }
  },
  saveConnections: function(containerBlock) {
    let optionBlock = containerBlock.getInputTargetBlock('STACK');
    let i = 0;
    while (optionBlock) {
      optionBlock.varName_ = this.getFieldValue('VAR_NAME' + i);
      optionBlock.varLen_ = this.getFieldValue('VAR_LEN' + i);
      i++;
      optionBlock = optionBlock.nextConnection &&
                    optionBlock.nextConnection.targetBlock();
    }
  },
  updateConstMenu: function(oldValue, newValue) {
    this.userDefinedConstantsList_ = [];
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let i = 0; i < allBlocks.length; i++) {
      if (allBlocks[i].type === 'constant_define') {
        let constantName = allBlocks[i].getFieldValue('CONSTANT_NAME');
        if (constantName === oldValue && newValue) {
          constantName = newValue;
        }
        if (constantName) {
          this.userDefinedConstantsList_.push(constantName);
        }
      }
    }
    this.userDefinedConstantsList_.push('MYVALUE');
    this.userDefinedConstantsList_ =
        this.userDefinedConstantsList_.sortedUnique();

    for (let i = 0; i < this.optionList_.length; i++) {
      const currentValue = this.getFieldValue('VAR_LEN' + i);
      const tempVariable = this.getFieldValue('VAR_NAME' + i);
      if (currentValue &&
          currentValue === oldValue &&
          newValue && this.getInput('VAR' + i)) {
        this.removeInput('VAR' + i);
        this.appendDummyInput('VAR' + i)
            .appendField('variable')
            .appendField(new Blockly.FieldVariable(
                Blockly.LANG_VARIABLES_GET_ITEM), 'VAR_NAME' + i)
            .appendField('to')
            .appendField(new Blockly.FieldDropdown(
                this.userDefinedConstantsList_.map(function(value) {
                  // returns an array of arrays built from the original array.
                  return [value, value];
                })), 'VAR_LEN' + i)
            .appendField('characters');
        this.setFieldValue(newValue || 'MYVALUE', 'VAR_LEN' + i);
        if (tempVariable) {
          this.setFieldValue(tempVariable, 'VAR_NAME' + i);
        }
        if (this.getInput('VAR' + (i + 1))) {
          this.moveInputBefore('VAR' + i, 'VAR' + (i + 1));
        }
      }
    }
  },
  updateShape_: function() {
    // Delete everything.
    let i = 0;
    while (this.getInput('VAR' + i)) {
      this.removeInput('VAR' + i);
      i++;
    }
    // Rebuild block.
    for (i = 0; i < this.optionList_.length; i++) {
      const type = this.optionList_[i];
      this.appendDummyInput('VAR' + i)
          .appendField('variable')
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_GET_ITEM), 'VAR_NAME' + i)
          .appendField('to');
      if (type === 'con') {
        this.getInput('VAR' + i)
            .appendField(new Blockly.FieldDropdown(
                this.userDefinedConstantsList_.map(function(value) {
                  // returns an array of arrays built from the original array.
                  return [value, value];
                })), 'VAR_LEN' + i)
            .appendField('characters');
      } else {
        this.getInput('VAR' + i)
            .appendField(new Blockly.FieldNumber(
                '64', null, null, 1), 'VAR_LEN' + i)
            .appendField('characters');
      }
    }
  },
  onchange: function() {
    this.setMYVALUEconstantValue = '';

    const mainWorkspace = Blockly.getMainWorkspace();
    let warnTxt = '';
    if (mainWorkspace.getBlocksByType('string_var_length').length > 1) {
      warnTxt += 'WARNING! Only use one of these blocks!';
    }

    let myDefineBlockWarning = '\n\nWARNING! MYVALUE is not defined!';
    mainWorkspace.getBlocksByType(
        'constant_define', false).forEach(function(theBlock) {
      if (theBlock.getFieldValue('CONSTANT_NAME') === 'MYVALUE') {
        myDefineBlockWarning = '';
      }
    });
    warnTxt += myDefineBlockWarning;

    if (myDefineBlockWarning !== '') {
      this.setMYVALUEconstantValue = true;
    }

    this.setWarningText(warnTxt === '' ? null : warnTxt.trim());
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.string_var_length_container.init}}
 */
Blockly.Blocks.string_var_length_container = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('String variable lengths');
    this.setInputsInline(false);
    this.appendStatementInput('STACK');
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.string_var_length_var.init}}
 */
Blockly.Blocks.string_var_length_var = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('number');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.string_var_length_con.init}}
 */
Blockly.Blocks.string_var_length_con = {
  init: function() {
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('named constant');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.string_var_length = function() {
  if (!this.disabled && this.setMYVALUEconstantValue) {
    Blockly.propc.definitions_['USER_MYVALUE'] = '#define MY_MYVALUE\t64';
  }

  let i = 0;
  Blockly.propc.string_var_lengths = [];
  while (this.getInput('VAR' + i.toString(10))) {
    const varLenValue = this.getFieldValue('VAR_LEN' + i.toString(10));
    let varPref = '';
    if (this.optionList_[i] === 'con') {
      varPref = 'MY_';
    }
    Blockly.propc.string_var_lengths.push([
      Blockly.propc.variableDB_.getName(
          this.getFieldValue('VAR_NAME' + i.toString(10)),
          Blockly.VARIABLE_CATEGORY_NAME),
      varPref + varLenValue,
    ]);
    i++;
  }
  return '';
};

/**
 *
 * @type {{init: Blockly.Blocks.string_length.init, helpUrl: string}}
 */
Blockly.Blocks.string_length = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_LENGTH_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField('length of string');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.string_length = function() {
  const text = Blockly.propc.valueToCode(
      this, 'VALUE', Blockly.propc.ORDER_NONE);
  return ['((int) strlen(' + text + '))', Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.high_low_value.init, helpUrl: string}}
 */
Blockly.Blocks.high_low_value = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_HIGH_LOW_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['high', '1'],
          ['low', '0'],
        ]),
        'VALUE');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.high_low_value = function() {
  const code = this.getFieldValue('VALUE');
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.comment.init,
 *  updateShape_: Blockly.Blocks.comment.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.comment.domToMutation
 * }}
 */
Blockly.Blocks.comment = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COMMENT_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput('MAIN')
        .appendField('add', 'TITLE')
        .appendField(new Blockly.FieldDropdown([
          ['comment', 'COMMENT'],
          ['blank separator', 'SPACER'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(action);
        }), 'ACTION')
        .appendField(new Blockly.FieldTextInput(''), 'COMMENT_TEXT');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('ACTION');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(container) {
    const action = container.getAttribute('action');
    this.updateShape_(action);
  },
  updateShape_: function(action) {
    this.commentText = this.getFieldValue('COMMENT_TEXT');
    if (this.getInput('MAIN')) {
      this.removeInput('MAIN');
    }
    if (action === 'COMMENT') {
      this.setColour(colorPalette.getColor('programming'));
      this.appendDummyInput('MAIN')
          .appendField('add', 'TITLE')
          .appendField(new Blockly.FieldDropdown([
            ['comment', 'COMMENT'],
            ['blank separator', 'SPACER'],
          ], function(action) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().updateShape_(action);
          }), 'ACTION')
          .appendField(new Blockly.FieldTextInput(
              this.commentText || ''), 'COMMENT_TEXT');
    } else if (action === 'SPACER') {
      this.setColour('#FFFFFF');
      this.appendDummyInput('MAIN')
          .appendField('   ', 'TITLE')
          .appendField(new Blockly.FieldDropdown([
            ['       \u25BD       ', 'SPACER'],
            ['comment', 'COMMENT'],
          ], function(action) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().updateShape_(action);
          }), 'ACTION');
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.comment = function() {
  const text = this.getFieldValue('COMMENT_TEXT');
  let code = '';
  if (text) {
    code = '// ' + text.replace(/,+\s*$/g, '') + '\n';
  }
  return code;
};

/**
 * Color Picker block
 * @type {{init: Blockly.Blocks.color_picker.init, helpUrl: string}}
 */
Blockly.Blocks.color_picker = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLOR_PICKER_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('color')
        .appendField(new Blockly.FieldColour('#FFFFFF')
            .setColours([
              '#FFFFFF', '#DFDFDF', '#BFBFBF', '#9F9F9F',
              '#7F7F7F', '#5F5F5F', '#3F3F3F', '#1F1F1F',
              '#000000', '#FFCCCC', '#FF9999', '#FF6666',
              '#FF3333', '#FF0000', '#CC0000', '#990000',
              '#660000', '#330000', '#FFE5CC', '#FFCB99',
              '#FFB166', '#FF9733', '#FF7D00', '#CC6400',
              '#994B00', '#663200', '#331900', '#FFFFCC',
              '#FFFF99', '#FFFF66', '#FFFF33', '#FFFF00',
              '#CCCC00', '#999900', '#666600', '#333300',
              '#E5FFCC', '#CBFF99', '#B1FF66', '#97FF33',
              '#7DFF00', '#64CC00', '#4B9900', '#326600',
              '#193300', '#CCFFCC', '#99FF99', '#66FF66',
              '#33FF33', '#00FF00', '#00CC00', '#009900',
              '#006600', '#003300', '#CCFFE5', '#99FFCB',
              '#66FFB1', '#33FF97', '#00FF7D', '#00CC64',
              '#00994B', '#006632', '#003319', '#CCFFFF',
              '#99FFFF', '#66FFFF', '#33FFFF', '#00FFFF',
              '#00CCCC', '#009999', '#006666', '#003333',
              '#CCE5FF', '#99CBFF', '#66B1FF', '#3397FF',
              '#007DFF', '#0064CC', '#004B99', '#003266',
              '#001933', '#CCCCFF', '#9999FF', '#6666FF',
              '#3333FF', '#0000FF', '#0000CC', '#000099',
              '#000066', '#000033', '#E5CCFF', '#CB99FF',
              '#B166FF', '#9733FF', '#7D00FF', '#6400CC',
              '#4B0099', '#320066', '#190033', '#FFCCFF',
              '#FF99FF', '#FF66FF', '#FF33FF', '#FF00FF',
              '#CC00CC', '#990099', '#660066', '#330033',
              '#FFCCE5', '#FF99CB', '#FF66B1', '#FF3397',
              '#FF007D', '#CC0064', '#99004B', '#660032',
              '#330019',
            ]).setColumns(9), 'COLOR');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.color_picker = function() {
  const tempColor = this.getFieldValue('COLOR');
  const color = '0x' + tempColor.substr(1);

  return [color, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.color_value_from.init, helpUrl: string}}
 */
Blockly.Blocks.color_value_from = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLOR_VALUE_FROM_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('color value from:');
    this.appendValueInput('RED_VALUE')
        .appendRange('R,0,255,0')
        .appendField('red')
        .setCheck('Number');
    this.appendValueInput('GREEN_VALUE')
        .appendRange('R,0,255,0')
        .appendField('green')
        .setCheck('Number');
    this.appendValueInput('BLUE_VALUE')
        .appendRange('R,0,255,0')
        .appendField('blue')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.color_value_from = function() {
  Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';

  const red = Blockly.propc.valueToCode(
      this, 'RED_VALUE', Blockly.propc.ORDER_NONE) || '0';
  const green = Blockly.propc.valueToCode(
      this, 'GREEN_VALUE', Blockly.propc.ORDER_NONE) || '0';
  const blue = Blockly.propc.valueToCode(
      this, 'BLUE_VALUE', Blockly.propc.ORDER_NONE) || '0';
  const output = 'getColorRRGGBB(' + red + ', ' + green + ', ' + blue + ')';

  return [output, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.get_channel_from.init, helpUrl: string}}
 */
Blockly.Blocks.get_channel_from = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GET_CHANNEL_FROM_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('get')
        .appendField(new Blockly.FieldDropdown([
          ['Red', 'R'],
          ['Green', 'G'],
          ['Blue', 'B'],
        ]), 'CHANNEL');
    this.appendValueInput('COLOR')
        .appendField('value from')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 * Generate C code for the get_channel_from block definition
 * @return {[string, number]}
 */
Blockly.propc.get_channel_from = function() {
  const channel = this.getFieldValue('CHANNEL');
  const color = Blockly.propc.valueToCode(
      this, 'COLOR', Blockly.propc.ORDER_NONE);

  // Set include file required for the library call below
  Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';

  return [
    'get8bitColor(' + color + ', "' + channel + '")',
    Blockly.propc.ORDER_NONE,
  ];
};

/**
 *
 * @type {{init: Blockly.Blocks.compare_colors.init, helpUrl: string}}
 */
Blockly.Blocks.compare_colors = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COMPARE_COLORS_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('compare');
    this.appendValueInput('COLOR1')
        .appendField('color 1:')
        .setCheck('Number');
    this.appendValueInput('COLOR2')
        .appendField('color 2:')
        .setCheck('Number');
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.compare_colors = function() {
  const color1 = Blockly.propc.valueToCode(
      this, 'COLOR1', Blockly.propc.ORDER_NONE) || '0';
  const color2 = Blockly.propc.valueToCode(
      this, 'COLOR2', Blockly.propc.ORDER_NONE) || '0';
  Blockly.propc.definitions_['colormath'] = '#include "colormath.h"';
  const code = 'compareRRGGBB(' + color1 + ', ' + color2 + ')';

  return [code, Blockly.propc.ORDER_NONE];
};

/**
 * Logical Comparison
 * @type {{
 *  init: Blockly.Blocks.logic_compare.init,
 *  category: string
 *  }}
 */
Blockly.Blocks.logic_compare = {
  // Comparison operator.
  category: Blockly.LANG_CATEGORY_LOGIC,
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_LOGIC_COMPARE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(
            [
              // TODO: Convert '\u2260' to a named constant
              ['=', '=='],
              ['\u2260', '!='],
              ['<', '<'],
              ['\u2264', '<='],
              ['>', '>'],
              ['\u2265', '>='],
            ]), 'OP');
    this.setInputsInline(true);
  },
};

/**
 *
 * @return {[string, *]}
 */
Blockly.propc.logic_compare = function() {
  // Comparison operator.
  const operator = this.getFieldValue('OP');
  const order = (operator === '==' || operator === '!=') ?
            Blockly.propc.ORDER_EQUALITY : Blockly.propc.ORDER_RELATIONAL;
  const argument0 = Blockly.propc.valueToCode(this, 'A', order) || '0';
  const argument1 = Blockly.propc.valueToCode(this, 'B', order) || '0';
  const code = argument0 + ' ' + operator + ' ' + argument1;

  return [code, order];
};

/**
 * Logic Operations
 * @type {{
 *  init: Blockly.Blocks.logic_operation.init,
 *  category: string
 *  }}
 */
Blockly.Blocks.logic_operation = {
  // Logical operations: 'and', 'or'.
  category: Blockly.LANG_CATEGORY_LOGIC,
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_LOGIC_OPERATION_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.setOutput(true, 'Number');
    this.appendValueInput('A')
        .setCheck('Number');
    this.appendValueInput('B')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['and', ' && '],
          ['or', ' || '],
          ['and not', ' && !'],
          ['or not', ' || !'],
        ]),
        'OP');
    this.setInputsInline(true);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.logic_operation = function() {
  // Operations 'and', 'or'.
  const operator = this.getFieldValue('OP');
  let order = Blockly.propc.ORDER_LOGICAL_AND;
  if (operator === ' || ' || operator === ' || !') {
    order = Blockly.propc.ORDER_LOGICAL_OR;
  }
  const argument0 = Blockly.propc.valueToCode(this, 'A', order) || '0';
  const argument1 = Blockly.propc.valueToCode(this, 'B', order) || '0';
  const code = argument0 + ' ' + operator + argument1;

  return [code, order];
};

/**
 * Parenthesis
 * @type {{init: Blockly.Blocks.parens.init}}
 */
Blockly.Blocks.parens = {
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_PARENS_TOOLTIP);
    this.appendValueInput('BOOL')
        .appendField('(', 'OP')
        .setCheck('Number');
    this.appendDummyInput('')
        .appendField(')');
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('math'));
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.parens = function() {
  const argument0 = Blockly.propc.valueToCode(
      this,
      'BOOL',
      Blockly.propc.ORDER_ATOMIC) || '0';
  const code = '(' + argument0 + ')';

  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 * Logical Negation
 * @type {{
 *  init: Blockly.Blocks.logic_negate.init
 *  }}
 */
Blockly.Blocks.logic_negate = {
  // Negation.
  // category: Blockly.LANG_CATEGORY_LOGIC,
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_NUMBERS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_LOGIC_NEGATE_TOOLTIP);
    this.appendValueInput('BOOL')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['not', '!'],
          ['negate', '-'],
          ['abs', 'abs('],
        ]), 'OP');
    this.setColour(colorPalette.getColor('math'));
    this.setOutput(true, 'Number');
    this.setInputsInline(false);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.logic_negate = function() {
  // Negation.
  let order = Blockly.propc.ORDER_UNARY_PREFIX;
  const operator = this.getFieldValue('OP');
  const argument0 = Blockly.propc.valueToCode(this, 'BOOL', order) || '0';
  let code = operator + argument0;
  if (operator === 'abs(') {
    code += ')';
    order = Blockly.propc.ORDER_NONE;
  }
  return [code, order];
};

/**
 *
 * @type {{init: Blockly.Blocks.logic_boolean.init, helpUrl: string}}
 */
Blockly.Blocks.logic_boolean = {
  // Boolean data type: true and false.
  // category: Blockly.LANG_CATEGORY_LOGIC,
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LOGIC_BOOLEAN_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.setOutput(true, 'Number');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['true', 'TRUE'],
          ['false', 'FALSE'],
        ]), 'BOOL');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.logic_boolean = function() {
  // Boolean values true and false.
  const code = (this.getFieldValue('BOOL') === 'TRUE') ? '1' : '0';

  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.cog_new.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.cog_new.onchange
 * }}
 */
Blockly.Blocks.cog_new = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COG_NEW_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('new processor');
    this.appendStatementInput('METHOD')
        .setCheck('Function')
        .appendField('function');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: function(event) {
    if (event &&
        (event.type === Blockly.Events.CHANGE ||
         event.type === Blockly.Events.MOVE)) {
      let repeatWarningText = null;
      const myRootBlock = this.getRootBlock();
      if (myRootBlock && myRootBlock.type.indexOf('repeat') > -1 ) {
        repeatWarningText = 'Warning: This block can only start up to 7' +
            ' additional cores - using this block in a repeat loop may cause' +
            ' unexpected errors!';
      }
      this.setWarningText(repeatWarningText);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.cog_new = function() {
  const method = Blockly.propc.statementToCode(this, 'METHOD');
  const methodName = method
      .replace('  ', '')
      .replace('\n', '')
      .replace('()', '')
      .replace(';', '');
  let code = '';

  if (method.length > 2) {
    Blockly.propc.cog_methods_[methodName] = method;

    code = 'cog_run(' + methodName + ', 128);\n';
  }
  return code;
};

/**
 *
 * @type {{init: Blockly.Blocks.combine_strings.init, helpUrl: string}}
 */
Blockly.Blocks.combine_strings = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COMBINE_STRINGS_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('STRA')
        .setCheck('String')
        .appendField('combine string');
    this.appendValueInput('STRB')
        .setCheck('String')
        .appendField('with string');
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
Blockly.propc.combine_strings = function() {
  const strA = Blockly.propc.valueToCode(
      this,
      'STRA',
      Blockly.propc.ORDER_ATOMIC) || '';
  const strB = Blockly.propc.valueToCode(
      this,
      'STRB',
      Blockly.propc.ORDER_ATOMIC) || '';
  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);
  let code = '';

  Blockly.propc.vartype_[data] = 'char *';

  if (strA !== '' && strB !== '') {
    code += 'sprint(' + data + ', "%s%s", ' + strA + ', ' + strB + ');\n';
  } else if (strA !== '') {
    code += 'strcpy(' + data + ', ' + strB + ');\n';
  } else if (strB !== '') {
    code += 'strcpy(' + data + ', ' + strA + ');\n';
  } else {
    code += '// Both of the strings to combine are blank!\n';
  }
  return code;
};

/**
 *
 * @type {{init: Blockly.Blocks.find_substring.init, helpUrl: string}}
 * @deprecated Replaced by the same block located in the Operators/Number menu
 */
Blockly.Blocks.find_substring = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_FIND_SUBSTRING_TOOLTIP);
    if (this.type === 'find_substring') {
      this.setColour('#FF8800');
      this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
          ' with a new block from the Operators > Numbers menu.\nOld blocks' +
          ' were (1) referenced, new blocks are (0) referenced.');
    } else {
      this.setColour(colorPalette.getColor('math'));
    }
    this.appendValueInput('SUBSTR')
        .setCheck('String')
        .appendField('find location of text');
    this.appendValueInput('STR')
        .setCheck('String')
        .appendField('in string');
    if (this.type !== 'find_substring') {
      this.appendValueInput('LOC')
          .appendField('starting at position');
    }
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
};

// Map the deprecated block to the new block
Blockly.Blocks.find_substring_zero = Blockly.Blocks.find_substring;

/**
 *
 * @return {[string, number]}
 * @deprecated Use Blockly.propc.find_substring_zero instead.
 */
Blockly.propc.find_substring = function() {
  const subs = Blockly.propc.valueToCode(
      this, 'SUBSTR', Blockly.propc.ORDER_ATOMIC) || '';
  const strs = Blockly.propc.valueToCode(
      this, 'STR', Blockly.propc.ORDER_ATOMIC) || '';
  const stlc = Blockly.propc.valueToCode(
      this, 'LOC', Blockly.propc.ORDER_ATOMIC) || '0';
  let code = '';

  if (this.type === 'find_substring') {
    if (!this.disabled) {
      Blockly.propc.methods_['find_sub'] =
          'int find_sub(char *__strS, char *__subS) { char* __pos =' +
          ' strstr(__strS, __subS); return (__pos - __strS + 1); }\n';
      Blockly.propc.method_declarations_['find_sub'] =
          'int find_sub(char *, char *);\n';
    }
    code = '// WARNING! THIS BLOCK IS DEPRECATED! \n\n';

    if (subs !== '' && strs !== '') {
      code += 'find_sub(' + strs + ', ' + subs + ')';
    } else {
      code += '0';
    }
  } else {
    if (!this.disabled) {
      Blockly.propc.methods_['find_sub_zero'] =
          'int str_loc(char *__strS, char *__subS, int __sLoc) { ';
      Blockly.propc.methods_['find_sub_zero'] +=
          '__sLoc = constrainInt(__sLoc, 0, (int) strlen(__strS) - 1);\n';
      Blockly.propc.methods_['find_sub_zero'] +=
          'char* __pos = strstr(__strS + __sLoc, __subS); return' +
          ' (__pos) ? (__pos - __strS) : -1; }\n';
      Blockly.propc.method_declarations_['find_sub_zero'] =
          'int str_loc(char *, char *, int);\n';
    }
    if (subs !== '' && strs !== '') {
      code += 'str_loc(' + strs + ', ' + subs + ', ' + stlc + ')';
    } else {
      code += '0';
    }
  }

  return [code, Blockly.propc.ORDER_NONE];
};


// Map find_substring block to find_substring_zero block
Blockly.propc.find_substring_zero = Blockly.propc.find_substring;

/**
 *
 * @type {{init: Blockly.Blocks.get_char_at_position.init, helpUrl: string}}
 * @deprecated
 */
Blockly.Blocks.get_char_at_position = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GET_CHAR_AT_POSITION_TOOLTIP);
    if (this.type === 'get_char_at_position') {
      this.setColour('#FF8800');
      this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
          ' with a new block from the Operators > Numbers menu.\nOld blocks' +
          ' were (1) referenced, new blocks are (0) referenced.');
    } else {
      this.setColour(colorPalette.getColor('math'));
    }
    this.appendValueInput('POSITION')
        .setCheck('Number')
        .appendField('get character at position');
    this.appendDummyInput()
        .appendField('of')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
};

// Map deprecated block to its replacement
Blockly.Blocks.get_char_at_position_zero = Blockly.Blocks.get_char_at_position;

/**
 *
 * @return {[string, number]}
 * @deprecated
 */
Blockly.propc.get_char_at_position = function() {
  const pos = Blockly.propc.valueToCode(
      this, 'POSITION', Blockly.propc.ORDER_ATOMIC) || '1';
  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);

  let code;

  if (this.type === 'get_char_at_position') {
    code = data + '[(' + pos + '>(int)strlen(' + data +
        ')?(int)strlen(' + data + '):' + pos + ')-1]';
  } else {
    code = data + '[' + pos + ']';
  }

  return [code, Blockly.propc.ORDER_NONE];
};

// Map deprecated block to the its replacement
Blockly.propc.get_char_at_position_zero = Blockly.propc.get_char_at_position;

/**
 *
 * @type {{init: Blockly.Blocks.set_char_at_position.init, helpUrl: string}}
 * @deprecated
 */
Blockly.Blocks.set_char_at_position = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SET_CHAR_AT_POSITION_TOOLTIP);
    if (this.type === 'set_char_at_position') {
      this.setColour('#FF8800');
      this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
          ' with a new block from the Operators > Numbers menu.\nOld blocks' +
          ' were (1) referenced, new blocks are (0) referenced.');
    } else {
      this.setColour(colorPalette.getColor('math'));
    }
    this.appendValueInput('POSITION')
        .setCheck('Number')
        .appendField('set character at position');
    this.appendDummyInput()
        .appendField('of string')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VALUE');
    this.appendValueInput('CHAR')
        .setCheck('Number')
        .appendField('to');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

// Map deprecated block to its replacement
Blockly.Blocks.set_char_at_position_zero = Blockly.Blocks.set_char_at_position;

/**
 *
 * @return {string}
 * @deprecated
 */
Blockly.propc.set_char_at_position = function() {
  const pos = Blockly.propc.valueToCode(
      this, 'POSITION', Blockly.propc.ORDER_ATOMIC) || '1';
  let chr = Blockly.propc.valueToCode(
      this, 'CHAR', Blockly.propc.ORDER_ATOMIC) || '32';

  if (!(chr.length === 3 && chr[0] === '\'' && chr[2] === '\'')) {
    if (chr !== chr.replace(/[^0-9]+/g, '')) {
      chr = '(' + chr + ' & 0xFF)';
    } else if (!(0 < parseInt(chr) && parseInt(chr) < 256)) {
      chr = '(' + chr + ' & 0xFF)';
    }
  }

  const data = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VALUE'),
      Blockly.VARIABLE_CATEGORY_NAME);

  Blockly.propc.vartype_[data] = 'char *';

  if (this.type === 'set_char_at_position') {
    return data + '[(' + pos + '>(int)strlen(' + data + ')?(int)strlen(' +
        data + '):' + pos + ')-1] = ' + chr + '\n;';
  } else {
    return data + '[' + pos + '] = ' + chr + '\n;';
  }
};

// Map deprecated code to its replacement
Blockly.propc.set_char_at_position_zero = Blockly.propc.set_char_at_position;

/**
 *
 * @type {{init: Blockly.Blocks.get_substring.init, helpUrl: string}}
 * @deprecated
 */
Blockly.Blocks.get_substring = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GET_SUBSTRING_TOOLTIP);
    if (this.type === 'get_substring') {
      this.setColour('#FF8800');
      this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
          ' with a new block from the Operators > Numbers menu.\nOld blocks' +
          ' were (1) referenced, new blocks are (0) referenced.');
    } else {
      this.setColour(colorPalette.getColor('math'));
    }
    this.appendDummyInput()
        .appendField('get part of string')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'FROM_STR');
    this.appendValueInput('START')
        .setCheck('Number')
        .appendField('from position');
    this.appendValueInput('END')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['thru', ' + 1'],
          ['to', ''],
        ]), 'PART')
        .appendField('position');
    this.appendDummyInput()
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'TO_STR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

// Map deprecated code to its replacement
Blockly.Blocks.get_substring_zero = Blockly.Blocks.get_substring;

/**
 *
 * @return {string}
 * @deprecated
 */
Blockly.propc.get_substring = function() {
  let sst = Blockly.propc.valueToCode(
      this, 'START', Blockly.propc.ORDER_ATOMIC) || '1';
  let snd = Blockly.propc.valueToCode(
      this, 'END', Blockly.propc.ORDER_ATOMIC) || '2';
  const pt = this.getFieldValue('PART');
  const frStr = Blockly.propc.variableDB_.getName(
      this.getFieldValue('FROM_STR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  const toStr = Blockly.propc.variableDB_.getName(
      this.getFieldValue('TO_STR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  Blockly.propc.vartype_[toStr] = 'char *';

  if (parseInt(sst) > parseInt(snd)) {
    const tmp = sst;
    sst = snd;
    snd = tmp;
  }

  let code = '';

  if (this.type === 'get_substring') {
    Blockly.propc.definitions_['str_Buffer'] = 'char *__scBfr;';

    code += '__stIdx = 0;\nfor(__ssIdx = (' + sst + '-1); __ssIdx <= (' + snd;
    code += ' <= (int)strlen(' + frStr;
    code += ')?' + snd + ':(int)strlen(' + frStr;
    code += '))-1; __ssIdx++) {\n__scBfr[__stIdx] = ' + frStr;
    code += '[__ssIdx]; __stIdx++; }\n';
    code += '__scBfr[__stIdx] = 0;\n';
    code += 'strcpy(' + toStr + ', __scBfr);\n';
  } else {
    code += 'substr (' + toStr + ', ' + frStr + ', ' + sst + ', ' +
        snd + pt + ');\n';

    if (!this.disabled) {
      let functionCode = 'void substr(char *__outStr, char *__inStr,' +
          ' int __startPos, int __toPos) {__startPos';
      functionCode += ' = (__startPos < 0 ? 0 : (__startPos > strlen(__inStr)' +
          ' ? strlen(__inStr) : __startPos));\n';
      functionCode += '__toPos = (__toPos < 0 ? 0 : (__toPos >' +
          ' strlen(__inStr) ? strlen(__inStr) : __toPos';
      functionCode += '));\nint __idx = ((__toPos < __startPos) ? __startPos' +
          ' : __toPos) - __startPos;\n';
      functionCode += 'memcpy(__outStr, __inStr + __startPos, __idx);\n' +
          '__outStr[__idx] = 0;}';

      Blockly.propc.methods_['substr'] = functionCode;
      Blockly.propc.method_declarations_['substr'] =
          'void substr (char *, char *, int, int);\n';
    }
  }

  return code;
};

// Map deprecated code to its replacement
Blockly.propc.get_substring_zero = Blockly.propc.get_substring;

/**
 *
 * @type {{init: Blockly.Blocks.string_compare.init, helpUrl: string}}
 */
Blockly.Blocks.string_compare = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_COMPARE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('STRA')
        .setCheck('String')
        .appendField('string');
    this.appendValueInput('STRB')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown([
          ['is the same as', '=='],
          ['is not the same as', '!='],
          ['is alphabetically before', '<'],
          ['is alphabetically after', '>'],
        ]), 'COMP');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]|[string, number]}
 */
Blockly.propc.string_compare = function() {
  const strA = Blockly.propc.valueToCode(
      this, 'STRA', Blockly.propc.ORDER_ATOMIC) || '';
  const strB = Blockly.propc.valueToCode(
      this, 'STRB', Blockly.propc.ORDER_ATOMIC) || '';
  const comp = this.getFieldValue('COMP');

  if (strA !== '' && strB !== '') {
    return [
      '(strcmp(' + strA + ', ' + strB + ') ' + comp + ' 0)',
      Blockly.propc.ORDER_NONE,
    ];
  } else {
    return [
      '(1' + comp + '0)',
      Blockly.propc.ORDER_NONE,
    ];
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.string_to_number.init, helpUrl: string}}
 * @deprecated replaced with scan string block
 */
Blockly.Blocks.string_to_number = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_TO_NUMBER_TOOLTIP);
    this.setColour('#FF8800');
    this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
        ' with a scan string block from the Operators > Numbers menu.');
    this.appendValueInput('STRING')
        .setCheck('String')
        .appendField('string');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['in decimal', '%d'],
          ['in hexadecimal', '%x'],
          ['in binary', '%b'],
        ]), 'TYPE')
        .appendField('to integer store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 * @deprecated
 */
Blockly.propc.string_to_number = function() {
  const str = Blockly.propc.valueToCode(
      this, 'STRING', Blockly.propc.ORDER_ATOMIC) || '0';
  const store = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  return 'sscan(' + str + ', "' + this.getFieldValue('TYPE') +
      '", &' + store + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.number_to_string.init, helpUrl: string}}
 * @deprecated
 */
Blockly.Blocks.number_to_string = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_NUMBER_TO_STRING_TOOLTIP);
    this.setColour('#FF8800');
    this.setWarningText('WARNING: This block has been deprecated.\nReplace' +
        ' with a create string from block from the Operators > Numbers menu.');
    this.appendValueInput('NUMBER')
        .setCheck('Number')
        .appendField('integer');
    this.appendDummyInput()
        .appendField('to string in')
        .appendField(new Blockly.FieldDropdown([
          ['decimal', '%d'],
          ['hexadecimal', '%x'],
          ['binary', '%b'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 * @deprecated
 */
Blockly.propc.number_to_string = function() {
  const str = Blockly.propc.valueToCode(
      this, 'NUMBER', Blockly.propc.ORDER_ATOMIC) || '0';
  const store = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  Blockly.propc.vartype_[store] = 'char *';

  return 'sprint(' + store + ', "' + this.getFieldValue('TYPE') +
      '", ' + str + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.string_split.init,
 *  updateShape_: Blockly.Blocks.string_split.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.string_split.domToMutation
 * }}
 */
Blockly.Blocks.string_split = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_SPLIT_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendDummyInput()
        .appendField('split string');
    this.appendValueInput('FROM_STR')
        .setCheck('String');
    this.appendValueInput('CHAR')
        .setCheck('Number')
        .appendField('on');
    this.appendDummyInput()
        .appendField('store the')
        .appendField(new Blockly.FieldDropdown([
          ['first part in', 'STR'],
          ['next part in', 'NULL'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(action);
        }), 'PART')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'TO_STR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  updateShape_: function(action) {
    if (action === 'NULL' && this.getInput('FROM_STR')) {
      this.removeInput('FROM_STR');
    } else if (action !== 'NULL' && !this.getInput('FROM_STR')) {
      this.appendValueInput('FROM_STR')
          .setCheck('String');
      this.moveInputBefore('FROM_STR', 'CHAR');
    }
  },
  mutationToDom: function() {
    // Create XML to represent menu options.
    const container = document.createElement('mutation');
    container.setAttribute('from_str', this.getFieldValue('PART'));
    return container;
  },
  domToMutation: function(container) {
    // Parse XML to restore the menu options.
    const action = container.getAttribute('from_str');
    this.updateShape_(action);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.string_split = function() {
  const delim = Blockly.propc.valueToCode(
      this, 'CHAR', Blockly.propc.ORDER_ATOMIC) || '32';
  let fromStr = Blockly.propc.valueToCode(
      this, 'FROM_STR', Blockly.propc.ORDER_ATOMIC) || '"Hello World!"';
  const part = this.getFieldValue('PART');
  const toStr = Blockly.propc.variableDB_.getName(
      this.getFieldValue('TO_STR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  Blockly.propc.vartype_[toStr] = 'char *';

  if (part === 'NULL') {
    fromStr = part;
  }

  if (!this.disabled) {
    let functionCode = '';
    functionCode += 'void str_split(char *__fromStr, char *__toStr,' +
        ' char __delim) {\nchar __d[2] = {__delim, 0};\n';
    functionCode += 'char *__token;\n\n__token = strtok(__fromStr,' +
        ' __d);\nstrcpy(__toStr, __token);\n}';

    Blockly.propc.methods_['str_split'] = functionCode;
    Blockly.propc.method_declarations_['str_split'] =
        'void str_split(char *, char *, char);\n';
  }

  return 'str_split(' + fromStr + ', ' + toStr + ', ' + delim + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.string_null.init, helpUrl: string}}
 */
Blockly.Blocks.string_null = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_NULL_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('STR')
        .appendField('string')
        .setCheck('String');
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['is empty', '[0] == 0'],
          ['is not empty', '[0] != 0'],
        ]), 'OP');
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {(*|number)[]}
 */
Blockly.propc.string_null = function() {
  const str = Blockly.propc.valueToCode(
      this, 'STR', Blockly.propc.ORDER_ATOMIC) || '"Hello World!"';
  const op = this.getFieldValue('OP') || '';
  return [str + op, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.string_trim.init, helpUrl: string}}
 */
Blockly.Blocks.string_trim = {
  helpUrl: Blockly.MSG_STRINGS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_STRING_TRIM_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('FROM_STR')
        .appendField('trim string');
    this.appendDummyInput()
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'TO_STR');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.string_trim = function() {
  const frStr = Blockly.propc.valueToCode(
      this, 'FROM_STR', Blockly.propc.ORDER_ATOMIC) || '" Hello World! "';
  const toStr = Blockly.propc.variableDB_.getName(
      this.getFieldValue('TO_STR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  Blockly.propc.vartype_[toStr] = 'char *';
  Blockly.propc.vartype_[frStr] = 'char *';

  if (!this.disabled) {
    let functionCode = '';
    functionCode += 'void str_trim(char *out, char *str)\n{\n' +
        'const char *end;\n\n';
    functionCode += 'while(isspace((unsigned char)*str)) str++;\n' +
        'if(*str == 0)\n{\n*out = 0;\nreturn;\n';
    functionCode += '}\nend = str + (int)strlen(str) - 1;\n' +
        'while(end > str && isspace((unsigned char)*end)) end--;\n';
    functionCode += 'end++;\n\nmemcpy(out, str, end - str);\n' +
        'out[end - str] = 0;\n}';

    // Blockly.propc.definitions_['__ssIdx'] = 'int __ssIdx, __stIdx;';
    Blockly.propc.methods_['str_trim'] = functionCode;
    Blockly.propc.method_declarations_['str_trim'] =
        'void str_trim(char *, char *);\n';
  }

  return 'str_trim(' + toStr + ', ' + frStr + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.number_binary.init, helpUrl: string}}
 */
Blockly.Blocks.number_binary = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_NUMBER_BINARY_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('0101', function(text) {
          if (text === null) {
            return null;
          }
          // 'O' is sometimes mistaken for '0' by inexperienced users.
          text = text.replace(/O/ig, '0');
          // remove anything that isn't a 0 or 1.
          text = text.replace(/[^0-1]/g, '');
          return text;
        }), 'NUMBER')
        .appendField('binary');
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.number_binary = function() {
  const code = '0b' + this.getFieldValue('NUMBER');

  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.number_hex.init, helpUrl: string}}
 */
Blockly.Blocks.number_hex = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_NUMBER_HEX_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('7F', function(text) {
          if (text === null) {
            return null;
          }
          // 'O' is sometimes mistaken for '0' by inexperienced users.
          text = text.replace(/O/ig, '0');
          // remove anything that isn't a hexadecimal number.
          text = text.replace(/[^0-9A-F]/ig, '').toUpperCase();
          return text;
        }), 'NUMBER')
        .appendField('hexadecimal');
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.number_hex = function() {
  const code = '0x' + this.getFieldValue('NUMBER');

  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.constrain_value.init, helpUrl: string}}
 */
Blockly.Blocks.constrain_value = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSTRAIN_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('NUMBER')
        .setCheck('Number')
        .appendField('constrain');
    this.appendDummyInput()
        .appendField('from')
        .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
        .appendField('(min) to')
        .appendField(new Blockly.FieldNumber('100', null, null, 1), 'MAX')
        .appendField('(max)');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.constrain_value = function() {
  const num = Blockly.propc.valueToCode(
      this, 'NUMBER', Blockly.propc.ORDER_ATOMIC) || '0';
  const min = window.parseInt(this.getFieldValue('MIN'));
  const max = window.parseInt(this.getFieldValue('MAX'));

  const code = 'constrainInt(' + num + ', ' + min + ', ' + max + ')';
  return [code, Blockly.propc.ORDER_NONE];
};

/**
 *
 * @type {{init: Blockly.Blocks.map_value.init, helpUrl: string}}
 */
Blockly.Blocks.map_value = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MAP_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('NUMBER')
        .setCheck('Number')
        .appendField('map');
    this.appendDummyInput()
        .appendField('with range')
        .appendField(new Blockly.FieldNumber('0', null, null, 1), 'IMIN')
        .appendField('(from A)')
        .appendField(new Blockly.FieldNumber('50', null, null, 1), 'IMAX')
        .appendField('(from B) to range')
        .appendField(new Blockly.FieldNumber('0', null, null, 1), 'FMIN')
        .appendField('(to A)')
        .appendField(new Blockly.FieldNumber('100', null, null, 1), 'FMAX')
        .appendField('(to B)');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.map_value = function() {
  const num = Blockly.propc.valueToCode(
      this, 'NUMBER', Blockly.propc.ORDER_ATOMIC) || '0';
  const iMin = window.parseInt(this.getFieldValue('IMIN'));
  const iMax = window.parseInt(this.getFieldValue('IMAX'));
  const fMin = window.parseInt(this.getFieldValue('FMIN'));
  const fMax = window.parseInt(this.getFieldValue('FMAX'));

  return [
    'mapInt(' + num + ',' + iMin + ',' + iMax + ',' + fMin + ',' + fMax + ')',
    Blockly.propc.ORDER_NONE,
  ];
};

/**
 *
 * @type {{init: Blockly.Blocks.math_advanced.init, helpUrl: string}}
 */
Blockly.Blocks.math_advanced = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MATH_ADVANCED_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('ARG1')
        .setCheck('Number');
    this.appendValueInput('ARG2')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['\u2715 the cosine of', 'cos'],
          ['\u2715 the sine of', 'sin'],
          ['\u2715 the tangent of', 'tan'],
          ['\u2715 the square root of', 'sqrt'],
          ['\u2715 e raised to the power of', 'exp'],
          ['\u2715 the logarithm (base 10) of', 'log10'],
          ['\u2715 the natural logarithm of', 'log'],
        ]), 'OP');
    this.appendDummyInput('')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'STORE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.math_advanced = function() {
  const store = Blockly.propc.variableDB_.getName(
      this.getFieldValue('STORE'),
      Blockly.VARIABLE_CATEGORY_NAME);
  let arg1 = Blockly.propc.valueToCode(
      this, 'ARG1', Blockly.propc.ORDER_ATOMIC) || '1';
  let arg2 = Blockly.propc.valueToCode(
      this, 'ARG2', Blockly.propc.ORDER_ATOMIC) || '1';
  arg1 = arg1.replace(/[(\-+ ](\d+)/g, '$1.0').replace(/\(int\)/g, '');
  arg2 = arg2.replace(/[(\-+ ](\d+)/g, '$1.0').replace(/\(int\)/g, '');
  const operator = this.getFieldValue('OP');
  let opTrig = '';
  if (operator === 'sin' || operator === 'cos' || operator === 'tan') {
    opTrig = ' * PI/180.0';
  }

  return store + ' = (int) (((float)' + arg1 + ') * ' + operator +
      '(((float) ' + arg2 + ')' + opTrig + '));\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.math_inv_trig.init, helpUrl: string}}
 */
Blockly.Blocks.math_inv_trig = {
  helpUrl: Blockly.MSG_NUMBERS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MATH_INV_TRIG_TOOLTIP);
    this.setColour(colorPalette.getColor('math'));
    this.appendValueInput('ARG1')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['arcsine of (', 'asin'],
          ['arccosine of (', 'acos'],
          ['arctangent of (', 'atan2']]), 'OP');
    this.appendValueInput('ARG2')
        .setCheck('Number')
        .appendField('\u00F7');
    this.appendValueInput('ARG3')
        .appendField(') \u00D7')
        .setCheck('Number');
    this.appendDummyInput()
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'STORE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.math_inv_trig = function() {
  const store = Blockly.propc.variableDB_.getName(
      this.getFieldValue('STORE'),
      Blockly.VARIABLE_CATEGORY_NAME);
  let arg1 = Blockly.propc.valueToCode(
      this, 'ARG1', Blockly.propc.ORDER_ATOMIC) || '1';
  let arg2 = Blockly.propc.valueToCode(
      this, 'ARG2', Blockly.propc.ORDER_ATOMIC) || '1';
  let arg3 = Blockly.propc.valueToCode(
      this, 'ARG3', Blockly.propc.ORDER_ATOMIC) || '1';
  arg1 = arg1
      .replace(/([0-9])(\xA0| |\)|$)/g, '$1.0$2')
      .replace(/\(int\)/g, '');
  arg2 = arg2
      .replace(/([0-9])(\xA0| |\)|$)/g, '$1.0$2')
      .replace(/\(int\)/g, '');
  arg3 = arg3
      .replace(/([0-9])(\xA0| |\)|$)/g, '$1.0$2')
      .replace(/\(int\)/g, '');
  const operator = this.getFieldValue('OP');
  let opTrig = '/';
  if (operator === 'atan2') {
    opTrig = ',';
  }

  return store + ' = (int) (180.0 * ' + operator + '(((float) ' + arg1 + ')' +
      opTrig + '((float) ' + arg2 + ')) * ' + arg3 + ' / PI);\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.constant_define.init,
 *  sendConstantVal: Blockly.Blocks.constant_define.sendConstantVal,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.constant_define.onchange
 * }}
 */
Blockly.Blocks.constant_define = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONSTANT_DEF_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput('MAIN')
        .appendField('constant')
        .appendField(new Blockly.FieldTextInput('MYVALUE', function(a) {
          a = a.toUpperCase();
          a = a.replace(/ /g, '_').replace(/[^A-Z0-9_]/g, '');
          // TODO STAT: Replace unresolved this references
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().sendConstantVal(
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().getFieldValue('CONSTANT_NAME'), a);
          return a;
        }), 'CONSTANT_NAME')
        .appendField(' = ')
        .appendField(new Blockly.FieldTextInput('0', function(a) {
          if (a.indexOf('0x') === 0) {
            a = a.replace(/[^0-9xA-Fa-f-]/g, '');
          } else {
            a = a.replace(/[^0-9b-]/g, '');
          }
          return a;
        }), 'VALUE');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.sendUpdate = true;
  },
  sendConstantVal: function(oldValue, newValue) {
    if (this.sendUpdate || (oldValue === '-1' && newValue === '-1')) {
      if (oldValue === '-1' && newValue === '-1') {
        oldValue = null;
        newValue = null;
      }
      // Find all the blocks that have my value and tell them to update it
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
      for (let x = 0; x < allBlocks.length; x++) {
        if (allBlocks[x] && allBlocks[x].updateConstMenu) {
          allBlocks[x].updateConstMenu.call(allBlocks[x], oldValue, newValue);
        }
      }
    }
    this.sendUpdate = true;
  },
  onchange: function(event) {
    const myName = this.getFieldValue('CONSTANT_NAME');
    const theBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    let fStart;

    // If I get deleted, broadcast that to other blocks.
    if (event.oldXml) {
      let oldName = '';
      const oSerializer = new XMLSerializer();
      const sXML = oSerializer.serializeToString(event.oldXml);
      fStart = sXML.indexOf('CONSTANT_NAME');
      if (fStart > -1 && sXML.indexOf('constant_define') > -1) {
        const fEnd = sXML.indexOf('</field', fStart);
        oldName = sXML.substring(fStart + 15, fEnd);
        this.sendConstantVal(oldName, null);
      }
    }

    let warnTxt = null;
    fStart = theBlocks.indexOf('constant ' + myName + '  =');
    if (theBlocks.indexOf('constant ' + myName + '  =', fStart + 1) > -1) {
      warnTxt = 'WARNING! you can only define the constant "' +
          myName + '" once!';
    }
    this.setWarningText(warnTxt);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.constant_define = function() {
  if (!this.disabled) {
    const c = this.getFieldValue('CONSTANT_NAME');
    const v = this.getFieldValue('VALUE');
    Blockly.propc.definitions_['USER_' + c] = '#define MY_' + c + ' \t' + v;
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.constant_value.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.constant_value.onchange,
 *  updateConstMenu: Blockly.Blocks.constant_value.updateConstMenu
 * }}
 */
Blockly.Blocks.constant_value = {
  helpUrl: Blockly.MSG_VALUES_HELPURL,
  init: function() {
    this.userDefinedConstantsList_ = [];
    this.setTooltip(Blockly.MSG_CONSTANT_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput('VALUE_LIST')
        .appendField(new Blockly.FieldDropdown([
          ['MYVALUE', 'MYVALUE'],
        ]), 'VALUE');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: function(oldValue, newValue) {
    this.userDefinedConstantsList_ = [];
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let x = 0; x < allBlocks.length; x++) {
      if (allBlocks[x].type === 'constant_define') {
        let variableName = allBlocks[x].getFieldValue('CONSTANT_NAME');
        if (variableName === oldValue && newValue) {
          variableName = newValue;
        }
        if (variableName) {
          this.userDefinedConstantsList_.push(variableName);
        }
      }
    }
    this.userDefinedConstantsList_.push('MYVALUE');
    this.userDefinedConstantsList_ =
        this.userDefinedConstantsList_.sortedUnique();
    const currentValue = this.getFieldValue('VALUE');

    if (this.getInput('VALUE_LIST')) {
      this.removeInput('VALUE_LIST');
    }
    this.appendDummyInput('VALUE_LIST')
        .appendField(new Blockly.FieldDropdown(
            this.userDefinedConstantsList_.map(function(value) {
              // returns an array of arrays built from the original array.
              return [value, value];
            })),
        'VALUE');
    if (currentValue && currentValue === oldValue && newValue) {
      this.setFieldValue(newValue, 'VALUE');
    } else if (currentValue) {
      this.setFieldValue(currentValue, 'VALUE');
    }
  },
  onchange: function() {
    const val = this.getFieldValue('VALUE');
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('constant ' + val) === -1) {
      this.setWarningText('WARNING: Your program must include a constant' +
          ' define block for this value!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.constant_value = function() {
  const code = this.getFieldValue('VALUE');
  return ['MY_' + code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  buildFields: Blockly.Blocks.custom_code_multiple.buildFields,
 *  init: Blockly.Blocks.custom_code_multiple.init,
 *  updateShape_: Blockly.Blocks.custom_code_multiple.updateShape_,
 *  destroyFields: Blockly.Blocks.custom_code_multiple.destroyFields,
 *  populateFields: Blockly.Blocks.custom_code_multiple.populateFields,
 *  mutationToDom: (function(): HTMLElement),
 *  setupInputs: Blockly.Blocks.custom_code_multiple.setupInputs,
 *  helpUrl: string,
 *  restoreConnectedBlocks:
 *      Blockly.Blocks.custom_code_multiple.restoreConnectedBlocks,
 *  setOutputType: Blockly.Blocks.custom_code_multiple.setOutputType,
 *  domToMutation: Blockly.Blocks.custom_code_multiple.domToMutation,
 *  getConnectedBlocks: Blockly.Blocks.custom_code_multiple.getConnectedBlocks
 * }}
 */
Blockly.Blocks.custom_code_multiple = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CUSTOM_CODE_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendDummyInput('BLOCK_LABEL')
        .appendField(new Blockly.FieldCheckbox(
            'FALSE', function(showFields) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().updateShape_(showFields, true);
            }), 'EDIT')
        .appendField('  User defined code', 'LABEL');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.fieldValueTemp_ = {
      'ARG_COUNT': '0',
      'COLOR': colorPalette.getColor('system'),
    };
    this.blockConnections_ = [];
  },
  updateShape_: function(showFields, populate) {
    this.fieldValueTemp_['EDIT'] = showFields;
    if (showFields === true || showFields === 'true' || showFields === 'TRUE') {
      this.buildFields();
      this.setupInputs();
      if (populate) {
        this.populateFields();
      }
    } else {
      this.setupInputs();
      this.destroyFields();
    }
  },
  buildFields: function() {
    if (this.getInput('SET_LABEL')) {
      return;
    }
    this.appendDummyInput('SET_LABEL')
        .appendField('label')
        .appendField(new Blockly.FieldTextInput(
            'User defined code', function(blockLabel) {
              // TODO: STAT Incorrect use of 'this'
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().fieldValueTemp_['LABEL_SET'] = blockLabel;
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setFieldValue('  ' + blockLabel, 'LABEL');
            }), 'LABEL_SET');
    this.appendDummyInput('SET_COLOR')
        .appendField('block color')
        .appendField(new Blockly.FieldColour('#992673', function(blockColor) {
          // TODO STAT: Replace incorrect use of 'this'.
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().fieldValueTemp_['COLOR'] = blockColor;
        }).setColours([
          '#26994D', '#268F99', '#266999',
          '#264399', '#392699', '#692699',
          '#8F2699', '#992673', '#99264C',
        ]).setColumns(3), 'COLOR');
    const currentCustomBlock = this;
    ([
      ['INCL', 'includes'],
      ['GLOB', 'globals'],
      ['SETS', 'setups'],
      ['MAIN', 'main'],
      ['FUNC', 'functions'],
    ]).forEach(function(value) {
      currentCustomBlock.appendDummyInput(value[0])
          .appendField(new Blockly.FieldAceEditor(
              value[1] + ' code', '', function(userinput) {
                // TODO STAT: Replace incorrect use of 'this'.
                // eslint-disable-next-line no-invalid-this
                this.getSourceBlock().fieldValueTemp_[value[1].toUpperCase()] =
                    userinput;
              }), value[1].toUpperCase());
    });
    this.appendDummyInput('OUTS')
        .appendField('main code is')
        .appendField(new Blockly.FieldDropdown([
          ['inline', 'INL'],
          ['a numeric value', 'NUM'],
          ['a string value', 'STR'],
        ], function(outType) {
          // TODO STAT: Replace incorrect use of 'this'.
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().fieldValueTemp_['TYPE'] = outType;
          // TODO STAT: Replace incorrect use of 'this'.
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setOutputType(outType);
        }), 'TYPE');
    this.moveInputBefore('OUTS', 'FUNC');
    this.appendDummyInput('ARGS')
        .appendField(new Blockly.FieldDropdown(function() {
          const inputChoicesArray = [['no inputs', '0']];
          for (let idx = 1; idx < 10; idx++) {
            inputChoicesArray.push([
              'add ' + idx.toString(10) + ' input' + (idx > 1 ? 's' : ''),
              idx.toString(10),
            ]);
          }
          return inputChoicesArray;
        }, function(value) {
          // TODO STAT: Replace incorrect use of 'this'.
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().fieldValueTemp_['ARG_COUNT'] = value;
          // TODO STAT: Replace incorrect use of 'this'.
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setupInputs();
        }), 'ARG_COUNT');
    this.setColour('#909090');
  },
  destroyFields: function() {
    const blockInputList = [
      'SET_LABEL',
      'SET_COLOR',
      'INCL',
      'GLOB',
      'SETS',
      'MAIN',
      'FUNC',
      'OUTS',
      'ARGS',
    ];
    const currentBlock = this;
    blockInputList.forEach(function(value) {
      if (currentBlock.getInput(value)) {
        currentBlock.removeInput(value);
      }
    });
    this.setColour(this.fieldValueTemp_['COLOR'] || '#ff8800');
  },
  populateFields: function() {
    const fieldList = Object.keys(this.fieldValueTemp_);
    const currentBlock = this;
    fieldList.forEach(function(value) {
      if (currentBlock.getField(value) && value !== 'EDIT') {
        currentBlock.setFieldValue(currentBlock.fieldValueTemp_[value], value);
      }
    });
  },
  getConnectedBlocks: function() {
    for (let idx = 0; idx < 10; idx++) {
      if (this.getInput('ARG' + idx.toString(10))) {
        this.blockConnections_[idx] =
            this.getInputTargetBlock('ARG' + idx.toString(10));
      }
    }
  },
  restoreConnectedBlocks: function() {
    for (let idx = 0; idx < 10; idx++) {
      if (this.getInput('ARG' + idx.toString(10))) {
        if (this.blockConnections_[idx] &&
            this.getInput('ARG' + idx.toString(10)) &&
            (this.blockConnections_[idx].workspace === this.workspace)) {
          this.blockConnections_[idx].outputConnection
              .connect(this.getInput('ARG' + idx.toString(10)).connection);
        } else {
          this.blockConnections_[idx] = null;
        }
      }
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute(
        'field_values', JSON.stringify(this.fieldValueTemp_));
    return container;
  },
  domToMutation: function(container) {
    const blockData = container.getAttribute('field_values');
    if (blockData) {
      this.fieldValueTemp_ = JSON.parse(blockData);
    } else {
      // Dive into the block's XML to recover field values from older versions
      // of the block that used hidden fields.
      const blockXMLchildren = container.parentElement.children;
      for (let i = 0; i < blockXMLchildren.length; i++) {
        if (blockXMLchildren[i].tagName === 'field') {
          const tempFieldName = blockXMLchildren[i].getAttribute('name');
          this.fieldValueTemp_[tempFieldName] = blockXMLchildren[i].textContent;
        }
      }
      this.fieldValueTemp_['ARG_COUNT'] = container.getAttribute('args');
      this.fieldValueTemp_['COLOR'] = container.getAttribute('color');
      this.fieldValueTemp_['TYPE'] = container.getAttribute('type');
      this.fieldValueTemp_['LABEL_SET'] = this.getFieldValue('LABEL_SET');
    }
    this.updateShape_(this.fieldValueTemp_['EDIT'], false);
    this.setFieldValue(this.fieldValueTemp_['LABEL_SET'], 'LABEL');
    this.setOutputType(this.fieldValueTemp_['TYPE'] || 'INL');
  },
  setOutputType: function(outType) {
    if (outType === 'INL') {
      this.setOutput(false);
      this.setPreviousStatement(true);
      this.setNextStatement(true);
    } else {
      this.setPreviousStatement(false);
      this.setNextStatement(false);
      this.setOutput(true, (outType === 'STR' ? 'String' : 'Number'));
    }
  },
  setupInputs: function() {
    const argsCount = this.fieldValueTemp_['ARG_COUNT'];
    const blockEditState = (this.fieldValueTemp_['EDIT'] === true ||
                this.fieldValueTemp_['EDIT'] === 'true' ||
                this.fieldValueTemp_['EDIT'] === 'TRUE');
    this.getConnectedBlocks();
    for (let i = 1; i < 10; i++) {
      if (this.getInput('ARG' + i.toString(10))) {
        this.removeInput('ARG' + i.toString(10));
      }
    }
    for (let i = 1; i <= Number(argsCount); i++) {
      if (!this.getInput('ARG' + i.toString(10))) {
        if (blockEditState) {
          this.appendValueInput('ARG' + i.toString(10))
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField(
                  'input "@' + i.toString(10) + '" label',
                  'EDIT_ARG' + i.toString(10))
              .appendField(new Blockly.FieldTextInput(
                  this.fieldValueTemp_['LABEL_ARG' + i.toString(10)] || '',
                  function(value) {
                    // TODO: STAT Incorrect use of 'this'
                    // eslint-disable-next-line no-invalid-this
                    this.getSourceBlock().fieldValueTemp_[this.name] = value;
                  }), 'LABEL_ARG' + i.toString(10));
        } else {
          this.appendValueInput('ARG' + i.toString(10))
              .setAlign(Blockly.ALIGN_RIGHT)
              .appendField('', 'EDIT_ARG' + i.toString(10))
              .appendField(
                  this.fieldValueTemp_['LABEL_ARG' + i.toString(10)] || '',
                  'LABEL_ARG' + i.toString(10));
        }
      }
    }
    this.restoreConnectedBlocks();
  },
};

/**
 *
 * @return {string|(string|number)[]}
 */
Blockly.propc.custom_code_multiple = function() {
  const inArgument = [];
  for (let tk = 1; tk < 10; tk++) {
    inArgument.push(Blockly.propc.valueToCode(
        this,
        'ARG' + tk.toString(10),
        Blockly.propc.ORDER_ATOMIC) || '');
  }
  // Create a key for this blocks includes/defs/globals/funcs so when multiple
  // blocks are used, it only generates one copy in the propc code
  let ccCode = this.getFieldValue('LABEL');
  ccCode = encodeURI(ccCode.replace(/ /g, '_')).replace(/[^\w]/g, '_');
  // addition here: prevents collision with names
  // with a leading double underscore.
  if ('0123456789'.indexOf(ccCode[0]) !== -1 ||
      (ccCode[0] === '_' && ccCode[1] === '_')) {
    ccCode = 'my_' + ccCode;
  }

  const incl = (
    this.getFieldValue('INCLUDES') || this.fieldValueTemp_['INCLUDES'] || '')
      .replace(/@([0-9])/g, function(m, p) {
        return inArgument[parseInt(p)-1];
      });

  const glob = (
    this.getFieldValue('GLOBALS') || this.fieldValueTemp_['GLOBALS'] || '')
      .replace(/@([0-9])/g, function(m, p) {
        return inArgument[parseInt(p)-1];
      });

  const sets = (
    this.getFieldValue('SETUPS') || this.fieldValueTemp_['SETUPS'] || '')
      .replace(/@([0-9])/g, function(m, p) {
        return inArgument[parseInt(p)-1];
      });

  const main = (
    this.getFieldValue('MAIN') || this.fieldValueTemp_['MAIN'] || '')
      .replace(/@([0-9])/g, function(m, p) {
        return inArgument[parseInt(p)-1];
      });

  const func = (
    this.getFieldValue('FUNCTIONS') || this.fieldValueTemp_['FUNCTIONS'] || '')
      .replace(/@([0-9])/g, function(m, p) {
        return inArgument[parseInt(p)-1];
      });

  let code = '';

  if (incl !== '') {
    Blockly.propc.definitions_['cCode' + ccCode] = incl + '\n';
  }
  if (glob !== '') {
    Blockly.propc.global_vars_['cCode' + ccCode] = glob + '\n';
  }
  if (sets !== '') {
    Blockly.propc.setups_['cCode' + ccCode] = sets + '\n';
  }
  if (main !== '') {
    code += main;
  }
  if ((this.getFieldValue('TYPE') || this.fieldValueTemp_['TYPE']) === 'INL') {
    code += '\n';
  }
  if (func !== '') {
    Blockly.propc.methods_['cCode' + ccCode] = func + '\n';
  }
  if ((['NUM', 'STR'].indexOf(
      this.getFieldValue('TYPE') || this.fieldValueTemp_['TYPE'] || '')) > -1) {
    return [code, Blockly.propc.ORDER_ATOMIC];
  } else {
    return code;
  }
};

/**
 *
 * @type {{init: Blockly.Blocks.propc_file.init}}
 */
Blockly.Blocks.propc_file = {
  init: function() {
    this.setColour('#000000');
    this.appendDummyInput()
        .appendField(new Blockly.FieldTextInput('single.c'), 'FILENAME')
        .appendField(new Blockly.FieldTextInput(''), 'CODE');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  },
};

/**
 * TODO: Need a description of what this method does.
 * @return {string}
 */
Blockly.propc.propc_file = function() {
  const filename = this.getFieldValue('FILENAME');
  let code = this.getFieldValue('CODE');
  if (code.indexOf(' ') === -1 && code.indexOf('{') === -1) {
    code = atob(code);
  }
  return '// RAW PROPC CODE\n//{{||}}\n' + filename + '//{{||}}\n' + code;
};

/**
 * TODO: Need a description of what this method does.
 * @type {{init: Blockly.Blocks.run_as_setup.init, helpUrl: string}}
 */
Blockly.Blocks.run_as_setup = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SYSTEM_RUN_AS_SETUP_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendDummyInput().appendField('Run as setup');
    this.appendStatementInput('CODE');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
  },
};

/**
 * TODO: Need a description for what this method does.
 * @return {string}
 */
Blockly.propc.run_as_setup = function() {
  if (!this.disabled) {
    const code = Blockly.propc.statementToCode(this, 'CODE');
    const myId = 'runAsSetup_' + btoa(code).substring(0, 19);
    Blockly.propc.setups_[myId] = code;
  }
  return '';
};
