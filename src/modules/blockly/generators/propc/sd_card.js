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
import {getDefaultProfile, getProjectInitialState} from '../../../project';
import {colorPalette} from '../propc';


/**
 * SD Card Initialization
 * @type {{
 *  init: Blockly.Blocks.sd_init.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.sd_init = {
  helpUrl: Blockly.MSG_SD_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SD_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.appendDummyInput()
        .appendField('SD initialize DO')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'DO')
        .appendField('CLK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'CLK')
        .appendField('DI')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'DI')
        .appendField('CS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'CS'),
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 * Generate source code for the sd_init block.
 * This creates a global file pointer.
 *
 * @return {string}
 */
Blockly.propc.sd_init = function() {
  // Global variable for SD file processing
  this.myType = 'fp';

  if (!this.disabled) {
    Blockly.propc.setups_['sd_card'] = 'sd_mount(' +
        this.getFieldValue('DO') + ', ' +
        this.getFieldValue('CLK') + ', ' +
        this.getFieldValue('DI') + ', ' +
        this.getFieldValue('CS') + ');';

    // Declare the global variable
    Blockly.propc.global_vars_[
        this.myType + 'global'] = 'FILE *' + this.myType + ';';
  }

  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sd_open.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.sd_open.onchange
 * }}
 */
Blockly.Blocks.sd_open = {
  helpUrl: Blockly.MSG_SD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SD_OPEN_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.appendDummyInput('MODE')
        .appendField('SD file open')
        .appendField(new Blockly.FieldTextInput(
            'filename.txt',
            function(filename) {
              filename = filename.replace(/[^A-Z0-9a-z_.]/g, '').toLowerCase();
              const filenamePart = filename.split('.');
              if (filenamePart[0].length > 8) {
                filenamePart[0].length = 8;
              }
              if (!filenamePart[1]) {
                filenamePart[1] = 'TXT';
              } else if (filenamePart[1].length > 3) {
                filenamePart[1].length = 3;
              }
              return filenamePart[0] + '.' + filenamePart[1];
            }), 'FILENAME')
        .appendField(new Blockly.FieldDropdown([
          ['as read-only', 'r'],
          ['as read-write', 'w'],
        ]), 'MODE');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  /**
   * Check for an active sd_init block in the project. The block must exist
   * and not be disabled.
   */
  onchange: function() {
    const project = getProjectInitialState();
    if (project.boardType.name !== 'activity-board' &&
        project.boardType.name !== 'heb-wx') {
      const block = Blockly.getMainWorkspace().getBlocksByType(
          'sd_init', false);
      if (block.length === 0 || ! block[0].isEnabled()) {
        this.setWarningText('WARNING: You must use a SD' +
            ' initialize\nblock at the beginning of your program!');
      } else {
        this.setWarningText(null);
      }
    }
  },
};

/**
 * SD Card Open C code generator
 * @return {string}
 */
Blockly.propc.sd_open = function() {
  const initSdBlock = Blockly.getMainWorkspace().getBlocksByType(
      'sd_init', false);
  if (initSdBlock.length === 0 || !initSdBlock[0].isEnabled()) {
    const project = getProjectInitialState();
    if (project.boardType.name !== 'activity-board' &&
        project.boardType.name !== 'heb-wx') {
      return '/** WARNING: You must use a SD initialize block at the' +
          ' beginning of your program! **/\r';
    } else {
      // Quietly mount the sd card filesystem
      setupSdCard();
    }
  }

  const filename = this.getFieldValue('FILENAME');
  const mode = this.getFieldValue('MODE');
  return `fp = fopen("${filename}","${mode}");\r`;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sd_read.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  setSdMode: Blockly.Blocks.sd_read.setSdMode,
 *  onchange: Blockly.Blocks.sd_read.onchange,
 *  domToMutation: Blockly.Blocks.sd_read.domToMutation
 * }}
 */
