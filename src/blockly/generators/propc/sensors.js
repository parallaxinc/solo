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

//define blocks
if (!Blockly.Blocks)
    Blockly.Blocks = {};

// ---------------- Ping))) Sensor Blocks --------------------------------------
Blockly.Blocks.sensor_ping = {
    helpUrl: Blockly.MSG_PING_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_SENSOR_PING_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Ping))) distance in")
                .appendField(new Blockly.FieldDropdown([["inches", "_inches"], ["cm", "_cm"], ["\u00B5s", ""]]), "UNIT");
        this.pinChoices = ['PIN'];
        this.otherPin = [false];
        this.addPinMenu("PIN", null, 0);
        this.setOutput(true, 'Number');
        this.setInputsInline(true);
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    addPinMenu: function (label, moveBefore, pinOpt) {
        this.appendDummyInput('SET_PIN')
                .appendField(label, 'LABEL')
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat([['other', 'other']]), function (op) {
                    this.sourceBlock_.setToOther(op, moveBefore, pinOpt);
                }), this.pinChoices[pinOpt]);
        this.moveBefore = moveBefore;
        this.otherPin[pinOpt] = false;
    },
    setToOther: function (op, moveBefore, pinOpt) {
        if (op === 'other') {
            this.otherPin[pinOpt] = true;
            var label = this.getFieldValue('LABEL');
            if(this.getInput('SET_PIN')) {
                this.removeInput('SET_PIN');
            }
            this.appendValueInput(this.pinChoices[pinOpt])
                    .appendField(label)
                    .setCheck('Number')
                    .appendRange('A,' + profile.default.digital.toString());
            if (moveBefore) {
                this.moveInputBefore(this.pinChoices[pinOpt], moveBefore);
            } else {
                var currBlockTimeout = this;
                setTimeout(function() {
                    currBlockTimeout.render();
                }, 200);
            }
        }
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        for (var pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
            container.setAttribute('otherpin' + pinOpt, this.otherPin[pinOpt]);
        }
        return container;
    },
    domToMutation: function (xmlElement) {
        for (var pinOpt = 0; pinOpt < this.pinChoices.length; pinOpt++) {
            var op = xmlElement.getAttribute('otherpin' + pinOpt);
            if (op === 'true') {
                this.setToOther('other', this.moveBefore, pinOpt);
            }
        }
    }
};

Blockly.propc.sensor_ping = function () {
    var pin = '0';
    if (this.otherPin[0]) {
        pin = Blockly.propc.valueToCode(this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
        pin = this.getFieldValue(this.pinChoices[0]);
    }
    var unit = this.getFieldValue('UNIT');

    if (!this.disabled) {
        Blockly.propc.definitions_["include ping"] = '#include "ping.h"';
    }

    var code = 'ping' + unit + '(' + pin + ')';
    return [code, Blockly.propc.ORDER_ATOMIC];
};

// ---------------- 2-axis Joystick Blocks -------------------------------------
Blockly.Blocks.joystick_input_yaxis = {
    helpUrl: Blockly.MSG_JOYSTICK_HELPURL,
    init: function () {
        this.chan = ['x', 'X'];
        if (this.type === 'joystick_input_yaxis') {
            this.chan = ['y', 'Y'];
        }
        this.setTooltip(Blockly.MSG_JOYSTICK_INPUT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Joystick " + this.chan[0] + "-axis A/D")
                .appendField(new Blockly.FieldDropdown(profile.default.analog), "PIN" + this.chan[1]);
        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    }
};

Blockly.propc.joystick_input_yaxis = function () {
    var pin_number = this.getFieldValue("PIN" + this.chan[1]);

    if (!this.disabled) {
        Blockly.propc.definitions_["include abvolts"] = '#include "abvolts.h"';
    }

    var code = 'ad_in(' + pin_number + ') * 100 / 4096';
    return [code, Blockly.propc.ORDER_ATOMIC];
};

Blockly.Blocks.joystick_input_xaxis = Blockly.Blocks.joystick_input_yaxis;
Blockly.propc.joystick_input_xaxis = Blockly.propc.joystick_input_yaxis;

// ---------------- PIR Sensor Blocks ------------------------------------------
Blockly.Blocks.PIR_Sensor = {
    helpUrl: Blockly.MSG_PIR_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_PIR_SENSOR_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.pinChoices = ['PIN'];
        this.otherPin = [false];
        this.addPinMenu("PIR sensor PIN", null, 0);
        this.setInputsInline(true);
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setOutput(true, 'Number');
    },
    mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
    domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
    addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
    setToOther: Blockly.Blocks['sensor_ping'].setToOther
};

Blockly.propc.PIR_Sensor = function () {
    var pin = '0';
    if (this.otherPin[0]) {
        pin = Blockly.propc.valueToCode(this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
        pin = this.getFieldValue(this.pinChoices[0]);
    }
    return ['input(' + pin + ')', Blockly.propc.ORDER_ATOMIC];
};


// ---------------- Sound Impact Sensor Blocks ---------------------------------
Blockly.Blocks.sound_impact_run = {
    helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_SOUND_IMPACT_RUN_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(true);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
        this.updateConstMenu();
    },
    updateConstMenu: function (oldValue, newValue) {
        this.userDefinedConstantsList_ = [];
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        for (var x = 0; x < allBlocks.length; x++) {
            if (allBlocks[x].type === 'constant_define') {
                var v_name = allBlocks[x].getFieldValue('CONSTANT_NAME');
                if (v_name === oldValue && newValue) {
                    v_name = newValue;
                }
                if (v_name) {
                    this.userDefinedConstantsList_.push(v_name);
                }
            }
        }
        this.userDefinedConstantsList_ = this.userDefinedConstantsList_.sortedUnique();
        this.setPinMenus(oldValue, newValue);
    },
    setPinMenus: function (oldValue, newValue) {
        var m1 = this.getFieldValue('PIN');
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        this.appendDummyInput('PINS')
                .appendField("Sound Impact initialize PIN")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "PIN");
        if (m1 && m1 === oldValue && newValue) {
            this.setFieldValue(newValue, 'PIN');
        } else if (m1) {
            this.setFieldValue(m1, 'PIN');
        }
    }
};

Blockly.propc.sound_impact_run = function () {
    if (!this.disabled) {
        var pin = this.getFieldValue('PIN');
        if (profile.default.digital.toString().indexOf(pin + ',' + pin) === -1) {
            pin = 'MY_' + pin;
        }
        Blockly.propc.definitions_["sound_impact"] = '#include "soundimpact.h"';
        Blockly.propc.setups_["sound_impact"] = 'int *__soundimpactcog = soundImpact_run(' + pin + ');';
    }

    return '';
};

Blockly.Blocks.sound_impact_get = {
    helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_SOUND_IMPACT_GET_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Sound Impact get count");
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setOutput(true, 'Number');
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Sound Impact initialize') === -1) {
            this.setWarningText('WARNING: You must use a sound impact sensor\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.sound_impact_get = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Sound Impact initialize') === -1) {
        return '// ERROR: Missing sound impact sensor initialize block!';
    } else {
        return ['soundImpact_getCount()', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.sound_impact_end = {
    helpUrl: Blockly.MSG_SOUND_IMPACT_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_SOUND_IMPACT_END_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Sound Impact close");
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Sound Impact initialize') === -1) {
            this.setWarningText('WARNING: You must use a sound impact sensor\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.sound_impact_end = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Sound Impact initialize') === -1) {
        return '// ERROR: Missing sound impact sensor initialize block!';
    } else {
        return 'soundImpact_end(__soundimpactcog);\n';
    }
};

// ---------------- ColorPal Color Sensor Blocks -------------------------------
Blockly.Blocks.colorpal_enable = {
    helpUrl: Blockly.MSG_COLORPAL_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_COLORPAL_ENABLE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("ColorPal initialize PIN")
                .appendField(new Blockly.FieldDropdown(profile.default.digital, function (myPin) {
                    this.sourceBlock_.onPinSet(myPin);
                }), "IO_PIN");
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.colorPalPin = this.getFieldValue('IO_PIN');
        this.onPinSet();
    },
    onchange: function (event) {
        this.colorPalPin = this.getFieldValue('IO_PIN');
        if (event && (event.type == Blockly.Events.BLOCK_CREATE || event.type == Blockly.Events.BLOCK_DELETE)) {  // only fire when a block got deleted or created
            this.onPinSet(null);
        }
    },
    onPinSet: function (myPin) {
        var oldPin = this.colorPalPin;
        this.colorPalPin = myPin;
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        for (var x = 0; x < allBlocks.length; x++) {
            var func = allBlocks[x].colorpalPins;
            var fund = allBlocks[x].onchange;
            if (func && myPin) {
                func.call(allBlocks[x], oldPin, myPin);
                if (fund) {
                    fund.call(allBlocks[x], {xml: true});
                }
            } else if (func) {
                func.call(allBlocks[x]);
            }
        }
    }
};

Blockly.propc.colorpal_enable = function () {
    var pin = this.getFieldValue('IO_PIN');
    if (!this.disabled) {
        Blockly.propc.definitions_["colorpal"] = '#include "colorpal.h"';
        Blockly.propc.global_vars_["colorpal" + pin] = 'colorPal *cpal' + pin + ';';
        Blockly.propc.setups_["colorpal" + pin] = 'cpal' + pin + ' = colorPal_open(' + pin + ');';
    }
    return '';
};

