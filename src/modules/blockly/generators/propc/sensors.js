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
 * @fileoverview Generating C for sensor blocks
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */
'use strict';

import Blockly from 'blockly/core';
import {colorPalette} from '../propc.js';
import {getDefaultProfile} from '../../../project';
import {buildConstantsList, verifyBlockTypeEnabled} from './sensors/sensors_common';

// ---------------- Sound Impact Sensor Blocks -----------------------

/**
 * Sound Impact Run
 *
 * @type {{
 *  init: Blockly.Blocks.sound_impact_run.init,
 *  setPinMenus: Blockly.Blocks.sound_impact_run.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: Blockly.Blocks.sound_impact_run.updateConstMenu
 *  }}
 */
Blockly.Blocks.sound_impact_run = {
  helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,

  /**
   * Initialize the Sound Impact block
   */
  init: function() {
    this.setTooltip(Blockly.MSG_SOUND_IMPACT_RUN_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');

    // Prepare the Pn dropdown list
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

  /**
   * Reload the Pin dropdown user input
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue = '', newValue = '') {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('PIN');

    // Remove Pins dropdown if it is already defined.
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }

    // Recreate the Pins dropdown control
    this.appendDummyInput('PINS')
        .appendField('Sound Impact initialize PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))),
        'PIN');

    // Restore the selected pin value or use the new value if one is provided
    if (m1 && m1 === oldValue && newValue.length > 0) {
      this.setFieldValue(newValue, 'PIN');
    } else if (m1) {
      this.setFieldValue(m1, 'PIN');
    }
  },

  /**
   * Update the Constants menu
   *
   * @param {string} oldValue
   * @param {string} newValue
   * @deprecated
   */
  updateConstMenu: function(oldValue, newValue) {
    const BLOCK_TYPE = 'constant_define';

    /**
     * User-defind constants list
     * @type {*[]}
     * @private
     */
    this.userDefinedConstantsList_ = [];

    const allBlocks = Blockly.getMainWorkspace().getBlocksByType(BLOCK_TYPE, false);
    for (let x = 0; x < allBlocks.length; x++) {
      let vName = allBlocks[x].getFieldValue('CONSTANT_NAME');
      if (vName === oldValue && newValue) {
        vName = newValue;
      }
      if (vName) {
        this.userDefinedConstantsList_.push(vName);
      }
    }
    this.userDefinedConstantsList_ = this.userDefinedConstantsList_.sortedUnique();
    this.setPinMenus(oldValue, newValue);
  },
};

/**
 * Sound Impact Run C code generator
 * @return {string}
 */
Blockly.propc.sound_impact_run = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();

    let pin = this.getFieldValue('PIN');
    if (profile.digital.toString().indexOf(pin + ',' + pin) === -1) {
      pin = 'MY_' + pin;
    }
    Blockly.propc.definitions_['sound_impact'] = '#include "soundimpact.h"';
    Blockly.propc.setups_['sound_impact'] =
        'int *__soundimpactcog = soundImpact_run(' + pin + ');';
  }

  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sound_impact_get.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.sound_impact_get.onchange
 * }}
 */
