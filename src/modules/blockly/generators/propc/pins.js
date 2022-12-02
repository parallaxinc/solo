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
import {getDefaultProfile} from '../../../project';
import {colorPalette} from '../propc';

/**
 * Make a Pin
 * @type {{
 *  init: Blockly.Blocks.make_pin.init
 *  }}
 */
Blockly.Blocks.make_pin = {
  init: function() {
    const profile = getDefaultProfile();

    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_IO_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_PINS_HELPURL);
    }

    this.setTooltip(Blockly.MSG_MAKE_PIN_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.appendDummyInput()
        .appendField('make PIN')
        .appendField(new Blockly.FieldDropdown(profile.digital), 'PIN')
        .appendField(new Blockly.FieldDropdown([
          ['high', 'HIGH'],
          ['low', 'LOW'],
          ['toggle', 'TOGGLE'],
          ['input', 'INPUT'],
          ['reverse', 'REVERSE'],
        ]),
        'ACTION');
  },
};


/**
 * Emit C source code to make a pin
 * @return {string}
 */
Blockly.propc.make_pin = function() {
  const dropdownPin = this.getFieldValue('PIN');
  // const dropdown_action = this.getFieldValue('ACTION');

  switch (this.getFieldValue('ACTION')) {
    case 'HIGH':
      return 'high(' + dropdownPin + ');\n';

    case 'LOW':
      return 'low(' + dropdownPin + ');\n';

    case 'TOGGLE':
      // eslint-disable-next-line max-len
      return 'toggle(' + dropdownPin + ');\n\tset_direction(' + dropdownPin + ', 1);\n';

    case 'INPUT':
      return 'set_direction(' + dropdownPin + ', 0);\n';

    case 'REVERSE':
      return 'reverse(' + dropdownPin + ');\n';
  }
};


/**
 * Make a Pin Input
 * @type {{
 *  init: Blockly.Blocks.make_pin_input.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.make_pin_input = {
  helpUrl: Blockly.MSG_PINS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();

    this.setTooltip(Blockly.MSG_MAKE_PIN_INPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.appendDummyInput('')
        .appendField('make PIN');
    this.appendValueInput('PIN')
        .setCheck('Number')
        .appendRange('A,' + profile.digital.toString());
    this.appendDummyInput('ACTION')
        .appendField(new Blockly.FieldDropdown(
            [['high', 'HIGH'],
              ['low', 'LOW'],
              ['toggle', 'TOGGLE'],
              ['input', 'INPUT'],
              ['reverse', 'REVERSE'],
            ]),
        'ACTION');
  },
};


/**
 *
 * @return {string}
 */
Blockly.propc.make_pin_input = function() {
  const pin = Blockly.propc.valueToCode(this, 'PIN', Blockly.propc.ORDER_ATOMIC) || 0;
  const dropdownAction = this.getFieldValue('ACTION');

  switch (dropdownAction) {
    case 'HIGH':
      return 'high(' + pin + ');\n';

    case 'LOW':
      return 'low(' + pin + ');\n';

    case 'TOGGLE':
      return 'toggle(' + pin + ');\n\tset_direction(' + pin + ', 1);\n';

    case 'INPUT':
      return 'set_direction(' + pin + ', 0);\n';

    case 'REVERSE':
      return 'reverse(' + pin + ');\n';
  }
};


/**
 * Check Pin
 * @type {{
 *  init: Blockly.Blocks.check_pin.init
 *  }}
 */
Blockly.Blocks.check_pin = {
  init: function() {
    const profile = getDefaultProfile();

    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_IO_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_PINS_HELPURL);
    }

    this.setTooltip(Blockly.MSG_CHECK_PIN_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.appendDummyInput('')
        .appendField('check PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PIN');
    this.setOutput(true, 'Number');
  },
};


/**
 *
 * @return {[string, number]}
 */
Blockly.propc.check_pin = function() {
  const dropdownPin = this.getFieldValue('PIN');
  const code = 'input(' + dropdownPin + ')';

  return [code, Blockly.propc.ORDER_ATOMIC];
};


/**
 * Check Pin Input
 * @type {{
 *  init: Blockly.Blocks.check_pin_input.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.check_pin_input = {
  helpUrl: Blockly.MSG_PINS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();

    this.setTooltip(Blockly.MSG_CHECK_PIN_INPUT_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.appendValueInput('PIN')
        .appendField('check PIN')
        .setCheck('Number')
        .appendRange('A,' + profile.digital.toString());
    this.setOutput(true, 'Number');
    this.setInputsInline(true);
  },
};


/**
 *
 * @return {[string, number]}
 */