Blockly.Blocks.colorpal_get_colors_raw = {
    helpUrl: Blockly.MSG_COLORPAL_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_RAW_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("ColorPal raw colors store R in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'R_STORAGE');
        this.appendDummyInput()
                .appendField("G in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'G_STORAGE');
        this.appendDummyInput()
                .appendField("B in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'B_STORAGE');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.cp_pins = [];
        this.warnFlag = 0;
        this.colorpalPins();
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        if (this.getInput('CPIN')) {
            container.setAttribute('cpin', this.getFieldValue('CP_PIN'));
        }
        container.setAttribute('pinmenu', JSON.stringify(this.cp_pins));
        return container;
    },
    domToMutation: function (xmlElement) {
        var cpin = xmlElement.getAttribute('cpin');
        this.cp_pins = JSON.parse(xmlElement.getAttribute('pinmenu'));
        if (Array.isArray(this.cp_pins)) {
            this.cp_pins = this.cp_pins.map(function (value) {
                return value[0];
            })
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
                    .appendField(new Blockly.FieldDropdown(this.cp_pins.map(function (value) {
                        return [value, value]  // returns an array of arrays built from the original array.
                    })), 'CP_PIN');
            this.setFieldValue(cpin, 'CP_PIN');
        }
    },
    colorpalPins: function (oldPin, newPin) {
        var currentPin = '-1';
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
                    .appendField(new Blockly.FieldDropdown(this.cp_pins.map(function (value) {
                        return [value, value]  // returns an array of arrays built from the original array.
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
    updateCpin: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        this.cp_pins.length = 0;
        for (var x = 0; x < allBlocks.length; x++) {
            if (allBlocks[x].type === 'colorpal_enable') {
                var cp = allBlocks[x].colorPalPin || allBlocks[x].getFieldValue('IO_PIN');
                if (cp) {
                    this.cp_pins.push(cp);
                }
            }
        }
        this.cp_pins = this.cp_pins.sortedUnique();
    },
    onchange: function (event) {
        if (event) {
            // only fire when a block got deleted or created, the CP_PIN field was changed
            if (event.type == Blockly.Events.BLOCK_CREATE || event.type == Blockly.Events.BLOCK_DELETE || (event.name === 'CP_PIN' && event.blockId === this.id) || this.warnFlag > 0) {
                var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
                if (allBlocks.toString().indexOf('ColorPal initialize') === -1)
                {
                    this.setWarningText('WARNING: You must use a ColorPal\ninitialize block at the beginning of your program!');
                } else {
                    this.setWarningText(null);
                    this.warnFlag--;
                    if (this.getInput('CPIN')) {
                        var allCpPins = '';
                        for (var x = 0; x < allBlocks.length; x++) {
                            if (allBlocks[x].type === 'colorpal_enable') {
                                allCpPins += (allBlocks[x].colorPalPin || allBlocks[x].getFieldValue('IO_PIN')) + ',';
                            }
                        }
                        if (allCpPins.indexOf(this.getFieldValue('CP_PIN')) === -1) {
                            this.setWarningText('WARNING: You must use choose a new PIN for this block!');
                            // let all changes through long enough to ensure this is set properly.
                            this.warnFlag = allBlocks.length * 3;
                        }
                    }
                }
            }
        }
    }
};

Blockly.propc.colorpal_get_colors_raw = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('ColorPal initialize') === -1)
    {
        return '// ERROR: Missing colorPal initialize block!';
    } else {
        var r = Blockly.propc.variableDB_.getName(this.getFieldValue('R_STORAGE'), Blockly.Variables.NAME_TYPE);
        var g = Blockly.propc.variableDB_.getName(this.getFieldValue('G_STORAGE'), Blockly.Variables.NAME_TYPE);
        var b = Blockly.propc.variableDB_.getName(this.getFieldValue('B_STORAGE'), Blockly.Variables.NAME_TYPE);
        var p = '0';
        if (this.cp_pins.length > 0) {
            p = this.cp_pins[0];
        }
        if (this.getInput('CPIN')) {
            p = this.getFieldValue('CP_PIN');
        }
        return 'colorPal_getRGB(cpal' + p + ', &' + r + ', &' + g + ', &' + b + ');';
    }
};

Blockly.Blocks.colorpal_get_colors = {
    helpUrl: Blockly.MSG_COLORPAL_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_COLORPAL_GET_COLORS_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("ColorPal store color in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'COLOR');

        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.cp_pins = [];
        this.warnFlag = 0;
        this.colorpalPins();
    },
    mutationToDom: Blockly.Blocks['colorpal_get_colors_raw'].mutationToDom,
    domToMutation: Blockly.Blocks['colorpal_get_colors_raw'].domToMutation,
    colorpalPins: Blockly.Blocks['colorpal_get_colors_raw'].colorpalPins,
    updateCpin: Blockly.Blocks['colorpal_get_colors_raw'].updateCpin,
    onchange: Blockly.Blocks['colorpal_get_colors_raw'].onchange
};

Blockly.propc.colorpal_get_colors = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('ColorPal initialize') === -1)
    {
        return '// ERROR: Missing colorPal initialize block!';
    } else {
        var color_var = Blockly.propc.variableDB_.getName(this.getFieldValue('COLOR'), Blockly.Variables.NAME_TYPE);

        if (!this.disabled) {
            Blockly.propc.global_vars_["colorpal_rr"] = 'int cpRR = 0;';
            Blockly.propc.global_vars_["colorpal_gg"] = 'int cpGG = 0;';
            Blockly.propc.global_vars_["colorpal_bb"] = 'int cpBB = 0;';
        }

        var p = '0';
        if (this.cp_pins.length > 0) {
            p = this.cp_pins[0];
        }
        if (this.getInput('CPIN')) {
            p = this.getFieldValue('CP_PIN');
        }

        var code = 'colorPal_getRGB(cpal' + p + ', &cpRR, &cpGG, &cpBB);\n\t' + color_var + ' = colorPalRRGGBB(cpRR, cpGG, cpBB);';
        return code;
    }
};

// -------------- Fingerprint Scanner Blocks -----------------------------------
Blockly.Blocks.fp_scanner_init = {
    helpUrl: Blockly.MSG_FPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_FPS_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var m1 = this.getFieldValue('RXPIN');
        var m2 = this.getFieldValue('TXPIN');
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        this.appendDummyInput()
                .appendField("Fingerprint Scanner initialize RX")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "RXPIN")
                .appendField("TX")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "TXPIN");
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
    }
};

Blockly.propc.fp_scanner_init = function () {
    if (!this.disabled) {
        var rxpin = this.getFieldValue('RXPIN');
        var txpin = this.getFieldValue('TXPIN');
        if (profile.default.digital.toString().indexOf(rxpin + ',' + rxpin) === -1) {
            rxpin = 'MY_' + rxpin;
        }
        if (profile.default.digital.toString().indexOf(pin_out + ',' + pin_out) === -1) {
            txpin = 'MY_' + txpin;
        }
        Blockly.propc.global_vars_["fpScannerObj"] = 'fpScanner *fpScan;';
        Blockly.propc.definitions_["fpScannerDef"] = '#include "fingerprint.h"';
        Blockly.propc.setups_["fpScanner"] = 'fpScan = fingerprint_open(' + txpin + ', ' + rxpin + ');';
    }
    return '';
};

Blockly.Blocks.fp_scanner_add = {
    helpUrl: Blockly.MSG_FPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_FPS_ADD_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Fingerprint Scanner")
                .appendField(new Blockly.FieldDropdown([["capture and save to", "ADD"], ["delete capture for", "DEL"], ["delete all captures", "ALL"]], function (action) {
                    this.sourceBlock_.setAction_({"ACTION": action});
                }), "ACTION");
        this.appendValueInput("USER")
                .setCheck("Number")
                .appendField("ID");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var action = this.getFieldValue('ACTION');
        container.setAttribute('action', action);
        return container;
    },
    domToMutation: function (xmlElement) {
        var action = xmlElement.getAttribute('action');
        this.setAction_({"ACTION": action});
    },
    setAction_: function (details) {
        var inputIs = this.getInput('USER');
        if (details['ACTION'] !== 'ALL') {
            if (!inputIs) {
                this.appendValueInput("USER")
                        .setCheck("Number")
                        .appendField("ID");
            }
        } else {
            if (inputIs)
                this.removeInput('USER');
        }
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a Fingerprint Scanner\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.fp_scanner_add = function () {
    var act = this.getFieldValue('ACTION');
    var usr = '1';
    if (act !== "ALL")
        usr = Blockly.propc.valueToCode(this, 'USER', Blockly.propc.ORDER_NONE) || '1';

    var code = '';

    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1)
    {
        code = '// ERROR: Fingerprint Scanner is not initialized!\n';
    } else {
        if (act === 'ADD')
            code = 'fingerprint_add(fpScan, ' + usr + ', 3, 0);\n';
        if (act === 'DEL')
            code = 'fingerprint_deleteUser(fpScan, ' + usr + ');\n';
        if (act === 'ALL')
            code = 'fingerprint_deleteUser(fpScan, 0);\n';
    }

    return code;
};

