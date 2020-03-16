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

import {isExperimental} from './url_parameters';
import {EMPTY_PROJECT_CODE_HEADER} from './constants';

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {{}}
 */
let codePropC = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
let codeXml = null;


/**
 * Prop c code editor implementing the Ace package
 */
class CodeEditor {
  /**
   *
   * @param {string} boardType
   */
  constructor(boardType) {
    if (!codePropC) {
      codePropC = ace.edit('code-propc');
      codePropC.setTheme('ace/theme/chrome');
      codePropC.getSession().setMode('ace/mode/c_cpp');
      codePropC.getSession().setTabSize(2);
      codePropC.$blockScrolling = Infinity;
      codePropC.setReadOnly(true);

      // if the project is a propc code-only project, enable code editing.
      if (boardType === 'propcfile') {
        codePropC.setReadOnly(false);
      }
    }

    if (!codeXml && isExperimental.indexOf('xedit') > -1) {
      codeXml = ace.edit('code-xml');
      codeXml.setTheme('ace/theme/chrome');
      codeXml.getSession().setMode('ace/mode/xml');
    }
  }

  /**
   * Ace editor Undo command
   */
  undo() {
    codePropC.undo();
  }


  /**
   * Ace editor Redo command
   */
  redo() {
    codePropC.redo();
  }
}


/**
 * Covert C source code into a Blockly block
 *
 * @return {string} An XML representation of the source code.
 */
function propcAsBlocksXml() {
  let code = EMPTY_PROJECT_CODE_HEADER;
  code += '<block type="propc_file" id="' +
      generateBlockId(codePropC ?
          codePropC.getValue() : 'thequickbrownfoxjumpedoverthelazydog') +
      '" x="100" y="100">';

  code += '<field name="FILENAME">single.c</field>';
  code += '<field name="CODE">';

  if (codePropC) {
    code += btoa(codePropC.getValue().replace('/* EMPTY_PROJECT */\n', ''));
  }

  code += '</field></block></xml>';
  return code;
}


/**
 * Generate a unique block ID
 *
 * @param {string} nonce is an entropy string
 * @return {string}
 */
function generateBlockId(nonce) {
  let blockId = btoa(nonce).replace(/=/g, '');
  const l = blockId.length;

  if (l < 20) {
    blockId = 'zzzzzzzzzzzzzzzzzzzz'.substr(l - 20) + blockId;
  } else {
    blockId = blockId.substr(l - 20);
  }

  return blockId;
}


export {CodeEditor, propcAsBlocksXml};