Blockly.propc.check_pin_input = function() {
  const dropdownPin = Blockly.propc.valueToCode(
      this, 'PIN', Blockly.propc.ORDER_UNARY_PREFIX) || '0';
  const code = 'input(' + dropdownPin + ')';

  return [code, Blockly.propc.ORDER_ATOMIC];
};


/**
 * Set Pins
 * @type {{
 *  init: Blockly.Blocks.set_pins.init,
 *  updateShape_: Blockly.Blocks.set_pins.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.set_pins.domToMutation
 *  }}
 */
Blockly.Blocks.set_pins = {
  helpUrl: Blockly.MSG_PINS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();

    this.setTooltip(Blockly.MSG_SET_PINS_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    const startPin = [];
    for (let i = profile.contiguous_pins_start;
      i <= profile.contiguous_pins_end; i++) {
      startPin.push([i.toString(), i.toString()]);
    }

    const pinCount = [];
    for (let i = profile.contiguous_pins_start;
      i <= profile.contiguous_pins_end; i++) {
      pinCount.push([i.toString(), i.toString()]);
    }

    this.appendDummyInput('')
        .appendField('set the')
        .appendField(new Blockly.FieldDropdown(
            [['states', 'STATE'],
              ['directions', 'DIRECTION'],
            ],
            function(action) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().updateShape_({'ACTION': action});
            }), 'ACTION')

        .appendField('from lowest PIN')
        .appendField(new Blockly.FieldDropdown(pinCount,
            function(startPin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().updateShape_({'START_PIN': startPin});
            }), 'START_PIN')

        .appendField('to highest PIN')
        .appendField(new Blockly.FieldDropdown(
            startPin, function(pinCount) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().updateShape_({'PIN_COUNT': pinCount});
            }), 'PIN_COUNT');

    this.appendDummyInput('PINS')
        .appendField('values:')
        .appendField('P0:')
        .appendField(new Blockly.FieldDropdown([
          ['HIGH', '1'],
          ['LOW', '0'],
        ]),
        'P0');
  },

  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('action', this.getFieldValue('ACTION'));
    container.setAttribute('pin_count', this.getFieldValue('PIN_COUNT'));
    container.setAttribute('start_pin', this.getFieldValue('START_PIN'));
    return container;
  },

  domToMutation: function(xmlElement) {
    this.updateShape_({
      'ACTION': xmlElement.getAttribute('action'),
      'PIN_COUNT': xmlElement.getAttribute('pin_count'),
      'START_PIN': xmlElement.getAttribute('start_pin'),
    });
  },

  updateShape_: function(details) {
    const data = [];
    for (let i = 0; i < 32; i++) {
      data.push(this.getFieldValue('P' + i));
    }

    let action = details['ACTION'];
    if (details['ACTION'] === undefined) {
      action = this.getFieldValue('ACTION');
    }
    let pinCount = details['PIN_COUNT'];
    if (details['PIN_COUNT'] === undefined) {
      pinCount = this.getFieldValue('PIN_COUNT');
    }
    let startPin = details['START_PIN'];
    if (details['START_PIN'] === undefined) {
      startPin = this.getFieldValue('START_PIN');
    }

    pinCount = Number(pinCount);
    startPin = Number(startPin);

    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('Values:');

    const inputPins = this.getInput('PINS');
    for (let i = 0; i < (pinCount - startPin + 1); i++) {
      const pin = startPin + i;
      if (action === 'STATE') {
        inputPins.appendField('P' + pin + ':')
            .appendField(new Blockly.FieldDropdown(
                [['HIGH', '1'], ['LOW', '0']]),
            'P' + pin);
      } else if (action === 'DIRECTION') {
        inputPins.appendField('P' + pin + ':')
            .appendField(new Blockly.FieldDropdown(
                [['OUT', '1'], ['IN', '0']]),
            'P' + pin);
      }
    }

    for (let i = 0; i < 32; i++) {
      if (this.getField('P' + i) && data[i] !== null) {
        this.setFieldValue(data[i], 'P' + i);
      }
    }
  },
};


/**
 * Generate C source code for the set_pins block
 *
 * @return {string}
 */
