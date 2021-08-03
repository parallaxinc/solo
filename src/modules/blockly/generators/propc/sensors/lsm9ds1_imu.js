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
// ------------------ IMU (LSM9DS1 Inertial Measurement Unit module) Blocks -----------------
//

/**
 * lsm9ds1 Initialization
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
    // this.updateConstMenu();

    // Prepare the Pn dropdown list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,

  /**
   * Reconstruct the pin dropdown menus
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue = '', newValue = '') {
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
 * Calibrate the magnetometer
 *
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
    // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    // if (allBlocks.indexOf('IMU initialize') === -1) {
    if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
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
  // // TODO: Refactor getAllBlocks to getBlocksByType
  // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  // if (allBlocks.indexOf('IMU initialize') === -1) {
  if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
    return '// ERROR: Missing IMU initialize block!\n';
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
    // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    // if (allBlocks.indexOf('IMU initialize') === -1) {
    if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
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
  // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  // if (allBlocks.indexOf('IMU initialize') === -1) {
  if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
    code += '// ERROR: Missing IMU initialize block!\n';
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
    // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    // if (allBlocks.indexOf('IMU initialize') === -1) {
    if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
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
  // const blocks = Blockly
  //     .getMainWorkspace()
  //     .getBlocksByType('IMU initialize', false);
  // console.log(blocks);

  // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  //
  // if (allBlocks.indexOf('IMU initialize') === -1) {
  if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
    code += '// ERROR: Missing IMU initialize block!\n';
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
 * IMU heading block
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
    // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    // if (allBlocks.indexOf('IMU initialize') === -1) {
    if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
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
  // const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  // if (allBlocks.indexOf('IMU initialize') === -1) {
  if (!verifyBlockTypeEnabled('lsm9ds1_init')) {
    code += '// ERROR: Missing IMU initialize block!\n';
  } else {
    const fbAxis = this.getFieldValue('FB_AXIS');
    const lrAxis = this.getFieldValue('LR_AXIS');
    const storage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    code += 'imu_readMagCalculated(&__imuX, &__imuY, &__imuZ);\n';
    code += '__compI = atan2(' + lrAxis + ', ' + fbAxis + ') * 180.0/PI;\n';
    code += '\nif(__compI < 0.0) {\n\t__compI = (360.0 + __compI);\n}\n';
    code += storage + ' = (int) __compI;\n';
  }
  return code;
};
