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
 * @fileoverview C code generator
 * @author Matthew Matz, Michel Lampo
 * @description This file registers the PropC C source code generator
 * with the Blockly environment.
 */

import Blockly from 'blockly/core.js';
import {getDefaultProfile} from '../../project.js';
import {isExperimental} from '../../utility';
import {WarnDeprecatedBlocks} from '../../constants';
import {loadReservedWords} from './propc_reserved_words';

Blockly.propc = new Blockly.Generator('propc');
Blockly.HSV_SATURATION = 0.75;
Blockly.HSV_VALUE = 0.60;
Blockly.RTL = false;

/**
 * Color Palette - Created by Michel on 30-4-2016.
 */
const colorPalette = {
  defaultColors: {
    'deprecated': 60,
    'input': 140,
    'output': 165,
    'io': 185,
    'programming': 205,
    'functions': 225,
    'variables': 250,
    'math': 275,
    'binary': 275,
    'robot': 295,
    'heb': 295,
    'ab': 320,
    'protocols': 340,
    'system': 320,
  },
  grayscaleColors: {
    'deprecated': '#a85c39',
    'input': '#AAAAAA',
    'output': '#222222',
    'io': '#333333',
    'programming': '#444444',
    'functions': '#555555',
    'variables': '#666666',
    'math': '#777777',
    'binary': '#777777',
    'robot': '#888888',
    'heb': '#888888',
    'ab': '#999999',
    'protocols': '#111111',
    'system': '#999999',
  },
  activePalette: null,

  getColor: function(type) {
    if (colorPalette.activePalette &&
        colorPalette.activePalette[type] !== undefined) {
      return colorPalette.activePalette[type];
    }
    return '#000000';
  },
};

if (document.referrer.indexOf('?') === -1) {
  colorPalette.activePalette = colorPalette.defaultColors;
} else {
  if (document.referrer.split('?')[1].indexOf('grayscale=1') === -1) {
    colorPalette.activePalette = colorPalette.defaultColors;
  } else {
    colorPalette.activePalette = colorPalette.grayscaleColors;
  }
}

loadReservedWords();

/**
 * Order of operation ENUMs.
 *
 */
Blockly.propc.ORDER_ATOMIC = 0; // 0 "" ...
Blockly.propc.ORDER_UNARY_POSTFIX = 1; // expr++ expr-- () [] .
Blockly.propc.ORDER_UNARY_PREFIX = 2; // -expr !expr ~expr ++expr --expr
Blockly.propc.ORDER_MULTIPLICATIVE = 3; // * / % ~/
Blockly.propc.ORDER_ADDITIVE = 4; // + -
Blockly.propc.ORDER_SHIFT = 5; // << >>
Blockly.propc.ORDER_RELATIONAL = 7; // is is! >= > <= <
Blockly.propc.ORDER_EQUALITY = 8; // == != === !==
Blockly.propc.ORDER_BITWISE_AND = 9; // &
Blockly.propc.ORDER_BITWISE_XOR = 10; // ^
Blockly.propc.ORDER_BITWISE_OR = 11; // |
Blockly.propc.ORDER_LOGICAL_AND = 12; // &&
Blockly.propc.ORDER_LOGICAL_OR = 13; // ||
Blockly.propc.ORDER_CONDITIONAL = 14; // expr ? expr : expr
Blockly.propc.ORDER_ASSIGNMENT = 15; // := *= /= ~/= %= += -= <<= >>= &= ^= |=
Blockly.propc.ORDER_NONE = 99; // (...)


/**
 * Initialize the database of variable names.
 * @param {Blockly.Workspace} workspace The active workspace.
 */