Blockly.Blocks.fp_scanner_scan = {
    helpUrl: Blockly.MSG_FPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_FPS_SCAN_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Fingerprint Scanner")
                .appendField(new Blockly.FieldDropdown([["scan and identify", "SCAN"], ["scan and compare", "COMP"], ["count number of IDs", "COUNT"]], function (action) {
                    this.sourceBlock_.setAction_({"ACTION": action});
                }), "ACTION");
        this.setInputsInline(true);
        this.setOutput(true, 'Number');
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var action = this.getFieldValue('ACTION');
        container.setAttribute('action', action);
        return container;
    },
    domToMutation: function (xmlElement) {
        var action = xmlElement.getAttribute('action');
        this.setAction_({"ACTION": action});
    },
    setAction_: function (details) {
        var inputIs = this.getInput('USER');
        if (details['ACTION'] === 'COMP') {
            if (!inputIs) {
                this.appendValueInput("USER")
                        .setCheck("Number")
                        .appendField("to ID");
            }
        } else {
            if (inputIs)
                this.removeInput('USER');
        }
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a Fingerprint Scanner\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.fp_scanner_scan = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Fingerprint Scanner initialize') === -1)
    {
        return '// ERROR: Fingerprint Scanner is not initialized!\n';
    } else {
        var act = this.getFieldValue('ACTION');
        var usr = '1';
        if (act === "COMP")
            usr = Blockly.propc.valueToCode(this, 'USER', Blockly.propc.ORDER_NONE) || '1';

        var func = 'int fingerScanner(int __u) {';
        func += 'int r;\nfingerprint_scan(fpScan, __u, &r);\n';
        func += 'if (__u != 0 && r != 0) return 1;\n else return r;}';

        var code = '0';

        if (Blockly.propc.global_vars_["fpScannerObj"] === 'fpScanner *fpScan;') {
            if (act === 'SCAN') {
                Blockly.propc.global_vars_["fpScannerFunc"] = func;
                code = 'fingerScanner(0)';
            }
            if (act === 'COMP') {
                Blockly.propc.global_vars_["fpScannerFunc"] = func;
                code = 'fingerScanner(' + usr + ')';
            }
            if (act === 'COUNT')
                code = 'fingerprint_countUsers(fpScan)';
        }
        return [code, Blockly.propc.ORDER_ATOMIC];
    }
};


// -------------Memsic Tilt/Accel (MX2125 Module) ------------------------------
Blockly.Blocks.MX2125_acceleration_xaxis = {
    helpUrl: Blockly.MSG_MEMSIC_HELPURL,
    init: function () {
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
            this.res = ['tilt', 'tilt']
        }
        this.addPinMenu("Memsic " + this.res[0] + " " + this.chan[0] + "-axis PIN", null, 0);
        this.setInputsInline(true);
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setOutput(true, 'Number');
    },
    mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
    domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
    addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
    setToOther: Blockly.Blocks['sensor_ping'].setToOther
};

Blockly.propc.MX2125_acceleration_xaxis = function () {
    if (!this.disabled) {
        Blockly.propc.definitions_["include_mx2125"] = '#include "mx2125.h"';
    }
    var pin = '0';
    if (this.otherPin[0]) {
        pin = Blockly.propc.valueToCode(this, 'PIN' + this.chan[1], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
        pin = this.getFieldValue("PIN" + this.chan[1]);
    }
    return ['mx_' + this.res[1] + '(' + pin + ')', Blockly.propc.ORDER_NONE];
};

Blockly.Blocks.MX2125_acceleration_yaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_acceleration_yaxis = Blockly.propc.MX2125_acceleration_xaxis;
Blockly.Blocks.MX2125_tilt_xaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_xaxis = Blockly.propc.MX2125_acceleration_xaxis;
Blockly.Blocks.MX2125_tilt_yaxis = Blockly.Blocks.MX2125_acceleration_xaxis;
Blockly.propc.MX2125_tilt_yaxis = Blockly.propc.MX2125_acceleration_xaxis;

Blockly.Blocks.MX2125_rotation = {
    helpUrl: Blockly.MSG_MEMSIC_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_MX2125_ROTATION_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.pinChoices = ['PINX', 'PINY'];
        this.otherPin = [false, false];
        this.addPinMenu("Memsic rotation x-axis PIN", 'YAXIS', 0);
        this.addPinMenu("y-axis PIN", 'XAXIS', 1);
        this.setInputsInline(true);
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setOutput(true, 'Number');
    },
    mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
    domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
    addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
    setToOther: Blockly.Blocks['sensor_ping'].setToOther
};

Blockly.propc.MX2125_rotation = function () {
    if (!this.disabled) {
        Blockly.propc.definitions_["include_mx2125"] = '#include "mx2125.h"';
    }
    var pinVal = ['0', '0'];
    for (var i = 0; i < this.pinChoices.length; i++) {
        if (this.otherPin[i]) {
            pinVal[i] = Blockly.propc.valueToCode(this, this.pinChoices[i], Blockly.propc.ORDER_ATOMIC) || '0';
        } else {
            pinVal[i] = this.getFieldValue(this.pinChoices[i]);
        }
    }
    var code = 'mx_rotate(' + pinVal[0] + ', ' + pinVal[1] + ')';
    return [code, Blockly.propc.ORDER_NONE];
};

// --------------Accelerometer (MMA7455 Module) Blocks--------------------------
Blockly.Blocks.MMA7455_init = {
    helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_MMA7455_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Accelerometer initialize CS")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), "PINZ")
                .appendField("DATA")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), "PINX")
                .appendField("CLK")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), "PINY");

        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    }
};

Blockly.propc.MMA7455_init = function () {
    var pinx = this.getFieldValue('PINX');
    var piny = this.getFieldValue('PINY');
    var pinz = this.getFieldValue('PINZ');

    if (!this.disabled) {
        Blockly.propc.definitions_["include_mma7455"] = '#include "mma7455.h"';
        Blockly.propc.global_vars_["mma_7455_tempVars"] = 'short int __tmpX, __tmpY, __tmpZ;';
        Blockly.propc.setups_["mma_7455"] = 'MMA7455_init(' + pinx + ', ' + piny + ', ' + pinz + ');';
    }
    return '';
};

Blockly.Blocks.MMA7455_acceleration = {
    helpUrl: Blockly.MSG_ACCELEROMETER_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_MMA7455_ACCELERATION_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Accelerometer store x-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'X_VAR')
                .appendField(" y-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'Y_VAR')
                .appendField(" z-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'Z_VAR');

        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Accelerometer initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an Accelerometer\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.MMA7455_acceleration = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Accelerometer initialize') === -1) {
        code += '// ERROR: Missing Accelerometer initialize block!';
    } else {
        var xstorage = Blockly.propc.variableDB_.getName(this.getFieldValue('X_VAR'), Blockly.Variables.NAME_TYPE);
        var ystorage = Blockly.propc.variableDB_.getName(this.getFieldValue('Y_VAR'), Blockly.Variables.NAME_TYPE);
        var zstorage = Blockly.propc.variableDB_.getName(this.getFieldValue('Z_VAR'), Blockly.Variables.NAME_TYPE);

        code += 'MMA7455_getxyz10(&__tmpX, &__tmpY, &__tmpZ);\n';
        code += xstorage + ' = (int) __tmpX;\n' + ystorage + ' = (int) __tmpY;\n' + zstorage + ' = (int) __tmpZ;\n';
    }
    return code;
};

//-----------------------Compass (HMC5883L Module) Blocks ----------------------
Blockly.Blocks.HMC5883L_init = {
    helpUrl: Blockly.MSG_COMPASS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_HMC5883L_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Compass initialize SCL")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), "SCL");
        this.appendDummyInput()
                .appendField("SDA")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), "SDA");
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    }
};

Blockly.propc.HMC5883L_init = function () {
    var scl = this.getFieldValue("SCL");
    var sda = this.getFieldValue("SDA");

    if (!this.disabled) {
        Blockly.propc.definitions_["HMC5883L"] = '#include "compass3d.h"';
        Blockly.propc.setups_["HMC5883L"] = 'i2c *compass_bus = i2c_newbus(' + scl + ', ' + sda + ', 0);\n\tcompass_init(compass_bus);';
    }
    return '';
};

Blockly.Blocks.HMC5883L_read = {
    helpUrl: Blockly.MSG_COMPASS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_HMC5883L_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Compass heading store in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'HEADING');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Compass initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a Compass\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.HMC5883L_read = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Compass initialize') === -1) {
        code += '// ERROR: Missing Compass initialize block!';
    } else {
        var storage = Blockly.propc.variableDB_.getName(this.getFieldValue('HEADING'), Blockly.Variables.NAME_TYPE);
        if (!this.disabled) {
            Blockly.propc.global_vars_["compass_vars"] = 'int __compX, __compY, __compZ;\nfloat __compH;\n';
        }
        code += 'compass_read(bus, &__compX, &__compY, &__compZ);\n';
        code += '\t__compH = atan2(((float) __compY), (((float) __compX)) * 180.0/PI;\n';
        code += '\tif(__compH < 0.0) __compH = (360.0 + __compH);\n';
        code += '\t' + storage + ' = (int) __compH;\n';
    }
    return code;
};


