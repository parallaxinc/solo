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
 * @fileoverview Generating C for variable blocks
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

/**
 * This is a counter used to provide unique array identifiers
 * @type {number}
 * @description This is used in the Blockly.propc.array_fill method to
 * keep an incremental counter between invocations. It essentially acts
 * as a unique number generator.
 */
let tempArrayNumber = 0;

/**
 *  Variable getter
 *
 * @type {{init: Blockly.Blocks.variables_get.init, helpUrl: *}}
 */
Blockly.Blocks.variables_get = {
  helpUrl: Blockly.MSG_VARIABLES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_VARIABLES_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendDummyInput('')
        .appendField(Blockly.LANG_VARIABLES_GET_TITLE_1)
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setOutput(true);
    this.typeCheckRun = null;
  },
};

/**
 *  Variable setter.
 *
 * @type {{init: Blockly.Blocks.variables_set.init, helpUrl: *}}
 */
Blockly.Blocks.variables_set = {
  helpUrl: Blockly.MSG_VARIABLES_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_VARIABLES_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendValueInput('VALUE')
        .appendField(Blockly.LANG_VARIABLES_SET_TITLE_1)
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_SET_ITEM), 'VAR')
        .appendField('=');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
  },
};

/**
 * Propeller C variable getter
 *
 * @return {[string, number]}
 */
Blockly.propc.variables_get = function() {
  const code = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  return [code, Blockly.propc.ORDER_ATOMIC];
};


/**
 *  Propeller C variable setter
 *
 * @return {string}
 */
Blockly.propc.variables_set = function() {
  const argument0 = Blockly.propc.valueToCode(this, 'VALUE',
      Blockly.propc.ORDER_ASSIGNMENT) || '0';
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  if (Blockly.propc.vartype_[varName] === undefined) {
    if (argument0.indexOf('int') > -1) {
      Blockly.propc.vartype_[varName] = 'int';
    } else if (argument0.indexOf('float') > -1) {
      Blockly.propc.vartype_[varName] = 'float';
      Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
    } else if (argument0.indexOf('char') > -1) {
      Blockly.propc.vartype_[varName] = 'char';
      Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
    } else if (argument0.indexOf('char\[\]') > -1) {
      Blockly.propc.vartype_[varName] = 'char *';
    } else if (argument0.indexOf('"') > -1 && argument0.indexOf('"') < 4) {
      // Some functions that return numbers take strings as arguments, so
      // we need to account for that.
      Blockly.propc.vartype_[varName] = 'char *';
    } else if (argument0.indexOf('.') > -1) {
      Blockly.propc.vartype_[varName] = 'float';
    } else if (argument0.indexOf('true') > -1 ||
        argument0.indexOf('false') > -1) {
      Blockly.propc.vartype_[varName] = 'boolean';
    } else {
      Blockly.propc.vartype_[varName] = 'int';
    }
  } else if (argument0.indexOf('int') > -1) {
    Blockly.propc.vartype_[varName] = 'int';
    // Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
  } else if (argument0.indexOf('float') > -1) {
    Blockly.propc.vartype_[varName] = 'float';
    Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
  } else if (argument0.indexOf('char') > -1) {
    Blockly.propc.vartype_[varName] = 'char';
    Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
  } else if (argument0.indexOf('char\[\]') > -1) {
    Blockly.propc.vartype_[varName] = 'char *';
  }

  return varName + ' = ' + argument0 + ';\n';
};

/* ----------   array blocks   ----------*/

/**
 *  Get an array of the currently defined project variables
 *
 * @type {{
 *  init: Blockly.Blocks.array_get.init,
 *  updateArrayMenu: Blockly.Blocks.array_get.updateArrayMenu,
 *  helpUrl: *,
 *  onchange: Blockly.Blocks.array_get.onchange,
 *  buildArrayMenu: Blockly.Blocks.array_get.buildArrayMenu
 * }}
 */
