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
import * as Sentry from '@sentry/browser';

import {getDefaultProfile, getProjectInitialState} from '../../../project';
import {colorPalette} from '../propc.js';

// ---------------- Ping))) Sensor Blocks -------------------------------------

/**
 * Ping Sensor
 * @type {{
 *  init: Blockly.Blocks.sensor_ping.init,
 *  addPinMenu: Blockly.Blocks.sensor_ping.addPinMenu,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  setToOther: Blockly.Blocks.sensor_ping.setToOther,
 *  domToMutation: Blockly.Blocks.sensor_ping.domToMutation
 *  }}
 */
Blockly.Blocks.sensor_ping = {
  helpUrl: Blockly.MSG_PING_HELPURL,

  /**
   * Initialize the ping sensor block
   */
  init: function() {
    this.setTooltip(Blockly.MSG_SENSOR_PING_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Ping))) distance in')
        .appendField(new Blockly.FieldDropdown([
          ['inches', '_inches'],
          ['cm', '_cm'],
          ['\u00B5s', ''],
        ]),
        'UNIT');

    // Mutation. Use a variable to identify the pir
    this.pinChoices = ['PIN'];
    this.otherPin = [false];

    this.addPinMenu('PIN', null, 0);
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
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
 * @return {[string, number]}
 */
Blockly.propc.sensor_ping = function() {
  let pin = '0';
  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue(this.pinChoices[0]);
  }
  const unit = this.getFieldValue('UNIT');

  if (!this.disabled) {
    Blockly.propc.definitions_['include ping'] = '#include "ping.h"';
  }

  const code = 'ping' + unit + '(' + pin + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

// ---------------- 2-axis Joystick Blocks -----------------------------------

/**
 * Joystick Y Axis Input
 * @type {{
 *  init: Blockly.Blocks.joystick_input_yaxis.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.joystick_input_yaxis = {
  helpUrl: Blockly.MSG_JOYSTICK_HELPURL,
  init: function() {
    let profile = getDefaultProfile();

    if (profile.analog.length === 0) {
      const project = getProjectInitialState();
      const message = `JoystickInputYAxis: ` +
          `Empty profile analog list detected for board type ` +
          `'${project.boardType.name}'.`;

      Sentry.captureMessage(message);
      console.log(message);
      profile = ['A0', '0'];
    }

    this.chan = ['x', 'X'];
    if (this.type === 'joystick_input_yaxis') {
      this.chan = ['y', 'Y'];
    }
    this.setTooltip(Blockly.MSG_JOYSTICK_INPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Joystick ' + this.chan[0] + '-axis A/D')
        .appendField(new Blockly.FieldDropdown(
            profile.analog), 'PIN' + this.chan[1]);
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.joystick_input_yaxis = function() {
  const pinNumber = this.getFieldValue('PIN' + this.chan[1]);

  if (!this.disabled) {
    Blockly.propc.definitions_['include abvolts'] = '#include "abvolts.h"';
  }

  const code = 'ad_in(' + pinNumber + ') * 100 / 4096';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

Blockly.Blocks.joystick_input_xaxis = Blockly.Blocks.joystick_input_yaxis;
Blockly.propc.joystick_input_xaxis = Blockly.propc.joystick_input_yaxis;

// ---------------- Sound Impact Sensor Blocks -----------------------

/**
 * Sound Impact Run
 * @type {{
 *  init: Blockly.Blocks.sound_impact_run.init,
 *  setPinMenus: Blockly.Blocks.sound_impact_run.setPinMenus,
 *  helpUrl: string,
 *  updateConstMenu: Blockly.Blocks.sound_impact_run.updateConstMenu
 *  }}
 */
