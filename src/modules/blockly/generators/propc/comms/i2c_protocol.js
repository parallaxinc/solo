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
 * @fileoverview Implement I2C communications protocol
 *
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */

//
//
// ---------------- I2C Protocol Blocks ---------------------------------------
//
//

import Blockly from 'blockly/core';
import {colorPalette} from '../../propc';
import {getDefaultProfile} from '../../../../project';

/**
 * I2C Send
 * @type {{
 *  init: Blockly.Blocks.i2c_send.init,
 *  mutationToDom: (function(): HTMLElement),
 *  setPinMenus: Blockly.Blocks.i2c_send.setPinMenus,
 *  helpUrl: string,
 *  domToMutation: Blockly.Blocks.i2c_send.domToMutation,
 *  checkI2cPins: Blockly.Blocks.i2c_send.checkI2cPins,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_send = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_SEND_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('i\u00B2c controller send');
    this.appendValueInput('DATA')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('data')
        .appendField(new Blockly.FieldNumber('2', null, null, 1), 'COUNT')
        .appendField(new Blockly.FieldDropdown([
          ['bytes MSB first', '-1'],
          ['bytes LSB first', '1'],
        ]), 'ORDER');
    this.appendValueInput('ADDR')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['register length 1 byte', '1'],
          ['register length 2 bytes', '2'],
          ['register length 3 bytes', '3'],
          ['register length 4 bytes', '4'],
        ]), 'ADDRCOUNT');
    this.appendValueInput('DEVICE')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('device address');
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.pinWarn = null;
    // this.checkI2cPins(null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('SDA');
    const m2 = this.getFieldValue('SCL');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('bus SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, pin, null);
            }), 'SDA')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, null, pin);
            }), 'SCL');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SDA');
    } else if (m1) {
      this.setFieldValue(m1, 'SDA');
    }
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: function() {
    const container = document.createElement('mutation');
    if (this.pinWarn) {
      container.setAttribute('pinwarn', this.pinWarn);
    }
    return container;
  },
  domToMutation: function(container) {
    const warnTxt = container.getAttribute('pinwarn') || null;
    this.pinWarn = warnTxt;
    this.setWarningText(warnTxt);
  },
  checkI2cPins: function(action, zda, zcl) {
    const sda = zda || this.getFieldValue('SDA');
    const scl = zcl || this.getFieldValue('SCL');
    const warnTxt = 'WARNING: Both SDA and SCL must be equal to \nSDA and ' +
        'SCL on other blocks if sharing \nan i\u00B2c bus, or both must be ' +
        'different\nif on separate i\u00B2c busses, and SDA and SCL must be ' +
        'different from each other!';
    this.pinWarn = null;

    if (action === null) {
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
      let func = null;
      for (let i = 0; i < allBlocks.length; i++) {
        func = allBlocks[i].checkI2cPins;
        if (func) {
          const xda = allBlocks[i].getFieldValue('SDA');
          const xcl = allBlocks[i].getFieldValue('SCL');
          if (((sda === scl) || (xda === sda && xcl !== scl) ||
                  (xda !== sda && xcl === scl) ||
                  (xda === scl && xcl !== sda) ||
                  (xcl === sda && xda !== scl)) &&
              allBlocks[i] !== this &&
              allBlocks[i].type !== 'i2c_busy') {
            this.pinWarn = warnTxt;
          }
        }
      }
      for (let i = 0; i < allBlocks.length; i++) {
        func = allBlocks[i].checkI2cPins;
        if (func) {
          func.call(allBlocks[i], (this.pinWarn ? true : false));
        }
        func = allBlocks[i].setSdaPins;
        if (func && sda !== this.getFieldValue('SDA')) {
          func.call(allBlocks[i], sda, this.getFieldValue('SDA'));
        }
        func = allBlocks[i].setSclPins;
        if (func && scl !== this.getFieldValue('SCL')) {
          func.call(allBlocks[i], scl, this.getFieldValue('SCL'));
        }
      }
    } else if (action === true) {
      this.pinWarn = warnTxt;
    } else if (action === false) {
      this.pinWarn = null;
    }
    this.setWarningText(this.pinWarn);
  },
};

/**
 * I2C Send C code generator
 * @return {string}
 */