Blockly.propc.init = function(workspace) {
  const profile = getDefaultProfile();
  // Create a dictionary of definitions to be printed before setups.
  Blockly.propc.definitions_ = [];
  Blockly.propc.definitions_['include simpletools'] =
      '#include "simpletools.h"';
  Blockly.propc.methods_ = {};
  Blockly.propc.setups_ = {};
  Blockly.propc.method_declarations_ = {};
  Blockly.propc.global_vars_ = {};
  /**
   * What does this do?
   * @type {Object}
   * @private
   */
  Blockly.propc.cog_methods_ = {};

  /**
   * What does this do?
   * @type {Object}
   * @private
   */
  Blockly.propc.cog_setups_ = {};

  // Create a list of stacks
  Blockly.propc.stacks_ = [];
  Blockly.propc.vartype_ = {};
  Blockly.propc.varlength_ = {};
  Blockly.propc.string_var_lengths = [];

  // Set up specific libraries for devices like the Scribbler or Badge
  if (profile.description === 'Scribbler Robot') {
    Blockly.propc.definitions_['include_scribbler'] = '#include "s3.h"';
  } else if (profile.description === 'Hackable Electronic Badge') {
    Blockly.propc.definitions_['badgetools'] = '#include "badgetools.h"';
    Blockly.propc.setups_['badgetools'] = 'badge_setup();';
  } else if (profile.description === 'Badge WX') {
    Blockly.propc.definitions_['badgetools'] = '#include "badgewxtools.h"';
    Blockly.propc.setups_['badgetools'] = 'badge_setup();';
  }

  if (Blockly.Variables) {
    if (!Blockly.propc.variableDB_) {
      Blockly.propc.variableDB_ =
          new Blockly.Names(Blockly.propc.RESERVED_WORDS_);
    } else {
      Blockly.propc.variableDB_.reset();
    }

    Blockly.propc.variableDB_.setVariableMap(workspace.getVariableMap());

    const defvars = [];
    const variables = Blockly.Variables.allUsedVarModels(workspace);
    for (let x = 0; x < variables.length; x++) {
      const varName = Blockly.propc.variableDB_.getName(
          variables[x].getId(),
          Blockly.VARIABLE_CATEGORY_NAME);
      defvars[x] = '{{$var_type_' + varName + '}} ' + varName +
          '{{$var_length_' + varName + '}};';
      Blockly.propc.definitions_['variable' + x.toString(10)] = defvars[x];
    }
  }
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 *
 * @description
 * Question: cogFunction is populated but never used. Why does it exist?
 */
Blockly.propc.finish = function(code) {
  const profile = getDefaultProfile();
  // Convert the definitions dictionary into a list.
  const imports = [];
  const methods = [];
  const uiSystemSettings = [];
  const declarations = [];
  const definitions = [];
  const definitionNames = [];
  const functionVariables = [];
  const cogFunctions = [];

  // Gives BlocklyProp developers the ability to add global variables
  for (const name in Blockly.propc.global_vars_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.global_vars_, name)) {
      const def = Blockly.propc.global_vars_[name];
      definitions.push(def);
      definitionNames.push(name);
    }
  }

  // Set the beginning of the variable definitions
  const userVariableStart = definitions.length;

  for (const name in Blockly.propc.definitions_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.definitions_, name)) {
      const def = Blockly.propc.definitions_[name];
      if (def.match(/^#include/) || def.match(/^#define/) ||
          def.match(/^#if/) || def.match(/^#end/) ||
          def.match(/^#else/) || def.match(/^#pragma/)) {
        imports.push(def);
      } else if (def.match(/\/\/ GRAPH_[A-Z]*_START:/)) {
        uiSystemSettings.push(def);
      } else {
        definitions.push(def);
        definitionNames.push(name);
      }
    }
  }

  // Set the end of the variable definitions
  const userVariableEnd = definitions.length;

  for (const declaration in Blockly.propc.method_declarations_) {
    if (Object.prototype.hasOwnProperty.call(
        Blockly.propc.method_declarations_, declaration)) {
      declarations.push(Blockly.propc.method_declarations_[declaration]);
      for (const functionIndex in Blockly.propc.cog_methods_) {
        if (Blockly.propc.cog_methods_[functionIndex].replace(/[^\w]+/g, '') ===
          // eslint-disable-next-line max-len
          Blockly.propc.method_declarations_[declaration].replace(/void/g, '').replace(/[^\w]+/g, '')) {
          cogFunctions.push(declaration);
        }
      }
    }
  }

  for (const method in Blockly.propc.methods_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.methods_, method)) {
      for (const cogSetup in Blockly.propc.cog_setups_) {
        if (Blockly.propc.cog_setups_[cogSetup][0] === method) {
          const cogFunctionCode = Blockly.propc.methods_[method];
          const bracePosition = cogFunctionCode.indexOf('{');
          Blockly.propc.methods_[method] =
            cogFunctionCode.substring(0, bracePosition + 1) +
            Blockly.propc.cog_setups_[cogSetup][1] +
            cogFunctionCode.substring(
                bracePosition + 1, bracePosition.length);
        }
      }
      methods.push(Blockly.propc.methods_[method]);
    }
  }

  for (const def in definitions) {
    if (Object.prototype.hasOwnProperty.call(definitions, def)) {
      for (const variable in Blockly.propc.vartype_) {
        if (definitions[def].indexOf('{{$var_type_' + variable + '}}') > -1) {
          if (Blockly.propc.vartype_[variable] !== 'LOCAL') {
            definitions[def] = definitions[def].replace(
                '{{$var_type_' + variable + '}}',
                Blockly.propc.vartype_[variable]);
          } else {
            definitions[def] = definitions[def].replace(
                '{{$var_type_' + variable + '}} ' + variable +
              '{{$var_length_' + variable + '}}', '');
          }
          if (Blockly.propc.varlength_[variable]) {
            definitions[def] = definitions[def].replace(
                '{{$var_length_' + variable + '}}',
                '[' + Blockly.propc.varlength_[variable] + ']');
          } else {
            definitions[def] = definitions[def].replace(
                '{{$var_length_' + variable + '}}', '');
          }
        }
      }

      if (definitions[def].indexOf('{{$var_type_') > -1) {
        definitions[def] = definitions[def]
            .replace(/\{\{\$var_type_.*?\}\}/ig, 'int')
            .replace(/\{\{\$var_length_.*?\}\}/ig, '');
      }

      // exclude custom code blocks from these modifiers
      if (definitionNames[def].indexOf('cCode') === -1) {
        // Exclude variables with "__" in the name for now because those
        // are buffers for private functions
        if (definitions[def].indexOf('char *') > -1 &&
          definitions[def].indexOf('__') === -1 &&
          definitions[def].indexOf('rfidBfr') === -1 &&
          definitions[def].indexOf('wxBuffer') === -1) {
          definitions[def] = definitions[def]
              .replace('char *', 'char ')
              .replace(';', '[64];');
        } else if (definitions[def].indexOf('wxBuffer') > -1) {
          definitions[def] = definitions[def]
              .replace('char *', 'char ')
              .replace('wxBuffer;', 'wxBuffer[64];');
        }

        // TODO: Temporary patch to correct some weirdness with char array
        //  pointer declarations
        definitions[def] = definitions[def]
            .replace(/char \*(\w+)\[/g, 'char $1[');
      }

      // Sets the length of string arrays based on the lengths specified
      // in the string set length block.
      const vl = Blockly.propc.string_var_lengths.length;
      for (let vt = 0; vt < vl; vt++) {
        const varMatch = new RegExp(
            'char\\s+' + Blockly.propc.string_var_lengths[vt][0] + '\\[');
        if (definitions[def].match(varMatch)) {
          definitions[def] = 'char ' +
          Blockly.propc.string_var_lengths[vt][0] +
          '[' +
          Blockly.propc.string_var_lengths[vt][1] +
          ' + 1];';
        }
      }

      // Looking for functions used in cog definitions.
      for (const method in Blockly.propc.cog_methods_) {
        if (Blockly.propc.methods_[method]) {
          // WIP: .indexOf fails on a null methods_[method]
          if (Blockly.propc.methods_[method]
              .indexOf(definitions[def]
                  .replace(/[charint]* (\w+)[[\]0-9]*;/g, '$1')) > -1) {
            functionVariables.push(definitions[def]);
          }
        }


        // TODO: Remove this code when the regEx above has been verified.
        // if (Blockly.propc.methods_[method]
        //     .indexOf(definitions[def]
        //         .replace(/[charint]* (\w+)[\[\]0-9]*;/g, '$1')) > -1) {
        //   functionVariables.push(definitions[def]);
        // }
      }
    }
  }

  for (const stack in Blockly.propc.stacks_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.stacks_, stack)) {
      definitions.push(Blockly.propc.stacks_[stack]);
      definitionNames.push(stack);
    }
  }

  // Convert the setups dictionary into a list.
  const setups = [];
  for (const name in Blockly.propc.setups_) {
    if (Object.prototype.hasOwnProperty.call(Blockly.propc.setups_, name)) {
      setups.push('  ' + Blockly.propc.setups_[name]);
    }
  }

  if (profile.description === 'Scribbler Robot') {
    // setups.unshift('  s3_setup();pause(100);');
    setups.unshift(' ');
    setups.unshift('  pause(100);');
    setups.unshift('  s3_setup();');
    setups.unshift('  // Initialize the robot');
  }

  // Add volatile to variable declarations in cogs
  for (let idx = userVariableStart; idx < userVariableEnd; idx++) {
    for (const idk in functionVariables) {
      if (definitions[idx] === functionVariables[idk] &&
          definitions[idx].indexOf('volatile') === -1) {
        // TODO: uncomment this when optimization is utilized!
        if (isExperimental.indexOf('volatile' > -1)) {
          definitions[idx] = 'volatile ' + definitions[idx];
        }

        // TODO: Apply 'volatile' to array definitions as well!
      }
    }
  }

  let spacerDefinitions = '\n\n';
  if (definitions.toString().trim().length > 0) {
    spacerDefinitions += '// ------ Global Variables and Objects ------\n';
  }

  const allDefs = '// ------ Libraries and Definitions ------\n' +
      imports.join('\n') +
      spacerDefinitions +
      definitions.join('\n') + '\n\n';

  if (code.indexOf('// RAW PROPC CODE\n//{{||}}\n') > -1) {
    const pcc = code.split('//{{||}}\n');
    return pcc[2];
  } else {
    // Indent every line.
    code = '  ' + code.replace(/\n/g, '\n  ');

    // Comment out any instance of 'pause(0);' - causes a compiler error
    code = code
        .replace(/\n\s+$/, '\n')
        .replace(/pause\(0\);\n/g, '// pause(0);\n');

    // Remove redundant casts
    code = code.replace(/\(float\)\s*\(int\)/g, '(float)');

    // Sweep for doubled-up parentheses
    while (code.match(/\(\(([^()]*)\)\)/g)) {
      code = code.replace(/\(\(([^()]*)\)\)/g, '($1)');
    }

    code = 'int main()\n{\n' + setups.join('\n') + '\n' + code + '\n}';
    let setup = '';
    if (Blockly.mainWorkspace.getAllBlocks().length === 0 &&
                profile.description !== 'Propeller C (code-only)') {
      setup += '/* EMPTY_PROJECT */\n';
    }
    setup += uiSystemSettings.join('\n') + '\n\n';

    let spacerDeclarations = '';
    if (declarations.length > 0) {
      spacerDeclarations += '// ------ Function Declarations ------\n';
    }

    let spacerFunctions = '\n\n';
    if (methods.length > 0) {
      spacerFunctions += '// ------ Functions ------\n';
    }

    if (Blockly.propc.definitions_['pure_code'] === '/* PURE CODE ONLY */\n') {
      code = Blockly.propc.methods_['pure_code'];
    } else {
      code = setup + allDefs
          .replace(/\n\n+/g, '\n\n')
          .replace(/\n*$/, '\n\n') +
          spacerDeclarations +
          declarations.join('\n\n')
              .replace(/\n\n+/g, '\n')
              .replace(/\n*$/, '\n') +
         '\n// ------ Main Program ------\n' + code + spacerFunctions +
          methods.join('\n');
    }

    // Change strings assigned to variables to strcpy functions
    code = code.replace(/(\w+)\s*=\s*\({0,1}"(.*)"\){0,1};/g,
        function(m, p1, p2) {
          if (p2.indexOf(',') === 0 && p2.indexOf(', "') > -1) {
            return m;
          } else {
            return 'strcpy(' + p1 + ', "' + p2 +
                '");\t\t\t// Save string into variable ' + p1 + '.';
          }
        });

    return code;
  }
};