Blockly.propc.set_pins = function() {
  let code = '';
  const action = this.getFieldValue('ACTION');
  const dropdownPinCount = Number(this.getFieldValue('PIN_COUNT'));
  const dropdownStartPin = Number(this.getFieldValue('START_PIN'));

  if (action === 'STATE') {
    code = 'set_outputs(';
  } else if (action === 'DIRECTION') {
    code = 'set_directions(';
  }

  code += dropdownPinCount;
  code += ', ';
  code += dropdownStartPin;
  code += ', 0b';

  for (let i = dropdownPinCount; i >= dropdownStartPin; i--) {
    code += this.getFieldValue('P' + i);
  }

  return code + ');\n';
};

/**
 * Get Pins
 * @type {{
 *  init: Blockly.Blocks.get_pins.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.get_pins = {
  helpUrl: Blockly.MSG_PINS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_GET_PINS_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');

    const startPin = [];
    for (let i = profile.contiguous_pins_start;
      i <= profile.contiguous_pins_end; i++) {
      startPin.push([i.toString(), i.toString()]);
    }

    const pinCount = [];
    for (let i = profile.contiguous_pins_start;
      i <= profile.contiguous_pins_end; i++) {
      pinCount.push([i.toString(), i.toString()]);
    }

    this.appendDummyInput('')
        .appendField('get the')
        .appendField(new Blockly.FieldDropdown([
          ['states', 'STATE'],
          ['directions', 'DIRECTION'],
        ]),
        'ACTION')
        .appendField('from lowest PIN')
        .appendField(new Blockly.FieldDropdown(pinCount), 'START_PIN')
        .appendField('to highest PIN')
        .appendField(new Blockly.FieldDropdown(startPin), 'PIN_COUNT');
  },
};


/**
 * Generate the C source code for the get_pins block
 *
 * @return {[string, number]}
 */
Blockly.propc.get_pins = function() {
  const action = this.getFieldValue('ACTION');
  const dropdownPinCount = Number(this.getFieldValue('PIN_COUNT'));
  const dropdownStartPin = Number(this.getFieldValue('START_PIN'));
  let code = '';

  if (action === 'STATE') {
    code = 'get_states(';
  } else if (action === 'DIRECTION') {
    code = 'get_outputs(';
  }

  code += dropdownPinCount + ', ' + dropdownStartPin + ')';
  return [code, Blockly.propc.ORDER_NONE];
};


/**
 * Set Binary Pins
 * @type {{
 *  init: Blockly.Blocks.set_pins_binary.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.set_pins_binary = {
  helpUrl: Blockly.MSG_PINS_HELPURL,

  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SET_PINS_BINARY_TOOLTIP);
    this.setColour(colorPalette.getColor('io'));
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);

    const startPin = [];
    for (let i = profile.contiguous_pins_start;
      i <= profile.contiguous_pins_end; i++) {
      startPin.push([i.toString(), i.toString()]);
    }

    const pinCount = [];
    for (let i = profile.contiguous_pins_start; i <= profile.contiguous_pins_end; i++) {
      pinCount.push([i.toString(), i.toString()]);
    }

    this.appendValueInput('VALUE')
        .appendField('set the')
        .appendField(new Blockly.FieldDropdown([
          ['states', 'STATE'],
          ['directions', 'DIRECTION'],
        ]),
        'ACTION')
        .appendField('from lowest PIN')
        .appendField(new Blockly.FieldDropdown(pinCount), 'START_PIN')
        .appendField('to highest PIN')
        .appendField(new Blockly.FieldDropdown(startPin), 'PIN_COUNT')
        .appendField('using bits from')
        .setCheck('Number');
  },
};


/**
 * Generate C source code for the sey_pins_binary block
 *
 * @return {string}
 */
Blockly.propc.set_pins_binary = function() {
  const value = Blockly.propc.valueToCode(this, 'VALUE', Blockly.propc.ORDER_NONE) || '0b0000';
  const action = this.getFieldValue('ACTION');
  const pinCount = Number(this.getFieldValue('PIN_COUNT'));
  const startPin = Number(this.getFieldValue('START_PIN'));
  let code = '';

  if (action === 'STATE') {
    code = 'set_outputs(';
  } else if (action === 'DIRECTION') {
    code = 'set_directions(';
  }

  code += pinCount + ', ' + startPin + ', ' + value + ');\n';
  return code;
};
