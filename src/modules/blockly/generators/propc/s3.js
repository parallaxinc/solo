
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

'use strict';

import Blockly from 'blockly/core.js';
import {getDefaultProfile} from '../../../project.js';
import {colorPalette} from '../propc.js';

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_loop.init
 * }}
 */
Blockly.Blocks.scribbler_loop = {
  init: function() {
    this.appendDummyInput()
        .appendField('loop');
    this.appendStatementInput('LOOP');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('programming'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_CONTROL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_LOOP_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_loop = function() {
  let branch = Blockly.propc.statementToCode(this, 'LOOP');
  if (Blockly.propc.INFINITE_LOOP_TRAP) {
    branch = Blockly.propc.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  return 'while(1) {\n' + branch + '}\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_limited_loop.init
 * }}
 */
Blockly.Blocks.scribbler_limited_loop = {
  init: function() {
    this.appendDummyInput()
        .appendField('loop')
        .appendField(new Blockly.FieldNumber('10', null, null, 1), 'LOOP_COUNT')
        .appendField('times');
    this.appendStatementInput('LOOP');

    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('programming'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_CONTROL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_LIMITED_LOOP_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_limited_loop = function() {
  let branch = Blockly.propc.statementToCode(this, 'LOOP');
  if (Blockly.propc.INFINITE_LOOP_TRAP) {
    branch = Blockly.propc.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  const repeats = this.getFieldValue('LOOP_COUNT') || '0';
  return 'for (int __n = 0; __n < ' + repeats + '; __n++) {\n' + branch + '}\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_exit_loop.init
 * }}
 */
Blockly.Blocks.scribbler_exit_loop = {
  init: function() {
    this.appendDummyInput()
        .appendField('exit loop');
    this.setPreviousStatement(true, 'Block');
    this.setColour(colorPalette.getColor('programming'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_CONTROL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_EXIT_LOOP_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_exit_loop = function() {
  return 'break;\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_simple_wait.init
 * }}
 */
Blockly.Blocks.scribbler_simple_wait = {
  init: function() {
    if (this.type === 'scribbler_simple_wait') {
      this.appendDummyInput()
          .appendField('wait')
          .appendField(new Blockly.FieldNumber('5', null, null, 1), 'WAITTIME');
    } else {
      this.appendValueInput('WAITTIME', 'Number')
          .appendRange('R,1,2147483647,1')
          .appendField('wait')
          .setCheck('Number');
    }
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['seconds', '1000'],
          ['tenths of a second', '100'],
          ['milliseconds', '1'],
        ], function(timeScale) {
          // eslint-disable-next-line no-invalid-this
          if (this.type !== 'scribbler_simple_wait') {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().getInput('WAITTIME')
                .appendRange('R,0,' + (2147483647 / parseInt(timeScale))
                    .toFixed(0) + ',1');
          }
        }), 'TIMESCALE');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('programming'));
    this.setHelpUrl(Blockly.MSG_S3_CONTROL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_WAIT_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_simple_wait = function() {
  let timeScale = ' * ';
  if (!this.getFieldValue('TIMESCALE') ||
      this.getFieldValue('TIMESCALE') === '1') {
    timeScale = '';
  } else {
    timeScale += this.getFieldValue('TIMESCALE');
  }

  let waitTime = '';
  if (this.type === 'scribbler_simple_wait') {
    waitTime = this.getFieldValue('WAITTIME') || '1';
  } else {
    waitTime = Blockly.propc.valueToCode(
        this, 'WAITTIME', Blockly.propc.ORDER_NONE) || '1';
  }

  if (waitTime !== '0') {
    return 'pause(' + waitTime + timeScale + ');\n';
  } else {
    return '';
  }
};

Blockly.Blocks.scribbler_wait = Blockly.Blocks.scribbler_simple_wait;
Blockly.propc.scribbler_wait = Blockly.propc.scribbler_simple_wait;

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_line.init,
 *  checkForWas: Blockly.Blocks.scribbler_if_line.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_if_line.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_if_line = {
  init: function() {
    this.appendDummyInput()
        .appendField('if the Scribbler')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'LINE_CONDITION')
        .appendField('over')
        .appendField(new Blockly.FieldDropdown([
          ['the center', 'CENTER'],
          ['the left edge', 'LEFT'],
          ['the right edge', 'RIGHT'],
          ['any part', 'DETECTED'],
        ]), 'LINE_POSITION')
        .appendField('of a')
        .appendField(new Blockly.FieldDropdown([
          ['black', 'BLACK'],
          ['white', 'WHITE'],
        ]), 'LINE_COLOR')
        .appendField('line');
    this.appendStatementInput('IF_LINE')
        .appendField();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_LINE_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('LINE_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_line = function() {
  const code = 'if(s3_simpleLine(S3_' + this.getFieldValue('LINE_CONDITION') +
      ', S3_' + this.getFieldValue('LINE_POSITION') +
      ', S3_' + this.getFieldValue('LINE_COLOR') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_LINE') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_simple_line.init,
 *  checkForWas: Blockly.Blocks.scribbler_simple_line.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_simple_line.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_simple_line = {
  init: function() {
    this.appendDummyInput()
        .appendField('line sensor')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'LINE_CONDITION')
        .appendField('over')
        .appendField(new Blockly.FieldDropdown([
          ['the center', 'CENTER'],
          ['the left edge', 'LEFT'],
          ['the right edge', 'RIGHT'],
          ['any part', 'DETECTED'],
        ]), 'LINE_POSITION')
        .appendField('of a')
        .appendField(new Blockly.FieldDropdown([
          ['black', 'BLACK'],
          ['white', 'WHITE'],
        ]), 'LINE_COLOR')
        .appendField('line');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_LINE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_LINE_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('LINE_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_simple_line = function() {
  const code = 's3_simpleLine(S3_' + this.getFieldValue('LINE_CONDITION') +
      ', S3_' + this.getFieldValue('LINE_POSITION') +
      ', S3_' + this.getFieldValue('LINE_COLOR') + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_obstacle.init,
 *  checkForWas: Blockly.Blocks.scribbler_if_obstacle.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_if_obstacle.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_if_obstacle = {
  init: function() {
    this.appendDummyInput()
        .appendField('if an obstacle')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'OBSTACLE_CONDITION')
        .appendField(new Blockly.FieldDropdown([
          ['in front of', 'CENTER'],
          ['to the left of', 'LEFT'],
          ['to the right of', 'RIGHT'],
          ['detected by', 'DETECTED'],
        ]), 'OBSTACLE_POSITION')
        .appendField('the Scribbler');
    this.appendStatementInput('IF_OBSTACLE')
        .appendField();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_OBSTACLE_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === undefined) state = this.getFieldValue('OBSTACLE_CONDITION');
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('OBSTACLE_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_obstacle = function() {
  const code = 'if(s3_simpleObstacle(S3_' +
      this.getFieldValue('OBSTACLE_CONDITION') + ', S3_' +
      this.getFieldValue('OBSTACLE_POSITION') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_OBSTACLE') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_simple_obstacle.init,
 *  checkForWas: Blockly.Blocks.scribbler_simple_obstacle.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_simple_obstacle.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_simple_obstacle = {
  init: function() {
    this.appendDummyInput()
        .appendField('obstacle')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'OBSTACLE_CONDITION')
        .appendField('detected')
        .appendField(new Blockly.FieldDropdown([
          ['in front', 'CENTER'],
          ['to the left', 'LEFT'],
          ['to the right', 'RIGHT'],
          ['on either side', 'DETECTED'],
        ]), 'OBSTACLE_POSITION');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_OBSTACLE_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('OBSTACLE_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_simple_obstacle = function() {
  const code = 's3_simpleObstacle(S3_' +
      this.getFieldValue('OBSTACLE_CONDITION') + ', S3_' +
      this.getFieldValue('OBSTACLE_POSITION') + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_light.init,
 *  checkForWas: Blockly.Blocks.scribbler_if_light.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_if_light.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_if_light = {
  init: function() {
    this.appendDummyInput()
        .appendField('if the most light')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT']], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'LIGHT_CONDITION')
        .appendField(new Blockly.FieldDropdown([
          ['in front', 'CENTER'],
          ['to the left', 'LEFT'],
          ['to the right', 'RIGHT'],
          ['on all sides', 'DETECTED'],
        ]), 'LIGHT_POSITION')
        .appendField('of the Scribbler');
    this.appendStatementInput('IF_LIGHT')
        .appendField();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_LIGHT_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('LIGHT_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_light = function() {
  const code = 'if(s3_simpleLight(S3_' +
      this.getFieldValue('LIGHT_CONDITION') + ', S3_' +
      this.getFieldValue('LIGHT_POSITION') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_LIGHT') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_simple_light.init,
 *  checkForWas: Blockly.Blocks.scribbler_simple_light.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_simple_light.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_simple_light = {
  init: function() {
    this.appendDummyInput()
        .appendField('light sensed is')
        .appendField(new Blockly.FieldDropdown([
          ['brightest', 'IS'],
          ['darkest', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'LIGHT_CONDITION')
        .appendField(' ')
        .appendField(new Blockly.FieldDropdown([
          ['in front', 'CENTER'],
          ['to the left', 'LEFT'],
          ['to the right', 'RIGHT'],
        ]), 'LIGHT_POSITION');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_LIGHT_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_LIGHT_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('LIGHT_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_simple_light = function() {
  const code = 's3_simpleLight(S3_' +
      this.getFieldValue('LIGHT_CONDITION') + ', S3_' +
      this.getFieldValue('LIGHT_POSITION') + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_stalled.init,
 *  checkForWas: Blockly.Blocks.scribbler_if_stalled.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_if_stalled.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_if_stalled = {
  init: function() {
    this.appendDummyInput()
        .appendField('if the Scribbler')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'STALLED_CONDITION')
        .appendField('stuck');
    this.appendStatementInput('IF_STALLED')
        .appendField();
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_STALLED_TOOLTIP);
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('STALLED_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_stalled = function() {
  const code = 'if(s3_simpleStalled(S3_' +
      this.getFieldValue('STALLED_CONDITION') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_STALLED') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_button.init,
 *  checkForWas: Blockly.Blocks.scribbler_if_button.checkForWas,
 *  mutationToDom: (function(): HTMLElement),
 *  domToMutation: Blockly.Blocks.scribbler_if_button.domToMutation
 * }}
 */
Blockly.Blocks.scribbler_if_button = {
  init: function() {
    this.appendDummyInput()
        .appendField('if the red button')
        .appendField(new Blockly.FieldDropdown([
          ['is', 'IS'],
          ['is not', 'IS_NOT'],
        ], function(state) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().checkForWas(state);
        }), 'BUTTON_CONDITION')
        .appendField('pressed');
    this.appendStatementInput('IF_BUTTON');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
  },
  checkForWas: function(state) {
    if (state === 'WAS' || state === 'WAS_NOT') {
      this.setColour('#FF8800');
      this.setWarningText(Blockly.MSG_S3_ERROR_NO_WAS_CONDITION);
    } else {
      this.setColour(colorPalette.getColor('input'));
      this.setWarningText(null);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('state', this.getFieldValue('BUTTON_CONDITION'));
    return container;
  },
  domToMutation: function(xmlElement) {
    const state = xmlElement.getAttribute('state');
    this.checkForWas(state);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_button = function() {
  const code = 'if(s3_simpleButton(S3_' +
      this.getFieldValue('BUTTON_CONDITION') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_BUTTON') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_if_random.init
 * }}
 */
Blockly.Blocks.scribbler_if_random = {
  init: function() {
    this.appendDummyInput()
        .appendField('if a virtual coin flip is')
        .appendField(new Blockly.FieldDropdown([
          ['heads', ''],
          ['tails', '_NOT'],
        ]), 'RANDOM_INVERT');
    this.appendStatementInput('IF_RANDOM');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_SENSORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_IF_RANDOM_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_if_random = function() {
  const code = 'if(s3_simpleRandom(S3_IS' +
      this.getFieldValue('RANDOM_INVERT') + ')) {\n';
  return code + Blockly.propc.statementToCode(this, 'IF_RANDOM') + '\n}';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_drive.init
 * }}
 */
Blockly.Blocks.scribbler_drive = {
  init: function() {
    this.appendDummyInput()
        .appendField('drive')
        .appendField(new Blockly.FieldDropdown([
          ['forward', ' '],
          ['backward', '-'],
        ]), 'DRIVE_DIRECTION')
        .appendField('and')
        .appendField(new Blockly.FieldDropdown([
          ['sharply to the left', 'SHARP_LEFT'],
          ['gently to the left', 'GENTLE_LEFT'],
          ['slightly to the left', 'SLIGHT_LEFT'],
          ['straight', 'STRAIGHT'],
          ['slightly to the right', 'SLIGHT_RIGHT'],
          ['gently to the right', 'GENTLE_RIGHT'],
          ['sharply to the right', 'SHARP_RIGHT'],
        ]), 'DRIVE_ANGLE')
        .appendField('at')
        .appendField(new Blockly.FieldDropdown([
          ['full', '255'],
          ['a quick', '191'],
          ['a gentle', '127'],
          ['a slow', '63'],
        ]), 'DRIVE_SPEED')
        .appendField('speed');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_ACTIONS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_DRIVE_TOOLTIP);
    if (this.getFieldValue('DRIVE_DIRECTION') &&
        this.getFieldValue('DRIVE_DIRECTION').length < 1) {
      this.setFieldValue(' ', 'DRIVE_DIRECTION');
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_drive = function() {
  return 's3_simpleDrive(S3_' +
      this.getFieldValue('DRIVE_DIRECTION') + ', ' +
      this.getFieldValue('DRIVE_ANGLE').trim() +
      this.getFieldValue('DRIVE_SPEED') + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_spin.init
 * }}
 */
Blockly.Blocks.scribbler_spin = {
  init: function() {
    this.appendDummyInput()
        .appendField('rotate')
        .appendField(new Blockly.FieldDropdown([
          ['\u21BB', ' '],
          ['\u21BA', '-'],
        ]), 'SPIN_DIRECTION')
        .appendField('for')
        .appendField(new Blockly.FieldAngle(90), 'SPIN_ANGLE')
        .appendField('at')
        .appendField(new Blockly.FieldDropdown([
          ['full', '15'],
          ['a quick', '7'],
          ['a gentle', '3'],
          ['a slow', '1'],
        ]), 'SPIN_SPEED')
        .appendField('speed');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_ACTIONS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_SPIN_TOOLTIP);
    if (this.getFieldValue('SPIN_DIRECTION') &&
        this.getFieldValue('SPIN_DIRECTION').length < 1) {
      this.setFieldValue(' ', 'SPIN_DIRECTION');
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_spin = function() {
  return 's3_simpleSpin(' +
      this.getFieldValue('SPIN_DIRECTION').trim() +
      this.getFieldValue('SPIN_ANGLE') + ', ' +
      this.getFieldValue('SPIN_SPEED') + ', 0);\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_stop.init
 * }}
 */
Blockly.Blocks.scribbler_stop = {
  init: function() {
    this.appendDummyInput()
        .appendField('stop driving');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_SIMPLE_ACTIONS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_STOP_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_stop = function() {
  return 's3_simpleStop();\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_LED.init
 * }}
 */
Blockly.Blocks.scribbler_LED = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('change these LEDs:   ')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'LEFT_LED')
        .appendField('  ')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'CENTER_LED')
        .appendField('  ')
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'RIGHT_LED')
        .appendField('  ');
    const leftLEDColors = new Blockly.FieldColour('#000000');
    const centerLEDColors = new Blockly.FieldColour('#000000');
    const rightLEDColors = new Blockly.FieldColour('#000000');
    leftLEDColors.setColours(['#FF0000', '#00FF00', '#FF7F00', '#000000'])
        .setColumns(2);
    centerLEDColors.setColours(['#FF0000', '#00FF00', '#FF7F00', '#000000'])
        .setColumns(2);
    rightLEDColors.setColours(['#FF0000', '#00FF00', '#FF7F00', '#000000'])
        .setColumns(2);
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('to these colors:  ')
        .appendField(leftLEDColors, 'LEFT_COLOR')
        .appendField(centerLEDColors, 'CENTER_COLOR')
        .appendField(rightLEDColors, 'RIGHT_COLOR')
        .appendField(' ');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_LEDS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_LED_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_LED = function() {
  const leftColor = this.getFieldValue('LEFT_COLOR');
  const centerColor = this.getFieldValue('CENTER_COLOR');
  const rightColor = this.getFieldValue('RIGHT_COLOR');
  let code = '';

  if (this.getFieldValue('LEFT_LED') === 'TRUE') {
    code += 's3_setLED(S3_LEFT, S3_COLOR_' +
        leftColor.substr(1, 6).toUpperCase() + ');\n';
  }
  if (this.getFieldValue('CENTER_LED') === 'TRUE') {
    code += 's3_setLED(S3_CENTER, S3_COLOR_' +
        centerColor.substr(1, 6).toUpperCase() + ');\n';
  }
  if (this.getFieldValue('RIGHT_LED') === 'TRUE') {
    code += 's3_setLED(S3_RIGHT, S3_COLOR_' +
        rightColor.substr(1, 6).toUpperCase() + ');\n';
  }

  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_play.init
 * }}
 */
Blockly.Blocks.scribbler_play = {
  init: function() {
    this.appendDummyInput()
        .appendField('play a')
        .appendField(new Blockly.FieldDropdown([
          ['soprano', '4'],
          ['tenor', '8'],
          ['middle', '16'],
          ['low', '32'],
          ['deep', '64'],
        ]), 'NOTE_OCTAVE')
        .appendField(new Blockly.FieldDropdown([
          ['A\u266D', '3322'],
          ['A', '3520'],
          ['A\u266F/B\u266D', '3729'],
          ['B', '3951'],
          ['C', '4186'],
          ['C\u266F/D\u266D', '4435'],
          ['D', '4699'],
          ['D\u266F/E\u266D', '4978'],
          ['E', '5274'],
          ['F', '5588'],
          ['F\u266F/G\u266D', '5920'],
          ['G', '6272'],
          ['G\u266F', '6645'],
        ]), 'NOTE_FREQUENCY')
        .appendField('for a')
        .appendField(new Blockly.FieldDropdown([
          ['sixteenth', '63'],
          ['dotted sixteenth', '94'],
          ['eighth', '125'],
          ['dotted eighth', '188'],
          ['quarter', '250'],
          ['dotted quarter', '375'],
          ['half', '500'],
          ['dotted half', '750'],
          ['whole', '1000'],
          ['dotted whole', '1500'],
        ]), 'NOTE_DURATION')
        .appendField('note at a')
        .appendField(new Blockly.FieldDropdown([
          ['loud', '50'],
          ['medium', '30'],
          ['quiet', '15'],
        ]), 'NOTE_VOLUME')
        .appendField('volume');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_SOUND_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_PLAY_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_play = function() {
  return 's3_simplePlay((' +
      this.getFieldValue('NOTE_FREQUENCY') + ' / ' +
      this.getFieldValue('NOTE_OCTAVE') + '), ' +
      this.getFieldValue('NOTE_DURATION') + ', ' +
      this.getFieldValue('NOTE_VOLUME') + ');\n';
};

/**
 *
 * @type {{init: Blockly.Blocks.move_motors.init}}
 */
// Move the motors for 0 to ? ms, or indefinately
Blockly.Blocks.move_motors = {
  init: function() {
    this.appendDummyInput()
        .appendField('drive at speeds of (%)');
    this.appendValueInput('LEFT_MOTOR_SPEED')
        .appendRange('R,-100,100,0')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('left motor');
    this.appendValueInput('RIGHT_MOTOR_SPEED')
        .appendRange('R,-100,100,0')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('right motor');
    this.appendValueInput('MOTOR_DURATION')
        .appendRange('R,0,15000,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('for (milliseconds, 0 is continuous)', 'OPS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_MOTORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_MOVE_MOTORS_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.move_motors = function() {
  const leftSpeed = Blockly.propc.valueToCode(
      this, 'LEFT_MOTOR_SPEED', Blockly.propc.ORDER_ATOMIC) || '0';
  const rightSpeed = Blockly.propc.valueToCode(
      this, 'RIGHT_MOTOR_SPEED', Blockly.propc.ORDER_ATOMIC) || '0';
  const movementTime = Blockly.propc.valueToCode(
      this, 'MOTOR_DURATION', Blockly.propc.ORDER_ATOMIC) || '0';
  return 's3_motorSet(' + leftSpeed + ', ' + rightSpeed + ', ' +
      movementTime + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.move_motors_distance.init,
 *  newUnit: Blockly.Blocks.move_motors_distance.newUnit
 * }}
 */
// Move the motors...
Blockly.Blocks.move_motors_distance = {
  init: function() {
    this.appendDummyInput()
        .appendField('drive distances in ')
        .appendField(new Blockly.FieldDropdown([
          ['inches', ' * 100000 / 1933'],
          ['tenths of an inch', ' * 10000 / 1933'],
          ['centimeters', ' * 10000 / 491'],
          ['millimeters', ' * 1000 / 491'],
          ['encoder counts', ' '],
        ], function(unit) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().newUnit(unit);
        }), 'MULTIPLIER');
    this.appendValueInput('LEFT_MOTOR_DISTANCE')
        .appendRange('R,-633,633,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('left motor distance');
    this.appendValueInput('RIGHT_MOTOR_DISTANCE')
        .appendRange('R,-633,633,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('right motor distance');
    this.appendValueInput('MOTOR_SPEED')
        .appendRange('R,-100,100,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('at speed (%)');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_MOTORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_MOVE_MOTORS_DISTANCE_TOOLTIP);
    if (this.getFieldValue('MULTIPLIER') &&
        this.getFieldValue('MULTIPLIER').length < 1) {
      this.setFieldValue(' ', 'MULTIPLIER');
    }
    this.newUnit(this.getFieldValue('MULTIPLIER'));
  },
  newUnit: function(unit) {
    const connectionRight_ = this.getInput('RIGHT_MOTOR_DISTANCE').connection;
    const connectionLeft_ = this.getInput('LEFT_MOTOR_DISTANCE').connection;
    const blockLeft_ = connectionLeft_.targetBlock();
    const blockRight_ = connectionRight_.targetBlock();
    let rangeText = 'R,-633,633,0';

    if (unit === ' * 10000 / 1933') {
      rangeText = 'R,-6333,6333,0';
    } else if (unit === ' * 10000 / 491') {
      rangeText = 'R,-1608,1608,0';
    } else if (unit === ' * 1000 / 491') {
      rangeText = 'R,-16088,16088,0';
    } else if (unit === ' ') {
      rangeText = 'R,-32767,32767,0';
    }

    this.getInput('RIGHT_MOTOR_DISTANCE').appendRange(rangeText);
    this.getInput('LEFT_MOTOR_DISTANCE').appendRange(rangeText);

    if (blockLeft_) {
      if (blockLeft_.onchange) {
        blockLeft_.onchange.call(blockLeft_);
      }
    }
    if (blockRight_) {
      if (blockRight_.onchange) {
        blockRight_.onchange.call(blockRight_);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.move_motors_distance = function() {
  const distanceMultiplier = this.getFieldValue('MULTIPLIER').trim();
  const leftDistance = Blockly.propc.valueToCode(
      this, 'LEFT_MOTOR_DISTANCE', Blockly.propc.ORDER_ATOMIC) || '0';
  const rightDistance = Blockly.propc.valueToCode(
      this, 'RIGHT_MOTOR_DISTANCE', Blockly.propc.ORDER_ATOMIC) || '0';
  const topSpeed = Blockly.propc.valueToCode(
      this, 'MOTOR_SPEED', Blockly.propc.ORDER_ATOMIC) || '0';
  return 's3_motorSetDistance(' + leftDistance + distanceMultiplier + ', ' +
      rightDistance + distanceMultiplier + ', ' + topSpeed + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.move_motors_xy.init,
 *  newUnit: Blockly.Blocks.move_motors_xy.newUnit
 * }}
 */
Blockly.Blocks.move_motors_xy = {
  init: function() {
    this.appendDummyInput()
        .appendField('drive to a location');
    this.appendValueInput('X_DISTANCE')
        .appendRange('R,-20755429,20755429,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('change (+/\u2212) in X');
    this.appendValueInput('Y_DISTANCE')
        .appendRange('R,-20755429,20755429,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('change (+/\u2212) in Y');
    this.appendValueInput('MOTOR_SPEED')
        .appendRange('R,-100,100,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('at speed (%)');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('in')
        .appendField(new Blockly.FieldDropdown([
          ['inches', ' * 100000 / 1933'],
          ['tenths of an inch', ' * 10000 / 1933'],
          ['centimeters', ' * 10000 / 491'],
          ['millimeters', ' * 1000 / 491'],
          ['encoder counts', ' '],
        ], function(unit) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().newUnit(unit);
        }), 'MULTIPLIER');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_MOTORS_HELPURL);
    if (this.getFieldValue('MULTIPLIER') &&
        this.getFieldValue('MULTIPLIER').length < 1) {
      this.setFieldValue(' ', 'MULTIPLIER');
    }
    this.setTooltip(Blockly.MSG_S3_MOVE_MOTORS_XY_TOOLTIP);
  },
  newUnit: function(unit) {
    const connectionRight_ = this.getInput('X_DISTANCE').connection;
    const connectionLeft_ = this.getInput('Y_DISTANCE').connection;
    const blockLeft_ = connectionLeft_.targetBlock();
    const blockRight_ = connectionRight_.targetBlock();
    let rangeText = 'R,-633,633,0';

    if (unit === ' * 10000 / 1933') {
      rangeText = 'R,-6334,6334,0';
    } else if (unit === ' * 10000 / 491') {
      rangeText = 'R,-1608,1608,0';
    } else if (unit === ' * 1000 / 491') {
      rangeText = 'R,-16089,16089,0';
    } else if (unit === ' ') {
      rangeText = 'R,-32768,32767,0';
    }

    this.getInput('X_DISTANCE').appendRange(rangeText);
    this.getInput('Y_DISTANCE').appendRange(rangeText);

    if (blockLeft_) {
      if (blockLeft_.onchange) {
        blockLeft_.onchange.call(blockLeft_);
      }
    }
    if (blockRight_) {
      if (blockRight_.onchange) {
        blockRight_.onchange.call(blockRight_);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.move_motors_xy = function() {
  const distanceMultiplier = this.getFieldValue('MULTIPLIER').trim();
  const xDistance = Blockly.propc.valueToCode(
      this, 'X_DISTANCE', Blockly.propc.ORDER_ATOMIC) || '0';
  const yDistance = Blockly.propc.valueToCode(
      this, 'Y_DISTANCE', Blockly.propc.ORDER_ATOMIC) || '0';
  const topSpeed = Blockly.propc.valueToCode(
      this, 'MOTOR_SPEED', Blockly.propc.ORDER_ATOMIC) || '0';
  return 's3_motorGotoXY(' + xDistance + distanceMultiplier + ', ' +
      yDistance + distanceMultiplier + ', ' + topSpeed + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.move_motors_angle.init,
 *  newUnit: Blockly.Blocks.move_motors_angle.newUnit
 * }}
 */
// Move the motors...
Blockly.Blocks.move_motors_angle = {
  init: function() {
    this.appendDummyInput()
        .appendField('drive a turn');
    this.appendValueInput('ROTATE_ANGLE')
        .appendRange('R,-1080,1080,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('that is (+/\u2212 degrees)');
    this.appendValueInput('ROTATE_RADIUS')
        .appendRange('R,-85,85,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('around a radius in (+/\u2212)')
        .appendField(new Blockly.FieldDropdown([
          ['inches of', ' * 100000 / 1933'],
          ['tenths of an inch of', ' * 10000 / 1933'],
          ['centimeters of', ' * 10000 / 491'],
          ['millimeters of', ' * 1000 / 491'],
          ['encoder counts of', ' '],
        ], function(unit) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().newUnit(unit);
        }), 'RADIUS_MULTIPLIER');
    this.appendValueInput('ROTATE_SPEED')
        .appendRange('R,-100,100,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('at speed (%)');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_MOTORS_HELPURL);
    this.setTooltip(Blockly.MSG_S3_MOVE_MOTORS_ANGLE_TOOLTIP);
    if (this.getFieldValue('RADIUS_MULTIPLIER') &&
        this.getFieldValue('RADIUS_MULTIPLIER').length < 1) {
      this.setFieldValue(' ', 'RADIUS_MULTIPLIER');
    }
  },
  newUnit: function(unit) {
    const thisConnection_ = this.getInput('ROTATE_RADIUS').connection;
    const thisBlock_ = thisConnection_.targetBlock();
    let rangeText = 'R,-85,85,0';

    if (unit === ' * 10000 / 1933') {
      rangeText = 'R,-850,850,0';
    } else if (unit === ' * 10000 / 491') {
      rangeText = 'R,-216,216,0';
    } else if (unit === ' * 1000 / 491') {
      rangeText = 'R,-2160,2160,0';
    } else if (unit === ' ') {
      rangeText = 'R,-4400,4400,0';
    }

    this.getInput('ROTATE_RADIUS').appendRange(rangeText);

    if (thisBlock_) {
      if (thisBlock_.onchange) {
        thisBlock_.onchange.call(thisBlock_);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.move_motors_angle = function() {
  const radiusMultiplier = this.getFieldValue('RADIUS_MULTIPLIER').trim();
  const angle = Blockly.propc.valueToCode(
      this, 'ROTATE_ANGLE', Blockly.propc.ORDER_ATOMIC);
  const radius = Blockly.propc.valueToCode(
      this, 'ROTATE_RADIUS', Blockly.propc.ORDER_ATOMIC);
  const rotateSpeed = Blockly.propc.valueToCode(
      this, 'ROTATE_SPEED', Blockly.propc.ORDER_ATOMIC);
  return 's3_motorSetRotate(' + angle + ', ' + radius.trim() +
      radiusMultiplier + ', ' + rotateSpeed + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.play_polyphony.init
 * }}
 */
Blockly.Blocks.play_polyphony = {
  init: function() {
    this.appendDummyInput()
        .appendField('play tones');
    this.appendValueInput('FREQUENCY_1')
        .appendRange('R,0,2000,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('tone 1 (Hz)');
    this.appendValueInput('FREQUENCY_2')
        .appendRange('R,0,2000,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('tone 2 (Hz)');
    this.appendValueInput('POLYPHONY_DURATION')
        .appendRange('R,0,15000,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('for (milliseconds)');
    this.appendValueInput('POLYPHONY_VOLUME')
        .appendRange('R,0,100,0')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('at volume (%)');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_SOUND_HELPURL);
    this.setTooltip(Blockly.MSG_S3_PLAY_POLYPHONY_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.play_polyphony = function() {
  const fq1 = Blockly.propc.valueToCode(
      this, 'FREQUENCY_1', Blockly.propc.ORDER_ATOMIC) || '522';
  const fq2 = Blockly.propc.valueToCode(
      this, 'FREQUENCY_2', Blockly.propc.ORDER_ATOMIC) || '784';
  const dur = Blockly.propc.valueToCode(
      this, 'POLYPHONY_DURATION', Blockly.propc.ORDER_ATOMIC) || '250';
  const vol = Blockly.propc.valueToCode(
      this, 'POLYPHONY_VOLUME', Blockly.propc.ORDER_ATOMIC) || '50';

  return 's3_setVolume((' + vol + ' / 2));\ns3_playNote(' +
      fq1 + ', ' + fq2 + ', ' + dur + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.line_sensor.init
 * }}
 */
Blockly.Blocks.line_sensor = {
  init: function() {
    this.appendDummyInput('')
        .appendField('line sensor')
        .appendField(new Blockly.FieldDropdown([
          ['left reflectivity', 'LEFT'],
          ['right reflectivity', 'RIGHT'],
        ]), 'LINE_SENSOR_CHOICE');
    this.setInputsInline(false);
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_LINE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_LINE_SENSOR_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.line_sensor = function() {
  const dir = this.getFieldValue('LINE_SENSOR_CHOICE');
  return ['s3_lineSensor(S3_' + dir + ')', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.obstacle_sensor.init
 * }}
 */
Blockly.Blocks.obstacle_sensor = {
  init: function() {
    this.appendDummyInput('')
        .appendField('obstacle detected')
        .appendField(new Blockly.FieldDropdown([
          ['on the left', 'LEFT'],
          ['on the right', 'RIGHT'],
          ['in front', '&&'],
          ['by either sensor', '||'],
        ]), 'OBSTACLE_SENSOR_CHOICE');

    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_OBSTACLE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_OBSTACLE_SENSOR_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]|[string, number]}
 */
Blockly.propc.obstacle_sensor = function() {
  const dir = this.getFieldValue('OBSTACLE_SENSOR_CHOICE');
  if (dir === 'LEFT' || dir === 'RIGHT') {
    return ['s3_readObstacle(S3_' + dir + ')', Blockly.propc.ORDER_ATOMIC];
  } else {
    return ['(s3_readObstacle(S3_LEFT) ' + dir +
    ' s3_readObstacle(S3_RIGHT))', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.stall_sensor.init
 * }}
 */
Blockly.Blocks.stall_sensor = {
  init: function() {
    this.appendDummyInput('')
        .appendField('stall sensor')
        .appendField(new Blockly.FieldDropdown([
          ['tail wheel is not spinning', '!s3_tailWheelMoving()'],
          ['tail wheel is spinning', 's3_tailWheelMoving()'],
          ['drive wheels are stopped', '!s3_motorsMoving()'],
          ['drive wheels are turning', 's3_motorsMoving()'],
          ['Scribbler is stuck', 's3_simpleStalled(S3_IS)'],
          ['Scribbler is not stuck', 's3_simpleStalled(S3_IS_NOT)'],
        ]), 'STALL_SENSOR_CHOICE');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_STALL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_STALL_SENSOR_TOOLTIP);
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.stall_sensor = function() {
  const choice = this.getFieldValue('STALL_SENSOR_CHOICE');
  return [choice, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.button_pressed.init
 * }}
 * @deprecated No references to this object within the project
 */
Blockly.Blocks.button_pressed = {
  init: function() {
    this.appendDummyInput('')
        .appendField('the red button is currently pressed');
    this.appendDummyInput('')
        .appendField('(true or false)');

    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
  },
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.spinning_sensor.init
 * }}
 */
Blockly.Blocks.spinning_sensor = {
  init: function() {
    this.appendDummyInput('')
        .appendField('drive wheels stalled');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_STALL_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SPINNING_SENSOR_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.spinning_sensor = function() {
  return ['!s3_motorsMoving()', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.light_sensor.init
 * }}
 */
Blockly.Blocks.light_sensor = {
  init: function() {
    this.appendDummyInput('')
        .appendField('light sensor')
        .appendField(new Blockly.FieldDropdown([
          ['left reading', 'LEFT'],
          ['center reading', 'CENTER'],
          ['right reading', 'RIGHT'],
        ]), 'LGHT_SENSOR_CHOICE');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_LIGHT_HELPURL);
    this.setTooltip(Blockly.MSG_S3_LIGHT_SENSOR_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.light_sensor = function() {
  const dir = this.getFieldValue('LGHT_SENSOR_CHOICE');
  return ['s3_lightSensor(S3_' + dir + ')', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.reset_button_presses.init
 * }}
 */
Blockly.Blocks.reset_button_presses = {
  init: function() {
    this.appendDummyInput('')
        .appendField('reset button presses on last reset');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_RESET_BUTTON_HELPURL);
    this.setTooltip(Blockly.MSG_S3_RESET_BUTTON_PRESSES_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.reset_button_presses = function() {
  return ['s3_resetButtonCount()', Blockly.propc.ORDER_ATOMIC];
};

/**
 * Scribbler Stop Servo
 * @type {{
 *  init: Blockly.Blocks.scribbler_stop_servo.init,
 *  addPinMenu: Blockly.Blocks.scribbler_stop_servo.addPinMenu,
 *  mutationToDom: (function(): HTMLElement),
 *  setToOther: Blockly.Blocks.scribbler_stop_servo.setToOther,
 *  domToMutation: Blockly.Blocks.scribbler_stop_servo.domToMutation
 *  }}
 */
Blockly.Blocks.scribbler_stop_servo = {
  init: function() {
    const profile = getDefaultProfile();
    // TODO: Why are we checking for an S3 project from this library??
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_SERVO_HELPURL);
      this.setColour(colorPalette.getColor('robot'));
      this.pinSet = profile.digital;
    } else {
      this.setHelpUrl(Blockly.MSG_SERVO_HELPURL);
      this.setColour(colorPalette.getColor('output'));
      this.pinSet = profile.digital.concat([['other', 'other']]);
    }
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_STOP_SERVO_TOOLTIP);
    this.addPinMenu('servo PIN', 'VALUE');
    this.appendDummyInput('VALUE')
        .appendField('disable');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  addPinMenu: function(label, moveBefore) {
    this.appendDummyInput('SET_PIN')
        .appendField(label, 'LABEL')
        .appendField(new Blockly.FieldDropdown(this.pinSet, function(op) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().setToOther(op, moveBefore);
        }), 'SERVO_PIN');
    this.moveBefore = moveBefore;
    this.otherPin = false;
  },
  setToOther: function(op, moveBefore) {
    const profile = getDefaultProfile();
    if (op === 'other') {
      this.otherPin = true;
      const label = this.getFieldValue('LABEL');
      if (this.getInput('SET_PIN')) {
        this.removeInput('SET_PIN');
      }
      this.appendValueInput('SERVO_PIN')
          .appendField(label)
          .setCheck('Number')
          .appendRange('A,' + profile.digital.toString());
      if (moveBefore) {
        this.moveInputBefore('SERVO_PIN', moveBefore);
      }
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('otherpin', this.otherPin);
    return container;
  },
  domToMutation: function(xmlElement) {
    const op = xmlElement.getAttribute('otherpin');
    if (op === 'true') {
      this.setToOther('other', this.moveBefore);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_stop_servo = function() {
  let pin = '0';
  if (this.otherPin) {
    pin = Blockly.propc.valueToCode(
        this, 'SERVO_PIN', Blockly.propc.ORDER_ATOMIC) || '0';
  } else {
    pin = this.getFieldValue('SERVO_PIN');
  }
  let addType = '';
  const blocks = Blockly.getMainWorkspace().getAllBlocks();

  // Iterate through every block - determine if we are trying to
  // disable a feedback 360 servo or a CR/standard servo
  for (let x = 0; x < blocks.length; x++) {
    const blockName = blocks[x].type;
    if (blockName === 'fb360_init' &&
        (blocks[x].getFieldValue('PIN') === pin ||
         blocks[x].getFieldValue('FB') === pin)) {
      addType = '360';
    }
  }

  if (addType === '') {
    Blockly.propc.definitions_['include servo'] = '#include "servo.h"';
    return 'servo_disable(' + pin + ');\n';
  } else {
    return 'servo360_enable(' + pin + ', 0);\n';
  }
};

/**
 * Scribbler Ping
 * @type {{
 *  init: Blockly.Blocks.scribbler_ping.init
 *  }}
 *  @description
 *  // TODO: Determine if this block can be deprecated.
 */
Blockly.Blocks.scribbler_ping = {
  init: function() {
    const profile = getDefaultProfile();
    this.appendDummyInput('')
        .appendField('Ping))) sensor on')
        .appendField(new Blockly.FieldDropdown(
            profile.digital), 'PIN')
        .appendField('distance in')
        .appendField(new Blockly.FieldDropdown([
          ['inches', '_inches'],
          ['centimeters', '_cm'],
        ]), 'SCALE');

    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('input'));
    this.setHelpUrl(Blockly.MSG_S3_PING_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_PING_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_ping = function() {
  const dropdownPin = this.getFieldValue('PIN');
  const unit = this.getFieldValue('SCALE');

  Blockly.propc.definitions_['include ping'] = '#include "ping.h"';

  const code = 'ping' + unit + '(' + dropdownPin + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 * Analog Input
 * @type {{
 *  init: Blockly.Blocks.analog_input.init
 *  }}
 */
Blockly.Blocks.analog_input = {
  init: function() {
    const profile = getDefaultProfile();
    this.appendDummyInput('')
        .appendField('check analog PIN')
        .appendField(new Blockly.FieldDropdown(
            profile.analog), 'ANALOG_PIN');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('io'));
    this.setHelpUrl(Blockly.MSG_S3_IO_HELPURL);
    this.setTooltip(Blockly.MSG_S3_ANALOG_INPUT_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.analog_input = function() {
  const pin = this.getFieldValue('ANALOG_PIN') || '0';
  return ['s3_readADC(S3_ADC_A' + pin + ')', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_boolean.init
 * }}
 */
Blockly.Blocks.scribbler_boolean = {
  init: function() {
    this.appendDummyInput('')
        .appendField(new Blockly.FieldDropdown([
          ['true', '1'],
          ['false', '0'],
        ]), 'BOOL');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('math'));
    this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_BOOLEAN_TOOLTIP);
  },
};

// eslint-disable-next-line valid-jsdoc
/**
 *
 * @return {[string | null, number]}
 */
Blockly.propc.scribbler_boolean = function() {
  return [this.getFieldValue('BOOL'), Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_random_boolean.init
 * }}
 */
Blockly.Blocks.scribbler_random_boolean = {
  init: function() {
    this.appendDummyInput('')
        .appendField('random true/false');
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('math'));
    this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_RANDOM_BOOLEAN_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_random_boolean = function() {
  Blockly.propc.setups_['random_seed'] = 'srand(INA + CNT);';
  return ['(rand() % 2)', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_random_number.init
 * }}
 */
Blockly.Blocks.scribbler_random_number = {
  init: function() {
    this.appendValueInput('A')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('random number from');
    this.appendValueInput('B')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('to');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('math'));
    this.setHelpUrl(Blockly.MSG_S3_MATH_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_RANDOM_NUMBER_TOOLTIP);
  },
};

/**
 *
 * @type {{init: Blockly.Blocks.factory_reset.init}}
 */
Blockly.Blocks.factory_reset = {
  init: function() {
    this.appendDummyInput()
        .appendField('restore s3 demo');
    this.setColour(colorPalette.getColor('programming'));
    this.setHelpUrl(Blockly.MSG_S3_FACTORY_RESET_HELPURL);
    this.setTooltip(Blockly.MSG_S3_FACTORY_RESET_TOOLTIP);
  },
};

/**
 * C code generator for factory_reset
 * @return {string}
 * @description The '#pragma...' generated by this block is a special
 * flag to the Cloud Compiler. When detected, the Cloud Compiler will
 * abandon any attempt to compile the source code received and, instead,
 * will return a binary file that resets the S3 Robot to it's factory
 * defaults.
 */
Blockly.propc.factory_reset = function() {
  Blockly.propc.definitions_['s3_factory_reset'] =
      '#pragma load_default_scribbler_binary';
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_send_text.init
 * }}
 */
Blockly.Blocks.scribbler_serial_send_text = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal', 'T'],
          ['WX module', 'W'],
          ['XBee', 'X'],
        ]), 'OUTPUT')
        .appendField('send text')
        .appendField('\u201C')
        .appendField(new Blockly.FieldTextInput(''), 'MESSAGE_TEXT')
        .appendField('\u201D');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_SEND_TEXT_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_serial_send_text = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';
  const message = this.getFieldValue('MESSAGE_TEXT')
      .replace(/"/g, '\\"')
      .replace(/%/g, '%%');

  return 'print("' + message + '");\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_send_char.init
 * }}
 */
Blockly.Blocks.scribbler_serial_send_char = {
  init: function() {
    this.appendValueInput('CHAR_VALUE')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal', 'T'],
          ['WX module', 'W'],
          ['XBee', 'X'],
        ]), 'OUTPUT')
        .appendField('send character')
        .setCheck('Number');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_SEND_CHAR_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_serial_send_char = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';
  const message = Blockly.propc.valueToCode(
      this, 'CHAR_VALUE', Blockly.propc.ORDER_ATOMIC);

  return 'print("%c", ' + message + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_send_decimal.init
 * }}
 */
Blockly.Blocks.scribbler_serial_send_decimal = {
  init: function() {
    this.appendValueInput('DECIMAL_VALUE')
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal', 'T'],
          ['WX module', 'W'],
          ['XBee', 'X'],
        ]), 'OUTPUT')
        .appendField('send number');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_SEND_DECIMAL_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_serial_send_decimal = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';
  const message = Blockly.propc.valueToCode(
      this, 'DECIMAL_VALUE', Blockly.propc.ORDER_ATOMIC) || 0;

  return 'print("%d", ' + message + ');\n';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_send_ctrl.init
 * }}
 */
Blockly.Blocks.scribbler_serial_send_ctrl = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([
          ['Terminal', 'T'],
          ['WX module', 'W'],
          ['XBee', 'X'],
        ]), 'OUTPUT')
        .appendField('send command')
        .appendField(new Blockly.FieldDropdown([
          ['carriage return', '13'],
          ['new line', '10'],
          ['backspace', '127'],
          ['clear screen', '256'],
        ]), 'SERIAL_CHAR');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setColour(colorPalette.getColor('protocols'));
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_SEND_CTRL_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_serial_send_ctrl = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';

  const message = this.getFieldValue('SERIAL_CHAR');
  if (message === '256') {
    return 'term_cmd(CLS);\n';
  } else {
    return 'print("%c", ' + message + ');\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_rx_byte.init
 * }}
 */
Blockly.Blocks.scribbler_serial_rx_byte = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal', 'T'],
          ['WX module', 'W'],
          ['XBee', 'X'],
        ]), 'OUTPUT')
        .appendField('receive character');
    this.setOutput(true, 'Number');
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_RX_BYTE_TOOLTIP);
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.scribbler_serial_rx_byte = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';

  return ['getChar()', Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.scribbler_serial_cursor_xy.init
 * }}
 */
Blockly.Blocks.scribbler_serial_cursor_xy = {
  init: function() {
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('Y')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('Terminal set cursor position to row');
    this.appendValueInput('X')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('column');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setHelpUrl(Blockly.MSG_S3_COMMUNICATE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_SERIAL_CURSOR_XY_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.scribbler_serial_cursor_xy = function() {
  Blockly.propc.setups_['s3_serial_baud'] = 'simpleterm_reopen(31,30,0,9600);';

  let row = Blockly.propc.valueToCode(this, 'Y', Blockly.propc.ORDER_NONE);
  let column = Blockly.propc.valueToCode(this, 'X', Blockly.propc.ORDER_NONE);

  if (Number(row) < 0) {
    row = 0;
  } else if (Number(row) > 255) {
    row = 255;
  }

  if (Number(column) < 0) {
    column = 0;
  } else if (Number(column) > 255) {
    column = 255;
  }

  return 'term_cmd(CRSRXY, ' + column + ', ' + row + ');\n';
};

/**
 * SIRC S3 Get
 * @type {{
 *  init: Blockly.Blocks.sirc_s3_get.init,
 *  helpUrl: string
 *  }}
 */
Blockly.Blocks.sirc_s3_get = {
  helpUrl: Blockly.MSG_S3_SIRC_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_SIRC_TOOLTIP);
    const addPin = [['Onboard IR sensor', 'SCRIBBLER_OBS_RX']];
    const thePins = addPin.concat(profile.digital);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('Sony Remote value')
        .appendField(new Blockly.FieldDropdown(thePins), 'PIN');

    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.sirc_s3_get = function() {
  const pin = this.getFieldValue('PIN');

  Blockly.propc.definitions_['sirc'] = '#include "sirc.h"';
  Blockly.propc.setups_['sirc'] = 'sirc_setTimeout(70);';

  const code = 'sirc_button(' + pin + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.mic_s3_get.init, helpUrl: string
 * }}
 */
Blockly.Blocks.mic_s3_get = {
  helpUrl: Blockly.MSG_S3_MIC_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_MIC_TOOLTIP);
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('microphone volume detected');
    this.setInputsInline(true);
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setOutput(true, 'Number');
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.mic_s3_get = function() {
  Blockly.propc.setups_['s3_mic'] = 's3_enableMic();';

  const code = 's3_readMic()';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.s3_eeprom_read.init, helpUrl: string
 * }}
 */
Blockly.Blocks.s3_eeprom_read = {
  helpUrl: Blockly.MSG_S3_MEMORY_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_MEMORY_READ_TOOLTIP);
    this.appendValueInput('ADDR')
        .setCheck('Number')
        .appendRange('R,0,7936,0')
        .appendField('memory read from address');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.setColour(colorPalette.getColor('output'));
  },
};

/**
 *
 * @return {[string, number]}
 */
Blockly.propc.s3_eeprom_read = function() {
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE);
  const code = 's3_memoryRead(' + addr + ')';
  return [code, Blockly.propc.ORDER_ATOMIC];
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.s3_eeprom_write.init, helpUrl: string
 * }}
 */
Blockly.Blocks.s3_eeprom_write = {
  helpUrl: Blockly.MSG_S3_MEMORY_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_S3_SCRIBBLER_MEMORY_WRITE_TOOLTIP);
    this.appendValueInput('VALUE')
        .setCheck('Number')
        .appendField('memory write');
    this.appendValueInput('ADDR')
        .setCheck('Number')
        .appendRange('R,0,7936,0')
        .appendField('to address');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setInputsInline(true);
    this.setColour(colorPalette.getColor('output'));
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.s3_eeprom_write = function() {
  const value = Blockly.propc.valueToCode(
      this, 'VALUE', Blockly.propc.ORDER_NONE);
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE);
  const code = 's3_memoryWrite(' + addr + ', ' + value + ');\n';

  return code;
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.calibrate_line_sensor.init
 * }}
 */
Blockly.Blocks.calibrate_line_sensor = {
  init: function() {
    this.setColour(colorPalette.getColor('input'));
    this.appendDummyInput()
        .appendField('line sensor calibrate');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setHelpUrl(Blockly.MSG_S3_LINE_HELPURL);
    this.setTooltip(Blockly.MSG_S3_LINE_CALIBRATE_TOOLTIP);
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.calibrate_line_sensor = function() {
  let func = 'void s3_calibrate_line_sensor(void)' +
      ' {int __lineSenCal[4];\n__lineSenCal[0] = ';
  func += 's3_lineSensor(S3_LEFT);\n__lineSenCal[1]' +
      ' = s3_lineSensor(S3_RIGHT);\n__lineSenCal[2] = ';
  func += 's3_lineSensor(S3_LEFT);\n__lineSenCal[3]' +
      ' = s3_lineSensor(S3_RIGHT);\n';
  func += 'int __calibrate_timer = CNT + (CLKFREQ/1000)' +
      ' * 3672;\ns3_motorSet(75, -75, 0);';
  func += '\nwhile(CNT < __calibrate_timer) ' +
      '{int __tempLineSen = s3_lineSensor(S3_LEFT);\n';
  func += 'if (__tempLineSen < __lineSenCal[0]) __lineSenCal[0] =' +
      ' __tempLineSen;\n';
  func += 'if (__tempLineSen > __lineSenCal[2]) __lineSenCal[2] =' +
      ' __tempLineSen;\n';
  func += '__tempLineSen = s3_lineSensor(S3_RIGHT);\nif (__tempLineSen <' +
      ' __lineSenCal[1]) ';
  func += '__lineSenCal[1] = __tempLineSen;\nif (__tempLineSen >' +
      ' __lineSenCal[3]) ';
  func += '__lineSenCal[3] = __tempLineSen;}s3_motorSet(0, 0, 0);\n';
  func += 'if (__lineSenCal[2] > __lineSenCal[0]) __lineSenCal[0] =' +
      ' __lineSenCal[2];\n';
  func += 'if (__lineSenCal[3] < __lineSenCal[1]) __lineSenCal[1] =' +
      ' __lineSenCal[3];\n';
  func += 'scribbler_set_line_threshold((__lineSenCal[0] +' +
      ' __lineSenCal[1]) / 2);\n';
  func += 'scribbler_write_line_threshold();\n}';

  Blockly.propc.methods_['s3_calibrate_line_sensor'] = func;
  Blockly.propc.method_declarations_['s3_calibrate_line_sensor'] =
            'void s3_calibrate_line_sensor(void);';

  return 's3_calibrate_line_sensor();';
};
