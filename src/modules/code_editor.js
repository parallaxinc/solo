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

// import * as ace from 'ace-builds/src-noconflict/ace.js';
// Load Ace Editor
import 'ace-builds/src-min-noconflict/ace';

// Import initial theme and mode so we don't have to wait
// for 2 extra HTTP requests
import 'ace-builds/src-min-noconflict/theme-chrome';
import 'ace-builds/src-min-noconflict/mode-javascript';

import {isExperimental} from './url_parameters';
import {Project} from './project';

/**
 *
 * @type {AceAjax.Editor | null}
 */
let cSourceCode = null;

/**
 * Ace Editor XML code representation
 * @type {AceAjax.Editor | null}
 */
let cXmlCode = null;

/**
 * Prop c code editor implementing the Ace package
 */
export class CodeEditor {
  /**
   * Create a new CodeEditor instance object
   * @param {string} boardType
   */
  constructor(boardType) {
    if (!cSourceCode) {
      // cdnjs didn't have a "no-conflict" version, so we'll use jsdelivr
      const CDN = 'https://cdn.jsdelivr.net/npm/ace-builds@1.3.3/src-min-noconflict';

      // Now we tell ace to use the CDN locations to look for files
      ace.config.set('basePath', CDN);

      // Link to the div in blocklyc.html
      const code = ace.edit('code-propc');
      code.setTheme('ace/theme/chrome');
      code.getSession().setMode('ace/mode/c_cpp');
      code.getSession().setTabSize(2);
      code.$blockScrolling = Infinity;
      code.setReadOnly(true);

      // if the project is a propc code-only project, enable code editing.
      if (boardType === 'propcfile') {
        code.setReadOnly(false);
      }
      cSourceCode = code;
    }

    if (!cXmlCode && isExperimental.indexOf('xedit') > -1) {
      const xmlCode = ace.edit('code-xml');
      xmlCode.setTheme('ace/theme/chrome');
      xmlCode.getSession().setMode('ace/mode/xml');
      cXmlCode = xmlCode;
    }
  }

  /**
   * Ace editor Undo command
   */
  undo() {
    cSourceCode.undo();
  }

  /**
   * Ace editor Redo command
   */
  redo() {
    cSourceCode.redo();
  }

  /**
   * Search for a matching element
   * @param {string} needle
   * @param {Object} options
   * @param {boolean} isAnimated
   */
  find(needle, options, isAnimated) {
    cSourceCode.find(needle, options, isAnimated);
  }

  /**
   * Replace the selected text with the replacement text
   * @param {string} source
   * @param {string} replacement
   * @param {Object} options
   */
  replace(source, replacement, options) {
    cSourceCode.replace(replacement, options);
  }
}

/**
 * Covert C source code into a Blockly block
 *
 * @return {string} An XML representation of the source code.
 */
export function propcAsBlocksXml() {
  let code = Project.getEmptyProjectCodeHeader();
  const codePropC = window.codePropC;
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
 * Return the active Ace code editor instance
 * @return {AceAjax.Editor}
 */
export function getSourceEditor() {
  return cSourceCode;
}

/**
 * Return the active Ace editor instance for the project XML
 * @return {AceAjax.Editor}
 */
export function getXmlCode() {
  return cXmlCode;
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

/**
 * Set the global codePropC variable
 * @param {Object} value
 * @deprecated - do not use!
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function setPropCCode(value) {
  window.codePropC = value;
}