Blockly.Blocks.sd_read = {
  helpUrl: Blockly.MSG_SD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SD_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.setSdMode('fwrite');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('mode', this.getFieldValue('MODE'));
    return container;
  },
  domToMutation: function(container) {
    const mode = container.getAttribute('mode');
    if (mode) {
      this.setFieldValue(mode, 'MODE');
    }
    this.setSdMode(mode);
  },
  setSdMode: function(mode) {
    let connectedBlock = null;

    if (this.getInput('SIZE')) {
      const valueConnection = this.getInput('SIZE').connection;
      if (valueConnection) {
        connectedBlock = valueConnection.targetBlock();
      }
      this.removeInput('SIZE');
    }
    if (this.getInput('VALUE')) {
      this.removeInput('VALUE');
    }
    if (mode === 'fwrite') {
      // Ensure that the field only receives numeric data
      this.appendValueInput('SIZE')
          .setCheck('Number')
          .appendField('SD file')
          .appendField(new Blockly.FieldDropdown([
            ['write', 'fwrite'],
            ['read', 'fread'],
            ['close', 'fclose'],
          ], function(mode) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setSdMode(mode);
          }), 'MODE');
      this.appendValueInput('VALUE')
          .setCheck('String')
          .appendField('bytes of');
    } else if (mode === 'fread') {
      this.appendValueInput('SIZE')
          .setCheck('Number')
          .appendField('SD file')
          .appendField(new Blockly.FieldDropdown([
            ['read', 'fread'],
            ['write', 'fwrite'],
            ['close', 'fclose'],
          ], function(mode) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setSdMode(mode);
          }), 'MODE');
      this.appendDummyInput('VALUE')
          .appendField('bytes  store in')
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_SET_ITEM), 'VAR');
    } else {
      this.appendDummyInput('SIZE')
          .appendField('SD file')
          .appendField(new Blockly.FieldDropdown([
            ['close', 'fclose'],
            ['read', 'fread'],
            ['write', 'fwrite'],
          ], function(mode) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setSdMode(mode);
          }), 'MODE');
    }
    if (connectedBlock) {
      connectedBlock.outputConnection.connect(this.getInput('SIZE').connection);
    }
  },
  onchange: function(event) {
    const project = getProjectInitialState();
    if (event.type === Blockly.Events.BLOCK_DELETE ||
        event.type === Blockly.Events.BLOCK_CREATE) {
      let warnTxt = null;
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
      if (allBlocks.indexOf('SD file open') === -1) {
        warnTxt = 'WARNING: You must use a SD file open block\nbefore' +
            ' reading, writing, or closing an SD file!';
      } else if (allBlocks.indexOf('SD initialize') === -1 &&
          project.boardType.name !== 'heb-wx' &&
          project.boardType.name !== 'activity-board') {
        warnTxt = 'WARNING: You must use a SD initialize\nblock at the' +
            ' beginning of your program!';
      }
      this.setWarningText(warnTxt);
    }
  },
};

/**
 * SD Card Read/Write/Close C code generator
 *
 * Generate code to read from an sd card, write to an sd card or to close a
 * connection to the sd card reader.
 *
 * @return {string}
 */
Blockly.propc.sd_read = function() {
  // Identify the block action (fread, fwrite, or fclose)
  const mode = this.getFieldValue('MODE');

  // Handle close stright away
  if (mode === 'fclose') {
    return `  if(fp) ${mode}(fp);\r`;
  }

  // Verify the required SD-Open block is in the project
  const block = Blockly.getMainWorkspace().getBlocksByType(
      'sd_open', false);

  if ( block.length === 0 || (!block[0].isEnabled())) {
    return '// WARNING: You must use a SD file open block before reading,' +
        ' writing, or closing an SD file!\r';
  }

  /**
   *  Verify that for boards that do not have a built-in card reader, there is
   *  an sd_init block in the project
   */
  const project = getProjectInitialState();
  let initFound = false;

  const initSdBlock = Blockly.getMainWorkspace().getBlocksByType(
      'sd_init', false);
  if (initSdBlock.length > 0 && initSdBlock[0].isEnabled()) {
    initFound = true;
  }

  if (project.boardType.name !== 'heb-wx' &&
      project.boardType.name !== 'activity-board' &&
      ! initFound) {
    return '/** WARNING: You must use a SD initialize block at the' +
        ' beginning of your program! **/\r';
  }

  // Silently mount the embedded sd card device
  if (!this.disabled && !initFound) {
    setupSdCard();
  }

  // Retrieve the number of bytes to read/write. Default to one byte
  const size = Blockly.propc.valueToCode(
      this, 'SIZE', Blockly.propc.ORDER_NONE) || '1';

  // Retrieve the data buffer or variable
  let value = '';
  if (mode === 'fread') {
    value = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    value = '&' + value;
    Blockly.propc.vartype_[value] = 'char *';
  } else if (mode === 'fwrite') {
    value = Blockly.propc.valueToCode(
        this, 'VALUE', Blockly.propc.ORDER_NONE) || '';
  }

  return `  ${mode}(${value}, 1, ${size}, fp);\r`;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sd_file_pointer.init,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  setSdMode: Blockly.Blocks.sd_file_pointer.setSdMode,
 *  onchange: *,
 *  domToMutation: *
 * }}
 */
