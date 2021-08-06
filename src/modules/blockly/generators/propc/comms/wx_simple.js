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
// --------------------- Simple WX Module --------------------------------------
//
//

import Blockly from 'blockly/core';
import {getDefaultProfile, getProjectInitialState} from '../../../../project';
import {colorPalette} from '../../propc';

/**
 * WX Initialization
 * @type {{
 *  init: Blockly.Blocks.wx_init.init,
 *  updateShape_: Blockly.Blocks.wx_init.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.wx_init.domToMutation
 *  }}
 */
Blockly.Blocks.wx_init = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    const profile = getDefaultProfile();
    this.setTooltip(Blockly.MSG_SWX_INIT_TOOLTIP);
    const backgroundColors = new Blockly.FieldColour('#FFFFFF');
    backgroundColors.setColours(['#FFFFFF', '#000000']).setColumns(2);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX initialize')
        .appendField('mode')
        .appendField(new Blockly.FieldDropdown([
          ['Terminal on USB', 'USB_PGM_TERM'],
          ['Terminal on WX', 'USB_PGM'],
          ['Term & Programming on WX', 'WX_ALL_COM'],
        ], function(mode) {
          if (mode === 'WX_ALL_COM') {
            // eslint-disable-next-line no-invalid-this
            this.getSourceBlock().setFieldValue('30', 'DI');
          }
        }), 'MODE')
        .appendField(' DI')
        .appendField(new Blockly.FieldDropdown([
          ['WX Socket', '30']].concat(profile.digital),
        function(pin) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_(pin);
        }), 'DI');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    const pin = this.getFieldValue('DI');
    container.setAttribute('pin', pin);
    return container;
  },
  domToMutation: function(xmlElement) {
    const pin = xmlElement.getAttribute('pin');
    this.updateShape_(pin);
  },
  updateShape_: function(details) {
    const profile = getDefaultProfile();
    if (details === '30' && this.getInput('DOPIN')) {
      this.removeInput('DOPIN');
    } else if (!this.getInput('DOPIN')) {
      this.appendDummyInput('DOPIN')
          .appendField('DO')
          .appendField(new Blockly.FieldDropdown(
              profile.digital),
          'DO');
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_init = function() {
  if (!this.disabled) {
    const pinDi = this.getFieldValue('DI') || '30';
    let pinDo = this.getFieldValue('DO') || '31';
    if (pinDi === '30') {
      pinDo = '31';
    }
    const mode = this.getFieldValue('MODE') || 'WX_ALL_COM';

    let code = 'wifi_start(' + pinDo + ', ' + pinDi + ', 115200, ' + mode;
    code += ');\nwifi_setBuffer(__wxBffr, sizeof(__wxBffr));\n' +
        '__wsId = wifi_listen(WS, "/ws/a");\nwhile(!__wsHandle) {\n' +
        '  wifi_poll(&__wxEvent, &__wxId, &__wxHandle);\n' +
        '  if(__wxEvent == \'W\' && __wxId == __wsId)' +
        '  __wsHandle = __wxHandle;\n}';

    const vars = 'int __wxEvent, __wxId, __wxHandle, __wsId, __wv[15],' +
        ' __wsHandle = 0;\nchar __wxBffr[136];\n';

    Blockly.propc.definitions_['wx_def'] = '#include "wifi.h"';
    Blockly.propc.global_vars_['wx_vars'] = vars;
    Blockly.propc.setups_['wx_init'] = code;
  }
  return '';
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_config_page.init,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_config_page.onchange
 * }}
 */
Blockly.Blocks.wx_config_page = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_CONFIG_PAGE_TOOLTIP);
    const backgroundColors = new Blockly.FieldColour('#FFFFFF');
    backgroundColors.setColours(['#FFFFFF', '#000000']).setColumns(2);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX configure page title')
        .appendField(new Blockly.FieldTextInput('title'), 'TITLE')
        .appendField(' background color')
        .appendField(backgroundColors, 'BKG');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString()
        .indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a Simple WX\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      let warnTxt = null;
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('WX ') === 0) {
          warnTxt = 'WARNING: You cannot use Simple WX and\nAdvanced' +
              ' WX blocks together in your project!';
        }
      }
      this.setWarningText(warnTxt);
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_config_page = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    // Runs the propc generator from the init block, since it's not
    // included in the badge WX board type.
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const bkg = (this.getFieldValue('BKG') === '#FFFFFF') ? '1' : '0';
    const title = this.getFieldValue('TITLE');
    const code = 'wifi_print(WS, __wsHandle, "S,' + bkg + ',' + title + '");\n';

    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_set_widget.init,
 *  updateShape_: Blockly.Blocks.wx_set_widget.updateShape_,
 *  mutationToDom: (function(): HTMLElement),
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.wx_set_widget.onchange,
 *  domToMutation: Blockly.Blocks.wx_set_widget.domToMutation
 * }}
 */
