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

    // Prepare the Pin dropdown list
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

