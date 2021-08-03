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
import {colorPalette} from '../../propc';
import {buildConstantsList, verifyBlockTypeEnabled} from './sensors_common';
import {getDefaultProfile} from '../../../../project';

/**
 * FP Scanner Initialization
 */
Blockly.Blocks.fp_scanner_init = {
  helpUrl: Blockly.MSG_FPS_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_FPS_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    // Populate the drop down pin list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  /**
   * Handle event where a constant value is changed
   * @param {Blockly.Events.Abstract} event
   *
   * @description
   * This method reacts to changes in the list of user-defined constants in
   * the project. When a change to an element in this list occurs, evaluate
   * the old value to see if it is in this object's list of known constants.
   * If changing constant is used, reset the pin list to replace the old
   * constant name with the new one.
   */
  onchange: function(event) {
    if (event.type === 'change' && event.name === 'CONSTANT_NAME') {
      // Change only if the selected pin is the named constant that is changing
      if (this.getFieldValue('PIN') === event.oldValue) {
        const index = this.userDefinedConstantsList_.indexOf(event.oldValue);
        if (index !== -1) {
          this.userDefinedConstantsList_[index] = event.newValue;
          this.setPinMenus(event.oldValue, event.newValue);
        }
      }
    }
  },

  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('RXPIN');
    const m2 = this.getFieldValue('TXPIN');

    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput()
        .appendField('Fingerprint Scanner initialize RX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_
                .map(function(value) {
                  return [value, value];
                }))), 'RXPIN')
        .appendField('TX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_
                .map(function(value) {
                  return [value, value];
                }))), 'TXPIN');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'RXPIN');
    } else if (m1) {
      this.setFieldValue(m1, 'RXPIN');
    }

    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'TXPIN');
    } else if (m2) {
      this.setFieldValue(m2, 'TXPIN');
    }
  },
};

/**
 * FP Scanner Initialization C code generator
 * @return {string}
 * @description This function adds data to several arrays that will be used
 * later to assemble the #include file, a global pointer to the fingerprint
 * scanner data structure and some code to initialize the pointer.
 *
 * Solo-#410
 * We are returning an empty string because code generators are required to
 * return a string, even if it is an empty one.
 */
Blockly.propc.fp_scanner_init = function() {
  if (this.disabled) {
    return '';
  }

  const profile = getDefaultProfile();
  let rxPin = this.getFieldValue('RXPIN');
  let txPin = this.getFieldValue('TXPIN');

  if (profile.digital.toString().indexOf(rxPin + ',' + rxPin) === -1) {
    rxPin = `MY_${rxPin}`;
  }
  if (profile.digital.toString().indexOf(txPin + ',' + txPin) === -1) {
    txPin = `MY_${txPin}`;
  }

  // Set up the fpScanner global variable, include file and init setup code
  Blockly.propc.global_vars_['fpScannerObj'] = 'fpScanner *fpScan;';
  Blockly.propc.definitions_['fpScannerDef'] = '#include "fingerprint.h"';
  Blockly.propc.setups_['fpScanner'] =
      `fpScan = fingerprint_open(${txPin}, ${rxPin});`;

  return ''; // Because we have to return a string
};

/**
 * Add user finger print block
 *
 */
