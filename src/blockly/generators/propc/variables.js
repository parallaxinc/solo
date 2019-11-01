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
 * @fileoverview Generating C for variable blocks
 * @author michel@creatingfuture.eu  (Michel Lampo)
 *         valetolpegin@gmail.com    (Vale Tolpegin)
 *         jewald@parallax.com       (Jim Ewald)
 *         mmatz@parallax.com        (Matthew Matz)
 *         kgracey@parallax.com      (Ken Gracey)
 *         carsongracey@gmail.com    (Carson Gracey)
 */
'use strict';


// Init a new Blocks object if one does not already exist
if (!Blockly.Blocks)
    Blockly.Blocks = {};

/**
 *
 * @type {number}
 */
var tempArrayNumber = 0;


/**
 *  Variable getter
 *
 * @type {{init: Blockly.Blocks.variables_get.init, helpUrl: *}}
 */
Blockly.Blocks.variables_get = {
    helpUrl: Blockly.MSG_VARIABLES_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_VARIABLES_GET_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendDummyInput("")
            .appendField(Blockly.LANG_VARIABLES_GET_TITLE_1)
            .appendField(new Blockly.FieldVariable(
                Blockly.LANG_VARIABLES_GET_ITEM), 'VAR');
        this.setOutput(true);
        this.typeCheckRun = null;
    }
};


/**
 *  Variable setter.
 *
 * @type {{init: Blockly.Blocks.variables_set.init, helpUrl: *}}
 */
Blockly.Blocks.variables_set = {
    helpUrl: Blockly.MSG_VARIABLES_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_VARIABLES_SET_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendValueInput('VALUE')
            .appendField(Blockly.LANG_VARIABLES_SET_TITLE_1)
            .appendField(new Blockly.FieldVariable(Blockly.LANG_VARIABLES_SET_ITEM), 'VAR')
            .appendField('=');
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true);
    }
};


/**
 * Propeller C variable getter
 *
 * @returns {[string, number]}
 */
Blockly.propc.variables_get = function () {
    var code = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR'),
        Blockly.Variables.NAME_TYPE);
    return [code, Blockly.propc.ORDER_ATOMIC];
};


/**
 *  Propeller C variable setter
 *
 * @returns {string}
 */
Blockly.propc.variables_set = function () {
    var argument0 = Blockly.propc.valueToCode(this, 'VALUE',
        Blockly.propc.ORDER_ASSIGNMENT) || '0';
    var varName = Blockly.propc.variableDB_.getName(
        this.getFieldValue('VAR'),
        Blockly.Variables.NAME_TYPE);
    if (Blockly.propc.vartype_[varName] === undefined) {
        if (argument0.indexOf("int") > -1) {
            Blockly.propc.vartype_[varName] = 'int';
            //Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
        } else if (argument0.indexOf("float") > -1) {
            Blockly.propc.vartype_[varName] = 'float';
            Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
        } else if (argument0.indexOf("char") > -1) {
            Blockly.propc.vartype_[varName] = 'char';
            Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
        } else if (argument0.indexOf("char\[\]") > -1) {
            Blockly.propc.vartype_[varName] = 'char *';
        } else if (argument0.indexOf("\"") > -1 && argument0.indexOf("\"") < 4) {  // Some functions that return numbers take strings as arguments, so we need to account for that.
            Blockly.propc.vartype_[varName] = 'char *';
        } else if (argument0.indexOf(".") > -1) {
            Blockly.propc.vartype_[varName] = 'float';
        } else if (argument0.indexOf("true") > -1 || argument0.indexOf("false") > -1) {
            Blockly.propc.vartype_[varName] = 'boolean';
        } else {
            Blockly.propc.vartype_[varName] = 'int';
        }
    } else if (argument0.indexOf("int") > -1) {
        Blockly.propc.vartype_[varName] = 'int';
        //Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
    } else if (argument0.indexOf("float") > -1) {
        Blockly.propc.vartype_[varName] = 'float';
        Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
    } else if (argument0.indexOf("char") > -1) {
        Blockly.propc.vartype_[varName] = 'char';
        Blockly.propc.varlength_[varName] = '{{$var_length_' + varName + '}};';
    } else if (argument0.indexOf("char\[\]") > -1) {
        Blockly.propc.vartype_[varName] = 'char *';
    }

    return varName + ' = ' + argument0 + ';\n';
};


