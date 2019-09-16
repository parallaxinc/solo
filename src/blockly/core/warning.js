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
 * @fileoverview Object representing a warning.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Warning');

goog.require('Blockly.Bubble');
goog.require('Blockly.Icon');


/**
 * Class for a warning.
 * @param {!Blockly.Block} block The block associated with this warning.
 * @extends {Blockly.Icon}
 * @constructor
 */
Blockly.Warning = function(block) {
  Blockly.Warning.superClass_.constructor.call(this, block);
  this.createIcon_();
};
goog.inherits(Blockly.Warning, Blockly.Icon);


/**
 * Create the text for the warning's bubble.
 * @param {string} text The text to display.
 * @return {!SVGTextElement} The top-level node of the text.
 * @private
 */
Blockly.Warning.textToDom_ = function(text) {
  var paragraph = /** @type {!SVGTextElement} */ (
      Blockly.createSvgElement('text',
          {'class': 'blocklyText blocklyBubbleText',
           'y': Blockly.Bubble.BORDER_WIDTH},
          null));
  var lines = text.split('\n');
  for (var i = 0; i < lines.length; i++) {
    var tspanElement = Blockly.createSvgElement('tspan',
        {'dy': '1em', 'x': Blockly.Bubble.BORDER_WIDTH}, paragraph);
    var textNode = document.createTextNode(lines[i]);
    tspanElement.appendChild(textNode);
  }
  return paragraph;
};

/**
 * Warning text (if bubble is not visible).
 * @private
 */
Blockly.Warning.prototype.text_ = '';

/**
 * Create the icon on the block.
 * @private
 */
Blockly.Warning.prototype.createIcon_ = function() {
  Blockly.Icon.prototype.createIcon_.call(this);
  /* Here's the markup that will be generated:
  <path class="blocklyIconShield" d="..."/>
  <text class="blocklyIconMark" x="8" y="13">!</text>
  */
  var iconShield = Blockly.createSvgElement('path',
      {'class': 'blocklyIconShield',
       'd': 'M 2,15 Q -1,15 0.5,12 L 6.5,1.7 Q 8,-1 9.5,1.7 L 15.5,12 ' +
       'Q 17,15 14,15 z'},
      this.iconGroup_);
  this.iconMark_ = Blockly.createSvgElement('text',
      {'class': 'blocklyIconMark',
       'x': Blockly.Icon.RADIUS,
       'y': 2 * Blockly.Icon.RADIUS - 3}, this.iconGroup_);
  this.iconMark_.appendChild(document.createTextNode('!'));
};

/**
 * Show or hide the warning bubble.
 * @param {boolean} visible True if the bubble should be visible.
 */
Blockly.Warning.prototype.setVisible = function(visible) {
  if (visible == this.isVisible()) {
    // No change.
    return;
  }
  if (visible) {
    // Create the bubble.
    var paragraph = Blockly.Warning.textToDom_(this.text_);
    this.bubble_ = new Blockly.Bubble(
        /** @type {!Blockly.Workspace} */ (this.block_.workspace),
        paragraph, this.block_.svgPath_,
        this.iconX_, this.iconY_, null, null);
    if (Blockly.RTL) {
      // Right-align the paragraph.
      // This cannot be done until the bubble is rendered on screen.
      var maxWidth = paragraph.getBBox().width;
      for (var x = 0, textElement; textElement = paragraph.childNodes[x]; x++) {
        textElement.setAttribute('text-anchor', 'end');
        textElement.setAttribute('x', maxWidth + Blockly.Bubble.BORDER_WIDTH);
      }
    }
    this.updateColour();
    // Bump the warning into the right location.
    var size = this.bubble_.getBubbleSize();
    this.bubble_.setBubbleSize(size.width, size.height);
  } else {
    // Dispose of the bubble.
    this.bubble_.dispose();
    this.bubble_ = null;
    this.body_ = null;
  }
};

/**
 * Bring the warning to the top of the stack when clicked on.
 * @param {!Event} e Mouse up event.
 * @private
 */
Blockly.Warning.prototype.bodyFocus_ = function(e) {
  this.bubble_.promote_();
};

/**
 * Set this warning's text.
 * @param {string} text Warning text.
 */
Blockly.Warning.prototype.setText = function(text) {
  if (this.text_ == text) {
    return;
  }
  this.text_ = text;
  if (this.isVisible()) {
    this.setVisible(false);
    this.setVisible(true);
  }
};

/**
 * Dispose of this warning.
 */
Blockly.Warning.prototype.dispose = function() {
  this.block_.warning = null;
  Blockly.Icon.prototype.dispose.call(this);
};
