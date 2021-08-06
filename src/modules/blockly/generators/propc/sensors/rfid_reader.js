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

//
// ------------------ RFID Reader Blocks --------------------
//

/**
 * RFID Enable
 */
Blockly.Blocks.rfid_enable = {
  helpUrl: Blockly.MSG_RFID_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_RFID_ENABLE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    // Prepare the Pn dropdown list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  /**
   * Rebuild the pin assignment drop down lists
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue = '', newValue = '') {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('PIN_IN');
    const m2 = this.getFieldValue('PIN_OUT');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('RFID initialize EN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))), 'PIN_IN')
        .appendField('SOUT')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))), 'PIN_OUT');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'PIN_IN');
    } else if (m1) {
      this.setFieldValue(m1, 'PIN_IN');
    }

    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'PIN_OUT');
    } else if (m2) {
      this.setFieldValue(m2, 'PIN_OUT');
    }
  },
};

/**
 * RFID Enable C code generator
 * @return {string}
 */
Blockly.propc.rfid_enable = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    let pinIN = this.getFieldValue('PIN_IN');
    let pinOUT = this.getFieldValue('PIN_OUT');

    if (profile.digital.toString().indexOf(pinIN + ',' + pinIN) === -1) {
      pinIN = 'MY_' + pinIN;
    }
    if (profile.digital.toString().indexOf(pinOUT + ',' + pinOUT) === -1) {
      pinOUT = 'MY_' + pinOUT;
    }

    Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    Blockly.propc.global_vars_['rfidser'] = 'rfidser *rfid;';
    Blockly.propc.setups_['rfidser_setup'] = 'rfid = rfid_open(' +
        pinOUT + ',' + pinIN + ');';
  }
  return '';
};

/**
 * RFID Read block
 */
Blockly.Blocks.rfid_get = {
  helpUrl: Blockly.MSG_RFID_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_RFID_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('RFID store reading in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'BUFFER');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('rfid_enable')) {
      this.setWarningText('WARNING: You must use an RFID\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.rfid_get = function() {
  if (!verifyBlockTypeEnabled('rfid_enable')) {
    return '// ERROR: Missing RFID initialize block!';
  } else {
    const saveVariable = Blockly.propc.variableDB_.getName(
        this.getFieldValue('BUFFER'),
        Blockly.VARIABLE_CATEGORY_NAME);

    if (!this.disabled) {
      Blockly.propc.global_vars_['rfid_buffer'] = 'char *rfidBfr;';
      Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    }
    return 'rfidBfr = rfid_get(rfid, 500);\nsscan(&rfidBfr[2], "%x", &' +
        saveVariable + ');\nif(' + saveVariable + ' == 237) ' +
        saveVariable + ' = 0;';
  }
};

/**
 * Disable the RFID reader
 */
Blockly.Blocks.rfid_disable = {
  helpUrl: Blockly.MSG_RFID_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_RFID_DISABLE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('RFID')
        .appendField(new Blockly.FieldDropdown([
          ['disable', 'DISABLE'],
          ['enable', 'ENABLE'],
        ]), 'ACTION');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('rfid_enable')) {
      this.setWarningText('WARNING: You must use an RFID\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.rfid_disable = function() {
  if (!verifyBlockTypeEnabled('rfid_enable')) {
    return '// ERROR: Missing RFID initialize block!';
  } else {
    const data = this.getFieldValue('ACTION');
    if (!this.disabled) {
      Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    }
    if (data === 'ENABLE') {
      return 'rfid_enable(rfid);';
    } else {
      return 'rfid_disable(rfid);';
    }
  }
};

/**
 * Close the connection to the RFID reader
 */
Blockly.Blocks.rfid_close = {
  helpUrl: Blockly.MSG_RFID_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_RFID_CLOSE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('RFID close');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('rfid_enable')) {
      this.setWarningText('WARNING: You must use an RFID\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.rfid_close = function() {
  if (!verifyBlockTypeEnabled('rfid_enable')) {
    return '// ERROR: Missing RFID initialize block!';
  } else {
    if (!this.disabled) {
      Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    }
    return 'rfidser_close(rfid);\n';
  }
};