/* ----------------------------------
 *      array blocks
 * --------------------------------*/

/**
 *  Get an array of the currently defined project variables
 *
 * @type {{
 *      init: Blockly.Blocks.array_get.init,
 *      updateArrayMenu: Blockly.Blocks.array_get.updateArrayMenu,
 *      helpUrl: *,
 *      onchange: Blockly.Blocks.array_get.onchange,
 *      buildArrayMenu: Blockly.Blocks.array_get.buildArrayMenu
 *      }}
 */
Blockly.Blocks.array_get = {
    helpUrl: Blockly.MSG_ARRAYS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_ARRAY_GET_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField('array')
            .appendField(
                new Blockly.FieldDropdown([["list", "list"]]),
                "VAR")
            .appendField('element');
        this.setInputsInline(true);
        this.setOutput(true, 'Number');

        // TODO: updateArrayMenu requires two arguments
        this.updateArrayMenu();
    },

    // Populate the variable name drop-down control
    buildArrayMenu: function (v_list) {
        var toConn = this.getInput('NUM').connection.targetConnection;

        if(this.getInput('NUM')) {
            this.removeInput('NUM');
        }

        this.appendValueInput('NUM')
            .setCheck('Number')
            .appendField('array')
            .appendField(new Blockly.FieldDropdown(v_list), "VAR")
            .appendField('element');
        if (toConn) {
            this.getInput('NUM').connection.connect(toConn);
        }
    },

    // TODO: ov and nv are undefined at select calls to this method
    // Note: That's intentional - this function is overloaded.
    updateArrayMenu: function (oldVarName, newVarName) {
        /*
        if (typeof(oldVarName) === 'undefined') {
            console.log("Call to updateArrayMenu() is missing first parameter.");
        }
        if (typeof(newVarName) === 'undefined') {
            console.log("Call to updateArrayMenu() is missing second parameter.");
        }
        */

        var v_check = true;
        var v_list = [];
        var allBlocks = Blockly.getMainWorkspace().getBlocksByType('array_init', false);

        // Walk through all of the defined blocks and find any
        // array_init blocks
        for (var x = 0; x < allBlocks.length; x++) {
            // Get the array variable name
            var v_name = allBlocks[x].getFieldValue('VAR');

            // Update the variable name if a new one is provided
            if (v_name === oldVarName && newVarName) {
                v_name = newVarName;
            }
            // Add the array name to the internal list of variables
            if (v_name) {
                v_list.push([v_name, v_name]);
            }
            v_check = false;
        }

        // Init the array name to a default if there are no existing
        // array variable blocks
        //if (v_check) {
            v_list.push(['list', 'list']);
        //}

        /* **********************************************************
         * This is returning a field value of 'list'. In the test
         * case, there is only one array_list, named 'notes'. There
         * is no array_list block named 'item' in the project.
         *
         * If this is called with a null or empty string, the correct
         * value of 'notes' is returned. The new question is why the
         * field name is not getting set as expected.
         * *********************************************************/
        var m = this.getFieldValue('VAR');

        // sort and remove duplicates
        v_list = uniq_fast(v_list);
        this.buildArrayMenu(v_list);

        // TODO: What is this code doing?
        if (m && m === oldVarName && newVarName) {
            this.setFieldValue(newVarName, 'VAR');
        } else if (m) {
            this.setFieldValue(m, 'VAR');
        }
    },

    onchange: function () {
        var code = null;
        var elmnts = parseInt(this.getFieldValue('NUM'), 10);
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
            var initStr = '';
            for (var ij = 0; ij < allBlocks.length; ij++) {
                var f_start = allBlocks[ij].toString().indexOf('array initialize ' + this.getFieldValue('VAR'));
                if (f_start > -1) {
                    initStr = allBlocks[ij].toString().substring(f_start).replace(/[^0-9]/g, "");
                    break;
                }
            }
            if (elmnts >= parseInt(initStr, 10) || elmnts < 0) {
                code = 'WARNING: You are trying to get an element from your array that does not exist!';
            }
        } else {
            code = 'WARNING: The array "' + this.getFieldValue('VAR') + '" has not been initialized!';
        }
        this.setWarningText(code);
    }
};