Blockly.Blocks.sound_impact_get = {
  helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_SOUND_IMPACT_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Sound Impact get count');
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('sound_impact_run')) {
      this.setWarningText('WARNING: You must use a sound impact' +
          ' sensor\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * Sound Impact Get C code generator
 *
 * @return {string|[string, number]}
 */
Blockly.propc.sound_impact_get = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Sound Impact initialize') === -1) {
    return '// ERROR: Missing sound impact sensor initialize block!';
  } else {
    return ['soundImpact_getCount()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sound_impact_end.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.sound_impact_end.onchange
 * }}
 */
Blockly.Blocks.sound_impact_end = {
  helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_SOUND_IMPACT_END_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Sound Impact close');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },

  onchange: function() {
    if (!verifyBlockTypeEnabled('sound_impact_run')) {
      this.setWarningText('WARNING: You must use a sound impact' +
          ' sensor\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.sound_impact_end = function() {
  if (!verifyBlockTypeEnabled('sound_impact_run')) {
    return '// ERROR: Missing sound impact sensor initialize block!';
  } else {
    return 'soundImpact_end(__soundimpactcog);\n';
  }
};


//
//
//
//
// ------------------ RFID Reader Blocks --------------------
//
//
//
//

/**
 *
 * @type {{
 *  init: Blockly.Blocks.rfid_get.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.rfid_get.onchange
 *  }}
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1) {
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
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('RFID initialize') === -1) {
    return '// ERROR: Missing RFID initalize block!';
  } else {
    const saveVariable = Blockly.propc.variableDB_.getName(
        this.getFieldValue('BUFFER'),
        Blockly.VARIABLE_CATEGORY_NAME);

    if (!this.disabled) {
      Blockly.propc.global_vars_['rfid_buffer'] = 'char *rfidBfr;';
      Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    }
    return 'rfidBfr = rfid_get(rfid, 500);\n\tsscan(&rfidBfr[2], "%x", &' +
        saveVariable + ');\n\tif(' + saveVariable + ' == 237) ' +
        saveVariable + ' = 0;';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.rfid_disable.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.rfid_disable.onchange
 *  }}
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1) {
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
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('RFID initialize') === -1) {
    return '// ERROR: Missing RFID initalize block!';
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
 * RFID Enable
 * @type {{
 *  init: Blockly.Blocks.rfid_enable.init,
 *  setPinMenus: Blockly.Blocks.rfid_enable.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
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
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
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
 *
 * @type {{
 *  init: Blockly.Blocks.rfid_close.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.rfid_close.onchange
 *  }}
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1) {
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
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('RFID initialize') === -1) {
    return '// ERROR: Missing RFID initalize block!';
  } else {
    if (!this.disabled) {
      Blockly.propc.definitions_['rfidser'] = '#include "rfidser.h"';
    }
    return 'rfidser_close(rfid);\n';
  }
};


// ------------------ 4x4 Keypad Blocks ----------------------------------------
/**
 * Keypad Initialization
 * @type {{
 *  init: Blockly.Blocks.keypad_initialize.init,
 *  setPinMenus: Blockly.Blocks.keypad_initialize.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.keypad_initialize = {
  helpUrl: Blockly.MSG_KEYPAD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_KEYPAD_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },

  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,

  /**
   * This is a called from within the updateConstMenu method.
   *
   * @description This method is called as a finalizer in the updateConstMenu() call. This
   * call is by reference to the method defined in the 'sound_impact_run' block. That method
   * calls setPinMenus with no parameters, which basically renders this method useless.
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m = [];
    for (let i = 0; i < 8; i++) {
      m[i] = this.getFieldValue('P' + i.toString(10));
    }
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    const pinConstantList = this.userDefinedConstantsList_.map(function(value) {
      return [value, value];
    });
    this.appendDummyInput('PINS')
        .appendField('4x4 Keypad initialize PINS left')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P0')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P1')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P2')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P3')
        .appendField('|')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P4')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P5')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P6')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'P7')
        .appendField('right');
    for (let i = 0; i < 8; i++) {
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, 'P' + i.toString(10));
      } else if (m[i]) {
        this.setFieldValue(m[i], 'P' + i.toString(10));
      }
    }
  },
};


/**
 * Keypad Initialization C code generator
 * @return {string}
 */
Blockly.propc.keypad_initialize = function() {
  if (!this.disabled) {
    const profile = getDefaultProfile();
    const kp = [];
    for (let k = 0; k < 8; k++) {
      kp[k] = this.getFieldValue('P' + k);
      if (profile.digital.toString().indexOf(kp[k] + ',' + kp[k]) === -1) {
        kp[k] = 'MY_' + kp[k];
      }
    }
    let keypadVars = 'int __rowPins[] = {' + kp[0] + ', ' + kp[1] + ', ' +
        kp[2] + ', ' + kp[3] + '};\n';
    keypadVars += 'int __colPins[] = {' + kp[4] + ', ' + kp[5] + ', ' +
        kp[6] + ', ' + kp[7] + '};\n';
    keypadVars += 'int __buttonVals[] = {1, 2, 3, \'A\', 4, 5, 6, \'B\', 7,' +
        ' 8, 9, \'C\', \'*\', 0, \'#\', \'D\'};\n';
    Blockly.propc.definitions_['keypad_lib'] = '#include "keypad.h"';
    Blockly.propc.global_vars_['keypad_pins'] = keypadVars;
    Blockly.propc.setups_['keypad_init'] =
        'keypad_setup(4, 4, __rowPins, __colPins, __buttonVals);';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.keypad_read.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.keypad_read = {
  helpUrl: Blockly.MSG_KEYPAD_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_KEYPAD_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('4x4 Keypad');
    this.setOutput(true, null);
  },
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.keypad_read = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Keypad initialize') === -1) {
    return '// ERROR: Missing Keypad initialize block!';
  } else {
    return ['keypad_read()', Blockly.propc.ORDER_ATOMIC];
  }
};

// ------------------ BME680 Air Quality Sensor -----------------------------

/**
 * BME680 gas sensor Initialization
 *
 * @description This block sets the pin assignments for the sensor and calls an
 * SPI init function in the library.
 *
 * NOTE: The block is a SINGLETON but is not implemented as one. If there are
 * multiple init blocks in the project, the last one declared will be the one
 * that provides the pin settings.
 *
 * @type {{
 *  init: Blockly.Blocks.bme680_init.init,
 *  setPinMenus: Blockly.Blocks.bme680_init.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.bme680_init = {
  helpUrl: Blockly.MSG_BME680_HELPURL,

  init: function() {
    this.setTooltip(Blockly.MSG_BME680_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
    this.updateConstMenu();
  },

  /**
   * Update the Constants menu
   *
   * This currently uses the updateConstMenu method in an unrelated block and should
   * be refactored to remove the dependency.
   */
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,

  /**
   * Set the pin dropdown menu elements
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const mv = [
      'PIN_CLK',
      'PIN_SDI',
      'PIN_SDO',
      'PIN_CS',
    ];
    const m = [
      this.getFieldValue('PIN_CLK'),
      this.getFieldValue('PIN_SDI'),
      this.getFieldValue('PIN_SDO'),
      this.getFieldValue('PIN_CS'),
    ];

    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }

    const pinConstantList = this.userDefinedConstantsList_.map(function(value) {
      return [value, value];
    });

    this.appendDummyInput('PINS')
        .appendField('Air Quality initialize SCK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_CLK')
        .appendField('SDI')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_SDI')
        .appendField('SDO')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_SDO')
        .appendField('CS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_CS');

    // Loop through the array of pin fields
    for (let i = 0; i < 4; i++) {
      // If the pin has a value, and the value is equal to the old value, and there is
      // a new value, then set the pin field to the new value
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, mv[i]);
      } else if (m[i]) {
        this.setFieldValue(m[i], mv[i]);
      }
    }
  },
};

/**
 * BME-680 Initialization C code generator
 * @return {string}
 */
Blockly.propc.bme680_init = function() {
  const profile = getDefaultProfile();
  const pin = [
    this.getFieldValue('PIN_CLK'),
    this.getFieldValue('PIN_SDI'),
    this.getFieldValue('PIN_SDO'),
    this.getFieldValue('PIN_CS'),
  ];
  for (let i = 0; i < 3; i++) {
    if (profile.digital.toString().indexOf(pin[i] + ',' + pin[i]) === -1) {
      pin[i] = 'MY_' + pin[i];
    }
  }
  if (!this.disabled) {
    Blockly.propc.definitions_['include_bme680'] = '#include "bme680.h"';
    Blockly.propc.setups_['init_bme680'] =
        'gas_sensor = bme680_openSPI(' + pin.join(', ') + ');\n';
    Blockly.propc.global_vars_['device_bme680'] = 'bme680 *gas_sensor;\n';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.bme680_read.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.bme680_read.onchange
 *  }}
 */
Blockly.Blocks.bme680_read = {
  helpUrl: Blockly.MSG_BME680_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_BME680_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Air Quality read');
    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },

  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
      this.setWarningText('WARNING: You must use an Air Quality\ninitialize' +
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
Blockly.propc.bme680_read = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Air Quality initialize') === -1) {
    code += '// ERROR: Missing Air Quality initialize block!';
  } else {
    code += 'bme680_readSensor(gas_sensor);';
  }
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.bme680_heater.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.bme680_heater.onchange
 *  }}
 */
Blockly.Blocks.bme680_heater = {
  helpUrl: Blockly.MSG_BME680_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_BME680_HEATER);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Air Quality heater')
        .appendField(new Blockly.FieldDropdown([
          ['disable', 'Disable'],
          ['enable', 'Enable'],
        ]), 'HEAT_STATE');
    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },

  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
      this.setWarningText('WARNING: You must use an Air Quality\ninitialize' +
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
Blockly.propc.bme680_heater = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Air Quality initialize') === -1) {
    code += '// ERROR: Missing Air Quality initialize block!';
  } else {
    code += 'bme680_heater' + this.getFieldValue(
        'HEAT_STATE') + '(gas_sensor);';
  }
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.bme680_get_value.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.bme680_get_value.onchange,
 *  setMeasUnit: Blockly.Blocks.bme680_get_value.setMeasUnit,
 *  domToMutation: Blockly.Blocks.bme680_get_value.domToMutation
 *  }}
 */
