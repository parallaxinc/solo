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

import {hasCode} from './blocklyc';
import {getProjectInitialState} from './project.js';
import {clientService, serviceConnectionTypes} from './client_service';


/**
 *  Update the state of the Compiler toolbar buttons
 */
export function propToolbarButtonController() {
  // Use activeConnection for WebSockets and available for BP Client
  if (clientService.activeConnection || clientService.available) {
    // Replace the no client found on the UI with a happy message
    clientConnectionUpdateUI(true);
  } else {
    clientConnectionUpdateUI(false);
  }

  const project = getProjectInitialState();
  let isS3boardType = false;

  if (!project) {
    // No project loaded. Turn off all visible buttons
    disableButtons(false);
    return;
  } else {
    // Determine if project board type is an S3
    if (project.boardType.name === 's3') {
      isS3boardType = true;
    }

    if (!hasCode()) {
      // There is a project without any blocks defined
      disableButtons(false, isS3boardType);
      return;
    }
  }
  // The compile button should always be available when a project
  // is loaded and there is at least one block defined in the project
  setCompileButtonState(true, true);

  // Set buttons available based on project type
  if (isS3boardType) {
    setS3UIButtonGroupDisabled();
    isS3boardType = true;
  } else {
    setUIButtonGroupDisabled();
  }

  // Use activeConnection for WebSockets and available for BP Client
  if (clientService.activeConnection ||
      (clientService.available &&
       clientService.type === serviceConnectionTypes.WS )) {
    if (clientService.portsAvailable &&
        clientService.portList.length > 0 &&
        clientService.getSelectedPort().length > 0) {
      if (isS3boardType) {
        setS3UIButtonGroup();
      } else {
        setUIButtonGroup();
      }
    } else {
      disableUIButtonGroup(isS3boardType);
    }
  } else {
    clientConnectionUpdateUI(false);
    disableButtons(true, isS3boardType);
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
 * @param {boolean?} isScribblerProject is true if the project has a
 *  board type of S3
 */
function disableButtons(isProject, isScribblerProject = false) {
  if (!isProject) {
    setCompileButtonState(true, false);
  }
  if (isScribblerProject) {
    setLoadEEPROMButtonState(false, false);
    setGraphButtonState(false, false);
  } else {
    setLoadEEPROMButtonState(true, false);
    setGraphButtonState(true, false);
  }
  setLoadRAMButtonState(true, false);
  setTerminalButtonState(true, false);
}

/**
 * Disable the UI buttons for a non-S3 project
 * @param {boolean} isS3Project
 */
function disableUIButtonGroup(isS3Project) {
  if (isS3Project) {
    setLoadEEPROMButtonState(false, false);
    setGraphButtonState(false, false);
  } else {
    setLoadEEPROMButtonState(true, false);
    setGraphButtonState(true, false);
  }
  setLoadRAMButtonState(true, false);
  setTerminalButtonState(true, false);
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
 * Set the UI buttons for an S3 project
 */
function setS3UIButtonGroupDisabled() {
  setLoadRAMButtonState(false, false);
  setLoadEEPROMButtonState(true, false);
  setTerminalButtonState(true, false);
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
 * Set the UI buttons for a non-S3 project
 */
function setUIButtonGroupDisabled() {
  // setCompileButtonState(true, true);
  setLoadRAMButtonState(true, false);
  setLoadEEPROMButtonState(true, false);
  setTerminalButtonState(true, false);
  setGraphButtonState(true, false);
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
