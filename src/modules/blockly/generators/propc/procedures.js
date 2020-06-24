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
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

import Blockly from 'blockly/core';

import {getDefaultProfile} from '../../../project';
import {colorPalette} from '../propc';

/**
 *  Block for defining a procedure with no return value.
 *    Procedures DefNoReturn
 * @type {{
 *    callType_: string,
 *    init: Blockly.Blocks.procedures_defnoreturn.init,
 *    getVars: (function(): []|*[]),
 *    displayRenamedVar_:
 *      Blockly.Blocks.procedures_defnoreturn.displayRenamedVar_,
 *    decompose: (function(!Blockly.Workspace): Blockly.Block),
 *    domToMutation: Blockly.Blocks.procedures_defnoreturn.domToMutation,
 *    updateVarName: Blockly.Blocks.procedures_defnoreturn.updateVarName,
 *    compose: Blockly.Blocks.procedures_defnoreturn.compose,
 *    mutationToDom: (function(boolean=): HTMLElement),
 *    setStatements_: Blockly.Blocks.procedures_defnoreturn.setStatements_,
 *    updateParams_: Blockly.Blocks.procedures_defnoreturn.updateParams_,
 *    getVarModels: (function(): []|*[]),
 *    getProcedureDef: (function(): ([]|*[]|boolean)[]),
 *    renameVarById: Blockly.Blocks.procedures_defnoreturn.renameVarById,
 *    customContextMenu: Blockly.Blocks.procedures_defnoreturn.customContextMenu
 *  }}
 */
Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * This is used how?
   * @type {string}
   */
  callType_: 'procedures_callnoreturn',

  /**
   * @this Blockly.Block
   */
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_FUNCTIONS_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_FUNCTIONS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setColour(colorPalette.getColor('functions'));
    const nameField = new Blockly.FieldTextInput('',
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_TITLE'])
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },

  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this Blockly.Block
   */
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK')
          .appendField(Blockly.Msg['PROCEDURES_DEFNORETURN_DO']);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },

  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    // Check for duplicated arguments.
    let badArg = false;
    const hash = {};
    for (let i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg['PROCEDURES_DEF_DUPLICATE_WARNING']);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    let paramString = '';
    if (this.arguments_.length) {
      paramString = Blockly.Msg['PROCEDURES_BEFORE_PARAMS'] +
          ' ' + this.arguments_.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },

  /**
   * Create XML to represent the argument inputs.
   * @param {boolean=} optParameterIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function(optParameterIds) {
    const container = document.createElement('mutation');
    if (optParameterIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      const parameter = document.createElement('arg');
      const argModel = this.argumentVarModels_[i];
      parameter.setAttribute('name', argModel.name);
      parameter.setAttribute('varid', argModel.getId());
      if (optParameterIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },

  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        const varName = childNode.getAttribute('name');
        const varId = childNode.getAttribute('varid') ||
            childNode.getAttribute('varId');
        this.arguments_.push(varName);
        const variable = Blockly.Variables.getOrCreateVariablePackage(
            this.workspace, varId, varName, '');
        this.argumentVarModels_.push(variable);
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },

  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    const containerBlock = workspace.newBlock('procedures_mutatorcontainer');
    containerBlock.initSvg();

    // Check/uncheck the allow statement box.
    if (this.getInput('RETURN')) {
      containerBlock.setFieldValue(
          this.hasStatements_ ? 'TRUE' : 'FALSE', 'STATEMENTS');
    } else {
      containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
    }

    // Parameter list.
    let connection = containerBlock.getInput('STACK').connection;
    for (let i = 0; i < this.arguments_.length; i++) {
      const paramBlock = workspace.newBlock('procedures_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[i], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },

  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    this.argumentVarModels_ = [];
    let paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      const varName = paramBlock.getFieldValue('NAME');
      this.arguments_.push(varName);
      const variable = this.workspace.getVariable(varName, '');
      this.argumentVarModels_.push(variable);
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show/hide the statement input.
    let hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements === 'TRUE';
      if (this.hasStatements_ !== hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          const stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            const stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setStatements_(false);
        }
      }
    }
  },

  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },

  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return this.arguments_;
  },

  /**
   * Return all variables referenced by this block.
   * @return {!Array.<!Blockly.VariableModel>} List of variable models.
   * @this Blockly.Block
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },

  /**
   * Notification that a variable is renaming.
   * If the ID matches one of this block's variables, rename it.
   * @param {string} oldId ID of variable to rename.
   * @param {string} newId ID of new variable.  May be the same as oldId, but
   *     with an updated name.  Guaranteed to be the same type as the old
   *     variable.
   * @override
   * @this Blockly.Block
   */
  renameVarById: function(oldId, newId) {
    const oldVariable = this.workspace.getVariableById(oldId);
    if (oldVariable.type !== '') {
      // Procedure arguments always have the empty type.
      return;
    }
    const oldName = oldVariable.name;
    const newVar = this.workspace.getVariableById(newId);

    let change = false;
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() === oldId) {
        this.arguments_[i] = newVar.name;
        this.argumentVarModels_[i] = newVar;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newVar.name);
    }
  },

  /**
   * Notification that a variable is renaming but keeping the same ID.  If the
   * variable is in use on this block, rerender to show the new name.
   * @param {!Blockly.VariableModel} variable The variable being renamed.
   * @package
   * @override
   * @this Blockly.Block
   */
  updateVarName: function(variable) {
    const newName = variable.name;
    let change = false;
    let oldName = '';
    for (let i = 0; i < this.argumentVarModels_.length; i++) {
      if (this.argumentVarModels_[i].getId() === variable.getId()) {
        oldName = this.arguments_[i];
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.displayRenamedVar_(oldName, newName);
    }
  },

  /**
   * Update the display to reflect a newly renamed argument.
   * @param {string} oldName The old display name of the argument.
   * @param {string} newName The new display name of the argument.
   * @private
   */
  displayRenamedVar_: function(oldName, newName) {
    this.updateParams_();
    // Update the mutator's variables if the mutator is open.
    if (this.mutator.isVisible()) {
      const blocks = this.mutator.workspace_.getAllBlocks();
      for (let i = 0, block; (block = blocks[i]); i++) {
        if (block.type === 'procedures_mutatorarg' &&
            Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
          block.setFieldValue(newName, 'NAME');
        }
      }
    }
  },

  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (this.isInFlyout) {
      return;
    }

    // Add option to create caller.
    const option = {enabled: true};
    const name = this.getFieldValue('NAME');
    option.text = Blockly.Msg['PROCEDURES_CREATE_DO'].replace('%1', name);
    const xmlMutation = document.createElement('mutation');
    xmlMutation.setAttribute('name', name);

    for (let i = 0; i < this.arguments_.length; i++) {
      const xmlArg = document.createElement('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }

    let xmlBlock = document.createElement('block');
    xmlBlock.setAttribute('type', this.callType_);
    xmlBlock.appendChild(xmlMutation);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (let i = 0; i < this.argumentVarModels_.length; i++) {
        const argVar = this.argumentVarModels_[i];
        const name = argVar.name;
        option.text = Blockly.Msg['VARIABLES_SET_CREATE_GET']
            .replace('%1', name);
        const xmlField = Blockly.Variables.generateVariableFieldDom(argVar);
        xmlBlock = document.createElement('block');
        xmlBlock.setAttribute('type', 'variables_get');
        xmlBlock.appendChild(xmlField);
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
};

/**
 * Procedure Call No Return
 *
 * @type {{
 *    init: Blockly.Blocks.procedures_callnoreturn.init,
 *    defType_: string,
 *    setProcedureParameters_:
 *      Blockly.Blocks.procedures_callnoreturn.setProcedureParameters_,
 *    renameProcedure:
 *      Blockly.Blocks.procedures_callnoreturn.renameProcedure,
 *    updateShape_:
 *      Blockly.Blocks.procedures_callnoreturn.updateShape_,
 *    mutationToDom: (function(): HTMLElement),
 *    onchange: Blockly.Blocks.procedures_callnoreturn.onchange,
 *    getVarModels: (function(): []|*[]),
 *    domToMutation: Blockly.Blocks.procedures_callnoreturn.domToMutation,
 *    customContextMenu:
 *      Blockly.Blocks.procedures_callnoreturn.customContextMenu,
 *    getProcedureCall: (function(): string)
 *  }}
 */
Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    const profile = getDefaultProfile();
    if (profile.description === 'Scribbler Robot') {
      this.setHelpUrl(Blockly.MSG_S3_FUNCTIONS_HELPURL);
    } else {
      this.setHelpUrl(Blockly.MSG_FUNCTIONS_HELPURL);
    }
    this.setTooltip(Blockly.MSG_PROCEDURES_CALLNORETURN_TOOLTIP);
    this.setColour(colorPalette.getColor('functions'));
    this.appendDummyInput('TOPROW')
        .appendField('run function  \u201C' + this.id + '\u201D', 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.arguments_ = [];
    this.argumentVarModels_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;

    /**
     * Set the previous disabled state to false (off)
     *
     * @type {boolean}
     * @private
     */
    this.previousDisabledState_ = false;
  },

  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcedureCall: function() {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (
      (this.getFieldValue('NAME'))
          .split('\u201C'))[1].slice(0, -1);
  },

  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this Blockly.Block
   */
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue('run function \u201C' + newName + '\u201D', 'NAME');
    }
  },

  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this Blockly.Block
   */
  setProcedureParameters_: function(paramNames, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    const defBlock = Blockly.Procedures.getDefinition(this.getProcedureCall(),
        this.workspace);
    const mutatorOpen = defBlock && defBlock.mutator &&
        defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
    }
    // Test arguments (arrays of strings) for changes. '\n' is not a valid
    // argument name character, so it is a valid delimiter here.
    if (paramNames.join('\n') == this.arguments_.join('\n')) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw new RangeError('paramNames and paramIds must be the same length.');
    }
    this.setCollapsed(false);
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      this.quarkIds_ = [];
    }
    // Switch off rendering while the block is rebuilt.
    const savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (let i = 0; i < this.arguments_.length; i++) {
      const input = this.getInput('ARG' + i);
      if (input) {
        const connection = input.connection.targetConnection;
        this.quarkConnections_[this.quarkIds_[i]] = connection;
        if (mutatorOpen && connection &&
            paramIds.indexOf(this.quarkIds_[i]) === -1) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours_();
        }
      }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    // And rebuild the argument model list.
    this.argumentVarModels_ = [];
    for (let i = 0; i < this.arguments_.length; i++) {
      const variable = Blockly.Variables.getOrCreateVariablePackage(
          this.workspace, null, this.arguments_[i], '');
      this.argumentVarModels_.push(variable);
    }

    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (let i = 0; i < this.arguments_.length; i++) {
        const quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          const connection = this.quarkConnections_[quarkId];
          if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },

  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    let i;
    for (i = 0; i < this.arguments_.length; i++) {
      let field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Blockly.Events.disable();
        try {
          field.setValue(this.arguments_[i]);
        } finally {
          Blockly.Events.enable();
        }
      } else {
        // Add new input.
        field = new Blockly.FieldLabel(this.arguments_[i]);
        const input = this.appendValueInput('ARG' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(field, 'ARGNAME' + i);
        input.init();
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ARG' + i)) {
      this.removeInput('ARG' + i);
      i++;
    }
    // Add 'with:' if there are parameters, remove otherwise.
    const topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(
              Blockly.Msg['PROCEDURES_CALL_BEFORE_PARAMS'], 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
    }
  },

  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    const container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (let i = 0; i < this.arguments_.length; i++) {
      const parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      container.appendChild(parameter);
    }
    return container;
  },

  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    const name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    const args = [];
    const paramIds = [];
    for (let i = 0, childNode; (childNode = xmlElement.childNodes[i]); i++) {
      if (childNode.nodeName.toLowerCase() === 'arg') {
        args.push(childNode.getAttribute('name'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, paramIds);
  },

  /**
   * Return all variables referenced by this block.
   * @return {!Array.<!Blockly.VariableModel>} List of variable models.
   * @this Blockly.Block
   */
  getVarModels: function() {
    return this.argumentVarModels_;
  },

  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @param {!Blockly.Events.Abstract} event Change event.
   * @this Blockly.Block
   */
  onchange: function(event) {
    const tBlock = this.previousConnection.targetBlock();
    if (tBlock) {
      if (tBlock.toString().indexOf('new processor ') === 0) {
        this.setNextStatement(false);
      } else {
        this.setNextStatement(true);
      }
    } else {
      this.setNextStatement(true);
    }
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (!event.recordUndo) {
      // Events not generated by user. Skip handling.
      return;
    }
    if (event.type == Blockly.Events.BLOCK_CREATE &&
        event.ids.indexOf(this.id) != -1) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      const name = this.getProcedureCall();
      let def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && (def.type != this.defType_ ||
          JSON.stringify(def.arguments_) != JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Blockly.Events.setGroup(event.group);
        /**
         * Create matching definition block.
         * <xml>
         *   <block type="procedures_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        const xml = document.createElement('xml');
        const block = document.createElement('block');
        block.setAttribute('type', this.defType_);
        const xy = this.getRelativeToSurfaceXY();
        const x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
        const y = xy.y + Blockly.SNAP_RADIUS * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        const mutation = this.mutationToDom();
        block.appendChild(mutation);
        const field = document.createElement('field');
        field.setAttribute('name', 'NAME');
        field.appendChild(document.createTextNode(this.getProcedureCall()));
        block.appendChild(field);
        xml.appendChild(block);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.BLOCK_DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      const name = this.getProcedureCall();
      const def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Blockly.Events.setGroup(event.group);
        this.dispose(true, false);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.CHANGE &&
               event.element == 'disabled') {
      const name = this.getProcedureCall();
      const def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && def.id == event.blockId) {
        // in most cases the old group should be ''
        const oldGroup = Blockly.Events.getGroup();
        if (oldGroup) {
          // This should only be possible programmatically and may indicate a
          // problem with event grouping. If you see this message please
          // investigate. If the use ends up being valid we may need to
          // reorder events in the undo stack.
          console.log('Saw an existing group while responding' +
              ' to a definition change');
        }

        Blockly.Events.setGroup(event.group);

        if (event.newValue) {
          this.previousDisabledState_ = this.disabled;
          // TODO: setDisabled is deprecated. Use setEnabled() instead.
          this.setDisabled(true);
        } else {
          this.setDisabled(this.previousDisabledState_);
        }
        Blockly.Events.setGroup(oldGroup);
      }
    }
  },

  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    const option = {enabled: true};
    option.text = Blockly.Msg['PROCEDURES_HIGHLIGHT_DEF'];
    const name = this.getProcedureCall();
    const workspace = this.workspace;
    option.callback = function() {
      const def = Blockly.Procedures.getDefinition(name, workspace);
      if (def) {
        workspace.centerOnBlock(def.id);
        def.select();
      }
    };
    options.push(option);
  },
  defType_: 'procedures_defnoreturn',
};

/**
 *
 * @return {null}
 */
Blockly.propc.procedures_defreturn = function() {
  // Define a procedure with a return value.
  const funcName = Blockly.propc.variableDB_.getName(
      this.getFieldValue('NAME'),
      Blockly.Procedures.NAME_TYPE);
  let branch = Blockly.propc.statementToCode(this, 'STACK');
  if (Blockly.propc.INFINITE_LOOP_TRAP) {
    branch = Blockly.propc.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + this.id + '\'') + branch;
  }
  let returnValue = Blockly.propc.valueToCode(this, 'RETURN',
      Blockly.propc.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + ';\n';
  }
  const returnType = returnValue ? 'int' : 'void';
  const args = [];
  for (let x = 0; x < this.arguments_.length; x++) {
    //        args[x] = this.arguments_[x];
    //        console.log("argument", this.arguments_[x]);
    const varName = Blockly.propc.variableDB_.getName(
        this.arguments_[x],
        Blockly.VARIABLE_CATEGORY_NAME);
    args.push('int ' + varName);
    if (Blockly.propc.vartype_[varName] === undefined) {
      Blockly.propc.vartype_[varName] = 'LOCAL';
    }
  }
  let code = returnType + ' ' + funcName + '(' + args.join(', ') + ') {\n' +
            branch + returnValue + '}\n';

  Blockly.propc.method_declarations_[funcName] = returnType + ' ' +
            funcName + '(' + args.join(', ') + ');\n';

  code = Blockly.propc.scrub_(this, code);
  Blockly.propc.methods_[funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.propc.procedures_defnoreturn = Blockly.propc.procedures_defreturn;

Blockly.propc.procedures_callreturn = function() {
  // Call a procedure with a return value.
  const funcName = Blockly.propc.variableDB_.getName(
      ((this.getFieldValue('NAME')).split('\u201C'))[1].slice(0, -1),
      Blockly.Procedures.NAME_TYPE);
  const args = [];
  for (let x = 0; x < this.arguments_.length; x++) {
    args[x] = Blockly.propc.valueToCode(this, 'ARG' + x,
        Blockly.propc.ORDER_NONE) || 'null';
  }
  const code = funcName + '(' + args.join(', ') + ')';
  if (this.type === 'procedures_callnoreturn') {
    return code + ';\n';
  } else {
    return [code, Blockly.propc.ORDER_UNARY_POSTFIX];
  }
};

Blockly.propc.procedures_callnoreturn = Blockly.propc.procedures_callreturn;

Blockly.propc.procedures_ifreturn = function() {
  // Conditionally return value from a procedure.
  const condition = Blockly.propc.valueToCode(this, 'CONDITION',
      Blockly.propc.ORDER_NONE) || 'false';
  let code = 'if (' + condition + ') {\n';
  if (this.hasReturnValue_) {
    const value = Blockly.propc.valueToCode(this, 'VALUE',
        Blockly.propc.ORDER_NONE) || 'null';
    code += '  return ' + value + ';\n';
  } else {
    code += '  return;\n';
  }
  code += '}\n';
  return code;
};