/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.  A trailing semicolon is needed to make this legal.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.propc.scrubNakedValue = function(line) {
  return line + ';\n';
};


/**
 * Common tasks for generating Prop-c from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 *
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The propc code created for this block.
 * @return {string} Prop-c code with comments and subsequent blocks added.
 * @this {Blockly.CodeGenerator}
 * @private
 */
Blockly.propc.scrub_ = function(block, code) {
  if (code === null) {
    // Block has handled code generation itself.
    return '';
  }
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection || !block.outputConnection.targetConnection) {
    // Collect comment for this block.
    const comment = block.getCommentText();
    if (comment) {
      commentCode += Blockly.propc.prefixLines(comment, '// ') + '\n';
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let x = 0; x < block.inputList.length; x++) {
      // TODO: Possible type coercion issue
      if (block.inputList[x].type === Blockly.INPUT_VALUE) {
        const childBlock = block.inputList[x].connection.targetBlock();
        if (childBlock) {
          const comment = Blockly.propc.allNestedComments(childBlock);
          if (comment) {
            commentCode += Blockly.propc.prefixLines(comment, '// ');
          }
        }
      }
    }
  }
  const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
  const nextCode = this.blockToCode(nextBlock);
  return commentCode + code + nextCode;
};

// Provides backward compatibility for some older browsers:
// eslint-disable-next-line max-len
// From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys
// TODO: Remove this statement once we decide what browser
//  revisions we are going to support
/*
if (!Object.keys) {
  Object.keys = (function() {
    const hasOwnProperty = Object.prototype.hasOwnProperty;
    const hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString');
    const dontEnums = [
      'toString',
      'toLocaleString',
      'valueOf',
      'hasOwnProperty',
      'isPrototypeOf',
      'propertyIsEnumerable',
      'constructor',
    ];
    const dontEnumsLength = dontEnums.length;

    return function(obj) {
      if (typeof obj !== 'function' &&
          (typeof obj !== 'object' || obj === null)) {
        throw new TypeError('Object.keys called on non-object');
      }

      const result = []; let prop; let i;

      for (prop in obj) {
        if (hasOwnProperty.call(obj, prop)) {
          result.push(prop);
        }
      }

      if (hasDontEnumBug) {
        for (i = 0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) {
            result.push(dontEnums[i]);
          }
        }
      }
      return result;
    };
  }());
}
*/