/**
 *
 * @type {{init: Blockly.Blocks.array_init.init, helpUrl: *, onchange: Blockly.Blocks.array_init.onchange, sendArrayVal: Blockly.Blocks.array_init.sendArrayVal}}
 */
Blockly.Blocks.array_init = {
    helpUrl: Blockly.MSG_ARRAYS_HELPURL,
    // Initialize an array variable
    init: function () {
        // build a block that has this format:
        // 'array initialize' {variable_name} 'with' {number} 'elements'
        this.setTooltip(Blockly.MSG_ARRAY_INIT_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendDummyInput()
            .appendField('array initialize') // block text
            .appendField(                           // create a new FieldTextInput object
                new Blockly.FieldTextInput(
                    'list',             // Default variable name
                    function (a) {      // field content validation
                        a = a.replace(/ /g, '_').replace(/[^a-zA-Z0-9_]/g, '');

                        // Set the new variable name (in a) for the array
                        this.sourceBlock_.sendArrayVal(
                            this.sourceBlock_.getFieldValue('VAR'),
                            a);

                        return a;
                    }),
                'VAR')

            .appendField("with")    // block text
            .appendField(
                new Blockly.FieldNumber('10', null, null, 1),
                'NUM')

            .appendField("elements");

        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true);
        this.sendUpdate = true;
    },
    // TODO: What, exactly, is this method trying to accomplish?
    sendArrayVal: function (oldVarName, newVarName) {
        if (this.sendUpdate || (oldVarName === '-1' && newVarName === '-1')) {
            if (oldVarName === '-1' && newVarName === '-1') {
                oldVarName = null;
                newVarName = null;
            }

            // Find all the blocks that have my value and tell them to update it
            var allBlocks = Blockly.getMainWorkspace().getAllBlocks();

            // loop through all blocks
            for (var x = 0; x < allBlocks.length; x++) {
                // Store a pointer to the UpdateArrayMenu method that
                // is defined for the block
                var func = allBlocks[x].updateArrayMenu;

                // Call the method in the block to force the block to
                // update it's array variable name?
                if (func && allBlocks[x]) {
                    func.call(allBlocks[x], oldVarName, newVarName);
                }
            }
        }
        this.sendUpdate = true;
    },
    // Handle the array_init block on_change event
    onchange: function (event) {
        var myName = this.getFieldValue('VAR');
        var theBlocks = Blockly.getMainWorkspace().getAllBlocks().toString();

        // If I get deleted, broadcast that to other blocks.
        if (event && event.oldXml) {
            var oldName = '';
            var oSerializer = new XMLSerializer();
            var sXML = oSerializer.serializeToString(event.oldXml);
            var f_start = sXML.indexOf('name="VAR');
            if (f_start > -1 && sXML.indexOf('array_init') > -1) {
                var f_end = sXML.indexOf('</field', f_start);
                oldName = sXML.substring(f_start + 11, f_end);
                this.sendArrayVal(oldName, null);
            }
        }

        var warnTxt = null;
        var f_start = theBlocks.indexOf('array initialize ' + myName + ' with');
        if (theBlocks.indexOf('array initialize ' + myName + ' with', f_start + 1) > -1) {
            warnTxt = 'WARNING! you can only initialize the array "' + myName + '" once!';
        }
        this.setWarningText(warnTxt);
    }
};




