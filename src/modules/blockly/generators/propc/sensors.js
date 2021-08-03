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


// -------------- Fingerprint Scanner Blocks ------------------------

/**
 * FP Scanner Initialization
 * @type {{
 *  init: Blockly.Blocks.fp_scanner_init.init,
 *  setPinMenus: Blockly.Blocks.fp_scanner_init.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
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
    // this.updateConstMenu();
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

  // updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,

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
 *
 * @type {{
 *  init: Blockly.Blocks.fp_scanner_add.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  setAction_: Blockly.Blocks.fp_scanner_add.setAction_,
 *  onchange: Blockly.Blocks.fp_scanner_add.onchange,
 *  domToMutation: Blockly.Blocks.fp_scanner_add.domToMutation
 *  }}
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1) {
      this.setWarningText('WARNING: You must use a Fingerprint' +
          ' Scanner\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.fp_scanner_add = function() {
  const act = this.getFieldValue('ACTION');
  let usr = '1';
  if (act !== 'ALL') {
    usr = Blockly.propc.valueToCode(
        this, 'USER', Blockly.propc.ORDER_NONE) || '1';
  }

  let code = '';

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1) {
    code = '// ERROR: Fingerprint Scanner is not initialized!\n';
  } else {
    if (act === 'ADD') {
      code = 'fingerprint_add(fpScan, ' + usr + ', 3, 0);\n';
    }
    if (act === 'DEL') {
      code = 'fingerprint_deleteUser(fpScan, ' + usr + ');\n';
    }
    if (act === 'ALL') {
      code = 'fingerprint_deleteUser(fpScan, 0);\n';
    }
  }

  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.fp_scanner_scan.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  setAction_: Blockly.Blocks.fp_scanner_scan.setAction_,
 *  onchange: Blockly.Blocks.fp_scanner_scan.onchange,
 *  domToMutation: Blockly.Blocks.fp_scanner_scan.domToMutation
 *  }}
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1) {
      this.setWarningText('WARNING: You must use a Fingerprint' +
          ' Scanner\ninitialize block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.fp_scanner_scan = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1) {
    return '// ERROR: Fingerprint Scanner is not initialized!\n';
  } else {
    const act = this.getFieldValue('ACTION');
    let usr = '1';
    if (act === 'COMP') {
      usr = Blockly.propc.valueToCode(
          this, 'USER', Blockly.propc.ORDER_NONE) || '1';
    }

    let func = 'int fingerScanner(int __u) {';
    func += 'int r;\nfingerprint_scan(fpScan, __u, &r);\n';
    func += 'if (__u != 0 && r != 0) return 1;\n else return r;}';

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
    return [code, Blockly.propc.ORDER_ATOMIC];
  }
};


// -----------------------Compass (HMC5883L Module) Blocks -------------------

/**
 * HMC5883L Initialization
 * @type {{
 *  init: Blockly.Blocks.HMC5883L_init.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.HMC5883L_init = {
  helpUrl: Blockly.MSG_COMPASS_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_HMC5883L_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Compass initialize SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'SCL');
    this.appendDummyInput()
        .appendField('SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'SDA');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.HMC5883L_init = function() {
  const scl = this.getFieldValue('SCL');
  const sda = this.getFieldValue('SDA');

  if (!this.disabled) {
    Blockly.propc.definitions_['HMC5883L'] = '#include "compass3d.h"';
    Blockly.propc.setups_['HMC5883L'] = 'i2c *compass_bus = i2c_newbus(' +
        scl + ', ' + sda + ', 0);\n\tcompass_init(compass_bus);';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.HMC5883L_read.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.HMC5883L_read.onchange
 *  }}
 */