// NOTE: Replaces core function!                   // USE WHEN CORE IS UPDATED
/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @override
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldVariable}
 */
Blockly.FieldVariable.dropdownCreate = function() {
  if (!this.variable_) {
    throw new Error('Tried to call dropdownCreate on a variable field with no' +
          ' variable selected.');
  }
  const name = this.getText();
  let workspace = null;
  if (this.sourceBlock_) {
    workspace = this.getSourceBlock().workspace;
  }
  let variableModelList = [];
  if (workspace) {
    const variableTypes = this.getVariableTypes_();
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    for (let i = 0; i < variableTypes.length; i++) {
      const variableType = variableTypes[i];
      const variables = workspace.getVariablesOfType(variableType);
      variableModelList = variableModelList.concat(variables);
    }
  }

  variableModelList.sort(Blockly.VariableModel.compareByName);

  const options = [];
  for (let i = 0; i < variableModelList.length; i++) {
    // Set the UUID as the internal representation of the variable.
    options[i] = [variableModelList[i].name, variableModelList[i].getId()];
  }
  if (name !== Blockly.LANG_VARIABLES_SET_ITEM) {
    options.push([Blockly.Msg['RENAME_VARIABLE'], Blockly.RENAME_VARIABLE_ID]);
  }
  // Prevents user from deleting the default "item" variable
  if (Blockly.Msg['DELETE_VARIABLE'] &&
      name !== Blockly.LANG_VARIABLES_SET_ITEM) {
    options.push([
      Blockly.Msg['DELETE_VARIABLE'].replace('%1', name),
      Blockly.DELETE_VARIABLE_ID,
    ]);
  }

  return options;
};