Blockly.propc.i2c_send = function() {
  // TODO: Please document the following line of code.
  let code = (this.pinWarn ? '// ' + this.pinWarn.replace(/\n/g, '') : '');

  const sda = this.getFieldValue('SDA');
  let mode = '0';
  const scl = this.getFieldValue('SCL');
  const order = this.getFieldValue('ORDER');
  const adct = this.getFieldValue('ADDRCOUNT');
  let val = Blockly.propc.valueToCode(
      this, 'DATA', Blockly.propc.ORDER_NONE) || '0';
  const cnt = this.getFieldValue('COUNT') || '1';
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE) || '0';
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < allBlocks.length; i++) {
    if (allBlocks[i].type === 'i2c_mode') {
      const xcl = allBlocks[i].getFieldValue('SCL');
      if (xcl === scl) {
        mode = allBlocks[i].getFieldValue('MODE');
      }
    }
  }

  if (!this.disabled) {
    const profile = getDefaultProfile();
    let s1 = '';
    let s2 = '';
    if (profile.digital.toString().indexOf(sda + ',' + sda) === -1) {
      s1 = 'MY_';
    }
    if (profile.digital.toString().indexOf(scl + ',' + scl) === -1) {
      s2 = 'MY_';
    }
    Blockly.propc.definitions_['i2c_init' + sda] = 'i2c *i2c' + sda + ';';
    Blockly.propc.setups_['i2c_init' + sda] =
        'i2c' + sda + ' = i2c_newbus(' + s2 + scl + ', ' + s1 + sda +
        ', ' + mode + ');';
  }

  let bufCode = '';
  let dType = 'Number';
  const connBlock = this.getInput('DATA').connection.targetBlock();
  if (connBlock) {
    const connOutput = connBlock.outputConnection.check_;
    if (connOutput && connOutput.toString().indexOf('String') > -1) {
      dType = 'String';
    }
    if (connBlock.type === 'variables_get') {
      let bType = connBlock.inputList['0'].fieldRow['0'].variable_.name;
      bType = Blockly.propc.vartype_[
          Blockly.propc.variableDB_.getName(bType, Blockly.VARIABLE_CATEGORY_NAME)
      ];
      if (bType) {
        if (bType.indexOf('char') > -1) {
          dType = 'String';
        }
      }
    }
  }

  if (dType === 'Number') {
    Blockly.propc.definitions_['i2c_Buf'] =
        'unsigned char i2cBuf[4] = {0, 0, 0, 0};';
    switch (cnt) {
      default:
        // falls through
      case '4':
        bufCode += 'i2cBuf[3] = (' + val + ' >> 24) & 255; ';
        // falls through
      case '3':
        bufCode += 'i2cBuf[2] = (' + val + ' >> 16) & 255; ';
        // falls through
      case '2':
        bufCode += 'i2cBuf[1] = (' + val + ' >> 8) & 255; ';
        // falls through
      case '1':
        bufCode += 'i2cBuf[0] = (' + val + ') & 255;';
        break;
    }
    val = 'i2cBuf';
  }

  code += bufCode;
  code += 'i2c_out(i2c' + sda + ', ' + devc + ' & 0x7F, ' + addr;
  code += ', ' + adct + ', ' + val + ', ' +
      order.replace(/1/g, '') + cnt + ');\n';

  return code;
};

/**
 * I2C Receive
 * @type {{
 *  init: Blockly.Blocks.i2c_receive.init,
 *  mutationToDom: *,
 *  setPinMenus: Blockly.Blocks.i2c_receive.setPinMenus,
 *  helpUrl: string,
 *  domToMutation: *,
 *  checkI2cPins: (
 *      Blockly.Blocks.i2c_send.checkI2cPins |
 *      Blockly.Blocks.i2c_send.checkI2cPins),
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_receive = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_RECEIVE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput()
        .appendField('i\u00B2c controller receive');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('data')
        .appendField(new Blockly.FieldNumber('2', null, null, 1), 'COUNT')
        .appendField(new Blockly.FieldDropdown([
          ['bytes MSB first', '-1'],
          ['bytes LSB first', '1'],
        ]), 'ORDER');
    this.appendValueInput('ADDR')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField(new Blockly.FieldDropdown([
          ['register length 1 byte', '1'],
          ['register length 2 bytes', '2'],
          ['register length 3 bytes', '3'],
          ['register length 4 bytes', '4'],
        ]), 'ADDRCOUNT');
    this.appendValueInput('DEVICE')
        .setAlign(Blockly.ALIGN_RIGHT)
        .setCheck('Number')
        .appendField('device address');
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(new Blockly.FieldDropdown([
          ['as Decimal', 'int'],
          ['as String', 'str'],
        ]), 'TYPE')
        .appendField('store in')
        .appendField(new Blockly.FieldVariable(
            Blockly.LANG_VARIABLES_SET_ITEM), 'VAR');
    this.appendDummyInput('PINS');
    this.setInputsInline(false);
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.pinWarn = null;
    // this.checkI2cPins(null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m1 = this.getFieldValue('SDA');
    const m2 = this.getFieldValue('SCL');
    const ct = this.getFieldValue('COUNT');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField('bus SDA')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, pin, null);
            }), 'SDA')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                })), function(pin) {
              // eslint-disable-next-line no-invalid-this
              this.getSourceBlock().checkI2cPins(null, null, pin);
            }), 'SCL');
    this.setFieldValue(ct, 'COUNT');
    if (m1 && m1 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SDA');
    } else if (m1) {
      this.setFieldValue(m1, 'SDA');
    }
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: Blockly.Blocks['i2c_send'].mutationToDom,
  domToMutation: Blockly.Blocks['i2c_send'].domToMutation,
  checkI2cPins: Blockly.Blocks['i2c_send'].checkI2cPins,
};

/**
 * I2C Receive C code generator
 * @return {string}
 */