Blockly.Blocks.HMC5883L_read = {
  helpUrl: Blockly.MSG_COMPASS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_HMC5883L_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Compass heading store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'HEADING');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Compass initialize') === -1) {
      this.setWarningText('WARNING: You must use a Compass\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.HMC5883L_read = function() {
  let code = '';
  // TODO: Refactor getAllBlocks reference to GetBlocksByType
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();

  if (allBlocks.indexOf('Compass initialize') === -1) {
    code += '// ERROR: Missing Compass initialize block!';
  } else {
    const storage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('HEADING'),
        Blockly.VARIABLE_CATEGORY_NAME);
    if (!this.disabled) {
      Blockly.propc.global_vars_['compass_vars'] =
          'int __compX, __compY, __compZ;\nfloat __compH;\n';
    }
    code += 'compass_read(bus, &__compX, &__compY, &__compZ);\n';
    code += '\t__compH = atan2(((float) __compY),' +
        ' (((float) __compX)) * 180.0/PI;\n';
    code += '\tif(__compH < 0.0) __compH = (360.0 + __compH);\n';
    code += '\t' + storage + ' = (int) __compH;\n';
  }
  return code;
};

// ---------------- LIS3DH Accelerometer Sensor Blocks ------------------

/**
 *
 * @type {{
 *  buildVoltageInput: Blockly.Blocks.lis3dh_init.buildVoltageInput,
 *  init: Blockly.Blocks.lis3dh_init.init,
 *  buildTempInput: Blockly.Blocks.lis3dh_init.buildTempInput,
 *  buildSmoothingInput: Blockly.Blocks.lis3dh_init.buildSmoothingInput,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lis3dh_init.onchange
 *  }}
 */