// ---------------- LIS3DH Accelerometer Sensor Blocks -------------------------------
Blockly.Blocks.lis3dh_init = {
    helpUrl: Blockly.MSG_LIS3DH_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LIS3DH_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS')
                .appendField('LIS3DH initialize SCK')
                .appendField(new Blockly.FieldDropdown(profile.default.digital), 'SCK_PIN')
                .appendField('SDI')
                .appendField(new Blockly.FieldDropdown(profile.default.digital), 'SDI_PIN')
                .appendField("CS")
                .appendField(new Blockly.FieldDropdown(profile.default.digital), 'CS_PIN')
                .appendField('', 'TEMP')            // Temperature calibration
                .appendField('', 'UNIT')            // Temperature calibration
                .appendField('', 'SMOOTHING')       // Tilt axis smoothing
                .appendField('', 'VSS_VOLTAGE')     // ADC ground offset initialization
                .appendField('', 'VDD_VOLTAGE');    // ADC 3.3 offset initialization

        this.setInputsInline(false);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    buildTempInput: function (hasTempBlocks) {
        if (hasTempBlocks && !this.getInput('TEMP_CALIBRATE')) {
            var temp = this.getFieldValue('TEMP');
            var unit = this.getFieldValue('UNIT');

            this.getInput('PINS').removeField('TEMP');
            this.getInput('PINS').removeField('UNIT');

            this.appendDummyInput('TEMP_CALIBRATE')
                    .appendField('Set ambient temperature to')
                    .appendField(new Blockly.FieldNumber('72', null, null, 1), "TEMP")
                    .appendField(new Blockly.FieldDropdown([
                            ["\u00b0F", "F"], 
                            ["\u00b0C", "C"]
                        ]), "UNIT");

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
    buildSmoothingInput: function (hasTiltBlocks) {
        if (hasTiltBlocks && !this.getInput('TILT_CALIBRATE')) {
            var smoothing = this.getFieldValue('SMOOTHING');
            if (this.getField('SMOOTHING')) {
                this.getInput('PINS').removeField('SMOOTHING');
            }

            this.appendDummyInput('TILT_CALIBRATE')
                    .appendField('Set tilt smoothing')
                    .appendField(new Blockly.FieldNumber('0', 0, 100, 1), "SMOOTHING");
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
            var vssVoltField = this.getInput('VSS_VOLTAGE');

            // 3.3 volt calibration
            var vddVoltField = this.getInput('VDD_VOLTAGE')

            this.getInput('PINS').removeField('VSS_VOLTAGE');
            this.getInput('PINS').removeField('VDD_VOLTAGE');


            this.appendDummyInput('VOLT_CALIBRATE')
                .appendField('Calibrate ADC  GND ')
                .appendField(
                    new Blockly.FieldNumber(
                        '0',
                        null,
                        null,
                        1
                    ),"VSS_VOLTAGE")
                .appendField(' 3.3V ')
                .appendField(
                    new Blockly.FieldNumber(
                        '0',
                        null,
                        null,
                        1
                    ), "VDD_VOLTAGE");

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

    onchange: function (event) {
        // Act when the block is dragged from the fly-out to the canvas
        if (event && !this.isInFlyout) {
            var warnText = null;
            if (Blockly.getMainWorkspace().getBlocksByType(this.type, false).length > 1) {
                warnText = 'WARNING! Only one LIS3DH init block can be used!';
            }
            this.setWarningText(warnText);

            // Look for read temperature blocks
            var tempBlocksPresent = false;
            if ((Blockly.getMainWorkspace().getBlocksByType('lis3dh_temp', false) || []).length > 0) {
                tempBlocksPresent = true;
            }
            this.buildTempInput(tempBlocksPresent);

            // Look for read tilt blocks
            var tiltBlockList = Blockly.getMainWorkspace().getBlocksByType('lis3dh_read', false) || [];
            var tiltBlocksPresent = false;
            for (var i = 0; i < tiltBlockList.length; i++) {
                if (tiltBlockList[i].getFieldValue('SENSOR') === 'tilt') {
                    tiltBlocksPresent = true;
                    break;
                }
            }
            this.buildSmoothingInput(tiltBlocksPresent);

            // Look for read voltage blocks
            var voltBlockList = Blockly.getMainWorkspace().getBlocksByType('lis3dh_read', false) || [];
            var voltBlocksPresent = false;
            for (var i = 0; i < tiltBlockList.length; i++) {
                if (voltBlockList[i].getFieldValue('SENSOR') === 'adc_mV') {
                    voltBlocksPresent = true;
                    break;
                }
            }
            this.buildVoltageInput(voltBlocksPresent);
        }
    }
};

Blockly.propc.lis3dh_init = function () {
    var sck_pin = this.getFieldValue('SCK_PIN');
    var sdi_pin = this.getFieldValue('SDI_PIN');
    var cs_pin = this.getFieldValue('CS_PIN');

    if (!this.disabled) {
        Blockly.propc.definitions_["lis3dh"] = '#include "lis3dh.h"';
        Blockly.propc.global_vars_["lis3dh_init"] = 'lis3dh *lis3dh_sensor;';
        var setupCode = 'lis3dh_sensor = lis3dh_init(' + sck_pin + ', ' + sdi_pin + ', ' + cs_pin + ');';

        if (this.getInput('TEMP_CALIBRATE')) {
            var temp_val = this.getFieldValue('TEMP');
            var temp_unit = this.getFieldValue('UNIT');
            setupCode += 'lis3dh_tempCal_' + temp_unit + '(lis3dh_sensor, ' + temp_val + ');';
        } 
        var tilt_smoothing = this.getFieldValue('SMOOTHING') || 0;
        if (this.getInput('TILT_CALIBRATE') && tilt_smoothing !== 0) {
            setupCode += 'lis3dh_tiltConfig(lis3dh_sensor, 100 - ' + tilt_smoothing + ');';
        }

        if (this.getInput('VOLT_CALIBRATE')) {
            var vssVoltField = this.getFieldValue('VSS_VOLTAGE');
            var vddVoltField = this.getFieldValue('VDD_VOLTAGE');

            if ((vssVoltField !== undefined) && (vddVoltField !== undefined)) {
                setupCode += 'lis3dh_adcCal_mV(lis3dh_sensor, ';

                if (vssVoltField === 0 && vddVoltField === 0) {
                    setupCode += '0, 0, 0, 0 );';
                }
                else {
                    setupCode += '0, 3300, ' + vssVoltField + ', ' + vddVoltField + ');';
                }
            }
        }

        Blockly.propc.setups_["lis3dh_init"] = setupCode + '\n';
    }
    return '';
};

Blockly.Blocks.lis3dh_read = {
    helpUrl: Blockly.MSG_LIS3DH_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LIS3DH_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));

        this.appendDummyInput('ACTION')
                    .appendField("LIS3DH read")
                    .appendField(
                        new Blockly.FieldDropdown([
                                ['acceleration (1000ths of g\'s)', 'accel_mg'],
                                ['tilt (degrees)', 'tilt'],
                                ['voltage (mV)', 'adc_mV']
                            ], function (action) {this.getSourceBlock().configureFields(action)}),
                        'SENSOR');

        this.appendDummyInput('VARS')
                .appendField("store X in", 'LABEL_0')
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_1')
                .appendField("Y in", 'LABEL_1')
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_2')
                .appendField("Z in", 'LABEL_2')
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_3')
                .appendField('', 'STORE_4');
        this.setInputsInline(false);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);

        // Field values - this gets populated in the configureFields method
        this.fieldVals = [];
    },
    configureFields: function (action) {
        // Set default if no action provided.
        if (!action) {
            action = 'accel_mg';
        }

        // The value of this field determines how the block will appear
        var blockText = {
            'accel_mg': {label: ['store X in', 'Y in', 'Z in']},
            'adc_mV': {label: ['store AD1 in', 'AD2 in', 'AD3 in']},
            'tilt': {label: ['store X in', 'Y in', 'Z in']}
        };

        for (var i = 0; i < 3; i++) {
            this.setFieldValue(blockText[action].label[i], 'LABEL_' + i.toString(10));
        }

        // Read the values of all of the fields before rebuilding all of the block's inputs
        if (!this.isInFlyout) {
            for (i = 1; i < 5; i++) {
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
            this.appendDummyInput('VARS_2').appendField("store combined motion in")
                    .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'STORE_4');
        } else if (!this.getField('STORE_4')) {
            // Attach a blank field just to make sure it exists when the block fields are populated.
            // Blockly will throw a warning if this isn't here.
            this.getInput('VARS').appendField('', 'STORE_4');
            this.fieldVals[4] = '';
        }

        // Repopulate all of the field values (make sure there is a field before trying to populate it)
        for (i = 1; i < 4; i++) {
            if (this.fieldVals[i] && this.fieldVals[i] !== '' && this.getField('STORE_' + i.toString(10))) {
                this.setFieldValue(this.fieldVals[i], 'STORE_' + i.toString(10));
            }
        }
        
        // Restore the variable field - this is a bit of a workaround, because the name (not the ID) is
        // somehow being stored, so it needs to be converted to an ID before repopulating the field.
        if (action === 'tilt' && this.fieldVals[3] && this.fieldVals[4] && this.fieldVals[4] !== '') {
            var tempVar = Blockly.getMainWorkspace().getVariable(this.fieldVals[4]);
            if (tempVar) {
                this.setFieldValue(tempVar.getId(), 'STORE_4');
            }
        }

        // If the placeholder fields are present, make sure they are empty.
        if (this.getField('STORE_4') && !this.getField('STORE_4').EDITABLE) {
            this.setFieldValue('', 'STORE_4');
        }
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('fieldvals', this.getFieldValue('SENSOR'));
        return container;
    },
    domToMutation: function (container) {
        var action = container.getAttribute('fieldvals');
        this.configureFields(action);
    },
    onchange: function(event) {
        // Only initiate this if there is a change that affects the field values in the block
        if (event && (event.type === Blockly.Events.BLOCK_CREATE || 
                event.type === Blockly.Events.BLOCK_DELETE || 
                event.type === Blockly.Events.BLOCK_CHANGE)) {

            var warnText = null;
            if ((Blockly.getMainWorkspace().getBlocksByType('lis3dh_init') || []).length < 1) {
                warnText = 'WARNING! The block requires an LIS3DH init block!';
            }
            this.setWarningText(warnText);
        }
    }
};