Blockly.Blocks.bme680_get_value = {
  helpUrl: Blockly.MSG_BME680_HELPURL,
  init: function() {
    this.measUnits = {
      'temperature': [
        ['in \u00b0C', 'CELSIUS'],
        ['in \u00b0F', 'FAHRENHEIT'],
        ['in Kelvin', 'KELVIN'],
      ],
      'pressure': [
        ['in pascals', 'PASCALS'],
        ['in mmHg', 'MMHG'],
        ['in inHg', 'INHG'],
        ['in PSI', 'PSI'],
      ],
      'humidity': [['in %', ' ']],
      'gasResistance': [['in \u2126', ' ']],
      'altitude': [
        ['in meters', 'METERS'],
        ['in feet', 'FEET'],
      ],
    };
    this.setTooltip(Blockly.MSG_BME680_GET_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Air Quality')
        .appendField(new Blockly.FieldDropdown([
          ['Temperature', 'temperature'],
          ['Pressure', 'pressure'],
          ['Altitude Estimate', 'altitude'],
          ['Gas Sensor Resistance', 'gasResistance'],
          ['Relative Humidity', 'humidity'],
        ],
        function(val) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setMeasUnit(val);
        }),
        'SENSOR');
    this.appendDummyInput('UNITS')
        .appendField(new Blockly.FieldDropdown(
            this.measUnits['temperature']), 'UNIT');
    this.appendDummyInput('MULTIPLIER')
        .appendField(new Blockly.FieldDropdown([
          ['\u2715 1', ' '],
          ['\u2715 10', '*10.0'],
          ['\u2715 100', '*100.0'],
          ['\u2715 1000', '*1000.0'],
          ['\u2715 10000', '*10000.0'],
        ]), 'MULT');
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },

  setMeasUnit: function(val) {
    this.removeInput('UNITS');
    if (val === 'humidity') {
      this.appendDummyInput('UNITS')
          .appendField('%');
    } else if (val === 'gasResistance') {
      this.appendDummyInput('UNITS')
          .appendField('\u2126');
    } else {
      this.appendDummyInput('UNITS')
          .appendField(new Blockly.FieldDropdown(this.measUnits[val]), 'UNIT');
    }
    this.moveInputBefore('UNITS', 'MULTIPLIER');
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('sensor', this.getFieldValue('SENSOR'));
    return container;
  },

  domToMutation: function(container) {
    const val = container.getAttribute('sensor');
    if (val) {
      this.setMeasUnit(val);
    }
  },

  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
      this.setWarningText('WARNING: You must use an Air Quality\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.bme680_get_value = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Air Quality initialize') === -1) {
    code += '// ERROR: Missing Air Quality initialize block!';
  } else {
    const sensor = this.getFieldValue('SENSOR');
    const mult = this.getFieldValue('MULT') || '';
    let unit = this.getFieldValue('UNIT') || '';
    if (unit.length > 2) {
      unit = ', ' + unit;
    }
    code += '(int)(bme680_' + sensor + '(gas_sensor' + unit + ')' + mult + ')';
  }
  return [code, Blockly.propc.ORDER_ATOMIC];
};