Blockly.Blocks.sound_impact_run = {
  helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SOUND_IMPACT_RUN_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
    this.updateConstMenu();
  },
  updateConstMenu: function(oldValue, newValue) {
    this.userDefinedConstantsList_ = [];
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let x = 0; x < allBlocks.length; x++) {
      if (allBlocks[x].type === 'constant_define') {
        let vName = allBlocks[x].getFieldValue('CONSTANT_NAME');
        if (vName === oldValue && newValue) {
          vName = newValue;
        }
        if (vName) {
          this.userDefinedConstantsList_.push(vName);
        }
      }
    }
    this.userDefinedConstantsList_ =
        this.userDefinedConstantsList_.sortedUnique();
    this.setPinMenus(oldValue, newValue);
  },
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('PIN');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('Sound Impact initialize PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))), 'PIN');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'PIN');
    } else if (m1) {
      this.setFieldValue(m1, 'PIN');
    }
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Sound Impact initialize') === -1) {
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
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Sound Impact initialize') === -1) {
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
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Sound Impact initialize') === -1) {
    return '// ERROR: Missing sound impact sensor initialize block!';
  } else {
    return 'soundImpact_end(__soundimpactcog);\n';
  }
};

// ---------------- ColorPal Color Sensor Blocks -----------------------
/**
 * ColorPAL Enable
 * @type {{
 *  init: Blockly.Blocks.colorpal_enable.init,
 *  onPinSet: Blockly.Blocks.colorpal_enable.onPinSet,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.colorpal_enable.onchange
 * }}
 */