/**
 * Given a proposed entity name, generate a name that conforms to the
 * [_A-Za-z][_A-Za-z0-9]* format that most languages consider legal for
 * variables.
 * @override
 * @param {string} name Potentially illegal entity name.
 * @return {string} Safe entity name.
 * @private
 */
Blockly.Names.prototype.safeName_ = function(name) {
  if (!name) {
    name = 'unnamed';
  } else {
    // Unfortunately names in non-latin characters will look like
    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
    name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
    // Most languages don't allow names with leading numbers. Addition here:
    // prevents collision with names with a leading double underscore.
    if ('0123456789'.indexOf(name[0]) !== -1 ||
        (name[0] === '_' && name[1] === '_')) {
      name = 'my_' + name;
    }
  }
  return name;
};

/*
const findBlocksByType = function(blockType) {
  const blockList = Blockly.getMainWorkspace().getAllBlocks();
  const blockMatchList = [];
  for (let idx = 0; idx < blockList.length; idx++) {
    if (blockList[idx].type === blockType) {
      blockMatchList.push(blockList[idx].id);
    }
  }
  if (blockMatchList.length > 0) {
    return blockMatchList;
  }
  return null;
};
*/

/**
 * Extends Blockly.Input to allow the input to have a specific range of
 * allowed values. Allows blocks to read the input's range and show warnings
 * if the user enters values outside of the range.
 * See base.js->Blockly.Blocks.math_number for more information about
 * formatting the range string.
 *
 * @param {string} rangeInfo
 *  String containing information about the range/allowed values:
 * @return {Object} this the specified input
 */
