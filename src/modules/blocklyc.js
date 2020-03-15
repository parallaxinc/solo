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
 * Initialize Blockly
 *
 * Called on page load. Loads a Blockly project onto the editor pallet
 *
 * @param {!Blockly} blockly Instance of Blockly from iframe.
 */
function init(blockly) {
  if (!codePropC) {
    codePropC = ace.edit("code-propc");
    codePropC.setTheme("ace/theme/chrome");
    codePropC.getSession().setMode("ace/mode/c_cpp");
    codePropC.getSession().setTabSize(2);
    codePropC.$blockScrolling = Infinity;
    codePropC.setReadOnly(true);

    // if the project is a propc code-only project, enable code editing.
    if (projectData.board === 'propcfile') {
      codePropC.setReadOnly(false);
    }
  }

  if (!codeXml && isExperimental.indexOf('xedit') > -1) {
    codeXml = ace.edit("code-xml");
    codeXml.setTheme("ace/theme/chrome");
    codeXml.getSession().setMode("ace/mode/xml");
  }

  window.Blockly = blockly;

  // TODO: Replace string length check with code that detects the first <block> xml element.
  if (projectData) {
    // Looking for the first <block> XML element
    const searchTerm = '<block';

    if (!projectData.code || projectData.code.indexOf(searchTerm) < 0) {
      projectData.code = EMPTY_PROJECT_CODE_HEADER + '</xml>';
    }
    if (projectData.board !== 'propcfile') {
      loadToolbox(projectData.code);
    }
  }
}
