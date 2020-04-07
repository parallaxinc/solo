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
 * @fileoverview Generating C for control blocks
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */
'use strict';

import Blockly from 'blockly/core.js';
import {getDefaultProfile} from '../../../project.js';
import {colorPalette} from '../propc.js';

/**
 * Controls Repeat
 * @type {{
 *  init: Blockly.Blocks.controls_repeat.init,
 *  updateShape_: Blockly.Blocks.controls_repeat.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.controls_repeat.domToMutation
 *  }}
 */
Blockly.Blocks.controls_repeat = {
  init: function() {
    const profile = getDefaultProfile();
    let blockLabel = 'repeat';
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_CONTROL_HELPURL);
      this.setTooltip(Blockly.MSG_S3_SCRIBBLER_LOOP_TOOLTIP);
      blockLabel = 'loop';
    } else {
      this.setHelpUrl(Blockly.MSG_CONTROL_HELPURL);
      this.setTooltip(Blockly.MSG_CONTROLS_REPEAT_TOOLTIP);
    }
    this.setColour(colorPalette.getColor('programming'));
    // ["with", "WITH"]
    const PROPERTIES = [
      ['forever', 'FOREVER'],
      ['x times', 'TIMES'],
      ['until', 'UNTIL'],
      ['while', 'WHILE'],
    ];
    const fieldDropdown = new Blockly.FieldDropdown(
        PROPERTIES,
        function(type) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(type);
        });
    this.appendDummyInput().appendField(blockLabel);
    this.appendDummyInput('REPEAT').appendField(
        fieldDropdown,
        'TYPE');
    this.appendStatementInput('DO').appendField(
        Blockly.LANG_CONTROLS_REPEAT_INPUT_DO);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('type', this.getFieldValue('TYPE'));
    return container;
  },
  domToMutation: function(xmlElement) {
    this.updateShape_(xmlElement.getAttribute('type'));
  },
  updateShape_: function(type) {
    // Add or remove a Value Input.
    const inputTimes = this.getInput('TIMES');
    if (type === 'TIMES') {
      if (!inputTimes) {
        this.appendValueInput('TIMES').setCheck('Number');
        this.moveInputBefore('TIMES', 'REPEAT');
      }
    } else {
      if (inputTimes) {
        this.removeInput('TIMES');
      }
    }
    const inputCondition = this.getInput('REPEAT_CONDITION');
    if (type === 'WHILE' || type === 'UNTIL') {
      if (!inputCondition) {
        this.appendValueInput('REPEAT_CONDITION').setCheck('Number');
        this.moveInputBefore('REPEAT_CONDITION', 'DO');
      }
    } else {
      if (inputCondition) {
        this.removeInput('REPEAT_CONDITION');
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.controls_repeat = function() {
  const type = this.getFieldValue('TYPE');
  let branch = Blockly.propc.statementToCode(this, 'DO');
  if (Blockly.propc.INFINITE_LOOP_TRAP) {
    branch = Blockly.propc.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  const order = Blockly.propc.ORDER_UNARY_PREFIX;
  let code = '';
  let repeatCondition = '';
  let repeats = '';

  switch (type) {
    case 'FOREVER':
      code = 'while(1) {\n' + branch + '}\n';
      break;
    case 'TIMES':
      repeats = Blockly.propc.valueToCode(this, 'TIMES', order) || '0';
      code = 'for (int __n = 0; __n < ' + repeats + '; __n++) {\n' +
                    branch + '}\n';
      break;
    case 'WHILE':
      repeatCondition = Blockly.propc.valueToCode(
          this, 'REPEAT_CONDITION', order) || '0';
      code = 'while (' + repeatCondition + ') {\n' +
                    branch + '}\n';
      break;
    case 'UNTIL':
      repeatCondition = Blockly.propc.valueToCode(
          this, 'REPEAT_CONDITION', order) || '0';
      code = 'while (!(' + repeatCondition + ')) {\n' +
                    branch + '}\n';
      break;
  }
  return code;
};

/**
 * Controls If
 * @type {{
 *  init: Blockly.Blocks.controls_if.init,
 *  saveConnections: Blockly.Blocks.controls_if.saveConnections,
 *  compose: Blockly.Blocks.controls_if.compose,
 *  mutationToDom: Blockly.Blocks.controls_if.mutationToDom,
 *  decompose: (function(*): Blockly.Block),
 *  domToMutation: Blockly.Blocks.controls_if.domToMutation,
 *  category: string
 *  }}
 */
Blockly.Blocks.controls_if = {
  // If/elseif/else condition.
  category: Blockly.LANG_CATEGORY_CONTROLS,
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_CONTROL_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_CONTROL_HELPURL);
    }
    this.setTooltip(Blockly.MSG_CONTROLS_IF_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendValueInput('IF0')
        .setCheck('Number')
        .appendField(Blockly.LANG_CONTROLS_IF_MSG_IF);
    this.appendStatementInput('DO0')
        .appendField(Blockly.LANG_CONTROLS_IF_MSG_THEN);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['controls_if_elseif',
      'controls_if_else']));
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
  },
  mutationToDom: function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    const container = document.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('elseif', this.elseifCount_);
    }
    if (this.elseCount_) {
      container.setAttribute('else', '1');
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.elseifCount_ = window.parseInt(xmlElement.getAttribute('elseif'), 10);
    this.elseCount_ = window.parseInt(xmlElement.getAttribute('else'), 10);
    for (let x = 1; x <= this.elseifCount_; x++) {
      this.appendValueInput('IF' + x)
          .setCheck('Number')
          .appendField(Blockly.LANG_CONTROLS_IF_MSG_ELSEIF);
      this.appendStatementInput('DO' + x)
          .appendField(Blockly.LANG_CONTROLS_IF_MSG_THEN);
    }
    if (this.elseCount_) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.LANG_CONTROLS_IF_MSG_ELSE);
    }
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('controls_if_if');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let x = 1; x <= this.elseifCount_; x++) {
      const elseifBlock = workspace.newBlock('controls_if_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      const elseBlock = workspace.newBlock('controls_if_else');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect the else input blocks and remove the inputs.
    if (this.elseCount_ && this.getInput('ELSE')) {
      this.removeInput('ELSE');
    }
    this.elseCount_ = 0;
    // Disconnect all the elseif input blocks and remove the inputs.
    for (let x = this.elseifCount_; x > 0; x--) {
      this.removeInput('IF' + x);
      this.removeInput('DO' + x);
    }
    this.elseifCount_ = 0;
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let ifInput;
    let doInput;
    let elseInput;

    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          this.elseifCount_++;
          ifInput = this.appendValueInput('IF' + this.elseifCount_)
              .setCheck('Number')
              .appendField(Blockly.LANG_CONTROLS_IF_MSG_ELSEIF);
          doInput = this.appendStatementInput('DO' + this.elseifCount_);
          doInput.appendField(Blockly.LANG_CONTROLS_IF_MSG_THEN);
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            ifInput.connection.connect(clauseBlock.valueConnection_);
          }
          if (clauseBlock.statementConnection_) {
            doInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        case 'controls_if_else':
          this.elseCount_++;
          elseInput = this.appendStatementInput('ELSE');
          elseInput.appendField(Blockly.LANG_CONTROLS_IF_MSG_ELSE);
          // Reconnect any child blocks.
          if (clauseBlock.statementConnection_) {
            elseInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        default:
          throw Error('Unknown block type.');
      }
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let x = 1;
    let inputIf;
    let inputDo;

    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          inputIf = this.getInput('IF' + x);
          inputDo = this.getInput('DO' + x);
          clauseBlock.valueConnection_ =
                            inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
                            inputDo && inputDo.connection.targetConnection;
          x++;
          break;
        case 'controls_if_else':
          inputDo = this.getInput('ELSE');
          clauseBlock.statementConnection_ =
                            inputDo && inputDo.connection.targetConnection;
          break;
        default:
          throw Error('Unknown block type.');
      }
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
  },
};