Blockly.propc.lis3dh_read = function () {
    // retrieve the sensor type selected
    var action = this.getFieldValue('SENSOR');
    // retrieve the field values
    var s1 = Blockly.propc.variableDB_.getName(this.getFieldValue('STORE_1'), Blockly.Variables.NAME_TYPE);
    var s2 = Blockly.propc.variableDB_.getName(this.getFieldValue('STORE_2'), Blockly.Variables.NAME_TYPE);
    var s3 = Blockly.propc.variableDB_.getName(this.getFieldValue('STORE_3'), Blockly.Variables.NAME_TYPE);
    var s4 = null;
    // if 'tilt' is selected, grab the fourth variable
    if (action === 'tilt') {
        s4 = Blockly.propc.variableDB_.getName(this.getFieldValue('STORE_4'), Blockly.Variables.NAME_TYPE);
    }

    // generate the c code for this block.
    if ((Blockly.getMainWorkspace().getBlocksByType('lis3dh_init') || []).length > 0) {
        return 'lis3dh_' + action + '(lis3dh_sensor, &' + s1 + ', &' + s2 + ', &' + s3 + (s4 ? ', &' + s4 : '') + ');\n';
    } else {
        return '// WARNING: Missing init block!';
    }
};

Blockly.Blocks.lis3dh_temp = {
    helpUrl: Blockly.MSG_LIS3DH_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LIS3DH_TEMP_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('MAIN')
                .appendField("LIS3DH temperature in")
                .appendField(new Blockly.FieldDropdown([
                    ["\u00b0F", "F"], 
                    ["\u00b0C", "C"]
                ]), "UNIT");
        this.setInputsInline(false);
        this.setOutput(true, 'Number');
    },
    onchange: Blockly.Blocks['lis3dh_read'].onchange,
};

Blockly.propc.lis3dh_temp = function () {
    if ((Blockly.getMainWorkspace().getBlocksByType('lis3dh_init') || []).length > 0) {
        return ['lis3dh_temp_' + this.getFieldValue('UNIT') + '(lis3dh_sensor)', Blockly.propc.ORDER_NONE];
    } else {
        return ['0 // WARNING: Missing init block!', Blockly.propc.ORDER_NONE];
    }
};


// ------------------ IMU (LSM9DS1 module) Blocks ------------------------------
Blockly.Blocks.lsm9ds1_init = {
    helpUrl: Blockly.MSG_IMU_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LSM9DS1_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var mv = ['PIN_SCL', 'PIN_SDIO', 'PIN_CSAG', 'PIN_CSM'];
        var m = [this.getFieldValue('PIN_SCL'), this.getFieldValue('PIN_SDIO'), this.getFieldValue('PIN_CSAG'), this.getFieldValue('PIN_CSM')];
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        var pinConstantList = this.userDefinedConstantsList_.map(function (value) {
            return [value, value]  // returns an array of arrays built from the original array.
        });
        this.appendDummyInput('PINS')
                .appendField("IMU initialize SCL")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_SCL")
                .appendField("SDIO")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_SDIO")
                .appendField("CS_AG")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_CSAG")
                .appendField("CS_M")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_CSM");
        for (var i = 0; i < 4; i++) {
            if (m[i] && m[i] === oldValue && newValue) {
                this.setFieldValue(newValue, mv[i]);
            } else if (m[i]) {
                this.setFieldValue(m[i], mv[i]);
            }
        }
    }
};

Blockly.propc.lsm9ds1_init = function () {
    var pin = [this.getFieldValue('PIN_SCL'), this.getFieldValue('PIN_SDIO'), this.getFieldValue('PIN_CSAG'), this.getFieldValue('PIN_CSM')];
    for (var i = 0; i < 3; i++) {
        if (profile.default.digital.toString().indexOf(pin[i] + ',' + pin[i]) === -1) {
            pin[i] = 'MY_' + pin[i];
        }
    }
    if (!this.disabled) {
        Blockly.propc.definitions_["include_lsm9ds1"] = '#include "lsm9ds1.h"';
        Blockly.propc.setups_["lsm9ds1_init"] = 'imu_init(' + pin[0] + ', ' + pin[1] + ', ' + pin[2] + ', ' + pin[3] + ');';
        Blockly.propc.global_vars_["lsm9ds1_vars"] = 'float __imuX, __imuY, __imuZ, __compI;\n';
    }
    return '';
};

Blockly.Blocks.lsm9ds1_mag_calibrate = {
    helpUrl: Blockly.MSG_IMU_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LSM9DS1_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("IMU calibrate magnetometer");

        this.setInputsInline(true);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('IMU initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an IMU\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.lsm9ds1_mag_calibrate = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
        return '// ERROR: Missing IMU initialize block!';
    } else {
        return 'high(26);high(27);imu_calibrateMag();low(26);low(27);';
    }
};

Blockly.Blocks.lsm9ds1_read = {
    helpUrl: Blockly.MSG_IMU_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LSM9DS1_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("IMU read")
                .appendField(new Blockly.FieldDropdown([["accelerometer (100ths of g's)", "Accel"], ["gyroscope (100ths of deg/s)", "Gyro"], ["magnetometer (100ths of gauss)", "Mag"]]), "SENSOR")
                .appendField("store X-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'X_VAR')
                .appendField(" y-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'Y_VAR')
                .appendField(" z-axis in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'Z_VAR');
        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('IMU initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an IMU\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.lsm9ds1_read = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
        code += '// ERROR: Missing IMU initialize block!';
    } else {
        var sensor = this.getFieldValue('SENSOR');
        var xstorage = Blockly.propc.variableDB_.getName(this.getFieldValue('X_VAR'), Blockly.Variables.NAME_TYPE);
        var ystorage = Blockly.propc.variableDB_.getName(this.getFieldValue('Y_VAR'), Blockly.Variables.NAME_TYPE);
        var zstorage = Blockly.propc.variableDB_.getName(this.getFieldValue('Z_VAR'), Blockly.Variables.NAME_TYPE);

        code += 'imu_read' + sensor + 'Calculated(&__imuX, &__imuY, &__imuZ);\n';
        code += xstorage + ' = (int) (100.0 * __imuX);\n';
        code += ystorage + ' = (int) (100.0 * __imuY);\n';
        code += zstorage + ' = (int) (100.0 * __imuZ);\n';
    }
    return code;
};

Blockly.Blocks.lsm9ds1_tilt = {
    helpUrl: Blockly.MSG_IMU_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LSM9DS1_TILT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("IMU tilt")
                .appendField(new Blockly.FieldDropdown([["x-axis", "X"], ["y-axis", "Y"], ["z-axis", "Z"]], function (action) {
                    this.sourceBlock_.setAxes_({"ACTION": action});
                }), "G_AXIS")
                .appendField("points up/down");
        this.appendDummyInput('TILT1')
                .appendField("store y-tilt in", 'A1')
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'VAR1');
        this.appendDummyInput('TILT2')
                .appendField("z-tilt in", 'A2')
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'VAR2');
        this.setInputsInline(true);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var action = this.getFieldValue('G_AXIS');
        container.setAttribute('action', action);
        return container;
    },
    domToMutation: function (xmlElement) {
        var action = xmlElement.getAttribute('action');
        this.setAxes_({"ACTION": action});
    },
    setAxes_: function (details) {
        if (details['ACTION'] === 'X') {
            this.setFieldValue("store y-tilt in", 'A1');
            this.setFieldValue("z-tilt in", 'A2');
        } else if (details['ACTION'] === 'Y') {
            this.setFieldValue("store x-tilt in", 'A1');
            this.setFieldValue("z-tilt in", 'A2');
        } else {
            this.setFieldValue("store x-tilt in", 'A1');
            this.setFieldValue("y-tilt in", 'A2');
        }
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('IMU initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an IMU\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.lsm9ds1_tilt = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
        code += '// ERROR: Missing IMU initialize block!';
    } else {
        var t1_axis = '__imu' + this.getFieldValue('A1')[6].toUpperCase();
        var t2_axis = '__imu' + this.getFieldValue('A2')[0].toUpperCase();
        var g_axis = '__imu' + this.getFieldValue('G_AXIS');
        var storage1 = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR1'), Blockly.Variables.NAME_TYPE);
        var storage2 = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR2'), Blockly.Variables.NAME_TYPE);

        code += 'imu_readAccelCalculated(&__imuX, &__imuY, &__imuZ);\n';
        code += storage1 + ' = (int) (atan2(' + t1_axis + ', ' + g_axis + ') * 180.0/PI);\n';
        code += storage2 + ' = (int) (atan2(' + t2_axis + ', ' + g_axis + ') * 180.0/PI);\n';
    }
    return code;
};

Blockly.Blocks.lsm9ds1_heading = {
    helpUrl: Blockly.MSG_IMU_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_LSM9DS1_HEADING_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("IMU heading")
                .appendField(new Blockly.FieldDropdown([
                    ["z-axis points forward", "__imuZ"],
                    ["z-axis points backward", "(-1.0*__imuZ)"],
                    ["y-axis points forward", "__imuY"],
                    ["y axis points backward", "(-1.0*__imuY)"],
                    ["x-axis points forward", "(-1.0*__imuX)"],
                    ["x-axis points backward", "__imuX"]],
                        function (action) {
                            this.sourceBlock_.setAxes_({"ACTION": action});
                        }), "FB_AXIS")
                .appendField(' ');
        this.appendDummyInput('MENU2')
                .appendField(new Blockly.FieldDropdown([
                    ["y-axis points left", "__imuY"],
                    ["y-axis points right", "(-1.0*__imuY)"],
                    ["x-axis points left", "(-1.0*__imuX)"],
                    ["x-axis points right", "__imuX"]
                ]), "LR_AXIS");
        this.appendDummyInput('IMUVAR')
                .appendField("store in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
        this.setInputsInline(true);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        var action = this.getFieldValue('FB_AXIS');
        container.setAttribute('action', action);
        return container;
    },
    domToMutation: function (xmlElement) {
        var action = xmlElement.getAttribute('action');
        this.setAxes_({"ACTION": action});
    },
    setAxes_: function (details) {
        if(this.getInput('MENU2')) {
            this.removeInput('MENU2');
        }
        var wh = details['ACTION'][details['ACTION'].length - 1];
        if (wh === ')')
            wh = details['ACTION'][details['ACTION'].length - 2];
        if (wh === 'X') {
            this.appendDummyInput('MENU2')
                    .appendField(new Blockly.FieldDropdown([
                        ["y-axis points left", "__imuY"],
                        ["y-axis points right", "(-1.0*__imuY)"],
                        ["z-axis points left", "__imuZ"],
                        ["z-axis points right", "(-1.0*__imuZ)"]
                    ]), "LR_AXIS");
        } else if (wh === 'Y') {
            this.appendDummyInput('MENU2')
                    .appendField(new Blockly.FieldDropdown([
                        ["x-axis points left", "(-1.0*__imuX)"],
                        ["x-axis points right", "__imuX"],
                        ["z-axis points left", "__imuZ"],
                        ["z-axis points right", "(-1.0*__imuZ)"]
                    ]), "LR_AXIS");
        } else {
            this.appendDummyInput('MENU2')
                    .appendField(new Blockly.FieldDropdown([
                        ["y-axis points left", "__imuY"],
                        ["y-axis points right", "(-1.0*__imuY)"],
                        ["x-axis points left", "(-1.0*__imuX)"],
                        ["x-axis points right", "__imuX"]
                    ]), "LR_AXIS");
        }
        this.moveInputBefore('MENU2', 'IMUVAR');
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('IMU initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an IMU\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.lsm9ds1_heading = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('IMU initialize') === -1) {
        code += '// ERROR: Missing IMU initialize block!';
    } else {
        var fb_axis = this.getFieldValue('FB_AXIS');
        var lr_axis = this.getFieldValue('LR_AXIS');
        var storage = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);

        code += 'imu_readMagCalculated(&__imuX, &__imuY, &__imuZ);\n';
        code += '__compI = atan2(' + lr_axis + ', ' + fb_axis + ') * 180.0/PI;\n';
        code += 'if(__compI < 0.0) __compI = (360.0 + __compI);\n';
        code += storage + ' = (int) __compI;\n';
    }
    return code;
};

// ------------------ GPS module Blocks ----------------------------------------
Blockly.Blocks.GPS_init = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var m = this.getFieldValue('TXPIN');
        var b = this.getFieldValue('BAUD')
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        this.appendDummyInput('PINS')
                .appendField("GPS module initialize TX")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "TXPIN")
                .appendField("baud")
                .appendField(new Blockly.FieldDropdown([
                    ["9600", "9600"], 
                    ["2400", "2400"], 
                    ["4800", "4800"], 
                    ["19200", "19200"]
                ]), "BAUD");
        this.setFieldValue(b ,'BAUD')
        if (m && m === oldValue && newValue) {
            this.setFieldValue(newValue, 'TXPIN');
        } else if (m) {
            this.setFieldValue(m, 'TXPIN');
        }
    }
};