Blockly.Blocks.array_get = {
  helpUrl: Blockly.MSG_ARRAYS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_ARRAY_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField('array')
        .appendField(new Blockly.FieldDropdown([['list', 'list']]), 'VAR')
        .appendField('element');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.arrayList = ['list'];
    this.arrayInitWarnFlag = false;
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('array_list', this.arrayList.join(','));
    return container;
  },
  domToMutation: function(container) {
    const arrayString = container.getAttribute('array_list');
    if (arrayString) {
      this.arrayList = arrayString.split(',');
    }
    this.buildArrayMenu();
  },
  buildArrayMenu: function() {
    const toConn = this.getInput('NUM').connection.targetConnection;
    if (this.getInput('NUM')) {
      this.removeInput('NUM');
    }
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField('array')
        .appendField(new Blockly.FieldDropdown(
            (this.arrayList.length > 0 ?
                this.arrayList : ['list']).map(function(value) {
              return [value, value];
            }), function() {
              // eslint-disable-next-line no-invalid-this
              if (this.getSourceBlock().arrayInitWarnFlag) {
                // eslint-disable-next-line no-invalid-this
                this.getSourceBlock().setWarningText(null);
              }
            }), 'VAR')
        .appendField('element');
    if (toConn) {
      this.getInput('NUM').connection.connect(toConn);
    }
  },
  updateArrayMenu: function(oldValue, newValue) {
    if (this.isInFlyout) {
      return;
    }
    const currentValue = this.getFieldValue('VAR');
    // Needs to contain 'list' - otherwise when it tries to set it as a
    // default, lots of warnings get thrown in the console.
    const initBlockList = ['list'];
    Blockly.getMainWorkspace().getBlocksByType('array_init', false)
        .forEach(function(element) {
          initBlockList.push(element.getFieldValue('VAR'));
        });
    this.arrayList = this.arrayList.concat(initBlockList);

    if (newValue) {
      this.arrayList.push(newValue); // add the new value to the list of arrays
    }
    if (oldValue) {
      this.arrayList = this.arrayList.filter(function(value) {
        return value !== oldValue; // remove the old value to the list of arrays
      });
    }

    // sort and remove duplicates from the list of arrays
    this.arrayList = this.arrayList.sortedUnique();
    this.buildArrayMenu();

    // update the menu on the block
    if (newValue && currentValue && currentValue === oldValue) {
      this.setFieldValue(newValue, 'VAR');
    } else if (currentValue && this.getField('VAR')) {
      if (this.arrayList.indexOf(currentValue) >= 0) {
        this.setFieldValue(currentValue, 'VAR');
        this.arrayInitWarnFlag = false;
      } else {
        // the init block for this array got deleted, so revert to "list"
        // and toggle the warning icon on the block
        this.setFieldValue('list', 'VAR');
        this.setWarningText('The array "' + currentValue + '" is no longer ' +
            'initialized.\nEither add an array initialize block\nor choose a' +
            ' different array.');
        this.arrayInitWarnFlag = true;
      }
    }
  },
  onchange: function(event) {
    let blockType = null;
    let oldValue = null;
    let newValue = null;
    if (event.type === Blockly.Events.BLOCK_DELETE) {
      // The block's fields can't be accessed after it's deleted, so we
      // have to dive into it's XML, since that's all that's preserved
      if (event.oldXml.attributes.type.nodeValue === 'array_init') {
        blockType = 'array_init';
        // Block field previous value
        oldValue = event.oldXml.firstChild.innerHTML;
      }
    } else if (event.type === Blockly.Events.BLOCK_CREATE) {
      const eventBlock = Blockly.getMainWorkspace().getBlockById(event.blockId);
      if (eventBlock && eventBlock.type === 'array_init') {
        blockType = 'array_init';
        newValue = eventBlock.getFieldValue('VAR'); // Block field new value
      }
      if (eventBlock === this) {
        this.updateArrayMenu();
      }
    } else if (event.type === Blockly.Events.BLOCK_CHANGE) {
      const eventBlock = Blockly.getMainWorkspace().getBlockById(event.blockId);
      if (eventBlock && eventBlock.type === 'array_init' &&
          event.name === 'VAR') {
        blockType = 'array_init';
        newValue = event.newValue; // Block field new value
        oldValue = event.oldValue; // Block field previous value
      }
    }
    if (blockType === 'array_init') {
      this.updateArrayMenu(oldValue, newValue);
    }

    let warnText = null;
    let elementCount = null;
    if (this.type === 'array_get' || this.type === 'array_set' ) {
      const connectedBlock = this.getInput('NUM').connection.targetBlock();
      if (connectedBlock && connectedBlock.type === 'math_number') {
        // Only run this check if the field is populated with a numeric value.
        // If it contains any other block, this will be skipped.
        const elementValue = connectedBlock.getFieldValue('NUM');
        if (typeof(elementValue) === 'number' ||
            (typeof(elementValue) === 'string' &&
             elementValue.replace(/[^0-9]+/g, '') === elementValue)) {
          elementCount = parseInt(elementValue);
        }
      }
    } else if (this.type === 'array_fill') {
      elementCount = (this.getFieldValue('NUM').split(',')).length;
    }
    const arrayName = this.getFieldValue('VAR');
    let initBlockCount = null;
    Blockly.getMainWorkspace().getBlocksByType('array_init', false)
        .forEach(function(element) {
          if (element.getFieldValue('VAR') === arrayName) {
            initBlockCount = parseInt(element.getFieldValue('NUM'), 10);
          }
        });
    if (!initBlockCount) {
      warnText = 'WARNING: The array "' + arrayName +
          '" has not been initialized!';
    } else if (elementCount && (elementCount > initBlockCount ||
        elementCount < 0)) {
      // We have more array elements than places to store them. (#159)
      warnText = 'WARNING: You are trying to get an element from your' +
          ' array that does not exist!';
    }
    if (!this.arrayInitWarnFlag) {
      this.setWarningText(warnText);
    }
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.array_init.init, helpUrl: *,
 *  onchange: Blockly.Blocks.array_init.onchange,
 *  sendArrayVal: Blockly.Blocks.array_init.sendArrayVal
 * }}
 */