Blockly.Blocks.sd_file_pointer = {
  helpUrl: Blockly.MSG_SD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SD_FILE_POINTER_TOOLTIP);
    this.setColour(colorPalette.getColor('output'));
    this.setSdMode('set');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: Blockly.Blocks['sd_read'].mutationToDom,
  domToMutation: Blockly.Blocks['sd_read'].domToMutation,
  setSdMode: function(mode) {
    if (this.getInput('FP')) {
      this.removeInput('FP');
    }
    if (mode === 'set') {
      this.appendValueInput('FP')
          .setCheck('Number')
          .appendField('SD file')
          .appendField(new Blockly.FieldDropdown([
            ['set', 'set'],
            ['get', 'get'],
          ], function(blockMode) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setSdMode(blockMode);
          }), 'MODE')
          .appendField('pointer = ');
      this.setOutput(false);
      this.setPreviousStatement(true, 'Block');
      this.setNextStatement(true, null);
    } else {
      // mode == get
      this.appendDummyInput('FP');
      this.getInput('FP')
          .appendField('SD file')
          .appendField(new Blockly.FieldDropdown([
            ['get', 'get'],
            ['set', 'set'],
          ], function(blockMode) {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setSdMode(blockMode);
          }), 'MODE')
          .appendField('pointer');

      this.setPreviousStatement(false);
      this.setNextStatement(false, null);
      this.setOutput(true, 'Number');
    }
  },
  onchange: Blockly.Blocks['sd_read'].onchange,
};

/**
 * SD Card File Pointer
 * @return {(string|number)[]|string}
 */
Blockly.propc.sd_file_pointer = function() {
  const project = getProjectInitialState();
  // TODO: Refactor getAllBlocks to getAllBlocksByType
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  let code = null;
  let initFound = false;
  for (let x = 0; x < allBlocks.length; x++) {
    if (allBlocks[x].type === 'sd_init') {
      initFound = true;
    }
  }

  // Quietly install setup code
  if (!this.disabled && !initFound) {
    setupSdCard();
  }

  if (allBlocks.indexOf('SD file open') === -1) {
    return '// WARNING: You must use a SD file open block before' +
           ' using the file pointer!';
  }
  if (allBlocks.indexOf('SD initialize') === -1 &&
      project.boardType.name !== 'heb-wx' &&
      project.boardType.name !== 'activity-board') {
    return '// WARNING: You must use a SD initialize block at the' +
           ' beginning of your program!';
  }

  if (this.getFieldValue('MODE') === 'set') {
    // Set pointer
    const fp = Blockly.propc.valueToCode(
        this, 'FP', Blockly.propc.ORDER_NONE) || '0';
    code = 'fp = ' + fp + ';\r';
    //  fseek(fp, item, SEEK_CUR)
    // code = `fp = (FILE*) fseek(${fp}, item, SEEK_CUR);\r`;
  } else {
    // Get pointer
    code = ['ftell(fp);', Blockly.propc.ORDER_ATOMIC];
  }

  return code;
};


/**
 * Mount SD Card
 */
function setupSdCard() {
  const profile = getDefaultProfile();
  if (profile.sd_card) {
    Blockly.propc.setups_['sd_card'] = 'sd_mount(' + profile.sd_card + ');';
    Blockly.propc.global_vars_['fpglobal'] = 'FILE *fp;';
  }
}