Blockly.Blocks.colorpal_enable = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_COLORPAL_ENABLE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal initialize PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital, function(myPin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().onPinSet(myPin);
            }), 'IO_PIN');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.colorPalPin = this.getFieldValue('IO_PIN');
    this.onPinSet();
  },
  onchange: function(event) {
    this.colorPalPin = this.getFieldValue('IO_PIN');
    // only fire when a block got deleted or created
    if (event && (event.type == Blockly.Events.BLOCK_CREATE ||
            event.type == Blockly.Events.BLOCK_DELETE)) {
      this.onPinSet(null);
    }
  },
  onPinSet: function(myPin) {
    const oldPin = this.colorPalPin;
    this.colorPalPin = myPin;
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    for (let x = 0; x < allBlocks.length; x++) {
      const func = allBlocks[x].colorpalPins;
      const fund = allBlocks[x].onchange;
      if (func && myPin) {
        func.call(allBlocks[x], oldPin, myPin);
        if (fund) {
          fund.call(allBlocks[x], {xml: true});
        }
      } else if (func) {
        func.call(allBlocks[x]);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_enable = function() {
  const pin = this.getFieldValue('IO_PIN');
  if (!this.disabled) {
    Blockly.propc.definitions_['colorpal'] = '#include "colorpal.h"';
    Blockly.propc.global_vars_['colorpal' + pin] = 'colorPal *cpal' + pin + ';';
    Blockly.propc.setups_['colorpal' + pin] = 'cpal' + pin +
        ' = colorPal_open(' + pin + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.colorpal_get_colors_raw.init,
 *  colorpalPins: Blockly.Blocks.colorpal_get_colors_raw.colorpalPins,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.colorpal_get_colors_raw.onchange,
 *  domToMutation: Blockly.Blocks.colorpal_get_colors_raw.domToMutation,
 *  updateCpin: Blockly.Blocks.colorpal_get_colors_raw.updateCpin
 *  }}
 */
Blockly.Blocks.colorpal_get_colors_raw = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_RAW_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal raw colors store R in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'R_STORAGE');
    this.appendDummyInput()
        .appendField('G in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'G_STORAGE');
    this.appendDummyInput()
        .appendField('B in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'B_STORAGE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.cp_pins = [];
    this.warnFlag = 0;
    this.colorpalPins();
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.getInput('CPIN')) {
      container.setAttribute('cpin', this.getFieldValue('CP_PIN'));
    }
    container.setAttribute('pinmenu', JSON.stringify(this.cp_pins));
    return container;
  },
  domToMutation: function(xmlElement) {
    let cpin = xmlElement.getAttribute('cpin');
    this.cp_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
    if (Array.isArray(this.cp_pins)) {
      this.cp_pins = this.cp_pins.map(function(value) {
        return value[0];
      });
    }
    if (cpin === 'null') {
      cpin = null;
    }
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (cpin) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(
              this.cp_pins.map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      this.setFieldValue(cpin, 'CP_PIN');
    }
  },
  colorpalPins: function(oldPin, newPin) {
    let currentPin = '-1';
    if (this.cp_pins.length > 0) {
      currentPin = this.cp_pins[0];
    }
    this.cp_pins.length = 0;
    if (this.getInput('CPIN')) {
      currentPin = this.getFieldValue('CP_PIN');
    }
    this.updateCpin();
    if (this.getInput('CPIN')) {
      this.removeInput('CPIN');
    }
    if (this.cp_pins.length > 1) {
      this.appendDummyInput('CPIN')
          .appendField('PIN')
          .appendField(new Blockly.FieldDropdown(this.cp_pins
              .map(function(value) {
                return [value, value];
              })), 'CP_PIN');
      if (currentPin === oldPin || oldPin === null) {
        this.setFieldValue(newPin, 'CP_PIN');
      } else {
        if (this.getInput('CPIN') && currentPin !== '-1') {
          this.setFieldValue(currentPin, 'CP_PIN');
        }
      }
    }
  },
  updateCpin: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    this.cp_pins.length = 0;
    for (let x = 0; x < allBlocks.length; x++) {
      if (allBlocks[x].type === 'colorpal_enable') {
        const cp = allBlocks[x].colorPalPin ||
            allBlocks[x].getFieldValue('IO_PIN');
        if (cp) {
          this.cp_pins.push(cp);
        }
      }
    }
    this.cp_pins = this.cp_pins.sortedUnique();
  },
  onchange: function(event) {
    if (event) {
      // only fire when a block got deleted or created,
      // the CP_PIN field was changed
      if (event.type == Blockly.Events.BLOCK_CREATE ||
          event.type == Blockly.Events.BLOCK_DELETE ||
          (event.name === 'CP_PIN' && event.blockId === this.id) ||
          this.warnFlag > 0) {
        const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('ColorPal initialize') === -1) {
          this.setWarningText('WARNING: You must use a ColorPal\ninitialize' +
              ' block at the beginning of your program!');
        } else {
          this.setWarningText(null);
          this.warnFlag--;
          if (this.getInput('CPIN')) {
            let allCpPins = '';
            for (let x = 0; x < allBlocks.length; x++) {
              if (allBlocks[x].type === 'colorpal_enable') {
                allCpPins += (allBlocks[x].colorPalPin ||
                    allBlocks[x].getFieldValue('IO_PIN')) + ',';
              }
            }
            if (allCpPins.indexOf(this.getFieldValue('CP_PIN')) === -1) {
              this.setWarningText(
                  'WARNING: You must use choose a new PIN for this block!');
              // let all changes through long enough to ensure
              // this is set properly.
              this.warnFlag = allBlocks.length * 3;
            }
          }
        }
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_get_colors_raw = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('ColorPal initialize') === -1) {
    return '// ERROR: Missing colorPal initialize block!';
  } else {
    const r = Blockly.propc.variableDB_.getName(
        this.getFieldValue('R_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const g = Blockly.propc.variableDB_.getName(
        this.getFieldValue('G_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    const b = Blockly.propc.variableDB_.getName(
        this.getFieldValue('B_STORAGE'),
        Blockly.VARIABLE_CATEGORY_NAME);
    let p = '0';
    if (this.cp_pins.length > 0) {
      p = this.cp_pins[0];
    }
    if (this.getInput('CPIN')) {
      p = this.getFieldValue('CP_PIN');
    }
    return 'colorPal_getRGB(cpal' + p + ', &' + r + ', &' + g +
        ', &' + b + ');';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.colorpal_get_colors.init,
 *  colorpalPins: (
 *    Blockly.Blocks.colorpal_get_colors_raw.colorpalPins |
 *    Blockly.Blocks.colorpal_get_colors_raw.colorpalPins
 *    ),
 *  mutationToDom: *,
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: *,
 *  updateCpin: (
 *    Blockly.Blocks.colorpal_get_colors_raw.updateCpin |
 *    Blockly.Blocks.colorpal_get_colors_raw.updateCpin
 *    )
 *  }}
 */
Blockly.Blocks.colorpal_get_colors = {
  helpUrl: Blockly.MSG_COLORPAL_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('ColorPal store color in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_GET_ITEM), 'COLOR');

    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.cp_pins = [];
    this.warnFlag = 0;
    this.colorpalPins();
  },
  mutationToDom: Blockly.Blocks['colorpal_get_colors_raw'].mutationToDom,
  domToMutation: Blockly.Blocks['colorpal_get_colors_raw'].domToMutation,
  colorpalPins: Blockly.Blocks['colorpal_get_colors_raw'].colorpalPins,
  updateCpin: Blockly.Blocks['colorpal_get_colors_raw'].updateCpin,
  onchange: Blockly.Blocks['colorpal_get_colors_raw'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.colorpal_get_colors = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('ColorPal initialize') === -1) {
    return '// ERROR: Missing colorPal initialize block!';
  } else {
    const colorVar = Blockly.propc.variableDB_.getName(
        this.getFieldValue('COLOR'),
        Blockly.VARIABLE_CATEGORY_NAME);

    if (!this.disabled) {
      Blockly.propc.global_vars_['colorpal_rr'] = 'int cpRR = 0;';
      Blockly.propc.global_vars_['colorpal_gg'] = 'int cpGG = 0;';
      Blockly.propc.global_vars_['colorpal_bb'] = 'int cpBB = 0;';
    }

    let p = '0';
    if (this.cp_pins.length > 0) {
      p = this.cp_pins[0];
    }
    if (this.getInput('CPIN')) {
      p = this.getFieldValue('CP_PIN');
    }

    return 'colorPal_getRGB(cpal' + p + ', &cpRR, &cpGG, &cpBB);\n\t' +
        colorVar + ' = colorPalRRGGBB(cpRR, cpGG, cpBB);';
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
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
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


// -------------Memsic Tilt/Accel (MX2125 Module) -------------------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.MX2125_acceleration_xaxis.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string, setToOther: *,
 *  domToMutation: *
 *  }}
 */
Blockly.Blocks.MX2125_acceleration_xaxis = {
  helpUrl: Blockly.MSG_MEMSIC_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MX2125_ACCELERATION_XAXIS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.chan = ['x', 'X'];
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    if (this.type.indexOf('yaxis') > -1) {
      this.chan = ['y', 'Y'];
    }
    this.pinChoices = ['PIN' + this.chan[1]];
    this.res = ['acceleration', 'accel'];
    if (this.type.indexOf('tilt') > -1) {
      this.res = ['tilt', 'tilt'];
    }
    this.addPinMenu('Memsic ' + this.res[0] + ' ' + this.chan[0] +
        '-axis PIN', null, 0);
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },
  mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
  addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
  setToOther: Blockly.Blocks['sensor_ping'].setToOther,
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.MX2125_acceleration_xaxis = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['include_mx2125'] = '#include "mx2125.h"';
  }
  let pin = '0';
  if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, 'PIN' + this.chan[1], Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue('PIN' + this.chan[1]);
  }
  return ['mx_' + this.res[1] + '(' + pin + ')', Blockly.propc.ORDER_NONE];
};