/**
 *
 *@type {{
 *  init: Blockly.Blocks.controls_if_if.init
 * }}
 */
Blockly.Blocks.controls_if_if = {
  // If condition.
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(Blockly.LANG_CONTROLS_IF_IF_TITLE_IF);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.LANG_CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_if_elseif.init
 * }}
 */
Blockly.Blocks.controls_if_elseif = {
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(Blockly.LANG_CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setTooltip(Blockly.LANG_CONTROLS_IF_ELSEIF_TOOLTIP);
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_if_else.init
 * }}
 */
Blockly.Blocks.controls_if_else = {
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(Blockly.LANG_CONTROLS_IF_ELSE_TITLE_ELSE);
    this.setPreviousStatement(true, 'Block');
    this.setTooltip(Blockly.LANG_CONTROLS_IF_ELSE_TOOLTIP);
    this.contextMenu = false;
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.controls_if = function() {
  let n = 0;
  let argument = Blockly.propc.valueToCode(this, 'IF' + n,
      Blockly.propc.ORDER_NONE) || '0';
  let branch = Blockly.propc.statementToCode(this, 'DO' + n);
  let code = 'if (' + argument + ') {\n' + branch + '}\n';
  for (n = 1; n <= this.elseifCount_; n++) {
    argument = Blockly.propc.valueToCode(this, 'IF' + n,
        Blockly.propc.ORDER_NONE) || '0';
    branch = Blockly.propc.statementToCode(this, 'DO' + n);
    code += 'else if (' + argument + ') {\n' + branch + '}';
  }
  if (this.elseCount_) {
    branch = Blockly.propc.statementToCode(this, 'ELSE');
    code += 'else {\n' + branch + '}\n';
  }
  return code + '\n';
};

/**
 * Control Repeat For Loop
 * @type {{
 *  init: Blockly.Blocks.control_repeat_for_loop.init,
 *  onchange: Blockly.Blocks.control_repeat_for_loop.onchange
 *  }}
 */
Blockly.Blocks.control_repeat_for_loop = {
  init: function() {
    const profile = getDefaultProfile();
    let blockLabel = 'repeat';
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_CONTROL_HELPURL);
      this.setTooltip(Blockly.MSG_S3_SCRIBBLER_LIMITED_LOOP_TOOLTIP);
      blockLabel = 'loop';
    } else {
      this.setHelpUrl(Blockly.MSG_CONTROL_HELPURL);
      this.setTooltip(Blockly.MSG_CONTROL_REPEAT_FOR_LOOP_TOOLTIP);
    }
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField(blockLabel)
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.appendValueInput('START')
        .setCheck('Number')
        .appendField('from');
    this.appendValueInput('END')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(
            [['thru', '= '], ['to', ' ']]),
        'EQ');
    this.appendValueInput('STEP')
        .setCheck('Number')
        .appendField('by');
    this.appendStatementInput('DO')
        .appendField('do');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setInputsInline(true);
  },
  onchange: function(event) {
    if (event && (event.type === Blockly.Events.CHANGE)) {
      let warnText = null;
      const blockStart = this.getInput('START').connection.targetBlock();
      const blockEnd = this.getInput('END').connection.targetBlock();
      const blockStep = this.getInput('STEP').connection.targetBlock();
      if (blockStart && blockEnd && blockStep &&
                    blockStart.type === 'math_number' &&
                    blockEnd.type === 'math_number' &&
                    blockStep.type === 'math_number') {
        if (parseInt(blockStart.getFieldValue('NUM')) <
            parseInt(blockEnd.getFieldValue('NUM')) &&
            parseInt(blockStep.getFieldValue('NUM')) < 0) {
          warnText = 'WARNING: If the "step" value is negative, the "start"' +
              ' value should be greater than the "end" value!';
        } else if (parseInt(blockStart.getFieldValue('NUM')) >
            parseInt(blockEnd.getFieldValue('NUM')) &&
            parseInt(blockStep.getFieldValue('NUM')) > 0) {
          warnText = 'WARNING: If the "step" value is positive, the "start"' +
              ' value should be less than the "end" value!';
        } else if (parseInt(blockStep.getFieldValue('NUM')) === 0) {
          warnText = 'WARNING: The "step" value cannot be zero!';
        }
      }
      this.setWarningText(warnText);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.control_repeat_for_loop = function() {
  const start = Blockly.propc.valueToCode(
      this, 'START', Blockly.propc.ORDER_NONE) || '1';
  let end = this.getFieldValue('EQ') +
        Blockly.propc.valueToCode(
            this, 'END', Blockly.propc.ORDER_NONE) || '10';
  const step = Blockly.propc.valueToCode(
      this, 'STEP', Blockly.propc.ORDER_NONE) || '1';
  let repeatCode = Blockly.propc.statementToCode(this, 'DO');
  const loopCounter = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);

  repeatCode = step + ')) {\n' + repeatCode + '\n}';
  end += '; ' + loopCounter;
  let code = 'for (' + loopCounter + ' = ' + start + '; ' + loopCounter;

  if (isNaN(parseFloat(start)) || !isFinite(start) ||
      isNaN(parseFloat(end)) || !isFinite(end)) {
    if (isNaN(parseFloat(step)) || !isFinite(step)) {
      code += ' <' + end + ' += abs(' + repeatCode;
    } else {
      if (Number(step) < 0) {
        code += ' >' + end + ' += (' + repeatCode;
      } else if (Number(step) > 0) {
        code += ' <' + end + ' += (' + repeatCode;
      } else if (Number(step) === 0) {
        code = '// ERROR: Your "step" size cannot be 0 (zero)!\n';
      }
    }
  } else {
    if (isNaN(parseFloat(step)) || !isFinite(step)) {
      if (Number(start) < Number(end)) {
        code += ' <' + end + ' += abs(' + repeatCode;
      } else {
        code += ' >' + end + ' -= abs(' + repeatCode;
      }
    } else {
      if (Number(start) < Number(end)) {
        code += ' <' + end + ' += (' + repeatCode;
      } else {
        code += ' >' + end + ' += (' + repeatCode;
      }
    }
  }
  code = code.replace(/ \+= \(-1\)/g, '--').replace(/ \+= \(1\)/g, '++');
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_return.init,
 *  helpUrl: string
 * }}
 */
