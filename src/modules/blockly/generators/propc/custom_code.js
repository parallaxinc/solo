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
import {colorPalette} from '../propc';

/**
 * Custom C Code block
 *
 */
Blockly['Blocks'].custom_code_multiple = {
  helpUrl: Blockly.MSG_SYSTEM_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_CUSTOM_CODE_MULTIPLE_TOOLTIP);
    this.setColour(colorPalette.getColor('system'));
    this.appendDummyInput('BLOCK_LABEL')
        // Check box
        .appendField(new Blockly.FieldCheckbox(
            'FALSE',
            function(showFields) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().updateShape_(showFields, true);
            }),
        'EDIT')

        // Block text
        .appendField('  User defined code', 'LABEL');

    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);

    /**
     * Temporary field value
     * @type {{COLOR: string, ARG_COUNT: string}}
     * @private
     */
    this.fieldValueTemp_ = {
      'ARG_COUNT': '0',
      'COLOR': colorPalette.getColor('system'),
    };

    /**
     * List of connected blocks
     * @type {*[]}
     * @private
     */
    this.blockConnections_ = [];
  },

  /**
   * This updates the block geometry. Maybe.
   * @param {string} showFields
   * @param {boolean} populate
   * @private
   */
  updateShape_: function(showFields, populate) {
    this.fieldValueTemp_['EDIT'] = showFields;
    if (showFields === true ||
        showFields === 'true' ||
        showFields === 'TRUE') {
      // ----------------------------------------------------------------------
      // This call is creating a fault when it tries to create a custom
      // field, FieldAceEditor
      // ----------------------------------------------------------------------
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

  /**
   * Build source code input fields
   */
  buildFields: function() {
    // Return if the label is already set up
    if (this.getInput('SET_LABEL')) {
      return;
    }

    this.appendDummyInput('SET_LABEL')
        .appendField('label')
        .appendField(new Blockly.FieldTextInput(
            'User defined code', function(blockLabel) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().fieldValueTemp_['LABEL_SET'] = blockLabel;
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setFieldValue('  ' + blockLabel, 'LABEL');
            }),
        'LABEL_SET');

    this.appendDummyInput('SET_COLOR')
        .appendField('block color')
        .appendField(new Blockly.FieldColour(
            '#992673',
            function(blockColor) {
              // TODO STAT: Replace incorrect use of 'this'.
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().fieldValueTemp_['COLOR'] = blockColor;
            })
            .setColours([
              '#26994D', '#268F99', '#266999',
              '#264399', '#392699', '#692699',
              '#8F2699', '#992673', '#99264C',
            ])
            .setColumns(3), 'COLOR');

    const currentCustomBlock = this;

    /**
     * @description
     * This defines the five separate editor panes that make up the custom
     * code block. Each code block is expressed as individual custom
     * FieldAceEditor fields.
     */
    ([
      ['INCL', 'includes'],
      ['GLOB', 'globals'],
      ['SETS', 'setups'],
      ['MAIN', 'main'],
      ['FUNC', 'functions'],
    ]).forEach(function(value) {
      currentCustomBlock.appendDummyInput(value[0])
          // Label text
          .appendField(value[1].toLowerCase())
          // source code field
          .appendField(
              new Blockly.FieldTextInput(''),
              value[1].toUpperCase(),

              //     new Blockly.FieldAceEditor(
              //     `${value[1]} code`,
              //     '',
              //     function(userInput) {
              //       // TODO STAT: Replace incorrect use of 'this'.
              //       // eslint-disable-next-line no-invalid-this
              //       currentCustomBlock
              //           .fieldValueTemp_[value[1].toUpperCase()] =
              //           userInput;
              //     }),
              // // Language-neutral identifier which may be used to find this field
              // // again. Should be unique to the host block.
              // value[1].toUpperCase()
          );
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

  /**
   * Destroy the fields that were previously created
   */
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

  /**
   * Update the visible fields?
   */
  populateFields: function() {
    const fieldList = Object.keys(this.fieldValueTemp_);
    const currentBlock = this;
    fieldList.forEach(function(value) {
      if (currentBlock.getField(value) && value !== 'EDIT') {
        currentBlock.setFieldValue(currentBlock.fieldValueTemp_[value], value);
      }
    });
  },

  /**
   * Get the blocks connected to this block
   */
  getConnectedBlocks: function() {
    for (let idx = 0; idx < 10; idx++) {
      if (this.getInput('ARG' + idx.toString(10))) {
        this.blockConnections_[idx] =
            this.getInputTargetBlock('ARG' + idx.toString(10));
      }
    }
  },

  /**
   * Restore the connected blocks
   */
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

  /**
   * Convert to DOM model
   * @return {HTMLElement}
   */
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute(
        'field_values', JSON.stringify(this.fieldValueTemp_));
    return container;
  },

  /**
   * Convert from DOM model to a mutation
   * @param {Element} container
   */
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

  /**
   * Set the output block type
   * @param {string} outType
   */
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

  /**
   * Configure block inputs
   */
  setupInputs: function() {
    const argsCount = this.fieldValueTemp_['ARG_COUNT'];
    const blockEditState = (
      this.fieldValueTemp_['EDIT'] === true ||
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
