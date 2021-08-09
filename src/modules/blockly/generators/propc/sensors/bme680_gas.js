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
import {buildConstantsList, verifyBlockTypeEnabled} from '../propc_common';
import {getDefaultProfile} from '../../../../project';


/**
 * @fileoverview Blocks to support the BME680 Air Quality (Gas) Sensor.
 * @link https://www.bosch-sensortec.com/products/environmental-sensors/gas-sensors/bme680/
 *
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */

//
// ------------------ BME680 Air Quality (Gas) Sensor -----------------------------
//

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

    // Prepare the Pn dropdown list
    this.userDefinedConstantsList_ = buildConstantsList();
    this.setPinMenus();
  },

  /**
   * Set the pin dropdown menu elements
   *
   * @param {string} oldValue
   * @param {string} newValue
   */
  setPinMenus: function(oldValue = '', newValue = '') {
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
 * Read a measurement
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
    if (!verifyBlockTypeEnabled('bme680_init')) {
      this.setWarningText('WARNING: You must use an Air Quality\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * Generate C source for the Read block
 * @return {string}
 */
Blockly.propc.bme680_read = function() {
  let code = '';
  if (!verifyBlockTypeEnabled('bme680_init')) {
    code += '// ERROR: Missing Air Quality initialize block!\n';
  } else {
    code += 'bme680_readSensor(gas_sensor);\n';
  }
  return code;
};

/**
 * Preheat the sensor block
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
    if (!verifyBlockTypeEnabled('bme680_init')) {
      this.setWarningText('WARNING: You must use an Air Quality\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 * Generate C source code for the preheat sensor block
 * @return {string}
 */
Blockly.propc.bme680_heater = function() {
  let code = '';
  if (!verifyBlockTypeEnabled('bme680_init')) {
    code += '// ERROR: Missing Air Quality initialize block!\n';
  } else {
    code += `bme680_heater${this.getFieldValue('HEAT_STATE')}(gas_sensor);\n`;
  }
  return code;
};

/**
 * Read a measurement
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
    if (!verifyBlockTypeEnabled('bme680_init')) {
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
  if (!verifyBlockTypeEnabled('bme680_init')) {
    code += '0;// ERROR: Missing Air Quality initialize block!\n';
  } else {
    const sensor = this.getFieldValue('SENSOR');
    const mult = this.getFieldValue('MULT') || '';
    let unit = this.getFieldValue('UNIT') || '';

    if (unit.length > 2) {
      unit = ', ' + unit;
    }

    code += `(int)(bme680_${sensor}(gas_sensor${unit})${mult})`;
  }
  return [code, Blockly.propc.ORDER_ATOMIC];
};