/**
 *  Define the elements of the named array
 *
 * @type {{init: Blockly.Blocks.array_fill.init, updateArrayMenu: *, helpUrl: *, onchange: Blockly.Blocks.array_fill.onchange, buildArrayMenu: Blockly.Blocks.array_fill.buildArrayMenu}}
 */
Blockly.Blocks.array_fill = {
    helpUrl: Blockly.MSG_ARRAYS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_ARRAY_FILL_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendDummyInput('NUMS')
            .appendField('array fill')
            .appendField(new Blockly.FieldDropdown([["list", "list"]]), "VAR")
            .appendField("with values")
            .appendField(new Blockly.FieldTextInput('10,20,30,40,50'), 'NUM');
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true);

        // This is calling out to the array_get block without
        // the required parameters
        // TODO: Calling method with missing paramaters
        this.updateArrayMenu();
    },
    buildArrayMenu: function (v_list) {
        var currList = this.getFieldValue("NUM") || '10,20,30,40,50';
        if(this.getInput('NUMS')) {
            this.removeInput('NUMS');
        }
        var fi = this.getFieldValue('NUM');
        this.appendDummyInput('NUMS')
            .appendField('array fill')
            .appendField(new Blockly.FieldDropdown(v_list || [["list", "list"]]), "VAR")
            .appendField("with values")
            .appendField(new Blockly.FieldTextInput(currList), 'NUM');
        this.setFieldValue(fi, 'NUM');
    },

    // Update the menu array list dropdown
    updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,

    onchange: function () {
        var code = null;
        var elmnts = (this.getFieldValue('NUM').split(',')).length;
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();

        if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
            var initStr = '';
            for (var ij = 0; ij < allBlocks.length; ij++) {
                if (allBlocks[ij].toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
                    initStr = allBlocks[ij].toString().replace(/[^0-9]/g, "");
                    break;
                }
            }
            if (elmnts > parseInt(initStr, 10)) {
                code = 'WARNING: You are trying to add more elements to your\narray than you initialized your array with!';
            }
        } else {
            code = 'WARNING: The array "' + this.getFieldValue('VAR') + '" has not been initialized!';
        }
        this.setWarningText(code);
    }
};




/**
 *
 * @type {{init: Blockly.Blocks.array_set.init, updateArrayMenu: *, helpUrl: *, onchange: Blockly.Blocks.array_set.onchange, buildArrayMenu: Blockly.Blocks.array_set.buildArrayMenu}}
 */
Blockly.Blocks.array_set = {
    helpUrl: Blockly.MSG_ARRAYS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_ARRAY_SET_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendValueInput('NUM')
            .appendField('array')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown([["list", "list"]]), "VAR")
            .appendField('element');
        this.appendValueInput('VALUE')
            .setCheck('Number')
            .appendField('=');
        this.setInputsInline(true);
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true);
        this.updateArrayMenu();
    },
    buildArrayMenu: function (v_list) {
        var toConn = this.getInput('NUM').connection.targetConnection;
        if(this.getInput('NUM')) {
            this.removeInput('NUM');
        }
        this.appendValueInput('NUM')
            .appendField('array')
            .setCheck('Number')
            .appendField(new Blockly.FieldDropdown(v_list || [["list", "list"]]), "VAR")
            .appendField('element');
        this.moveInputBefore('NUM', 'VALUE');
        if (toConn) {
            this.getInput('NUM').connection.connect(toConn);
        }
    },
    updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,
    onchange: function () {
        var code = null;
        var elmnts = null;
        var en = '0';
        var targetBlock = this.getInput('NUM').connection.targetBlock();
        if (targetBlock && targetBlock.type === 'math_number') {
            en = targetBlock.getFieldValue('NUM') || '0';
        }
        //Blockly.propc.valueToCode(this, 'NUM', Blockly.propc.ORDER_NONE) || '0';
        if (en.replace(/[^0-9]+/g, "") === en) {
            elmnts = parseInt(en);
        }
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
            var initStr = '';
            for (var ij = 0; ij < allBlocks.length; ij++) {
                if (allBlocks[ij].toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
                    initStr = allBlocks[ij].toString().replace(/[^0-9]/g, "");
                    break;
                }
            }
            if (elmnts) {
                if (elmnts >= parseInt(initStr, 10) || elmnts < 0) {
                    code = 'WARNING: You are trying to set an element\nin your array that does not exist!';
                }
            }
        } else {
            code = 'WARNING: The array "' + this.getFieldValue('VAR') + '" has not been initialized!';
        }
        this.setWarningText(code);
    }
};


