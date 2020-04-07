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
 * @fileoverview Code input field.
 * @author matt.m.matz@gmail.com (Matthew Matz)
 *
 * Based on custom field examples written by Beka Westberg
 * https://github.com/BeksOmega/BlocklySummit2019-Fields
 */
'use strict';

goog.provide('Blockly.FieldAceEditor');

goog.require('Blockly.Field');
goog.require('Blockly.utils');
goog.require('Blockly.utils.dom');

/**
 * Class for a field used to edit custom code.
 * @param {string} displayText
 * @param {string=} opt_value text or code to initially start with in the editor.
 * @param {Function=} opt_validator A function that is called to validate
 *    changes to the field's value.
 * @constructor
 */
Blockly.FieldAceEditor = function(displayText, opt_value, opt_validator) {
  this.displayText_ = displayText;
  this.arrowRendered_ = false;
  if (!opt_value) {
    opt_value = '';
  }
  Blockly.FieldAceEditor.superClass_.constructor.call(this, opt_value, opt_validator);
};

goog.inherits(Blockly.FieldAceEditor, Blockly.Field);

/**
 * Construct a FieldAceEditor from a JSON arg object.
 * @param {!Object} options A JSON object with options.
 * @return {Blockly.FieldAceEditor} The new field instance.
 */
Blockly.FieldAceEditor.fromJson = function(options) {
  return new Blockly.FieldAceEditor(
      options['value']);
};

/**
 * Serializable fields are saved by the XML renderer, non-serializable fields
 * are not. Editable fields should also be serializable.
 * @type {boolean}
 * @const
 */
Blockly.FieldAceEditor.prototype.SERIALIZABLE = true;

/**
 * Ensure that the input is a valid ISO code.
 * @param {string} newValue The input value.
 * @return {?string} The valid ISO code, or null if invalid.
 * @protected
 */
Blockly.FieldAceEditor.prototype.doClassValidation_ = function(newValue) {
  return newValue;
};

/**
 * Render the on-block display. And rerender the editor if it is open.
 * @protected
 */
Blockly.FieldAceEditor.prototype.render_ = function() {
  if (!this.arrowRendered_) {
    this.arrowRendered_ = true;
    const span = Blockly.utils.dom.createSvgElement('tspan', {}, null);
    this.arrow_ = document.createTextNode(' \u25BE');
    span.appendChild(this.arrow_);
    span.style['fill'] = this.getSourceBlock().getColour();
    this.textElement_.insertBefore(span, this.textContent_.nextSibling);
  }
  Blockly.FieldAceEditor.superClass_.render_.call(this);
};

/**
 * Get the text representation of the value of the field.
 * @return {string}
 */
Blockly.FieldAceEditor.prototype.getText = function() {
  return this.getValue();
};

/**
 * Get the text used for the on-block display.
 * @return {string}
 * @protected
 */
Blockly.FieldAceEditor.prototype.getDisplayText_ = function() {
  return this.displayText_;
};

/**
 * Create the field's editor.
 * @protected
 */
Blockly.FieldAceEditor.prototype.showEditor_ = function() {
  this.editor_ = this.dropdownCreate_();
  const currentField = this;
  this.codeField_ = ace.edit(this.editor_);
  this.codeField_.setTheme("ace/theme/chrome");
  this.codeField_.getSession().setMode("ace/mode/c_cpp");
  this.codeField_.getSession().setTabSize(2);
  this.codeField_.$blockScrolling = Infinity;
  this.codeField_.setValue(this.getValue());
  this.codeField_.focus();
  this.codeField_.navigateFileEnd();
  this.codeField_.on('change', function() {
    currentField.setValue(currentField.codeField_.getValue());
  });
  Blockly.DropDownDiv.getContentDiv().appendChild(this.editor_);
  Blockly.DropDownDiv.setColour('white', 'silver');
  Blockly.DropDownDiv.showPositionedByField(
      this, this.dropdownDispose_.bind(this));
};

/**
 * Create the dom of the dropdown editor.
 * @return {HTMLObjectElement}
 * @private
 */
Blockly.FieldAceEditor.prototype.dropdownCreate_ = function() {
  const editorDiv = document.createElement('div');
  editorDiv.style.width = '400px';
  editorDiv.style.height = '250px';

  // TODO: Returning an HTMLDivElement but a HTMLObjectElement was specified.
  return editorDiv;
};

/**
 * Dispose of all listeners bound to the editor, and all dom references that
 * have been removed.
 * @private
 */
Blockly.FieldAceEditor.prototype.dropdownDispose_ = function() {
  this.setValue(this.codeField_.getValue());
  this.codeField_.destroy();
  this.editor_ = null;
};

Blockly.Field.register('field_ace', Blockly.FieldAceEditor);