Blockly.Blocks.array_init = {
  helpUrl: Blockly.MSG_ARRAYS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_ARRAY_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendDummyInput()
        .appendField('array initialize')
        .appendField(new Blockly.FieldTextInput('list', function(a) {
          // Replace spaces with underscores and remove non-word characters
          // from the array variable name
          return a.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');
        }), 'VAR')
        .appendField('with')
        .appendField(new Blockly.FieldNumber('10', null, null, 1), 'NUM')
        .appendField('elements');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
  },
  onchange: function(event) {
    const myName = this.getFieldValue('VAR');
    const theBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();

    let warnTxt = null;
    const fStart = theBlocks.indexOf('array initialize ' + myName + ' with');
    if (theBlocks
        .indexOf('array initialize ' + myName + ' with', fStart + 1) > -1) {
      warnTxt = 'WARNING! you can only initialize the array "' +
          myName + '" once!';
    }
    this.setWarningText(warnTxt);
  },
};

/**
 *  Define the elements of the named array
 *
 * @type {{
 *  init: Blockly.Blocks.array_fill.init,
 *  updateArrayMenu: *,
 *  helpUrl: *,
 *  onchange: Blockly.Blocks.array_fill.onchange,
 *  buildArrayMenu: Blockly.Blocks.array_fill.buildArrayMenu
 * }}
 */
Blockly.Blocks.array_fill = {
  helpUrl: Blockly.MSG_ARRAYS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_ARRAY_FILL_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendDummyInput('NUMS')
        .appendField('array fill')
        .appendField(new Blockly.FieldDropdown([['list', 'list']]), 'VAR')
        .appendField('with values')
        .appendField(new Blockly.FieldTextInput('10,20,30,40,50'), 'NUM');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.arrayList = ['list'];
    this.arrayInitWarnFlag = false;
  },
  mutationToDom: Blockly.Blocks['array_get'].mutationToDom,
  domToMutation: Blockly.Blocks['array_get'].domToMutation,
  buildArrayMenu: function() {
    const currList = this.getFieldValue('NUM') || '10,20,30,40,50';
    if (this.getInput('NUMS')) {
      this.removeInput('NUMS');
    }
    const currentValue = this.getFieldValue('NUM');
    this.appendDummyInput('NUMS')
        .appendField('array fill')
        .appendField(new Blockly.FieldDropdown(
            (this.arrayList.length > 0 ? this.arrayList : ['list'])
                .map(function(value) {
                  return [value, value];
                })), 'VAR')
        .appendField('with values')
        .appendField(new Blockly.FieldTextInput(currList), 'NUM');
    this.setFieldValue(currentValue, 'NUM');
  },
  updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,
  onchange: Blockly.Blocks['array_get'].onchange,
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.array_set.init,
 *  updateArrayMenu: *,
 *  helpUrl: *,
 *  onchange: Blockly.Blocks.array_set.onchange,
 *  buildArrayMenu: Blockly.Blocks.array_set.buildArrayMenu
 * }}
 */