/**
 *  Clear the elements in an array
 *
 * @type {{
 *      init: Blockly.Blocks.array_clear.init,
 *      updateArrayMenu: *,
 *      helpUrl: *,
 *      onchange: Blockly.Blocks.array_clear.onchange,
 *      buildArrayMenu: Blockly.Blocks.array_clear.buildArrayMenu
 *      }}
 */
Blockly.Blocks.array_clear = {
    helpUrl: Blockly.MSG_ARRAYS_HELPURL,
    init: function () {
        this.setTooltip(Blockly.MSG_ARRAY_CLEAR_TOOLTIP);
        this.setColour(colorPalette.getColor('variables'));
        this.appendDummyInput('NUM')
            .appendField('array clear')
            .appendField(new Blockly.FieldDropdown([["list", "list"]]), "VAR");
        this.setPreviousStatement(true, "Block");
        this.setNextStatement(true);
        this.updateArrayMenu();
    },
    buildArrayMenu: function (v_list) {
        if(this.getInput('NUM')) {
            this.removeInput('NUM');
        }
        this.appendDummyInput('NUM')
            .appendField('array clear')
            .appendField(
                new Blockly.FieldDropdown(v_list || [["list", "list"]]),
                "VAR");
    },

    updateArrayMenu: Blockly.Blocks['array_get'].updateArrayMenu,

    onchange: function () {
        var code = null;
        var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
        if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) === -1) {
            code = 'WARNING: The array "' + this.getFieldValue('VAR') + '" has not been initialized!';
        }
        this.setWarningText(code);
    }
};


/* --------------------------------
 *    propc array management
 * ------------------------------*/

/**
 *
 * @returns {string}
 */
Blockly.propc.array_clear = function () {
    var varName = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), 'Array');
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) === -1) {
        return '// ERROR: The array "' + this.getFieldValue('VAR') + '" has not been initialized!\n';
    } else {
        return 'memset(' + varName + ', 0, sizeof ' + varName + ');\n';
    }
};


/**
 *  Fill an array with values
 *
 * @returns {string}
 */