Blockly.propc.GPS_init = function () {
    var tx_pin = this.getFieldValue('TXPIN');
    if (profile.default.digital.toString().indexOf(tx_pin + ',' + tx_pin) === -1) {
        tx_pin = 'MY_' + tx_pin;
    }
    var baud = this.getFieldValue('BAUD');

    if (!this.disabled) {
        Blockly.propc.definitions_["include GPS"] = '#include "gps.h"';
    }
    return 'gps_open(' + tx_pin + ', 32, ' + baud + ');\npause(100);';
};

Blockly.Blocks.GPS_hasFix = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_HASFIX_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS has valid satellite fix");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_hasFix = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        return ['gps_fixValid()', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_latitude = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_LAT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS latitude (\u00B5\u00B0)");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_latitude = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        return ['(int) (gps_latitude() * 1000000)', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_longitude = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_LONG_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS longitude (\u00B5\u00B0)");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_longitude = function () {
    Blockly.propc.definitions_["include GPS"] = '#include "gps.h"';

    var code = '(int) (gps_longitude() * 1000000)';
    return [code, Blockly.propc.ORDER_ATOMIC];
};

Blockly.Blocks.GPS_heading = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_HEADING_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS heading (\u00B0)");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_heading = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        return ['(int) gps_heading()', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_altitude = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_ALTITUDE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS altitude (cm)");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_altitude = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        return ['(int) (gps_altitude() * 100)', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_satsTracked = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_SATS_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS number of satellites");

        this.setOutput(true, 'Number');
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_satsTracked = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        return ['gps_satsTracked()', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_velocity = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS speed in")
                .appendField(new Blockly.FieldDropdown([["mph", "MPH"], ["knots", "KNOTS"]]), "VELOCITYUNITS");

        this.setOutput(true, 'Number');
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_velocity = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        var velocity_units = this.getFieldValue('VELOCITYUNITS');
        return ['(int) gps_velocity(' + velocity_units + ')', Blockly.propc.ORDER_ATOMIC];
    }
};

