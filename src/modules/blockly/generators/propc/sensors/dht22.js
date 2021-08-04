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
 * @fileoverview Blocks to support the DHT22 digital temperature and humidity sensor.
 *
 * @link https://cityos-air.readme.io/docs/4-dht22-digital-temperature-humidity-sensor
 *
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {getDefaultProfile} from '../../../../project';

/**
 * The DHT22 is an inexpensive digital temperature and humidity sensor
 *
 * @type {{
 *  init: Blockly.Blocks.dht22_read.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  setToOther: *,
 *  domToMutation: *
 *  }}
 */
Blockly.Blocks.dht22_read = {
  helpUrl: Blockly.MSG_TEMPERATURE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DHT22_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    this.addPinMenu('Temp & Humidity read PIN', null, 0);
    this.setPreviousStatement(true, 'Block');
    this.setInputsInline(true);
    this.setNextStatement(true, null);
  },


  /**
   * Add a pin to the block configuration
   * @param {string} label
   * @param {boolean} moveBefore
   * @param {number} pinOpt is an index into the pins array
   */
  addPinMenu: function(label, moveBefore, pinOpt) {
    const profile = getDefaultProfile();
    this.appendDummyInput('SET_PIN')
        .appendField(label, 'LABEL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat([['other', 'other']]),
            function(op) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().setToOther(op, moveBefore, pinOpt);
            }), this.pinChoices[pinOpt]);
    this.moveBefore = moveBefore;
    this.otherPin[pinOpt] = false;
  },

  /**
   * Set the pin to default 'other' as defined in the board type profile
   * @param {string} op
   * @param {boolean} moveBefore
   * @param {number} pinOpt
   */
  setToOther: function(op, moveBefore, pinOpt) {
    if (op === 'other') {
      const profile = getDefaultProfile();
      this.otherPin[pinOpt] = true;
      const label = this.getFieldValue('LABEL');
      if (this.getInput('SET_PIN')) {
        this.removeInput('SET_PIN');
      }
      this.appendValueInput(this.pinChoices[pinOpt])
          .appendField(label)
          .setCheck('Number')
          .appendRange('A,' + profile.digital.toString());
      if (moveBefore) {
        this.moveInputBefore(this.pinChoices[pinOpt], moveBefore);
      } else {
        const currBlockTimeout = this;
        setTimeout(function() {
          currBlockTimeout.render();
        }, 200);
      }
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      // TODO: verify that otherPin is in fact a boolean
      container.setAttribute('otherpin' +
          pinOpt, this.otherPin[pinOpt].toString());
    }
    return container;
  },
  domToMutation: function(xmlElement) {
    for (let pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
      const op = xmlElement.getAttribute('otherpin' + pinOpt);
      if (op === 'true') {
        this.setToOther('other', this.moveBefore, pinOpt);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.dht22_read = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['dht22'] = '#include "dht22.h"';
  }

  let pin;
  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue(this.pinChoices[0]);
  }

  return 'dht22_read(' + pin + ');';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.dht22_value.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.dht22_value = {
  helpUrl: Blockly.MSG_TEMPERATURE_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_DHT22_VALUE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Temp & Humidity')
        .appendField(new Blockly.FieldDropdown([
          ['temperature (\u00b0F)', 'Temp,FAHRENHEIT'],
          ['temperature (\u00b0C)', 'Temp,CELSIUS'],
          ['temperature (Kelvin)', 'Temp,KELVIN'],
          ['relative humidity (%)', 'Humidity,'],
        ]), 'ACTION')
        .appendField('\u2715 10');
    this.setInputsInline(false);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.dht22_value = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['dht22'] = '#include "dht22.h"';
  }
  const action = this.getFieldValue('ACTION').split(',');
  return [
    'dht22_get' + action[0] + '(' + action[1] + ')',
    Blockly.propc.ORDER_ATOMIC,
  ];
};