Blockly.propc.i2c_receive = function() {
  let code = (this.pinWarn ? '// ' + this.pinWarn.replace(/\n/g, '') : '');
  const sda = this.getFieldValue('SDA');
  let mode = '0';
  const scl = this.getFieldValue('SCL');
  const order = this.getFieldValue('ORDER');
  const adct = this.getFieldValue('ADDRCOUNT');
  const type = this.getFieldValue('TYPE');
  let val = Blockly.propc.variableDB_.getName(
      this.getFieldValue('VAR'),
      Blockly.VARIABLE_CATEGORY_NAME);
  const cnt = this.getFieldValue('COUNT') || '1';
  const addr = Blockly.propc.valueToCode(
      this, 'ADDR', Blockly.propc.ORDER_NONE) || '0';
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';

  const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
  for (let i = 0; i < allBlocks.length; i++) {
    if (allBlocks[i].type === 'i2c_mode') {
      const xcl = allBlocks[i].getFieldValue('SCL');
      if (xcl === scl) {
        mode = allBlocks[i].getFieldValue('MODE');
      }
    }
  }

  if (!this.disabled) {
    const profile = getDefaultProfile();
    let s1 = '';
    let s2 = '';
    if (profile.digital.toString().indexOf(sda + ',' + sda) === -1) {
      s1 = 'MY_';
    }
    if (profile.digital.toString().indexOf(scl + ',' + scl) === -1) {
      s2 = 'MY_';
    }
    Blockly.propc.definitions_['i2c_init' + sda] = 'i2c *i2c' + sda + ';';
    Blockly.propc.setups_['i2c_init' + sda] =
        'i2c' + sda + ' = i2c_newbus(' + s2 + scl + ', ' + s1 +
        sda + ', ' + mode + ');';
  }

  let bufCode = val + ' = ';
  if (type === 'str') {
    Blockly.propc.vartype_[val] = 'char *';
    bufCode = '';
  } else {
    Blockly.propc.definitions_['i2c_Buf'] =
        'unsigned char i2cBuf[4] = {0, 0, 0, 0};';
    val = 'i2cBuf';
    bufCode += '(';
    switch (cnt) {
      default:
        // falls through
      case '4':
        bufCode += '(i2cBuf[3] << 24) | ';
        // falls through
      case '3':
        bufCode += '(i2cBuf[2] << 16) | ';
        // falls through
      case '2':
        bufCode += '(i2cBuf[1] << 8) | ';
        // falls through
      case '1':
        bufCode += 'i2cBuf[0]';
        break;
    }
    bufCode += ');\n';
  }

  code += 'i2c_in(i2c' + sda + ', ' + devc + ' & 0x7F, ' + addr;
  code += ', ' + adct + ', ' + val + ', ' +
      order.replace(/1/g, '') + cnt + ');\n';
  code += bufCode;
  return code;
};