/**
 * Alias MX2125_acceleration_yaxis block to the MX2125_acceleration_xaxis block
 * @type {{
 *    init: Blockly.Blocks.MX2125_acceleration_xaxis.init,
 *    addPinMenu: *,
 *    mutationToDom: *,
 *    helpUrl: string,
 *    setToOther: *,
 *    domToMutation: *
 *  }}
 */
Blockly.Blocks.MX2125_acceleration_yaxis =
    Blockly.Blocks.MX2125_acceleration_xaxis;

/**
 * Alias the MX2125_acceleration_yaxis C code generator to the
 * MX2125_acceleration_xaxis object
 * @type {function(): (string|number)[]}
 */
Blockly.propc.MX2125_acceleration_yaxis =
    Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_tilt_xaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_xaxis = Blockly.propc.MX2125_acceleration_xaxis;
Blockly.Blocks.MX2125_tilt_yaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_yaxis = Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_rotation = {
  helpUrl: Blockly.MSG_MEMSIC_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MX2125_ROTATION_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PINX', 'PINY'];
    this.otherPin = [false, false];
    this.addPinMenu('Memsic rotation x-axis PIN', 'YAXIS', 0);
    this.addPinMenu('y-axis PIN', 'XAXIS', 1);
    this.setInputsInline(true);
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setOutput(true, 'Number');
  },
  mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
  addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
  setToOther: Blockly.Blocks['sensor_ping'].setToOther,
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.MX2125_rotation = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['include_mx2125'] = '#include "mx2125.h"';
  }
  const pinVal = ['0', '0'];
  for (let i = 0; i < this.pinChoices.length; i++) {
    if (this.otherPin[i]) {
      pinVal[i] = Blockly.propc.valueToCode(
          this, this.pinChoices[i], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
      pinVal[i] = this.getFieldValue(this.pinChoices[i]);
    }
  }
  const code = 'mx_rotate(' + pinVal[0] + ', ' + pinVal[1] + ')';
  return [code, Blockly.propc.ORDER_NONE];
};