Blockly.Input.prototype.appendRange = function(rangeInfo) {
  this.inputRange = rangeInfo;
  return this;
};


/**
 * Extends Blockly.Input to allow the input to have a specific range or
 * allowed values. See base.js->Blockly.Blocks.math_number for more
 * information about formatting the range string.
 * @return {string} the String populated by Blockly.Input.appendRange()
 */
Blockly.Input.prototype.getRange = function() {
  return this.inputRange;
};


// TODO: Remove the following overrides after updating to a blockly core
//  with these patches (targeted for 2019Q4).
/**
 * Initialize the model for this field if it has not already been initialized.
 * If the value has not been set to a variable by the first render, we make up a
 * variable rather than let the value be invalid.
 * @override - Due to error in blockly core targeted to be fixed in release
 * 2019 Q4 - delete after replacing with a core containing these fixes
 * @package
 */
// Blockly.FieldVariable.prototype.initModel = function() {
//   if (this.variable_) {
//     return; // Initialization already happened.
//   }
//   const variable = Blockly.Variables.getOrCreateVariablePackage(
//       this.getSourceBlock().workspace, null,
//       this.defaultVariableName, this.defaultType_);
//
//   // Don't call setValue because we don't want to cause a rerender.
//   this.doValueUpdate_(variable.getId());
// };

/**
 * Update the source block when the mutator's blocks are changed.
 * Bump down any block that's too high.
 * Fired whenever a change is made to the mutator's workspace.
 * @override - Due to error in blockly core targeted to be fixed in
 * release 2019 Q4 - delete after replacing with a core containing these fixes
 * @param {!Blockly.Events.Abstract} e Custom data for event.
 * @private
 */
