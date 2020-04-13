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

import {getProjectInitialState} from './project.js';
import {clientService} from './blocklyc';

/**
 *  Update the state of the Compiler toolbar buttons
 */
function propToolbarButtonController() {
  const project = getProjectInitialState();

  // No buttons are valid if there is no project.
  if (!project) {
    disableButtons(false);
    return;
  }

  // The compile button should always be available when a project is loaded
  setCompileButtonState(true, true);

  // Update elements when we are connected
  if (clientService.activeConnection) {
    clientConnectionUpdateUI(true);

    if (clientService.portsAvailable) {
      if (project.boardType.name === 's3') {
        setS3UIButtonGroup();
      } else {
        setUIButtonGroup();
      }
    } else {
      disableUIButtonGroup();
    }
  } else {
    clientConnectionUpdateUI(false);
    disableButtons(true);
  }
}

/**
 * Update client connection UI elements
 * @param {boolean} state is true if client is detected, otherwise false
 */
function clientConnectionUpdateUI(state) {
  if (state) {
    // Hide the 'client unavailable' message and show the
    // port selection message
    $('#client-available').removeClass('hidden');
    $('#client-unavailable').addClass('hidden');
  } else {
    // Client has not been detected. Show the 'client unavailable' message
    $('#client-available').addClass('hidden');
    $('#client-unavailable').removeClass('hidden');
  }
}

/**
 * Disable the toolbar buttons
 * @param {boolean} isProject is true if a project is loaded
 */
function disableButtons(isProject) {
  if (!isProject) {
    setCompileButtonState(true, false);
  }
  setLoadRAMButtonState(true, false);
  setLoadEEPROMButtonState(true, false);
  setTerminalButtonState(true, false);
  setGraphButtonState(true, false);
}

/**
 * Disable the UI buttons for a non-S3 project
 */
function disableUIButtonGroup() {
  setLoadRAMButtonState(true, false);
  setLoadEEPROMButtonState(true, false);
  setTerminalButtonState(true, false);
  setGraphButtonState(true, false);
}

/**
 * Set the UI buttons for an S3 project
 */
function setS3UIButtonGroup() {
  setLoadRAMButtonState(false, false);
  setLoadEEPROMButtonState(true, true);
  setTerminalButtonState(true, true);
  setGraphButtonState(false, false);
}

/**
 * Set the UI buttons for a non-S3 project
 */
function setUIButtonGroup() {
  // setCompileButtonState(true, true);
  setLoadRAMButtonState(true, true);
  setLoadEEPROMButtonState(true, true);
  setTerminalButtonState(true, true);
  setGraphButtonState(true, true);
}

/**
 * Manage the Compile button UI
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setCompileButtonState(visible, enabled) {
  const element = $('#prop-btn-comp');
  if (element) {
    setUIControlState(element, visible, enabled);
  }
}

/**
 * Manage the Load to RAM button UI
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setLoadRAMButtonState(visible, enabled) {
  const element = $('#prop-btn-ram');
  if (element) {
    setUIControlState(element, visible, enabled);
  }
}

/**
 * Manage the Load to EEPROM button UI
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setLoadEEPROMButtonState(visible, enabled) {
  const element = $('#prop-btn-eeprom');
  if (element) {
    setUIControlState(element, visible, enabled);
  }
}

/**
 * Manage the Display Terminal button UI
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setTerminalButtonState(visible, enabled) {
  const element = $('#prop-btn-term');
  if (element) {
    setUIControlState(element, visible, enabled);
  }
}

/**
 * Manage the Display Graph button UI
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setGraphButtonState(visible, enabled) {
  const element = $('#prop-btn-graph');
  if (element) {
    setUIControlState(element, visible, enabled);
  }
}

/**
 * Generic UI control state manager
 * @param {Object} element is the HTML element to act upon
 * @param {boolean} visible Is the button visible
 * @param {boolean} enabled Is the button clickable
 */
function setUIControlState(element, visible, enabled) {
  // Set element visibility
  if (visible) {
    element.removeClass('hidden');

    // Enable/disable element
    if (enabled) {
      element.removeClass('disabled');
    } else {
      element.addClass('disabled');
    }
  } else {
    element.addClass('hidden');
  }
}
export {propToolbarButtonController};