Blockly.Blocks.lis3dh_init = {
  helpUrl: Blockly.MSG_LIS3DH_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_LIS3DH_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS')
        .appendField('LIS3DH initialize SCK')
        .appendField(new Blockly.FieldDropdown(profile.digital), 'SCK_PIN')
        .appendField('SDI')
        .appendField(new Blockly.FieldDropdown(profile.digital), 'SDI_PIN')
        .appendField('CS')
        .appendField(new Blockly.FieldDropdown(profile.digital), 'CS_PIN')
        .appendField('', 'TEMP') // Temperature calibration
        .appendField('', 'UNIT') // Temperature calibration
        .appendField('', 'SMOOTHING') // Tilt axis smoothing
        .appendField('', 'VSS_VOLTAGE') // ADC ground offset initialization
        .appendField('', 'VDD_VOLTAGE'); // ADC 3.3 offset initialization

    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  buildTempInput: function(hasTempBlocks) {
    if (hasTempBlocks && !this.getInput('TEMP_CALIBRATE')) {
      const temp = this.getFieldValue('TEMP');
      const unit = this.getFieldValue('UNIT');

      this.getInput('PINS').removeField('TEMP');
      this.getInput('PINS').removeField('UNIT');

      this.appendDummyInput('TEMP_CALIBRATE')
          .appendField('Set ambient temperature to')
          .appendField(new Blockly.FieldNumber(
              '72', null, null, 1), 'TEMP')
          .appendField(new Blockly.FieldDropdown([
            ['\u00b0F', 'F'],
            ['\u00b0C', 'C'],
          ]), 'UNIT');

      this.setFieldValue(temp || '72', 'TEMP');
      this.setFieldValue(unit || 'F', 'UNIT');

      if (this.getInput('TILT_CALIBRATE') ) {
        this.moveInputBefore('TEMP_CALIBRATE', 'TILT_CALIBRATE');
      }
    } else if (!hasTempBlocks && this.getInput('TEMP_CALIBRATE')) {
      this.removeInput('TEMP_CALIBRATE');
      this.getInput('PINS').appendField('', 'TEMP').appendField('', 'UNIT');
    }
  },
  buildSmoothingInput: function(hasTiltBlocks) {
    if (hasTiltBlocks && !this.getInput('TILT_CALIBRATE')) {
      const smoothing = this.getFieldValue('SMOOTHING');
      if (this.getField('SMOOTHING')) {
        this.getInput('PINS').removeField('SMOOTHING');
      }

      this.appendDummyInput('TILT_CALIBRATE')
          .appendField('Set tilt smoothing')
          .appendField(new Blockly.FieldNumber(
              '0', 0, 100, 1), 'SMOOTHING');
      this.setFieldValue(smoothing || '0', 'SMOOTHING');

      // This has to appear above the voltage block if one is defined.
      if (this.getInput('VOLT_CALIBRATE') ) {
        this.moveInputBefore('TILT_CALIBRATE', 'VOLT_CALIBRATE');
      }
    } else if (!hasTiltBlocks && this.getInput('TILT_CALIBRATE')) {
      this.removeInput('TILT_CALIBRATE');
      if (!this.getField('SMOOTHING')) {
        this.getInput('PINS').appendField('', 'SMOOTHING');
      }
    }
  },
  buildVoltageInput: function(hasVoltageBlocks) {
    // Create a init field for the ADC voltage offset
    if (hasVoltageBlocks && !this.getInput('VOLT_CALIBRATE')) {
      // Ground calibration value
      const vssVoltField = this.getInput('VSS_VOLTAGE');

      // 3.3 volt calibration
      const vddVoltField = this.getInput('VDD_VOLTAGE');

      this.getInput('PINS').removeField('VSS_VOLTAGE');
      this.getInput('PINS').removeField('VDD_VOLTAGE');


      this.appendDummyInput('VOLT_CALIBRATE')
          .appendField('Calibrate ADC  GND ')
          .appendField(
              new Blockly.FieldNumber(
                  '0',
                  null,
                  null,
                  1,
              ), 'VSS_VOLTAGE')
          .appendField(' 3.3V ')
          .appendField(
              new Blockly.FieldNumber(
                  '0',
                  null,
                  null,
                  1,
              ), 'VDD_VOLTAGE');

      this.setFieldValue(vssVoltField || '0', 'VSS_VOLTAGE');
      this.setFieldValue(vddVoltField || '0', 'VDD_VOLTAGE');

      // Move this input field to the bottom of the init block
      this.moveInputBefore('VOLT_CALIBRATE', null);
    } else if (!hasVoltageBlocks && this.getInput('VOLT_CALIBRATE')) {
      // Destroy the ADC init fields
      this.removeInput('VOLT_CALIBRATE');
      if (!this.getField('VOLTAGE')) {
        this.getInput('PINS').appendField('', 'VSS_VOLTAGE');
        this.getInput('PINS').appendField('', 'VDD_VOLTAGE');
      }
    }
  },
  onchange: function(event) {
    // Act when the block is dragged from the fly-out to the canvas
    if (event && !this.isInFlyout) {
      let warnText = null;
      if (Blockly.getMainWorkspace()
          .getBlocksByType(this.type, false).length > 1) {
        warnText = 'WARNING! Only one LIS3DH init block can be used!';
      }
      this.setWarningText(warnText);

      // Look for read temperature blocks
      let tempBlocksPresent = false;
      if ((Blockly.getMainWorkspace()
          .getBlocksByType('lis3dh_temp', false) || []).length > 0) {
        tempBlocksPresent = true;
      }
      this.buildTempInput(tempBlocksPresent);

      // Look for read tilt blocks
      const tiltBlockList = Blockly.getMainWorkspace()
          .getBlocksByType('lis3dh_read', false) || [];
      let tiltBlocksPresent = false;
      for (let i = 0; i < tiltBlockList.length; i++) {
        if (tiltBlockList[i].getFieldValue('SENSOR') === 'tilt') {
          tiltBlocksPresent = true;
          break;
        }
      }
      this.buildSmoothingInput(tiltBlocksPresent);

      // Look for read voltage blocks
      const voltBlockList = Blockly.getMainWorkspace()
          .getBlocksByType('lis3dh_read', false) || [];
      let voltBlocksPresent = false;
      for (let i = 0; i < tiltBlockList.length; i++) {
        if (voltBlockList[i].getFieldValue('SENSOR') === 'adc_mV') {
          voltBlocksPresent = true;
          break;
        }
      }
      this.buildVoltageInput(voltBlocksPresent);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.lis3dh_init = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['lis3dh'] = '#include "lis3dh.h"';
    Blockly.propc.global_vars_['lis3dh_init'] = 'lis3dh *lis3dh_sensor;';
    let setupCode = 'lis3dh_sensor = lis3dh_init(' +
        this.getFieldValue('SCK_PIN') + ', ' +
        this.getFieldValue('SDI_PIN') + ', ' +
        this.getFieldValue('CS_PIN') + ');';

    if (this.getInput('TEMP_CALIBRATE')) {
      setupCode += 'lis3dh_tempCal_' +
          this.getFieldValue('UNIT') + '(lis3dh_sensor, ' +
          this.getFieldValue('TEMP') + ');';
    }
    const tiltSmoothing = this.getFieldValue('SMOOTHING') || 0;
    if (this.getInput('TILT_CALIBRATE') && tiltSmoothing !== 0) {
      setupCode += 'lis3dh_tiltConfig(lis3dh_sensor, 100 - ' +
          tiltSmoothing + ');';
    }

    if (this.getInput('VOLT_CALIBRATE')) {
      const vssVoltField = this.getFieldValue('VSS_VOLTAGE');
      const vddVoltField = this.getFieldValue('VDD_VOLTAGE');

      if ((vssVoltField !== undefined) && (vddVoltField !== undefined)) {
        setupCode += 'lis3dh_adcCal_mV(lis3dh_sensor, ';

        if (vssVoltField === 0 && vddVoltField === 0) {
          setupCode += '0, 0, 0, 0 );';
        } else {
          setupCode += '0, 3300, ' + vssVoltField + ', ' + vddVoltField + ');';
        }
      }
    }

    Blockly.propc.setups_['lis3dh_init'] = setupCode + '\n';
  }
  return '';
};

/**
 *
 * @type {{
 *  configureFields: Blockly.Blocks.lis3dh_read.configureFields,
 *  init: Blockly.Blocks.lis3dh_read.init,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lis3dh_read.onchange,
 *  domToMutation: Blockly.Blocks.lis3dh_read.domToMutation
 *  }}
 */
Blockly.Blocks.lis3dh_read = {
  helpUrl: Blockly.MSG_LIS3DH_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LIS3DH_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));

    this.appendDummyInput('ACTION')
        .appendField('LIS3DH read')
        .appendField(
            new Blockly.FieldDropdown([
              ['acceleration (1000ths of g\'s)', 'accel_mg'],
              ['tilt (degrees)', 'tilt'],
              ['voltage (mV)', 'adc_mV'],
            ], function(action) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().configureFields(action);
            }),
            'SENSOR');

    this.appendDummyInput('VARS')
        .appendField('store X in', 'LABEL_0')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_1')
        .appendField('Y in', 'LABEL_1')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_2')
        .appendField('Z in', 'LABEL_2')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_3')
        .appendField('', 'STORE_4');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    // Field values - this gets populated in the configureFields method
    this.fieldVals = [];
  },
  configureFields: function(action) {
    // Set default if no action provided.
    if (!action) {
      action = 'accel_mg';
    }

    // The value of this field determines how the block will appear
    const blockText = {
      'accel_mg': {label: ['store X in', 'Y in', 'Z in']},
      'adc_mV': {label: ['store AD1 in', 'AD2 in', 'AD3 in']},
      'tilt': {label: ['store X in', 'Y in', 'Z in']},
    };

    for (let i = 0; i < 3; i++) {
      this.setFieldValue(blockText[action].label[i], 'LABEL_' + i.toString(10));
    }

    // Read the values of all of the fields before rebuilding
    // all of the block's inputs
    if (!this.isInFlyout) {
      for (let i = 1; i < 5; i++) {
        if (action === 'tilt' || i !== 4) {
          this.fieldVals[i] = this.getFieldValue('STORE_' + i.toString(10));
        }
      }
    }

    //  This input will get rebuilt depending on the state of the dropdown menu.
    if (this.getInput('VARS_2') && action !== 'tilt') {
      this.removeInput('VARS_2');
    }

    // If the placeholder field is present, delete it.
    if (this.getField('STORE_4') && !this.getField('STORE_4').EDITABLE) {
      this.getInput('VARS').removeField('STORE_4');
    }

    // Only add a fourth field if
    if (action === 'tilt' && !this.getInput('VARS_2') && !this.isInFlyout) {
      this.appendDummyInput('VARS_2').appendField('store combined motion in')
          .appendField(new Blockly.FieldVariable(
              Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_4');
    } else if (!this.getField('STORE_4')) {
      // Attach a blank field just to make sure it exists when the block
      // fields are populated. Blockly will throw a warning if this isn't here.
      this.getInput('VARS').appendField('', 'STORE_4');
      this.fieldVals[4] = '';
    }

    // Repopulate all of the field values (make sure there is a
    // field before trying to populate it)
    for (let i = 1; i < 4; i++) {
      if (this.fieldVals[i] && this.fieldVals[i] !== '' &&
          this.getField('STORE_' + i.toString(10))) {
        this.setFieldValue(this.fieldVals[i], 'STORE_' + i.toString(10));
      }
    }

    // Restore the variable field - this is a bit of a workaround, because
    // the name (not the ID) is somehow being stored, so it needs to be
    // converted to an ID before repopulating the field.
    if (action === 'tilt' && this.fieldVals[3] &&
        this.fieldVals[4] && this.fieldVals[4] !== '') {
      const tempVar = Blockly.getMainWorkspace().getVariable(this.fieldVals[4]);
      if (tempVar) {
        this.setFieldValue(tempVar.getId(), 'STORE_4');
      }
    }

    // If the placeholder fields are present, make sure they are empty.
    if (this.getField('STORE_4') && !this.getField('STORE_4').EDITABLE) {
      this.setFieldValue('', 'STORE_4');
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('fieldvals', this.getFieldValue('SENSOR'));
    return container;
  },
  domToMutation: function(container) {
    const action = container.getAttribute('fieldvals');
    this.configureFields(action);
  },
  onchange: function(event) {
    // Only initiate this if there is a change that affects the
    // field values in the block
    if (event && (event.type === Blockly.Events.BLOCK_CREATE ||
                event.type === Blockly.Events.BLOCK_DELETE ||
                event.type === Blockly.Events.BLOCK_CHANGE)) {
      let warnText = null;
      if ((Blockly.getMainWorkspace()
          .getBlocksByType('lis3dh_init') || []).length < 1) {
        warnText = 'WARNING! The block requires an LIS3DH init block!';
      }
      this.setWarningText(warnText);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.lis3dh_read = function() {
  // retrieve the sensor type selected
  const action = this.getFieldValue('SENSOR');
  // retrieve the field values
  const s1 = Blockly.propc.variableDB_.getName(
      this.getFieldValue('STORE_1'),
      Blockly.VARIABLE_CATEGORY_NAME);
  const s2 = Blockly.propc.variableDB_.getName(
      this.getFieldValue('STORE_2'),
      Blockly.VARIABLE_CATEGORY_NAME);
  const s3 = Blockly.propc.variableDB_.getName(
      this.getFieldValue('STORE_3'),
      Blockly.VARIABLE_CATEGORY_NAME);
  let s4 = null;
  // if 'tilt' is selected, grab the fourth variable
  if (action === 'tilt') {
    s4 = Blockly.propc.variableDB_.getName(
        this.getFieldValue('STORE_4'),
        Blockly.VARIABLE_CATEGORY_NAME);
  }

  // generate the c code for this block.
  if ((Blockly.getMainWorkspace()
      .getBlocksByType('lis3dh_init') || []).length > 0) {
    return 'lis3dh_' + action + '(lis3dh_sensor, &' + s1 + ', &' + s2 +
        ', &' + s3 + (s4 ? ', &' + s4 : '') + ');\n';
  } else {
    return '// WARNING: Missing init block!';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.lis3dh_temp.init,
 *  helpUrl: string,
 *  onchange: *
 *  }}
 */
Blockly.Blocks.lis3dh_temp = {
  helpUrl: Blockly.MSG_LIS3DH_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LIS3DH_TEMP_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('MAIN')
        .appendField('LIS3DH temperature in')
        .appendField(new Blockly.FieldDropdown([
          ['\u00b0F', 'F'],
          ['\u00b0C', 'C'],
        ]), 'UNIT');
    this.setInputsInline(false);
    this.setOutput(true, 'Number');
  },
  onchange: Blockly.Blocks['lis3dh_read'].onchange,
};

/**
 *
 * @return {[string, number]|[string, number]}
 */
Blockly.propc.lis3dh_temp = function() {
  if ((Blockly.getMainWorkspace()
      .getBlocksByType('lis3dh_init') || []).length > 0) {
    return ['lis3dh_temp_' + this.getFieldValue('UNIT') +
    '(lis3dh_sensor)', Blockly.propc.ORDER_NONE];
  } else {
    return ['0 // WARNING: Missing init block!', Blockly.propc.ORDER_NONE];
  }
};


// ------------------ IMU (LSM9DS1 module) Blocks -----------------
/**
 * lsm9ds1 Initialization
 * @type {{
 *  init: Blockly.Blocks.lsm9ds1_init.init,
 *  setPinMenus: Blockly.Blocks.lsm9ds1_init.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.lsm9ds1_init = {
  helpUrl: Blockly.MSG_IMU_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LSM9DS1_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const mv = ['PIN_SCL', 'PIN_SDIO', 'PIN_CSAG', 'PIN_CSM'];
    const m = [
      this.getFieldValue('PIN_SCL'),
      this.getFieldValue('PIN_SDIO'),
      this.getFieldValue('PIN_CSAG'),
      this.getFieldValue('PIN_CSM'),
    ];
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    const pinConstantList = this.userDefinedConstantsList_.map(function(value) {
      return [value, value];
    });
    this.appendDummyInput('PINS')
        .appendField('IMU initialize SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_SCL')
        .appendField('SDIO')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_SDIO')
        .appendField('CS_AG')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_CSAG')
        .appendField('CS_M')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(pinConstantList)), 'PIN_CSM');
    for (let i = 0; i < 4; i++) {
      if (m[i] && m[i] === oldValue && newValue) {
        this.setFieldValue(newValue, mv[i]);
      } else if (m[i]) {
        this.setFieldValue(m[i], mv[i]);
      }
    }
  },
};

/**
 * lsm9ds1 Initialization C code generator
 * @return {string}
 */
Blockly.propc.lsm9ds1_init = function() {
  const profile = getDefaultProfile();
  const pin = [
    this.getFieldValue('PIN_SCL'),
    this.getFieldValue('PIN_SDIO'),
    this.getFieldValue('PIN_CSAG'),
    this.getFieldValue('PIN_CSM'),
  ];
  for (let i = 0; i < 3; i++) {
    if (profile.digital.toString().indexOf(pin[i] + ',' + pin[i]) === -1) {
      pin[i] = 'MY_' + pin[i];
    }
  }
  if (!this.disabled) {
    Blockly.propc.definitions_['include_lsm9ds1'] = '#include "lsm9ds1.h"';
    Blockly.propc.setups_['lsm9ds1_init'] = 'imu_init(' + pin[0] + ', ' +
        pin[1] + ', ' + pin[2] + ', ' + pin[3] + ');';
    Blockly.propc.global_vars_['lsm9ds1_vars'] =
        'float __imuX, __imuY, __imuZ, __compI;\n';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.lsm9ds1_mag_calibrate.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lsm9ds1_mag_calibrate.onchange
 *  }}
 */
Blockly.Blocks.lsm9ds1_mag_calibrate = {
  helpUrl: Blockly.MSG_IMU_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LSM9DS1_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('IMU calibrate magnetometer');

    this.setInputsInline(true);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
      this.setWarningText('WARNING: You must use an IMU\ninitialize block' +
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
Blockly.propc.lsm9ds1_mag_calibrate = function() {
  // TODO: Refactor getAllBlocks to getBlocksByType
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('IMU initialize') === -1) {
    return '// ERROR: Missing IMU initialize block!';
  } else {
    return 'high(26);high(27);imu_calibrateMag();low(26);low(27);';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.lsm9ds1_read.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lsm9ds1_read.onchange
 *  }}
 */
Blockly.Blocks.lsm9ds1_read = {
  helpUrl: Blockly.MSG_IMU_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LSM9DS1_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('IMU read')
        .appendField(new Blockly.FieldDropdown([
          ['accelerometer (100ths of g\'s)', 'Accel'],
          ['gyroscope (100ths of deg/s)', 'Gyro'],
          ['magnetometer (100ths of gauss)', 'Mag'],
        ]), 'SENSOR')
        .appendField('store X-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'X_VAR')
        .appendField(' y-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'Y_VAR')
        .appendField(' z-axis in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'Z_VAR');
    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
      this.setWarningText('WARNING: You must use an IMU\ninitialize block at' +
          ' the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.lsm9ds1_read = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('IMU initialize') === -1) {
    code += '// ERROR: Missing IMU initialize block!';
  } else {
    const sensor = this.getFieldValue('SENSOR');
    const xStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('X_VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const yStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Y_VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const zStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Z_VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    code += 'imu_read' + sensor + 'Calculated(&__imuX, &__imuY, &__imuZ);\n';
    code += xStorage + ' = (int) (100.0 * __imuX);\n';
    code += yStorage + ' = (int) (100.0 * __imuY);\n';
    code += zStorage + ' = (int) (100.0 * __imuZ);\n';
  }
  return code;
};

/**
 * IMU tilt block
 *
 * @type {{
 *  init: Blockly.Blocks.lsm9ds1_tilt.init,
 *  setAxes_: Blockly.Blocks.lsm9ds1_tilt.setAxes_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lsm9ds1_tilt.onchange,
 *  domToMutation: Blockly.Blocks.lsm9ds1_tilt.domToMutation
 *  }}
 */
Blockly.Blocks.lsm9ds1_tilt = {
  // TODO: Refactor instances of 'axes' to 'axis'
  helpUrl: Blockly.MSG_IMU_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LSM9DS1_TILT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('IMU tilt')
        .appendField(new Blockly.FieldDropdown([
          ['x-axis', 'X'],
          ['y-axis', 'Y'],
          ['z-axis', 'Z'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setAxes_({'ACTION': action});
        }), 'G_AXIS')
        .appendField('points up/down');
    this.appendDummyInput('TILT1')
        .appendField('store y-tilt in', 'A1')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR1');
    this.appendDummyInput('TILT2')
        .appendField('z-tilt in', 'A2')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR2');
    this.setInputsInline(true);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('G_AXIS');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setAxes_({'ACTION': action});
  },
  setAxes_: function(details) {
    if (details['ACTION'] === 'X') {
      this.setFieldValue('store y-tilt in', 'A1');
      this.setFieldValue('z-tilt in', 'A2');
    } else if (details['ACTION'] === 'Y') {
      this.setFieldValue('store x-tilt in', 'A1');
      this.setFieldValue('z-tilt in', 'A2');
    } else {
      this.setFieldValue('store x-tilt in', 'A1');
      this.setFieldValue('y-tilt in', 'A2');
    }
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
      this.setWarningText('WARNING: You must use an IMU\ninitialize block' +
          ' at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * IMU tilt block C code generator
 * @return {string}
 */
Blockly.propc.lsm9ds1_tilt = function() {
  let code = '';
  // TODO: Refactor getAllBlocks reference to GetBlocksByType
  // const blocks = Blockly
  //     .getMainWorkspace()
  //     .getBlocksByType('IMU initialize', false);
  // console.log(blocks);

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();

  if (allBlocks.indexOf('IMU initialize') === -1) {
    code += '// ERROR: Missing IMU initialize block!';
  } else {
    // getFieldValue may return a null or undefined, so blindly accessing
    // a substring from getFieldValue could throw a type error
    let t1Axis;
    let t2Axis;
    let tmpFieldValue = this.getFieldValue('A1');
    if (tmpFieldValue) {
      t1Axis = `__imu${tmpFieldValue.substr(6, 1).toUpperCase()}`;
    }
    tmpFieldValue = this.getFieldValue('A2');
    if (tmpFieldValue) {
      t2Axis = `__imu${tmpFieldValue.substr(0, 1).toUpperCase()}`;
    }

    const gAxis = '__imu' + this.getFieldValue('G_AXIS');
    const storage1 = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR1'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const storage2 = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR2'),
        Blockly.VARIABLE_CATEGORY_NAME);

    code += 'imu_readAccelCalculated(&__imuX, &__imuY, &__imuZ);\n';
    code += storage1 + ' = (int) (atan2(' + t1Axis + ', ' +
        gAxis + ') * 180.0 / PI);\n';
    code += storage2 + ' = (int) (atan2(' + t2Axis + ', ' +
        gAxis + ') * 180.0 / PI);\n';
  }
  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.lsm9ds1_heading.init,
 *  setAxes_: Blockly.Blocks.lsm9ds1_heading.setAxes_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.lsm9ds1_heading.onchange,
 *  domToMutation: Blockly.Blocks.lsm9ds1_heading.domToMutation
 *  }}
 */
Blockly.Blocks.lsm9ds1_heading = {
  helpUrl: Blockly.MSG_IMU_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_LSM9DS1_HEADING_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('IMU heading')
        .appendField(new Blockly.FieldDropdown([
          ['z-axis points forward', '__imuZ'],
          ['z-axis points backward', '(-1.0*__imuZ)'],
          ['y-axis points forward', '__imuY'],
          ['y axis points backward', '(-1.0*__imuY)'],
          ['x-axis points forward', '(-1.0*__imuX)'],
          ['x-axis points backward', '__imuX']],
        function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setAxes_({'ACTION': action});
        }), 'FB_AXIS')
        .appendField(' ');
    this.appendDummyInput('MENU2')
        .appendField(new Blockly.FieldDropdown([
          ['y-axis points left', '__imuY'],
          ['y-axis points right', '(-1.0*__imuY)'],
          ['x-axis points left', '(-1.0*__imuX)'],
          ['x-axis points right', '__imuX'],
        ]), 'LR_AXIS');
    this.appendDummyInput('IMUVAR')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
    this.setInputsInline(true);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const action = this.getFieldValue('FB_AXIS');
    container.setAttribute('action', action);
    return container;
  },
  domToMutation: function(xmlElement) {
    const action = xmlElement.getAttribute('action');
    this.setAxes_({'ACTION': action});
  },
  setAxes_: function(details) {
    if (this.getInput('MENU2')) {
      this.removeInput('MENU2');
    }
    let wh = details['ACTION'][details['ACTION'].length - 1];
    if (wh === ')') {
      wh = details['ACTION'][details['ACTION'].length - 2];
    }
    if (wh === 'X') {
      this.appendDummyInput('MENU2')
          .appendField(new Blockly.FieldDropdown([
            ['y-axis points left', '__imuY'],
            ['y-axis points right', '(-1.0*__imuY)'],
            ['z-axis points left', '__imuZ'],
            ['z-axis points right', '(-1.0*__imuZ)'],
          ]), 'LR_AXIS');
    } else if (wh === 'Y') {
      this.appendDummyInput('MENU2')
          .appendField(new Blockly.FieldDropdown([
            ['x-axis points left', '(-1.0*__imuX)'],
            ['x-axis points right', '__imuX'],
            ['z-axis points left', '__imuZ'],
            ['z-axis points right', '(-1.0*__imuZ)'],
          ]), 'LR_AXIS');
    } else {
      this.appendDummyInput('MENU2')
          .appendField(new Blockly.FieldDropdown([
            ['y-axis points left', '__imuY'],
            ['y-axis points right', '(-1.0*__imuY)'],
            ['x-axis points left', '(-1.0*__imuX)'],
            ['x-axis points right', '__imuX'],
          ]), 'LR_AXIS');
    }
    this.moveInputBefore('MENU2', 'IMUVAR');
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
      this.setWarningText('WARNING: You must use an IMU\ninitialize block' +
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
Blockly.propc.lsm9ds1_heading = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('IMU initialize') === -1) {
    code += '// ERROR: Missing IMU initialize block!';
  } else {
    const fbAxis = this.getFieldValue('FB_AXIS');
    const lrAxis = this.getFieldValue('LR_AXIS');
    const storage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    code += 'imu_readMagCalculated(&__imuX, &__imuY, &__imuZ);\n';
    code += '__compI = atan2(' + lrAxis + ', ' + fbAxis + ') * 180.0/PI;\n';
    code += 'if(__compI < 0.0) __compI = (360.0 + __compI);\n';
    code += storage + ' = (int) __compI;\n';
  }
  return code;
};


// ------------------ RFID Reader Blocks --------------------

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