Blockly.Blocks.wx_set_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_SET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('SET_1')
        .appendField('Simple WX configure widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
        ]), 'WIDGET')
        .appendField('to a')
        .appendField(new Blockly.FieldDropdown([
          ['Button \u2794', '0'],
          ['Switch \u2794', '1'],
          ['Slider \u2794', '2'],
          ['Send Value \u2794', '3'],
          ['Pick Color \u2794', '4'],
          ['\u2794 Show Value', '5'],
          ['\u2794 Gauge', '6'],
          ['\u2794 Bar Graph', '7'],
          ['\u2794 Show Color', '8'],
          ['\u2794 Light Bulb', '9'],
          ['Clear Widget', '10']], function(type) {
          // eslint-disable-next-line no-invalid-this
          this.getSourceBlock().updateShape_({'TYPE': type});
        }), 'TYPE')
        .appendField(' label')
        .appendField(new Blockly.FieldTextInput('label'), 'LABEL');
    this.appendDummyInput('SET_2')
        .appendField('widget color')
        .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
        .appendField(' minimum')
        .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
        .appendField(' maximum')
        .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
        .appendField(' initial value')
        .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: function() {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
        getProjectInitialState().boardType.name !== 'heb-wx') {
      this.setWarningText('WARNING: You must use a Simple WX\ninitialize' +
          ' block at the beginning of your program!');
    } else {
      let warnTxt = null;
      for (let ik = 0; ik < allBlocks.length; ik++) {
        if (allBlocks[ik].toString().indexOf('WX ') === 0) {
          warnTxt = 'WARNING: You cannot use Simple WX and\nAdvanced WX' +
              ' blocks together in your project!';
        }
      }
      this.setWarningText(warnTxt);
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('w_type', this.getFieldValue('TYPE'));
    container.setAttribute('w_color', this.getFieldValue('COLOR'));
    container.setAttribute('w_min', this.getFieldValue('MIN'));
    container.setAttribute('w_max', this.getFieldValue('MAX'));
    container.setAttribute('w_init', this.getFieldValue('INITIAL'));

    return container;
  },
  domToMutation: function(xmlElement) {
    this.updateShape_({
      'TYPE': xmlElement.getAttribute('w_type'),
      'COLOR': xmlElement.getAttribute('w_color'),
      'MIN': xmlElement.getAttribute('w_min'),
      'MAX': xmlElement.getAttribute('w_max'),
      'INITIAL': xmlElement.getAttribute('w_init'),
    });
  },
  updateShape_: function(details) {
    let type = details['TYPE'];
    if (details['TYPE'] === undefined) {
      type = this.getFieldValue('TYPE');
    }
    let min = details['MIN'];
    if (details['MIN'] === undefined) {
      min = this.getFieldValue('MIN');
    }
    let max = details['MAX'];
    if (details['MAX'] === undefined) {
      max = this.getFieldValue('MAX');
    }
    let color = details['COLOR'];
    if (details['COLOR'] === undefined) {
      color = this.getFieldValue('COLOR');
    }
    let initial = details['INITIAL'];
    if (details['INITIAL'] === undefined) {
      initial = this.getFieldValue('INITIAL');
    }
    if (this.getInput('SET_2')) {
      this.removeInput('SET_2');
    }
    let inputPins;
    if (type !== '10') {
      this.appendDummyInput('SET_2');
      inputPins = this.getInput('SET_2');
    }
    if (type === '2' || type === '6' || type === '7') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' minimum')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
          .appendField(' maximum')
          .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
          .appendField(' initial value')
          .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    } else if (type === '1') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' off value')
          .appendField(new Blockly.FieldNumber('0', null, null, 1), 'MIN')
          .appendField(' on value')
          .appendField(new Blockly.FieldNumber('10', null, null, 1), 'MAX')
          .appendField(' initial state')
          .appendField(new Blockly.FieldDropdown([
            ['on', 'on'],
            ['off', 'off'],
          ]), 'INITIAL');
    } else if (type === '0' || type === '5' || type === '9') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' initial value')
          .appendField(new Blockly.FieldNumber('5', null, null, 1), 'INITIAL');
    } else if (type === '8') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR')
          .appendField(' initial color shown')
          .appendField(new Blockly.FieldColour('#ffffff'), 'INITIAL');
    } else if (type === '3' || type === '4') {
      inputPins.appendField('widget color')
          .appendField(new Blockly.FieldColour('#ffffff'), 'COLOR');
    }

    if (this.getField('TYPE') && type !== null) {
      this.setFieldValue(type, 'TYPE');
    }
    if (this.getField('MIN') && min !== null) {
      this.setFieldValue(min, 'MIN');
    }
    if (this.getField('MAX') && max !== null) {
      this.setFieldValue(max, 'MAX');
    }
    if (this.getField('COLOR') && color !== null) {
      this.setFieldValue(color, 'COLOR');
    }
    if (this.getField('INITIAL') && initial !== null) {
      this.setFieldValue(initial, 'INITIAL');
      if (type === '1' && initial === min) {
        this.setFieldValue('off', 'INITIAL');
      }
      if (type === '1' && initial === max) {
        this.setFieldValue('on', 'INITIAL');
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_set_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    // Runs the propc generator from the init block, since it's not included
    // in the badge WX board type.
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const widget = this.getFieldValue('WIDGET');
    const label = this.getFieldValue('LABEL');
    const type = this.getFieldValue('TYPE');
    const color = this.getFieldValue('COLOR').substr(1).toUpperCase();
    const min = window.parseInt(this.getFieldValue('MIN') || '0');
    const max = window.parseInt(this.getFieldValue('MAX') || '10');
    let initial;
    if (type === '8') {
      initial = (window.parseInt(
          (this.getFieldValue('INITIAL') || '#FFFFFF')
              .substr(1), 16)).toString(10);
    } else if (this.getFieldValue('INITIAL') === 'on') {
      initial = max;
    } else if (this.getFieldValue('INITIAL') === 'off') {
      initial = min;
    } else {
      initial = (window.parseInt(
          this.getFieldValue('INITIAL') || '5')).toString(10);
    }

    return 'wifi_print(WS, __wsHandle, "W,' + widget + ',' + type +
        ',' + label + ',' + min + ',' + max + ',' + initial + ',' + color +
        '");\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_send_widget.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_send_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_SEND_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('NUM')
        .setCheck('Number')
        .appendField('Simple WX send');
    this.appendDummyInput()
        .appendField('to widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
        ]), 'WIDGET');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_send_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const num = Blockly.propc.valueToCode(
        this, 'NUM', Blockly.propc.ORDER_NONE);
    const widget = this.getFieldValue('WIDGET');
    return 'wifi_print(WS, __wsHandle, "D,' + widget + ',%d", ' + num + ');\n';
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_read_widgets.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_read_widgets = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_READ_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX read widgets');
    this.setInputsInline(true);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_read_widgets = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    let code = '';
    code += 'wifi_print(WS, __wsHandle, "U,0");\n__wv[0] = 0;\n';
    code += 'while(__wv[0] != \'V\') {  __wv[0]++;\n  wifi_poll(&__wxEvent,' +
        ' &__wxId,';
    code += '&__wxHandle);\n  if(__wxEvent == \'W\' && __wxId == __wsId)';
    code += '__wsHandle = __wxHandle;\n   if(__wxEvent == \'D\') ';
    code += 'wifi_scan(WS, __wxHandle, "%c%d%d%d%d%d%d%d%d%d%d%d%d%d%d", ';
    code += '&__wv[0], &__wv[1], &__wv[2], &__wv[3], &__wv[4], &__wv[5],' +
        ' &__wv[6], ';
    code += '&__wv[7], &__wv[8], &__wv[9], &__wv[10], &__wv[11], &__wv[12],' +
        ' &__wv[13], &__wv[14]);\n';
    code += 'if(__wxEvent == \'X\') {__wsHandle = 0;\nwhile (!__wsHandle)';
    code += '{wifi_poll( & __wxEvent, & __wxId, & __wxHandle);\nif' +
        ' (__wxEvent == \'W\' ';
    code += '&& __wxId == __wsId) __wsHandle = __wxHandle;}break;}}';
    return code;
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_get_widget.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_get_widget = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX widget')
        .appendField(new Blockly.FieldDropdown([
          ['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'],
          ['5', '5'], ['6', '6'], ['7', '7'], ['8', '8'],
          ['9', '9'], ['10', '10'], ['11', '11'], ['12', '12'],
          ['device horizontal tilt', '13'],
          ['device vertical tilt', '14'],
        ]), 'WIDGET')
        .appendField('value');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

