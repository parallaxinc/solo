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
 * New Cog block definition
 * @type {{
 *  init: Blockly.Blocks.cog_new.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.cog_new.onchange
 * }}
 */
Blockly['Blocks'].cog_new = {
  helpUrl: Blockly.MSG_CONTROL_HELPURL,
  /**
   * Initialize a new cog and assign a function to it
   */
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

  /**
   * Handle specific change events
   * @param {Blockly.Events} event
   */
  onchange: function(event) {
    if (event &&
        (event.type === Blockly.Events.CHANGE ||
            event.type === Blockly.Events.MOVE)) {
      let repeatWarningText = null;
      // Warn if the root block is a repeat block. The code should never loop to
      // assign multiple cogs
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
 * C source code emitter for the New Cog block
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