Blockly.Blocks.array_set = {
  helpUrl: Blockly.MSG_ARRAYS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_ARRAY_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendValueInput('NUM')
        .appendField('array')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([['list', 'list']]), 'VAR')
        .appendField('element');
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('=');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.arrayList = ['list'];
    this.arrayInitWarnFlag = false;
  },
  mutationToDom: Blockly.Blocks['array_get'].mutationToDom,
  domToMutation: Blockly.Blocks['array_get'].domToMutation,
  buildArrayMenu: function() {
    const inputTargetConnection =
        this.getInput('NUM').connection.targetConnection;
    if (this.getInput('NUM')) {
      this.removeInput('NUM');
    }
    this.appendValueInput('NUM')
        .appendField('array')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown(
            (this.arrayList.length > 0 ? this.arrayList : ['list'])
                .map(function(value) {
                  return [value, value];
                })), 'VAR')
        .appendField('element');
    this.moveInputBefore('NUM', 'VALUE');
    if (inputTargetConnection) {
      this.getInput('NUM').connection.connect(inputTargetConnection);
    }
  },
  updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,
  onchange: Blockly.Blocks['array_get'].onchange,
};

/**
 *  Clear the elements in an array
 *
 * @type {{
 *      init: Blockly.Blocks.array_clear.init,
 *      updateArrayMenu: *,
 *      helpUrl: *,
 *      onchange: Blockly.Blocks.array_clear.onchange,
 *      buildArrayMenu: Blockly.Blocks.array_clear.buildArrayMenu
 *      }}
 */
Blockly.Blocks.array_clear = {
  helpUrl: Blockly.MSG_ARRAYS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_ARRAY_CLEAR_TOOLTIP);
    this.setColour(colorPalette.getColor('variables'));
    this.appendDummyInput('NUM')
        .appendField('array clear')
        .appendField(new Blockly.FieldDropdown([['list', 'list']]), 'VAR');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.arrayList = ['list'];
    this.arrayInitWarnFlag = false;
  },
  mutationToDom: Blockly.Blocks['array_get'].mutationToDom,
  domToMutation: Blockly.Blocks['array_get'].domToMutation,
  buildArrayMenu: function() {
    if (this.getInput('NUM')) {
      this.removeInput('NUM');
    }
    this.appendDummyInput('NUM')
        .appendField('array clear')
        .appendField(new Blockly.FieldDropdown(
            (this.arrayList.length > 0 ? this.arrayList : ['list'])
                .map(function(value) {
                  return [value, value];
                })), 'VAR');
  },
  updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,
  onchange: Blockly.Blocks['array_get'].onchange,
};

/* ----------    propc array management     ---------- */

/**
 *
 * @return {string}
 */
Blockly.propc.array_clear = function() {
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'), 'Array');
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (allBlocks.toString().indexOf(
      'array initialize ' + this.getFieldValue('VAR')) === -1) {
    return '// ERROR: The array "' + this.getFieldValue('VAR') +
        '" has not been initialized!\n';
  } else {
    return 'memset(' + varName + ', 0, sizeof ' + varName + ');\n';
  }
};

/**
 *  Fill an array with values
 *
 * @return {string}
 */