// --------------Accelerometer (MMA7455 Module) Blocks--------------------

/**
 * MMA7455 Initialization
 * @type {{
 *  init: Blockly.Blocks.MMA7455_init.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.MMA7455_init = {
  helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_MMA7455_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Accelerometer initialize CS')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINZ')
        .appendField('DATA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINX')
        .appendField('CLK')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PINY');

    this.setInputsInline(false);
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
  },
};

/**
 *
 * @return {string}
 * @constructor
 */
Blockly.propc.MMA7455_init = function() {
  const pinx = this.getFieldValue('PINX');
  const piny = this.getFieldValue('PINY');
  const pinz = this.getFieldValue('PINZ');

  if (!this.disabled) {
    Blockly.propc.definitions_['include_mma7455'] = '#include "mma7455.h"';
    Blockly.propc.global_vars_['mma_7455_tempVars'] = 'short int __tmpX,' +
        ' __tmpY, __tmpZ;';
    Blockly.propc.setups_['mma_7455'] = 'MMA7455_init(' +
        pinx + ', ' + piny + ', ' + pinz + ');';
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.MMA7455_acceleration.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.MMA7455_acceleration.onchange
 *  }}
 */
Blockly.Blocks.MMA7455_acceleration = {
  helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_MMA7455_ACCELERATION_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Accelerometer store x-axis in')
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
    if (allBlocks.indexOf('Accelerometer initialize') === -1) {
      this.setWarningText('WARNING: You must use an Accelerometer\ninitialize' +
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
Blockly.propc.MMA7455_acceleration = function() {
  let code = '';
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('Accelerometer initialize') === -1) {
    code += '// ERROR: Missing Accelerometer initialize block!';
  } else {
    const xStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('X_VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    const yStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Y_VAR'), Blockly.VARIABLE_CATEGORY_NAME);
    const zStorage = Blockly.propc.variableDB_.getName(
        this.getFieldValue('Z_VAR'), Blockly.VARIABLE_CATEGORY_NAME);

    code += 'MMA7455_getxyz10(&__tmpX, &__tmpY, &__tmpZ);\n';
    code += xStorage + ' = (int) __tmpX;\n' + yStorage + ' = (int) __tmpY;\n' +
        zStorage + ' = (int) __tmpZ;\n';
  }
  return code;
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

// ------------------ GPS module Blocks -----------------------

/**
 * GPS Initialization
 * @type {{
 *  init: Blockly.Blocks.GPS_init.init,
 *  setPinMenus: Blockly.Blocks.GPS_init.setPinMenus,
 *  helpUrl: string, updateConstMenu: *
 *  }}
 */
Blockly.Blocks.GPS_init = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_INIT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput('PINS');
    this.setNextStatement(true, null);
    this.setPreviousStatement(true, 'Block');
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m = this.getFieldValue('TXPIN');
    const b = this.getFieldValue('BAUD');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('GPS module initialize TX')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(
                this.userDefinedConstantsList_.map(function(value) {
                  return [value, value];
                }))), 'TXPIN')
        .appendField('baud')
        .appendField(new Blockly.FieldDropdown([
          ['9600', '9600'],
          ['2400', '2400'],
          ['4800', '4800'],
          ['19200', '19200'],
        ]), 'BAUD');
    this.setFieldValue(b, 'BAUD');
    if (m && m === oldValue && newValue) {
      this.setFieldValue(newValue, 'TXPIN');
    } else if (m) {
      this.setFieldValue(m, 'TXPIN');
    }
  },
};

