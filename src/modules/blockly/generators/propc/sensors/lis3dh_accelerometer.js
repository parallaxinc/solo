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


//
//
//
// ---------------- LIS3DH Accelerometer Sensor Blocks ------------------
//
//
//
//

import Blockly from 'blockly/core';
import {getDefaultProfile} from '../../../../project';
import {colorPalette} from '../../propc';
import {verifyBlockTypeEnabled} from '../propc_common';

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
      this.getInput('PINS')
          .appendField('', 'TEMP')
          .appendField('', 'UNIT');
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
          .appendField(new Blockly.FieldNumber(
              '0', null, null, 1),
          'VSS_VOLTAGE')
          .appendField(' 3.3V ')
          .appendField(new Blockly.FieldNumber(
              '0', null, null, 1),
          'VDD_VOLTAGE');

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
    if (!event || !this.isInFlyout) {
      return;
    }

    let warnText = null;
    const blocks = Blockly.getMainWorkspace().getBlocksByType(this.type, false);
    if (blocks && blocks.length > 1) {
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
      if (!verifyBlockTypeEnabled('lis3dh_init')) {
      // if ((Blockly.getMainWorkspace()
      //     .getBlocksByType('lis3dh_init') || []).length < 1) {
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