Blockly.propc.array_fill = function() {
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'), 'Array');
  let varVals = this.getFieldValue('NUM');
  if (varVals.indexOf('0x') === 0 || varVals.indexOf(',0x') > 0) {
    varVals = varVals.replace(/[^0-9xA-Fa-f,-\.]/g, '');
  } else {
    varVals = varVals.replace(/[^0-9b,-\.]/g, '');
  }
  varVals = varVals.replace(/,\./g, ',0.')
      .replace(/\b\.[0-9-]+,\b/g, ',')
      .replace(/\.[0-9],/g, ',')
      .replace(/,,/g, ',0,')
      .replace(/,\s*$/, '');
  varVals = varVals.split('.')[0];

  const noCommas = varVals.replace(/,/g, '');
  let elements = varVals.length - noCommas.length + 1;
  let elemCount = 0;
  /* ----------------------------------------------------------------
   * DONT DELETE - MAY WANT TO USE THIS CODE ELSEWHERE
   * Find all Array-type variables, and find the largest one.

    var ArrayList = Object.keys(Blockly.propc.global_vars_);
    var ArrayMaxSize = 1;
    for (var k = 0; k < ArrayList.length; k++) {
    if (ArrayList[k].indexOf('__ARRAY') >= 0) {
    var t = Blockly.propc.global_vars_[ArrayList[k]];
    t = t.replace(/[^0-9]/g, "");
    var z = parseInt(t, 10);
    if (z > ArrayMaxSize)
    ArrayMaxSize = z;
    }
    }
    Blockly.propc.global_vars_['__TEMP_ARR'] =
     'int __tmpArr[' + ArrayMaxSize.toString() + '];';
   * --------------------------------------------------------------*/
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (allBlocks.toString().indexOf(
      'array initialize ' + this.getFieldValue('VAR')) > -1) {
    let initStr = '';
    for (let ij = 0; ij < allBlocks.length; ij++) {
      if (allBlocks[ij].toString().indexOf(
          'array initialize ' + this.getFieldValue('VAR')) > -1) {
        initStr = allBlocks[ij].toString().replace(/[^0-9]/g, '');
        break;
      }
    }
    elemCount = parseInt(initStr, 10);

    if (elements > elemCount) {
      code += '// WARNING: You are trying to add more elements to your\n';
      code += '//          array than you initialized your array with!\n';
      elements = elemCount;
    }
    code += 'int __tmpArr' + tempArrayNumber.toString() + '[] = {' +
        varVals + '};\n';
    code += 'memcpy(' + varName + ', __tmpArr' + tempArrayNumber.toString() +
        ', ' + elements + ' * sizeof(int));\n';
    tempArrayNumber++;
  } else {
    code = '// ERROR: The array "' + this.getFieldValue('VAR') +
        '" has not been initialized!\n';
  }

  return code;
};

/**
 *
 * @return {*[]}
 */
Blockly.propc.array_get = function() {
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'), 'Array');
  const element = Blockly.propc.valueToCode(
      this, 'NUM', Blockly.propc.ORDER_NONE) || '0';

  return [varName + '[' + element + ']', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @return {string}
 */
Blockly.propc.array_init = function() {
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'), 'Array');
  const element = this.getFieldValue('NUM') || '10';

  if (!this.disabled) {
    Blockly.propc.global_vars_['__ARRAY' + varName] = 'int ' + varName +
        '[' + element + '];';
  }

  return '';
};

/**
 *
 * @return {string}
 */
Blockly.propc.array_set = function() {
  const varName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'), 'Array');
  const elementCount = Blockly.propc.valueToCode(
      this, 'NUM', Blockly.propc.ORDER_NONE) || '0';
  const value = Blockly.propc.valueToCode(
      this, 'VALUE', Blockly.propc.ORDER_NONE) || '0';
  let code = varName + '[' + elementCount + '] = ' + value + ';\n';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (allBlocks.toString().indexOf(
      'array initialize ' + this.getFieldValue('VAR')) > -1) {
    let initStr = '';
    for (let ij = 0; ij < allBlocks.length; ij++) {
      if (allBlocks[ij].toString().indexOf(
          'array initialize ' + this.getFieldValue('VAR')) > -1) {
        initStr = allBlocks[ij].toString().replace(/[^0-9]/g, '');
        break;
      }
    }
    if (elementCount.replace(/[^0-9]+/g, '') === elementCount) {
      if (parseInt(elementCount) >= parseInt(initStr, 10) ||
          parseInt(elementCount) < 0) {
        code = '// WARNING: You are trying to set an element\nin your' +
            ' array that does not exist!\n';
      }
    } else {
      code = varName + '[constrainInt(' + elementCount + ', 0, ';
      code += (parseInt(initStr, 10) - 1).toString(10);
      code += ')] = ' + value + ';\n';
    }
  } else {
    code = '// WARNING: The array "' + this.getFieldValue('VAR') +
        '" has not been initialized!\n';
  }
  return code;
};