/**
 * GPS Initialization C code generator
 * @return {string}
 */
Blockly.propc.GPS_init = function() {
  const profile = getDefaultProfile();
  let txPin = this.getFieldValue('TXPIN');
  if (profile.digital.toString().indexOf(txPin + ',' + txPin) === -1) {
    txPin = 'MY_' + txPin;
  }
  const baud = this.getFieldValue('BAUD');

  if (!this.disabled) {
    Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';
  }
  return 'gps_open(' + txPin + ', 32, ' + baud + ');\npause(100);';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_hasFix.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_hasFix.onchange
 *  }}
 */
Blockly.Blocks.GPS_hasFix = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_HASFIX_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS has valid satellite fix');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_hasFix = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['gps_fixValid()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_latitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_latitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_latitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_LAT_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS latitude (\u00B5\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_latitude = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) (gps_latitude() * 1000000)', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_longitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_longitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_longitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_LONG_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS longitude (\u00B5\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]}
 * @constructor
 */
Blockly.propc.GPS_longitude = function() {
  Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';
  const code = '(int) (gps_longitude() * 1000000)';

  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_heading.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_heading.onchange
 *  }}
 */
Blockly.Blocks.GPS_heading = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_HEADING_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS heading (\u00B0)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_heading = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) gps_heading()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_altitude.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_altitude.onchange
 *  }}
 */
Blockly.Blocks.GPS_altitude = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_ALTITUDE_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS altitude (cm)');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_altitude = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initialize block!';
  } else {
    return ['(int) (gps_altitude() * 100)', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_satsTracked.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_satsTracked.onchange
 *  }}
 */
Blockly.Blocks.GPS_satsTracked = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_SATS_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS number of satellites');

    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_satsTracked = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    return ['gps_satsTracked()', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_velocity.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_velocity.onchange
 *  }}
 */
Blockly.Blocks.GPS_velocity = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS speed in')
        .appendField(new Blockly.FieldDropdown([
          ['mph', 'MPH'],
          ['knots', 'KNOTS'],
        ]), 'VELOCITYUNITS');

    this.setOutput(true, 'Number');
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {string|[string, number]}
 * @constructor
 */
Blockly.propc.GPS_velocity = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    const velocityUnits = this.getFieldValue('VELOCITYUNITS');
    return [
      '(int) gps_velocity(' + velocityUnits + ')',
      Blockly.propc.ORDER_ATOMIC,
    ];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.GPS_date_time.init,
 *  updateShape_: Blockly.Blocks.GPS_date_time.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.GPS_date_time.onchange,
 *  domToMutation: Blockly.Blocks.GPS_date_time.domToMutation
 *  }}
 */