Blockly.propc.wx_get_widget = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    const widget = this.getFieldValue('WIDGET');
    return ['__wv[' + widget + ']', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_evt_connected.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_evt_connected = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX connected');
    this.setOutput(true, 'Number');
    this.setPreviousStatement(false, null);
    this.setNextStatement(false, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

Blockly.propc.wx_evt_connected = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    return ['(__wxEvent != \'X\')', Blockly.propc.ORDER_ATOMIC];
  }
};

/**
 *
 * @type {{
 *  init: Blockly.Blocks.wx_reconnect.init,
 *  helpUrl: string,
 *  onchange: *
 * }}
 */
Blockly.Blocks.wx_reconnect = {
  helpUrl: Blockly.MSG_SWX_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_SWX_GET_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('Simple WX reconnect');
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.setWarningText(null);
  },
  onchange: Blockly.Blocks['wx_set_widget'].onchange,
};

/**
 *
 * @return {string}
 */
Blockly.propc.wx_reconnect = function() {
  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  if (getProjectInitialState().boardType.name === 'heb-wx') {
    Blockly.propc.wx_init.call();
  }
  if (allBlocks.toString().indexOf('Simple WX initialize') === -1 &&
      getProjectInitialState().boardType.name !== 'heb-wx') {
    return '// ERROR: Simple WX is not initialized!\n';
  } else {
    let code = '__wsId = wifi_listen(WS, "/ws/a"); __wsHandle = 0;\n';
    code += 'while(!__wsHandle) {\n  wifi_poll(&__wxEvent, &__wxId,' +
        ' &__wxHandle);\n';
    code += '  if(__wxEvent == \'W\' && __wxId == __wsId)  __wsHandle =' +
        ' __wxHandle;\n}';
    return code;
  }
};