/**
 * I2C Mode
 * @type {{
 *  init: Blockly.Blocks.i2c_mode.init,
 *  setPinMenus: Blockly.Blocks.i2c_mode.setPinMenus,
 *  helpUrl: string,
 *  onchange: Blockly.Blocks.i2c_mode.onchange,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_mode = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_MODE_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendDummyInput('PINS');
    this.warnFlag = 0;
    this.pinWarn = null;
    this.setPreviousStatement(true, 'Block');
    this.setNextStatement(true, null);
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m2 = this.getFieldValue('SCL');
    const ct = this.getFieldValue('MODE');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('i\u00B2c controller set mode')
        .appendField(new Blockly.FieldDropdown([
          ['normal (open-collector)', '0'],
          ['push-pull', '1'],
        ]), 'MODE')
        .appendField('SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                }))), 'SCL');
    this.setFieldValue(ct, 'MODE');
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  onchange: function(event) {
    // only fire when a block got deleted or created, the SCL field was changed
    if (event &&
        (event.type == Blockly.Events.BLOCK_CREATE ||
            event.type == Blockly.Events.BLOCK_DELETE ||
            event.name === 'SCL' || event.name === 'SDA' ||
            event.blockId === this.id || this.warnFlag > 0)) {
      // TODO: Supply missing parameter in call to getAllBlocks.
      const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
      this.warnFlag--;
      let sda = null;
      this.pinWarn = 'WARNING: SCL on this block must match SCL on at least' +
          ' one i\u00B2c receive or i\u00B2c send block!';
      for (let i = 0; i < allBlocks.length; i++) {
        if (allBlocks[i].type === 'i2c_send' ||
            allBlocks[i].type === 'i2c_receive') {
          if (allBlocks[i].getFieldValue('SCL') === this.getFieldValue('SCL')) {
            if (sda && sda !== allBlocks[i].getFieldValue('SDA')) {
              this.pinWarn = 'WARNING: Both SDA and SCL must match SDA and' +
                  ' SCL on other i\u00B2c blocks if sharing ';
              this.pinWarn += 'an i\u00B2c bus, or both must be different' +
                  ' if on separate i\u00B2c busses!';
              sda = '-1';
            } else {
              sda = allBlocks[i].getFieldValue('SDA');
              this.pinWarn = null;
            }
          }
          if (allBlocks[i].getFieldValue('SCL') ===
              allBlocks[i].getFieldValue('SDA')) {
            this.pinWarn = 'WARNING: SDA and SCL cannot be on the same pin!';
            i = allBlocks.length + 1;
          }
        }
        this.setWarningText(this.pinWarn);
      }
    }
  },
};

/**
 *
 * @return {string}
 */
Blockly.propc.i2c_mode = function() {
  return '';
};

/**
 * I2C Busy
 * @type {{
 *  init: Blockly.Blocks.i2c_busy.init,
 *  mutationToDom: *,
 *  setPinMenus: Blockly.Blocks.i2c_busy.setPinMenus,
 *  helpUrl: string,
 *  onchange: *,
 *  domToMutation: *,
 *  updateConstMenu: *
 *  }}
 */
Blockly.Blocks.i2c_busy = {
  helpUrl: Blockly.MSG_PROTOCOLS_HELPURL,
  init: function() {
    this.setTooltip(Blockly.MSG_I2C_BUSY_TOOLTIP);
    this.setColour(colorPalette.getColor('protocols'));
    this.appendValueInput('DEVICE')
        .setCheck('Number')
        .appendField('i\u00B2c controller is device at address');
    this.appendDummyInput('PINS');
    this.setInputsInline(true);
    this.setOutput(true, 'Number');
    this.pinWarn = null;
    this.updateConstMenu();
  },
  updateConstMenu: Blockly.Blocks['shift_in'].updateConstMenu,
  setPinMenus: function(oldValue, newValue) {
    const profile = getDefaultProfile();
    const m2 = this.getFieldValue('SCL');
    if (this.getInput('PINS')) {
      this.removeInput('PINS');
    }
    this.appendDummyInput('PINS')
        .appendField('busy  SCL')
        .appendField(new Blockly.FieldDropdown(
            profile.digital.concat(this.userDefinedConstantsList_.map(
                function(value) {
                  return [value, value];
                }))), 'SCL');
    if (m2 && m2 === oldValue && newValue) {
      this.setFieldValue(newValue, 'SCL');
    } else if (m2) {
      this.setFieldValue(m2, 'SCL');
    }
  },
  mutationToDom: Blockly.Blocks['i2c_send'].mutationToDom,
  domToMutation: Blockly.Blocks['i2c_send'].domToMutation,
  onchange: Blockly.Blocks['i2c_mode'].onchange,
};

/**
 *
 * @return {string|[string, number]}
 */
Blockly.propc.i2c_busy = function() {
  const devc = Blockly.propc.valueToCode(
      this, 'DEVICE', Blockly.propc.ORDER_NONE) || '0';
  if (this.pinWarn) {
    return '// ' + this.pinWarn;
  } else {
    const allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    let sda = '0';
    for (let i = 0; i < allBlocks.length; i++) {
      if ((allBlocks[i].type === 'i2c_send' ||
              allBlocks[i].type === 'i2c_receive') &&
          allBlocks[i].getFieldValue('SCL') === this.getFieldValue('SCL')) {
        sda = allBlocks[i].getFieldValue('SDA');
      }
    }
    return [
      'i2c_busy(i2c' + sda + ', ' + devc + ')',
      Blockly.propc.ORDER_ATOMIC,
    ];
  }
};