Blockly.Blocks.GPS_date_time = {
  helpUrl: Blockly.MSG_GPS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('GPS current ')
        .appendField(new Blockly.FieldDropdown([
          ['year', 'GPS_UNIT_YEAR'],
          ['month', 'GPS_UNIT_MONTH'],
          ['day', 'GPS_UNIT_DAY'],
          ['hour', 'GPS_UNIT_HOUR'],
          ['minute', 'GPS_UNIT_MINUTE'],
          ['second', 'GPS_UNIT_SECOND'],
        ], function(action) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(action);
        }), 'TIME_UNIT');
    this.setOutput(true, 'Number');
    this.setNextStatement(false, null);
    this.setPreviousStatement(false, null);
    this.setInputsInline(true);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('unit', this.getFieldValue('TIME_UNIT'));
    return container;
  },
  domToMutation: function(container) {
    // Create array of timezones
    this.timeZones = [['UTC+0', '0']];
    for (let tz = -1; tz != 0; tz--) {
      if (tz < -12) {
        tz = 14;
      }
      this.timeZones.push(['UTC' + (tz > -1 ? '+' : '') +
        tz.toString(10), tz.toString(10)]);
    }
    this.updateShape_(container.getAttribute('unit') || '');
  },
  updateShape_: function(action) {
    const show = ([
      'GPS_UNIT_HOUR',
      'GPS_UNIT_DAY',
      'GPS_UNIT_MONTH',
      'GPS_UNIT_YEAR',
    ].indexOf(action) >= 0);
    if (show && !this.getInput('ZONE_FIELDS')) {
      this.appendDummyInput('ZONE_FIELDS')
          .appendField('time zone', 'ZONE_LABEL')
          .appendField(new Blockly.FieldDropdown(this.timeZones), 'ZONE_VALUE');
    } else if (!show && this.getInput('ZONE_FIELDS')) {
      this.removeInput('ZONE_FIELDS');
    }
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1) {
      this.setWarningText('WARNING: You must use a GPS module\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      this.setWarningText(null);
    }
  },
};

/**
 *
 * @return {[string, number]|string}
 * @constructor
 */
Blockly.propc.GPS_date_time = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
  if (allBlocks.indexOf('GPS module initialize') === -1) {
    return '// ERROR: Missing GPS initalize block!';
  } else {
    const timeUnit = this.getFieldValue('TIME_UNIT');
    let zoneUnit = '0';
    if (timeUnit === 'GPS_UNIT_HOUR' ||
                timeUnit === 'GPS_UNIT_DAY' ||
                timeUnit === 'GPS_UNIT_MONTH' ||
                timeUnit === 'GPS_UNIT_YEAR') {
      zoneUnit = this.getFieldValue('ZONE_VALUE');
    }

    Blockly.propc.definitions_['include GPS'] = '#include "gps.h"';

    let dtDefines = '#define GPS_UNIT_YEAR     1\n';
    dtDefines += '#define GPS_UNIT_DAY      2\n';
    dtDefines += '#define GPS_UNIT_MONTH    3\n';
    dtDefines += '#define GPS_UNIT_HOUR     4\n';
    dtDefines += '#define GPS_UNIT_MINUTE   5\n';
    dtDefines += '#define GPS_UNIT_SECOND   6\n';
    Blockly.propc.definitions_['GPS_dateTime_units'] = dtDefines;

    const dtDeclare = 'int gps_dateTimeByUnit(char __u, int __z);\n';
    let dtFunction = 'int gps_dateTimeByUnit(char __u, int __z){';
    dtFunction += 'int __gpsTime = gps_rawTime();int __gpsDate =' +
        ' gps_rawDate();\n';
    dtFunction += 'int __monthDays[13] = {31, 31, 28, 31, 30, 31, 30, 31,' +
        ' 31, 30, 31, 30, 31};\n';
    dtFunction += 'int __gpsDay = __gpsDate / 10000;\n';
    dtFunction += 'int __gpsMonth = __gpsDate / 100 - (__gpsDate / 10000)' +
        ' * 100;\n';
    dtFunction += 'int __gpsYear = __gpsDate - (__gpsDate / 100) * 100;\n';
    dtFunction += 'if (__gpsYear % 4 == 0) __monthDays[2] = 29;\n';
    dtFunction += 'int __gpsHour = __gpsTime / 10000 + __z;\n';
    dtFunction += 'if (__gpsHour < 0) { __gpsHour += 24; __gpsDay--; }\n';
    dtFunction += 'if (__gpsHour > 23) { __gpsHour -= 24; __gpsDay++; }\n';
    dtFunction += 'if (__gpsDay > __monthDays[__gpsMonth]) { __gpsDay = 1;' +
        ' __gpsMonth++; }\n';
    dtFunction += 'if (__gpsDay < 1) { __gpsMonth--; __gpsDay =' +
        ' __monthDays[__gpsMonth]; }\n';
    dtFunction += 'if (__gpsMonth < 1) { __gpsYear--; __gpsMonth = 12; }\n';
    dtFunction += 'if (__gpsMonth > 12) { __gpsYear++; __gpsMonth = 1; }\n';
    dtFunction += 'switch (__u){case GPS_UNIT_DAY:return __gpsDay;break;\n';
    dtFunction += 'case GPS_UNIT_MONTH:\nreturn __gpsMonth;break;\n';
    dtFunction += 'case GPS_UNIT_YEAR:\nreturn __gpsYear;break;\n';
    dtFunction += 'case GPS_UNIT_HOUR:\nreturn __gpsHour;break;\n';
    dtFunction += 'case GPS_UNIT_MINUTE:\nreturn __gpsTime / 100 - (__gpsTime' +
        ' / 10000) * 100;break;\n';
    dtFunction += 'case GPS_UNIT_SECOND:\nreturn __gpsTime -' +
        ' (__gpsTime / 100) * 100;break;\n';
    dtFunction += 'default:\nreturn -1;break;}}';

    if (!this.disabled) {
      Blockly.propc.methods_['gps_time_func'] = dtFunction;
      Blockly.propc.method_declarations_['gps_time_func'] = dtDeclare;
    }
    return ['gps_dateTimeByUnit(' + timeUnit + ', ' + zoneUnit +
    ')', Blockly.propc.ORDER_ATOMIC];
  }
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