Blockly.Blocks.controls_return = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONTROLS_RETURN_TOOLTIP);
    this.appendDummyInput()
        .appendField('return');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setColour(colorPalette.getColor('programming'));
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.controls_return = function() {
  return 'return;';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_break.init,
 *  helpUrl: string
 * }}
 */
Blockly.Blocks.controls_break = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_CONTROLS_BREAK_TOOLTIP);
    this.appendDummyInput()
        .appendField('break');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setColour(colorPalette.getColor('programming'));
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.controls_break = function() {
  return 'break;';
};

/**
 * Controls Select
 * @type {{
 *  init: Blockly.Blocks.controls_select.init,
 *  saveConnections: Blockly.Blocks.controls_select.saveConnections,
 *  compose: Blockly.Blocks.controls_select.compose,
 *  mutationToDom: Blockly.Blocks.controls_select.mutationToDom,
 *  decompose: (function(*): Blockly.Block),
 *  domToMutation: Blockly.Blocks.controls_select.domToMutation,
 *  category: string
 *  }}
 */
Blockly.Blocks.controls_select = {
  // If/elseif/else condition.
  category: Blockly.LANG_CATEGORY_CONTROLS,
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_CONTROL_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_CONTROL_HELPURL);
    }
    this.setTooltip(Blockly.MSG_CONTROLS_SELECT_TOOLTIP);
    this.setColour(colorPalette.getColor('programming'));
    this.appendValueInput('SWITCH')
        .appendField('switch');
    this.appendValueInput('SEL1')
        .setCheck('Number')
        .appendField('case');
    this.appendStatementInput('CASE1')
        .appendField('do (then break')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'BREAK1')
        .appendField(')');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['controls_select_case',
      'controls_select_default']));
    this.elseifCount_ = 1;
    this.elseCount_ = 0;
  },
  mutationToDom: function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    const container = document.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('case', this.elseifCount_);
    }
    if (this.elseCount_) {
      container.setAttribute('default', '1');
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    this.elseifCount_ = window.parseInt(xmlElement.getAttribute('case'), 10);
    this.elseCount_ = window.parseInt(xmlElement.getAttribute('default'), 10);
    for (let x = 1; x <= this.elseifCount_; x++) {
      const theInput = this.getInput('SEL' + x);
      if (!theInput) {
        this.appendValueInput('SEL' + x)
            .setCheck('Number')
            .appendField('case');
        this.appendStatementInput('CASE' + x)
            .appendField('do (then break')
            .appendField(new Blockly.FieldCheckbox('TRUE'), 'BREAK' + x)
            .appendField(')');
      }
    }
    if (this.elseCount_) {
      this.appendStatementInput('DEFAULT')
          .appendField('default');
    }
  },
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('controls_select_select');
    containerBlock.initSvg();
    let connection = containerBlock.getInput('STACK').connection;
    for (let x = 1; x <= this.elseifCount_; x++) {
      const elseifBlock = workspace.newBlock('controls_select_case');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      const elseBlock = workspace.newBlock('controls_select_default');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  compose: function(containerBlock) {
    // Disconnect the else input blocks and remove the inputs.
    if (this.elseCount_) {
      this.removeInput('DEFAULT');
    }
    this.elseCount_ = 0;
    // Disconnect all the elseif input blocks and remove the inputs.
    for (let x = this.elseifCount_; x > 0; x--) {
      if (this.getInput('SEL' + x)) {
        this.removeInput('SEL' + x);
      }
      if (this.getInput('CASE' + x)) {
        this.removeInput('CASE' + x);
      }
    }
    this.elseifCount_ = 0;
    // Rebuild the block's optional inputs.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let ifInput;
    let doInput;
    let elseInput;

    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_select_case':
          this.elseifCount_++;
          ifInput = this.appendValueInput('SEL' + this.elseifCount_)
              .setCheck('Number')
              .appendField('case');
          doInput = this.appendStatementInput('CASE' + this.elseifCount_);
          doInput.appendField('do (then break')
              .appendField(
                  new Blockly.FieldCheckbox('TRUE'),
                  'BREAK' + this.elseifCount_)
              .appendField(')');
          // Reconnect any child blocks.
          if (clauseBlock.valueConnection_) {
            ifInput.connection.connect(clauseBlock.valueConnection_);
          }
          if (clauseBlock.statementConnection_) {
            doInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        case 'controls_select_default':
          this.elseCount_++;
          elseInput = this.appendStatementInput('DEFAULT');
          elseInput.appendField('default');
          // Reconnect any child blocks.
          if (clauseBlock.statementConnection_) {
            elseInput.connection.connect(clauseBlock.statementConnection_);
          }
          break;
        default:
          throw Error('Unknown block type.');
      }
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
  },
  saveConnections: function(containerBlock) {
    // Store a pointer to any connected child blocks.
    let clauseBlock = containerBlock.getInputTargetBlock('STACK');
    let x = 1;
    let inputIf;
    let inputDo;

    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_select_case':
          inputIf = this.getInput('SEL' + x);
          inputDo = this.getInput('CASE' + x);
          clauseBlock.valueConnection_ =
                            inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
                            inputDo && inputDo.connection.targetConnection;
          x++;
          break;
        case 'controls_select_default':
          inputDo = this.getInput('DEFAULT');
          clauseBlock.statementConnection_ =
                            inputDo && inputDo.connection.targetConnection;
          break;
        default:
          throw Error('Unknown block type.');
      }
      clauseBlock = clauseBlock.nextConnection &&
                    clauseBlock.nextConnection.targetBlock();
    }
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_select_select.init
 * }}
 */