Blockly.Blocks.GPS_date_time = {
    helpUrl: Blockly.MSG_GPS_HELPURL,
    init: function () {

        this.setTooltip(Blockly.MSG_GPS_VELOCITY_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("GPS current ")
                .appendField(new Blockly.FieldDropdown([
                        ["year", "GPS_UNIT_YEAR"],
                        ["month", "GPS_UNIT_MONTH"],
                        ["day", "GPS_UNIT_DAY"],
                        ["hour", "GPS_UNIT_HOUR"],
                        ["minute", "GPS_UNIT_MINUTE"],
                        ["second", "GPS_UNIT_SECOND"]
                    ], function (action) {
                        this.sourceBlock_.updateShape_(action);
                    }), "TIME_UNIT");
        this.setOutput(true, 'Number');
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setInputsInline(true);
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('unit', this.getFieldValue('TIME_UNIT'));
        return container;
    },
    domToMutation: function (container) {
        // Create array of timezones
        this.timeZones = [['UTC+0', '0']];
        for (var tz = -1; tz != 0; tz--) {
            if (tz < -12) {
                tz = 14;
            }
            this.timeZones.push(['UTC' + (tz > -1 ? '+' : '') + tz.toString(10), tz.toString(10)]);
        }
        this.updateShape_(container.getAttribute('unit') || '');
    },
    updateShape_: function (action) {
        var show = (['GPS_UNIT_HOUR', 'GPS_UNIT_DAY', 'GPS_UNIT_MONTH', 'GPS_UNIT_YEAR'].indexOf(action) >= 0);
        if (show && !this.getInput('ZONE_FIELDS')) {
            this.appendDummyInput('ZONE_FIELDS')
                .appendField("time zone", 'ZONE_LABEL')
                .appendField(new Blockly.FieldDropdown(this.timeZones), "ZONE_VALUE");
        } else if (!show && this.getInput('ZONE_FIELDS')) {
            this.removeInput('ZONE_FIELDS');
        }
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('GPS module initialize') === -1)
        {
            this.setWarningText('WARNING: You must use a GPS module\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.GPS_date_time = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('GPS module initialize') === -1)
    {
        return '// ERROR: Missing GPS initalize block!';
    } else {
        var time_unit = this.getFieldValue('TIME_UNIT');
        var zone_unit = '0';
        if (time_unit === 'GPS_UNIT_HOUR' ||
                time_unit === 'GPS_UNIT_DAY' ||
                time_unit === 'GPS_UNIT_MONTH' ||
                time_unit === 'GPS_UNIT_YEAR') {
            zone_unit = this.getFieldValue('ZONE_VALUE');
        }

        Blockly.propc.definitions_["include GPS"] = '#include "gps.h"';

        var dt_defines = '#define GPS_UNIT_YEAR     1\n';
        dt_defines += '#define GPS_UNIT_DAY      2\n';
        dt_defines += '#define GPS_UNIT_MONTH    3\n';
        dt_defines += '#define GPS_UNIT_HOUR     4\n';
        dt_defines += '#define GPS_UNIT_MINUTE   5\n';
        dt_defines += '#define GPS_UNIT_SECOND   6\n';
        Blockly.propc.definitions_["GPS_dateTime_units"] = dt_defines;

        var dt_declare = 'int gps_dateTimeByUnit(char __u, int __z);\n';
        var dt_function = 'int gps_dateTimeByUnit(char __u, int __z){';
        dt_function += 'int __gpsTime = gps_rawTime();int __gpsDate = gps_rawDate();\n';
        dt_function += 'int __monthDays[13] = {31, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};\n';
        dt_function += 'int __gpsDay = __gpsDate / 10000;\n';
        dt_function += 'int __gpsMonth = __gpsDate / 100 - (__gpsDate / 10000) * 100;\n';
        dt_function += 'int __gpsYear = __gpsDate - (__gpsDate / 100) * 100;\n';
        dt_function += 'if (__gpsYear % 4 == 0) __monthDays[2] = 29;\n';
        dt_function += 'int __gpsHour = __gpsTime / 10000 + __z;\n';
        dt_function += 'if (__gpsHour < 0) { __gpsHour += 24; __gpsDay--; }\n';
        dt_function += 'if (__gpsHour > 23) { __gpsHour -= 24; __gpsDay++; }\n';
        dt_function += 'if (__gpsDay > __monthDays[__gpsMonth]) { __gpsDay = 1; __gpsMonth++; }\n';
        dt_function += 'if (__gpsDay < 1) { __gpsMonth--; __gpsDay = __monthDays[__gpsMonth]; }\n';
        dt_function += 'if (__gpsMonth < 1) { __gpsYear--; __gpsMonth = 12; }\n';
        dt_function += 'if (__gpsMonth > 12) { __gpsYear++; __gpsMonth = 1; }\n';
        dt_function += 'switch (__u){case GPS_UNIT_DAY:return __gpsDay;break;\n';
        dt_function += 'case GPS_UNIT_MONTH:\nreturn __gpsMonth;break;\n';
        dt_function += 'case GPS_UNIT_YEAR:\nreturn __gpsYear;break;\n';
        dt_function += 'case GPS_UNIT_HOUR:\nreturn __gpsHour;break;\n';
        dt_function += 'case GPS_UNIT_MINUTE:\nreturn __gpsTime / 100 - (__gpsTime / 10000) * 100;break;\n';
        dt_function += 'case GPS_UNIT_SECOND:\nreturn __gpsTime - (__gpsTime / 100) * 100;break;\n';
        dt_function += 'default:\nreturn -1;break;}}';

        if (!this.disabled) {
            Blockly.propc.methods_["gps_time_func"] = dt_function;
            Blockly.propc.method_declarations_["gps_time_func"] = dt_declare;
        }
        return ['gps_dateTimeByUnit(' + time_unit + ', ' + zone_unit + ')', Blockly.propc.ORDER_ATOMIC];
    }
};



// ------------------ RFID Reader Blocks ---------------------------------------
Blockly.Blocks.rfid_get = {
    helpUrl: Blockly.MSG_RFID_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_RFID_GET_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("RFID store reading in")
                .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_GET_ITEM), 'BUFFER');

        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('RFID initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an RFID\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.rfid_get = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1)
    {
        return '// ERROR: Missing RFID initalize block!';
    } else {
        var saveVariable = Blockly.propc.variableDB_.getName(this.getFieldValue('BUFFER'), Blockly.Variables.NAME_TYPE);

        if (!this.disabled) {
            Blockly.propc.global_vars_["rfid_buffer"] = "char *rfidBfr;";
            Blockly.propc.definitions_["rfidser"] = '#include "rfidser.h"';
        }
        return 'rfidBfr = rfid_get(rfid, 500);\n\tsscan(&rfidBfr[2], "%x", &' + saveVariable + ');\n\tif(' + saveVariable + ' == 237) ' + saveVariable + ' = 0;';
    }
};

Blockly.Blocks.rfid_disable = {
    helpUrl: Blockly.MSG_RFID_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_RFID_DISABLE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("RFID")
                .appendField(new Blockly.FieldDropdown([
                    ["disable", "DISABLE"],
                    ["enable", "ENABLE"]
                ]), "ACTION");

        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('RFID initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an RFID\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.rfid_disable = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1)
    {
        return '// ERROR: Missing RFID initalize block!';
    } else {
        var data = this.getFieldValue('ACTION');
        if (!this.disabled) {
            Blockly.propc.definitions_["rfidser"] = '#include "rfidser.h"';
        }
        if (data === "ENABLE") {
            return 'rfid_enable(rfid);';
        } else {
            return 'rfid_disable(rfid);';
        }
    }
};

Blockly.Blocks.rfid_enable = {
    helpUrl: Blockly.MSG_RFID_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_RFID_ENABLE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var m1 = this.getFieldValue('PIN_IN');
        var m2 = this.getFieldValue('PIN_OUT');
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        this.appendDummyInput('PINS')
                .appendField("RFID initialize EN")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "PIN_IN")
                .appendField("SOUT")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(this.userDefinedConstantsList_.map(function (value) {
                    return [value, value]  // returns an array of arrays built from the original array.
                }))), "PIN_OUT");
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
    }
};

Blockly.propc.rfid_enable = function () {
    if (!this.disbaled) {
        var pin_in = this.getFieldValue('PIN_IN');
        var pin_out = this.getFieldValue('PIN_OUT');

        if (profile.default.digital.toString().indexOf(pin_in + ',' + pin_in) === -1) {
            pin_in = 'MY_' + pin_in;
        }
        if (profile.default.digital.toString().indexOf(pin_out + ',' + pin_out) === -1) {
            pin_out = 'MY_' + pin_out;
        }
    
        Blockly.propc.definitions_["rfidser"] = '#include "rfidser.h"';
        Blockly.propc.global_vars_["rfidser"] = 'rfidser *rfid;';
        Blockly.propc.setups_["rfidser_setup"] = 'rfid = rfid_open(' + pin_out + ',' + pin_in + ');';
    }
    return '';
};

Blockly.Blocks.rfid_close = {
    helpUrl: Blockly.MSG_RFID_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_RFID_CLOSE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("RFID close");

        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('RFID initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an RFID\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.rfid_close = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('RFID initialize') === -1)
    {
        return '// ERROR: Missing RFID initalize block!';
    } else {
        if (!this.disabled) {
            Blockly.propc.definitions_["rfidser"] = '#include "rfidser.h"';
        }
        return 'rfidser_close(rfid);\n';
    }
};

// ------------------ Sony TV Remote (Using 40 kHz IR sensor) Blocks -----------
Blockly.Blocks.sirc_get = {
    helpUrl: Blockly.MSG_SONY_REMOTE_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_SIRC_GET_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.pinChoices = ['PIN'];
        this.otherPin = [false];
        if (projectData.board && projectData.board === "heb-wx") {
            this.appendDummyInput()
                .appendField("Sony Remote value received");
        } else {
            this.addPinMenu("Sony Remote value received from PIN", null, 0);
        }
        this.setInputsInline(true);
        this.setPreviousStatement(false, null);
        this.setNextStatement(false, null);
        this.setOutput(true, 'Number');
    },
    mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
    domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
    addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
    setToOther: Blockly.Blocks['sensor_ping'].setToOther
};

Blockly.propc.sirc_get = function () {
    var pin = '0';
    if (projectData.board && projectData.board === "heb-wx") {
        pin = '23';
    } else if (this.otherPin[0]) {
        pin = Blockly.propc.valueToCode(this, 'PIN', Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
        pin = this.getFieldValue("PIN");
    }
    if (!this.disabled) {
        Blockly.propc.definitions_["sirc"] = '#include "sirc.h"';
        Blockly.propc.setups_["sirc"] = "sirc_setTimeout(70);";
    }
    var code = 'sirc_button(' + pin + ')';
    return [code, Blockly.propc.ORDER_NONE];
};

// ------------------ 4x4 Keypad Blocks ----------------------------------------
Blockly.Blocks.keypad_initialize = {
    helpUrl: Blockly.MSG_KEYPAD_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_KEYPAD_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true, null);
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var m = [];
        for (var i = 0; i < 8; i++) {
            m[i] = this.getFieldValue('P' + i.toString(10));
        }
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        var pinConstantList = this.userDefinedConstantsList_.map(function (value) {
            return [value, value]  // returns an array of arrays built from the original array.
        });
        this.appendDummyInput('PINS')
                .appendField("4x4 Keypad initialize PINS left")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P0")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P1")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P2")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P3")
                .appendField('|')
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P4")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P5")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P6")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "P7")
                .appendField("right");
        for (i = 0; i < 8; i++) {
            if (m[i] && m[i] === oldValue && newValue) {
                this.setFieldValue(newValue, 'P' + i.toString(10));
            } else if (m[i]) {
                this.setFieldValue(m[i], 'P' + i.toString(10));
            }
        }
    }
};

Blockly.propc.keypad_initialize = function () {
    if (!this.disabled) {
        var kp = [];
        for (var k = 0; k < 8; k++) {
            kp[k] = this.getFieldValue('P' + k);
            if (profile.default.digital.toString().indexOf(kp[k] + ',' + kp[k]) === -1) {
                kp[k] = 'MY_' + kp[k];
            }
        }
        var keypad_vars = 'int __rowPins[] = {' + kp[0] + ', ' + kp[1] + ', ' + kp[2] + ', ' + kp[3] + '};\n';
        keypad_vars += 'int __colPins[] = {' + kp[4] + ', ' + kp[5] + ', ' + kp[6] + ', ' + kp[7] + '};\n';
        keypad_vars += "int __buttonVals[] = {1, 2, 3, 'A', 4, 5, 6, 'B', 7, 8, 9, 'C', '*', 0, '#', 'D'};\n";
        Blockly.propc.definitions_["keypad_lib"] = '#include "keypad.h"';
        Blockly.propc.global_vars_['keypad_pins'] = keypad_vars;
        Blockly.propc.setups_['keypad_init'] = 'keypad_setup(4, 4, __rowPins, __colPins, __buttonVals);';
    }
    return '';
};