// ---------- Sony TV Remote (Using 40 kHz IR sensor) Blocks -----------

/**
 *
 * @type {{
 *  init: Blockly.Blocks.sirc_get.init,
 *  addPinMenu: *,
 *  mutationToDom: *,
 *  helpUrl: string,
 *  setToOther: *,
 *  domToMutation: *
 *  }}
 */
Blockly.Blocks.sirc_get = {
  helpUrl: Blockly.MSG_SONY_REMOTE_HELPURL,
  init: function() {
    const project = getProjectInitialState();
    this.setTooltip(Blockly.MSG_SIRC_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.pinChoices = ['PIN'];
    this.otherPin = [false];
    if (project.boardType.name === 'heb-wx') {
      this.appendDummyInput()
          .appendField('Sony Remote value received');
    } else {
      this.addPinMenu('Sony Remote value received from PIN', null, 0);
    }
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
  mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
  addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
  setToOther: Blockly.Blocks['sensor_ping'].setToOther,
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.sirc_get = function() {
  const project = getProjectInitialState();
  let pin = '0';
  if (project.boardType.name === 'heb-wx') {
    pin = '23';
  } else if (this.otherPin[0]) {
    pin = Blockly.propc.valueToCode(
        this, 'PIN', Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue('PIN');
  }
  if (!this.disabled) {
    Blockly.propc.definitions_['sirc'] = '#include "sirc.h"';
    Blockly.propc.setups_['sirc'] = 'sirc_setTimeout(70);';
  }
  const code = 'sirc_button(' + pin + ')';
  return [code, Blockly.propc.ORDER_NONE];
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


// ------------------ DHT22 Temp & Humidity Sensor ----------------------

/**
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
  mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
  domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
  addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
  setToOther: Blockly.Blocks['sensor_ping'].setToOther,
};

/**
 *
 * @return {string}
 */
Blockly.propc.dht22_read = function() {
  if (!this.disabled) {
    Blockly.propc.definitions_['dht22'] = '#include "dht22.h"';
  }

  let pin = '0';
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


// ------------------ BME680 Air Quality Sensor -----------------------------

/**
 * bme680 Initialization
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
  updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const mv = ['PIN_CLK', 'PIN_SDI', 'PIN_SDO', 'PIN_CS'];
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