Blockly.Blocks.controls_select_select = {
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('switch');
    this.appendStatementInput('STACK');
    this.setInputsInline(false);
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_select_case.init
 * }}
 */
Blockly.Blocks.controls_select_case = {
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('case');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.contextMenu = false;
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.controls_select_default.init
 * }}
 */
Blockly.Blocks.controls_select_default = {
  // Else condition.
  init: function() {
    this.setColour(colorPalette.getColor('programming'));
    this.appendDummyInput()
        .appendField('default');
    this.setPreviousStatement(true, 'Block');
    this.contextMenu = false;
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.controls_select = function() {
  let n;
  const start = Blockly.propc.valueToCode(
      this, 'SWITCH', Blockly.propc.ORDER_NONE) || '0';
  let breaking = '';
  let branch = '';
  let code = 'switch(' + start + ') {\n';

  if (breaking === true || breaking === 'TRUE' || breaking === 'true') {
    code += 'break;\n';
  }
  for (n = 1; n <= this.elseifCount_; n++) {
    const argument = Blockly.propc.valueToCode(
        this, 'SEL' + n, Blockly.propc.ORDER_NONE) || '0';
    branch = Blockly.propc.statementToCode(this, 'CASE' + n);
    code += 'case ' + argument + ':\n' + branch;
    breaking = this.getFieldValue('BREAK' + n);
    if (breaking === true || breaking === 'TRUE' || breaking === 'true') {
      code += 'break;\n';
    }
  }

  if (this.elseCount_) {
    branch = Blockly.propc.statementToCode(this, 'DEFAULT');
    code += 'default: \n' + branch + '\n';
  }

  return code + '}\n';
};