Blockly.Blocks.fp_scanner_add = {
  helpUrl: Blockly.MSG_FPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_FPS_ADD_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Fingerprint Scanner')
        .appendField(new Blockly.FieldDropdown([
          ['capture and save to', 'ADD'],
          ['delete capture for', 'DEL'],
          ['delete all captures', 'ALL'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setAction_({'ACTION': action});
        }), 'ACTION');
    this.appendValueInput('USER')
        .setCheck('Number')
        .appendField('ID');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('ACTION');
    container.setAttribute('action', action);
    return container;
  },

  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setAction_({'ACTION': action});
  },

  setAction_: function(details) {
    const inputIs = this.getInput('USER');
    if (details['ACTION'] !== 'ALL') {
      if (!inputIs) {
        this.appendValueInput('USER')
            .setCheck('Number')
            .appendField('ID');
      }
    } else {
      if (inputIs) {
        this.removeInput('USER');
      }
    }
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('fp_scanner_init')) {
      this.setWarningText('WARNING: You must use a Fingerprint' +
          ' Scanner\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * Generate C source code for fingerprint scanner add block
 * @return {string}
 */
Blockly.propc.fp_scanner_add = function() {
  const act = this.getFieldValue('ACTION');
  let usr = '1';

  if (act !== 'ALL') {
    usr = Blockly.propc.valueToCode(this, 'USER', Blockly.propc.ORDER_NONE) || '1';
  }

  if (!verifyBlockTypeEnabled('fp_scanner_init')) {
    return '// ERROR: Fingerprint Scanner is not initialized!\n';
  }

  if (act === 'ADD') {
    return 'fingerprint_add(fpScan, ' + usr + ', 3, 0);\n';
  }

  if (act === 'DEL') {
    return 'fingerprint_deleteUser(fpScan, ' + usr + ');\n';
  }

  if (act === 'ALL') {
    return 'fingerprint_deleteUser(fpScan, 0);\n';
  }

  return `// Finger print scanner add - unknown action.\n `;
};

/**
 * Fingerprint scanner block
 */
Blockly.Blocks.fp_scanner_scan = {
  helpUrl: Blockly.MSG_FPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_FPS_SCAN_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Fingerprint Scanner')
        .appendField(new Blockly.FieldDropdown([
          ['scan and identify', 'SCAN'],
          ['scan and compare', 'COMP'],
          ['count number of IDs', 'COUNT'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setAction_({'ACTION': action});
        }), 'ACTION');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('ACTION');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setAction_({'ACTION': action});
  },
  setAction_: function(details) {
    const inputIs = this.getInput('USER');
    if (details['ACTION'] === 'COMP') {
      if (!inputIs) {
        this.appendValueInput('USER')
            .setCheck('Number')
            .appendField('to ID');
      }
    } else {
      if (inputIs) {
        this.removeInput('USER');
      }
    }
  },
  onchange: function() {
    if (!verifyBlockTypeEnabled('fp_scanner_init')) {
      this.setWarningText('WARNING: You must use a Fingerprint' +
          ' Scanner\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * Generate C source code for fingerprint scanner block
 * @return {string|[string, number]}
 */
Blockly.propc.fp_scanner_scan = function() {
  const act = this.getFieldValue('ACTION');
  let usr = '1';
  if (act === 'COMP') {
    usr = Blockly.propc.valueToCode(this, 'USER', Blockly.propc.ORDER_NONE) || '1';
  }

  // Embed a function in the emitted code
  let func = '\n// Scan finger input\nint fingerScanner(int __u) {\n';
  func += '  int r;\n  fingerprint_scan(fpScan, __u, &r);\n';
  func += '  return (__u != 0 && r != 0) ? 1 : r;\n}\n';

  let code = '0';

  if (Blockly.propc.global_vars_['fpScannerObj'] === 'fpScanner *fpScan;') {
    if (act === 'SCAN') {
      Blockly.propc.global_vars_['fpScannerFunc'] = func;
      code = 'fingerScanner(0)';
    }
    if (act === 'COMP') {
      Blockly.propc.global_vars_['fpScannerFunc'] = func;
      code = 'fingerScanner(' + usr + ')';
    }
    if (act === 'COUNT') {
      code = 'fingerprint_countUsers(fpScan)';
    }
  }
  if (!verifyBlockTypeEnabled('fp_scanner_init')) {
    return ['// ERROR: Fingerprint Scanner is not initialized!\n', Blockly.propc.ORDER_ATOMIC];
  }

  return [code, Blockly.propc.ORDER_ATOMIC];
};