// Blockly.Mutator.prototype.workspaceChanged_ = function(e) {
//   if (e.type == Blockly.Events.UI ||
//         (e.type == Blockly.Events.CHANGE && e.element == 'disabled')) {
//     return;
//   }
//
//   if (!this.workspace_.isDragging()) {
//     const blocks = this.workspace_.getTopBlocks(false);
//     const MARGIN = 20;
//     for (let b = 0, block; (block = blocks[b]); b++) {
//       const blockXY = block.getRelativeToSurfaceXY();
//       const blockHW = block.getHeightWidth();
//       if (blockXY.y + blockHW.height < MARGIN) {
//         // Bump any block that's above the top back inside.
//         block.moveBy(0, MARGIN - blockHW.height - blockXY.y);
//       }
//     }
//   }
//
//   // When the mutator's workspace changes, update the source block.
//   if (this.rootBlock_.workspace == this.workspace_) {
//     Blockly.Events.setGroup(true);
//     const block = this.block_;
//     const oldMutationDom = block.mutationToDom();
//     const oldMutation = oldMutationDom && Blockly.Xml.domToText(oldMutationDom);
//     // Allow the source block to rebuild itself.
//     block.compose(this.rootBlock_);
//     block.render();
//     const newMutationDom = block.mutationToDom();
//     const newMutation = newMutationDom && Blockly.Xml.domToText(newMutationDom);
//     if (oldMutation != newMutation) {
//       Blockly.Events.fire(new Blockly.Events.BlockChange(
//           block, 'mutation', null, oldMutation, newMutation));
//       // Ensure that any bump is part of this mutation's event group.
//       const group = Blockly.Events.getGroup();
//       setTimeout(function() {
//         Blockly.Events.setGroup(group);
//         block.bumpNeighbours();
//         Blockly.Events.setGroup(false);
//       }, Blockly.BUMP_DELAY);
//     }
//
//     if (oldMutation != newMutation &&
//           this.workspace_.keyboardAccessibilityMode) {
//       Blockly.navigation.moveCursorOnBlockMutation(block);
//     }
//     // Don't update the bubble until the drag has ended, to avoid moving blocks
//     // under the cursor.
//     if (!this.workspace_.isDragging()) {
//       this.resizeBubble_();
//     }
//     Blockly.Events.setGroup(false);
//   }
// };

/**
 * Bump unconnected blocks out of alignment.  Two blocks which aren't actually
 * connected should not coincidentally line up on screen.
 * @override - Due to error in blockly core targeted to be fixed in
 * release 2019 Q4 - delete after replacing with a core containing these fixes
 *
 * Released in 2019 Q3
 * https://github.com/google/blockly/pull/3156
 */
// Blockly.BlockSvg.prototype.bumpNeighbours = function() {
//   if (!this.workspace) {
//     return; // Deleted block.
//   }
//   if (this.workspace.isDragging()) {
//     return; // Don't bump blocks during a drag.
//   }
//   const rootBlock = this.getRootBlock();
//   if (rootBlock.isInFlyout) {
//     return; // Don't move blocks around in a flyout.
//   }
//   // Loop through every connection on this block.
//   /** @type {Blockly.Connection[]} */
//   const myConnections = this.getConnections_(false);
//   /** @type {RenderedConnection} connection */
//   // TODO: Correct assignment/boolean in for/next block
//   for (let i = 0, connection; connection = myConnections[i]; i++) {
//     // connection is of type Blockly.RenderedConnection
//     // Spider down from this block bumping all sub-blocks.
//     if (connection.isConnected() && connection.isSuperior()) {
//       connection.targetBlock().bumpNeighbours();
//     }
//     // const nb = connection.getNeighbours( Blockly.SNAP_RADIUS);
//     const neighbours = connection.neighbours_(Blockly.SNAP_RADIUS);
//     for (let j = 0, otherConnection; otherConnection = neighbours[j]; j++) {
//       // If both connections are connected, that's probably fine.  But if
//       // either one of them is unconnected, then there could be confusion.
//       if (!connection.isConnected() || !otherConnection.isConnected()) {
//         // Only bump blocks if they are from different tree structures.
//         if (otherConnection.getSourceBlock().getRootBlock() != rootBlock) {
//           // Always bump the inferior block.
//           if (connection.isSuperior()) {
//             otherConnection.bumpAwayFrom_(connection);
//           } else {
//             connection.bumpAwayFrom_(otherConnection);
//           }
//         }
//       }
//     }
//   }
// };

const isDeprecatedBlockWarningEnabled = function() {
  return WarnDeprecatedBlocks;
};

export {colorPalette, isDeprecatedBlockWarningEnabled};