Blockly.propc.array_fill = function () {
    var varName = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), 'Array');
    var varVals = this.getFieldValue('NUM');

    if (varVals.indexOf('0x') === 0 || varVals.indexOf(',0x') > 0) {
        varVals = varVals.replace(/[^0-9xA-Fa-f,-\.]/g, "");
    } else {
        varVals = varVals.replace(/[^0-9b,-\.]/g, "");
    }

    varVals = varVals.replace(/,\./g, ",0.")
        .replace(/\b\.[0-9-]+,\b/g, ",")
        .replace(/\.[0-9],/g, ",")
        .replace(/,,/g, ",0,")
        .replace(/,\s*$/, "");
    varVals = varVals.split(".")[0];

    var noCommas = varVals.replace(/,/g, "");
    var elements = varVals.length - noCommas.length + 1;
    var elemCount = 0;

    /* DONT DELETE - MAY WANT TO USE THIS CODE ELSEWHERE

     // Find all Array-type variables, and find the largest one.
     var ArrayList = Object.keys(Blockly.propc.global_vars_);
     var ArrayMaxSize = 1;
     for (var k = 0; k < ArrayList.length; k++) {
     if (ArrayList[k].indexOf('__ARRAY') >= 0) {
     var t = Blockly.propc.global_vars_[ArrayList[k]];
     t = t.replace(/[^0-9]/g, "");
     var z = parseInt(t, 10);
     if (z > ArrayMaxSize)
     ArrayMaxSize = z;
     }
     }

     Blockly.propc.global_vars_['__TEMP_ARR'] = 'int __tmpArr[' + ArrayMaxSize.toString() + '];';

     */

    var code = '';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks();

    if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
        var initStr = '';
        for (var ij = 0; ij < allBlocks.length; ij++) {
            if (allBlocks[ij].toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
                initStr = allBlocks[ij].toString().replace(/[^0-9]/g, "");
                break;
            }
        }
        elemCount = parseInt(initStr, 10);

        if (elements > elemCount) {
            code += '// WARNING: You are trying to add more elements to your\n';
            code += '//          array than you initialized your array with!\n';
            elements = elemCount;
        }
        code += 'int __tmpArr' + tempArrayNumber.toString() + '[] = {' + varVals + '};\n';
        code += 'memcpy(' + varName + ', __tmpArr' + tempArrayNumber.toString() + ', ' + elements + ' * sizeof(int));\n';
        tempArrayNumber++;
    } else {
        code = '// ERROR: The array "' + this.getFieldValue('VAR') + '" has not been initialized!\n';
    }

    return code;
};


/**
 *
 * @returns {*[]}
 */
Blockly.propc.array_get = function () {
    var varName = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), 'Array');
    var element = Blockly.propc.valueToCode(this, 'NUM', Blockly.propc.ORDER_NONE) || '0';

    return [varName + '[' + element + ']', Blockly.propc.ORDER_ATOMIC];
};


/**
 *
 * @returns {string}
 */
Blockly.propc.array_init = function () {
    var varName = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), 'Array');
    var element = this.getFieldValue('NUM') || '10';

    if (!this.disabled) {
        Blockly.propc.global_vars_['__ARRAY' + varName] = 'int ' + varName + '[' + element + '];';
    }

    return '';
};


/**
 *
 * @returns {string}
 */
Blockly.propc.array_set = function () {
    var varName = Blockly.propc.variableDB_.getName(this.getFieldValue('VAR'), 'Array');
    var element = Blockly.propc.valueToCode(this, 'NUM', Blockly.propc.ORDER_NONE) || '0';
    var value = Blockly.propc.valueToCode(this, 'VALUE', Blockly.propc.ORDER_NONE) || '0';
    var code = varName + '[' + element + '] = ' + value + ';\n';
    var allBlocks = Blockly.getMainWorkspace().getAllBlocks();
    if (allBlocks.toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
        var initStr = '';
        for (var ij = 0; ij < allBlocks.length; ij++) {
            if (allBlocks[ij].toString().indexOf('array initialize ' + this.getFieldValue('VAR')) > -1) {
                initStr = allBlocks[ij].toString().replace(/[^0-9]/g, "");
                break;
            }
        }
        if (element.replace(/[^0-9]+/g, "") === element) {
            if (parseInt(element) >= parseInt(initStr, 10) || parseInt(element) < 0) {
                code = '// WARNING: You are trying to set an element in your array that does not exist!\n';
            }
        } else {
            code = varName + '[constrainInt(' + element + ', 0, ';
            code += (parseInt(initStr, 10) - 1).toString(10);
            code += ')] = ' + value + ';\n';
        }
    } else {
        code = '// WARNING: The array "' + this.getFieldValue('VAR') + '" has not been initialized!\n';
    }
    return code;
};