Blockly.Blocks.keypad_read = {
    helpUrl: Blockly.MSG_KEYPAD_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_KEYPAD_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("4x4 Keypad");
        this.setOutput(true, null);

    }
};

Blockly.propc.keypad_read = function () {
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Keypad initialize') === -1)
    {
        return '// ERROR: Missing Keypad initalize block!';
    } else {
        return ['keypad_read()', Blockly.propc.ORDER_ATOMIC];
    }
};


// ------------------ DHT22 Temp & Humidity Sensor -----------------------------
Blockly.Blocks.dht22_read = {
    helpUrl: Blockly.MSG_TEMPERATURE_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_DHT22_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.pinChoices = ['PIN'];
        this.otherPin = [false];
        this.addPinMenu("Temp & Humidity read PIN", null, 0);
        this.setPreviousStatement(true, "Block");
        this.setInputsInline(true);
        this.setNextStatement(true, null);
      },
      mutationToDom: Blockly.Blocks['sensor_ping'].mutationToDom,
      domToMutation: Blockly.Blocks['sensor_ping'].domToMutation,
      addPinMenu: Blockly.Blocks['sensor_ping'].addPinMenu,
      setToOther: Blockly.Blocks['sensor_ping'].setToOther
};

Blockly.propc.dht22_read = function () {
    if (!this.disabled) {
        Blockly.propc.definitions_["dht22"] = '#include "dht22.h"';
    }

    var pin = '0';
    if (this.otherPin[0]) {
        pin = Blockly.propc.valueToCode(this, this.pinChoices[0], Blockly.propc.ORDER_ATOMIC) || '0';
    } else {
        pin = this.getFieldValue(this.pinChoices[0]);
    }

    return 'dht22_read(' + pin + ');';
};


Blockly.Blocks.dht22_value = {
    helpUrl: Blockly.MSG_TEMPERATURE_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_DHT22_VALUE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
            .appendField("Temp & Humidity")
            .appendField(new Blockly.FieldDropdown([
                ["temperature (\u00b0F)","Temp,FAHRENHEIT"], 
                ["temperature (\u00b0C)","Temp,CELSIUS"], 
                ["temperature (Kelvin)","Temp,KELVIN"], 
                ["relative humidity (%)","Humidity,"]
            ]), "ACTION")
            .appendField("\u2715 10");
        this.setInputsInline(false);
        this.setOutput(true, "Number");
    }
};

Blockly.propc.dht22_value = function () {
    if (!this.disabled) {
        Blockly.propc.definitions_["dht22"] = '#include "dht22.h"';
    }
    var action = this.getFieldValue('ACTION').split(',');
    return ['dht22_get' + action[0] + '(' + action[1] + ')', Blockly.propc.ORDER_ATOMIC];
};


// ------------------ BME680 Air Quality Sensor -----------------------------
Blockly.Blocks.bme680_init = {
    helpUrl: Blockly.MSG_BME680_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_BME680_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput('PINS');
        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
        this.updateConstMenu();
    },
    updateConstMenu: Blockly.Blocks['sound_impact_run'].updateConstMenu,
    setPinMenus: function (oldValue, newValue) {
        var mv = ['PIN_CLK', 'PIN_SDI', 'PIN_SDO', 'PIN_CS'];
        var m = [this.getFieldValue('PIN_CLK'), this.getFieldValue('PIN_SDI'), this.getFieldValue('PIN_SDO'), this.getFieldValue('PIN_CS')];
        if(this.getInput('PINS')) {
            this.removeInput('PINS');
        }
        var pinConstantList = this.userDefinedConstantsList_.map(function (value) {
            return [value, value]  // returns an array of arrays built from the original array.
        });
        this.appendDummyInput('PINS')
                .appendField("Air Quality initialize SCK")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_CLK")
                .appendField("SDI")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_SDI")
                .appendField("SDO")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_SDO")
                .appendField("CS")
                .appendField(new Blockly.FieldDropdown(profile.default.digital.concat(pinConstantList)), "PIN_CS");
        for (var i = 0; i < 4; i++) {
            if (m[i] && m[i] === oldValue && newValue) {
                this.setFieldValue(newValue, mv[i]);
            } else if (m[i]) {
                this.setFieldValue(m[i], mv[i]);
            }
        }
    }
};

Blockly.propc.bme680_init = function () {
    var pin = [this.getFieldValue('PIN_CLK'), this.getFieldValue('PIN_SDI'), this.getFieldValue('PIN_SDO'), this.getFieldValue('PIN_CS')];
    for (var i = 0; i < 3; i++) {
        if (profile.default.digital.toString().indexOf(pin[i] + ',' + pin[i]) === -1) {
            pin[i] = 'MY_' + pin[i];
        }
    }
    if (!this.disabled) {
        Blockly.propc.definitions_["include_bme680"] = '#include "bme680.h"';
        Blockly.propc.setups_["init_bme680"] = 'gas_sensor = bme680_openSPI(' + pin.join(', ') + ');\n';
        Blockly.propc.global_vars_["device_bme680"] = 'bme680 *gas_sensor;\n';
    }
    return '';
};

Blockly.Blocks.bme680_read = {
    helpUrl: Blockly.MSG_BME680_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_BME680_READ_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Air Quality read");
        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Air Quality initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an Air Quality\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.bme680_read = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
        code += '// ERROR: Missing Air Quality initialize block!';
    } else {
        code += 'bme680_readSensor(gas_sensor);';
    }
    return code;
};

Blockly.Blocks.bme680_heater = {
    helpUrl: Blockly.MSG_BME680_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_BME680_HEATER);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Air Quality heater")
                .appendField(new Blockly.FieldDropdown([
                    ["disable", "Disable"],
                    ["enable", "Enable"]
                ]), "HEAT_STATE");
        this.setInputsInline(false);
        this.setNextStatement(true, null);
        this.setPreviousStatement(true, "Block");
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Air Quality initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an Air Quality\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.bme680_heater = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
        code += '// ERROR: Missing Air Quality initialize block!';
    } else {
        code += 'bme680_heater' + this.getFieldValue('HEAT_STATE') + '(gas_sensor);';
    }
    return code;
};

Blockly.Blocks.bme680_get_value = {
    helpUrl: Blockly.MSG_BME680_HELPURL,
    init: function () {
        this.measUnits = {
            'temperature': [
                ['in \u00b0C', 'CELSIUS'], 
                ['in \u00b0F', 'FAHRENHEIT'], 
                ['in Kelvin', 'KELVIN']
            ],
            'pressure': [
                ['in pascals', 'PASCALS'],
                ['in mmHg', 'MMHG'],
                ['in inHg', 'INHG'],
                ['in PSI', 'PSI']
            ],
            'humidity': [['in %', ' ']],
            'gasResistance': [['in \u2126', ' ']],
            'altitude': [
                ['in meters', 'METERS'],
                ['in feet', 'FEET']
            ]
        }
        this.setTooltip(Blockly.MSG_BME680_GET_VALUE_TOOLTIP);
        this.setColour(colorPalette.getColor('input'));
        this.appendDummyInput()
                .appendField("Air Quality")
                .appendField(new Blockly.FieldDropdown([
                    ["Temperature", "temperature"], 
                    ["Pressure", "pressure"], 
                    ["Altitude Estimate", "altitude"], 
                    ["Gas Sensor Resistance", "gasResistance"], 
                    ["Relative Humidity", "humidity"]
                ], function(val) {this.sourceBlock_.setMeasUnit(val);}), "SENSOR");
        this.appendDummyInput('UNITS')
                .appendField(new Blockly.FieldDropdown(this.measUnits['temperature']), "UNIT");
        this.appendDummyInput('MULTIPLIER')
                .appendField(new Blockly.FieldDropdown([
                    ["\u2715 1", " "], 
                    ["\u2715 10", "*10.0"], 
                    ["\u2715 100", "*100.0"], 
                    ["\u2715 1000", "*1000.0"], 
                    ["\u2715 10000", "*10000.0"]
                ]), "MULT")
        this.setInputsInline(true);
        this.setNextStatement(false, null);
        this.setPreviousStatement(false, null);
        this.setOutput(true, 'Number')
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
                    .appendField(new Blockly.FieldDropdown(this.measUnits[val]), "UNIT");
        }
        this.moveInputBefore('UNITS', 'MULTIPLIER');
    },
    mutationToDom: function () {
        var container = document.createElement('mutation');
        container.setAttribute('sensor', this.getFieldValue('SENSOR'));
        return container;
    },
    domToMutation: function (container) {
        var val = container.getAttribute('sensor');
        if (val) {
            this.setMeasUnit(val);
        }
    },
    onchange: function () {
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
        if (allBlocks.indexOf('Air Quality initialize') === -1)
        {
            this.setWarningText('WARNING: You must use an Air Quality\ninitialize block at the beginning of your program!');
        } else {
            this.setWarningText(null);
        }
    }
};

Blockly.propc.bme680_get_value = function () {
    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();
    if (allBlocks.indexOf('Air Quality initialize') === -1) {
        code += '// ERROR: Missing Air Quality initialize block!';
    } else {
        var sensor = this.getFieldValue('SENSOR');
        var mult = this.getFieldValue('MULT') || '';
        var unit = this.getFieldValue('UNIT') || '';
        if (unit.length > 2) {
            unit = ', ' + unit;
        }
        code += '(int)(bme680_' + sensor + '(gas_sensor' + unit + ')' + mult + ')';
    }
    return [code, Blockly.propc.ORDER_ATOMIC];
};
