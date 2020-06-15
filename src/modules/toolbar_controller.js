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

import Blockly from 'blockly/core';

import {Project, getProjectInitialState} from './project.js';
import {clientService, serviceConnectionTypes} from './client_service';
import {logConsoleMessage} from './utility';


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
        clientService.portList[0].length > 0) {
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

/**
 * Initialize the tool bar icons
 *
 * @description
 * Locate each element that has a class 'bpIcon' assigned and contains a
 * 'data-icon' attribute. Iterate through each match and draw the custom
 * icons into the specified element.
 */
export function initToolbarIcons() {
  /**
   * WIP - TODO: generate svg icons and inject them (search for glyphicon
   *          and font-awesome and replace them).
   *
   * These are string representations of inline SVG elements to be used as
   * icons using JS to inject these into the HTML keeps the HTML simpler
   * and cleaner.
   *
   * @type {object}
   */
  const bpIcons = {
    // eslint-disable-next-line max-len
    warningCircle: '<svg width="15" height="15"><path d="M7,8 L8,8 8,11 8,11 7,11 Z" style="stroke-width:1px;stroke:#8a6d3b;fill:none;"/><circle cx="7.5" cy="7.5" r="6" style="stroke-width:1.3px;stroke:#8a6d3b;fill:none;"/><circle cx="7.5" cy="5" r="1.25" style="stroke-width:0;fill:#8a6d3b;"/></svg>',

    // eslint-disable-next-line max-len
    dangerTriangleBlack: '<svg width="15" height="15"><path d="M1,12 L2,13 13,13 14,12 8,2 7,2 1,12 Z M7.25,6 L7.75,6 7.5,9 Z" style="stroke-width:1.5px;stroke:#000;fill:none;"/><circle cx="7.5" cy="10.75" r="1" style="stroke-width:0;fill:#000;"/><circle cx="7.5" cy="5.5" r="1" style="stroke-width:0;fill:#000;"/></svg>',

    // eslint-disable-next-line max-len
    dangerTriangle: '<svg width="15" height="15"><path d="M1,12 L2,13 13,13 14,12 8,2 7,2 1,12 Z M7.25,6 L7.75,6 7.5,9 Z" style="stroke-width:1.5px;stroke:#a94442;fill:none;"/><circle cx="7.5" cy="10.75" r="1" style="stroke-width:0;fill:#a94442;"/><circle cx="7.5" cy="5.5" r="1" style="stroke-width:0;fill:#a94442;"/></svg>',

    // eslint-disable-next-line max-len
    checkMarkWhite: '<svg width="14" height="15"><path d="M2.25,6 L5.5,9.25 12,2.5 13.5,4 5.5,12 1,7.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    checkMarkGreen: '<svg width="14" height="15"><path d="M2.25,6 L5.5,9.25 12,2.5 13.5,4 5.5,12 1,7.5 Z" style="stroke:#3c763d;stroke-width:1;fill:#3c763d;"/></svg>',

    // eslint-disable-next-line max-len
    downArrowWhite: '<svg width="14" height="15"><path d="M5.5,0 L8.5,0 8.5,9 12.5,9 7,14.5 1.5,9 5.5,9 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    downArrowBoxWhite: '<svg width="14" height="15"><path d="M5.5,0 L8.5,0 8.5,6 12.5,6 7,11.5 1.5,6 5.5,6 Z M0.5,12 L13.5,12 13.5,14.5 0.5,14.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    terminalWhite: '<svg width="14" height="15"><path d="M3,4.5 L10,4.5 M3,6.5 L6,6.5 M3,8.5 L8,8.5 M1,1 L13,1 13,14 1,14 1,1 M2,0 L12,0 M14,2 L14,13 M12,15 L2,15 M0,2 L0,13" style="stroke:#fff;stroke-width:1;fill:none;"/></svg>',

    // eslint-disable-next-line max-len
    graphWhite: '<svg width="13" height="14"><path d="M.5,0 L.5,13.5 L12.5,13.5 M3.5,0 L3.5,13.5 M6.5,0 L6.5,13.5 M9.5,0 L9.5,13.5 M12.5,0 L12.5,13.5 M.5,3.5 L12.5,3.5 M.5,7 L12.5,7 M.5,10.5 L12.5,10.5 M.5,.5 L12.5,.5" style="stroke:rgba(255,255,255,.6);stroke-width:1;fill:none;"/><path d="M0,13 L6,5 L9,8 L14,2" style="stroke:#fff;stroke-width:2;fill:none;"/></svg>',

    // eslint-disable-next-line max-len
    searchWhite: '<svg width="14" height="15"><path d="M1.5,13.25 L4.5,8.75" style="stroke:#fff;stroke-width:2px;fill:none;"/><circle cx="7" cy="5" r="3.5" style="stroke:#fff;stroke-width:1.5px;fill:none;"></circle></svg>',

    // eslint-disable-next-line max-len
    magicWandWhite: '<svg width="14" height="15"><path d="M1,10 L5,10 5,11 1,11 Z M2,12 L6,12 6,13 2,13 Z M1,14 5,14 5,15 1,15 Z M0.5,2.75 L2.5,0.6 5.5,3.5 3.5,5.5 Z M5,7 L7,4.75 14,12 12,14 Z M0,7 Q1.5,6.5 2,5 Q2.5,6.5 4,7 Q2.5,7.5 2,9 Q1.5,7.5 0,7 Z M7,3 Q9.5,2.5 10,0 Q10.5,2.5 13,3 Q10.5,3.5 10,6 Q9.5,3.5 7,3 Z" style="stroke-width:0;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    undoWhite: '<svg width="15" height="15"><path d="M3.5,6.5 L2.25,4.5 0.75,10.25 6,10.5 5,8.5 Q8.5,5.5 12,7 Q8,3.5 3.5,6.5 Z M11,11 L14.5,11 Q12.5,6 7,8.25 Q11,8 11,11 Z" style="stroke-width:0;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    redoWhite: '<svg width="15" height="15"><path d="M11.5,6.5 L12.75,4.5 14.25,10.25 9,10.5 10,8.5 Q6.5,5.5 3,7 Q7,3.5 11.5,6.5 Z M4,11 L0.5,11 Q2.5,6 8,8.25 Q4,8 4,11 Z" style="stroke-width:0;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    eyeBlack: '<svg width="14" height="15" style="vertical-align: middle;"><path d="M0.5,7 C4,1.5 10,1.5 13.5,7 C10,12.5 4,12.5 0.5,7 M0.5,7 C4,3.5 10,3.5 13.5,7" style="stroke:#000;stroke-width:1.5;fill:none;"/><circle cx="7" cy="6.5" r="2.75" style="stroke:#000;stroke-width:1.5;fill:none;"></circle><circle cx="7" cy="6.5" r=".5" style="stroke:#000;stroke-width:1.5;fill:#000;"></circle></svg>',

    // eslint-disable-next-line max-len
    eyeWhite: '<svg width="14" height="15" style="vertical-align: middle;"><path d="M0.5,7 C4,1.5 10,1.5 13.5,7 C10,12.5 4,12.5 0.5,7 M0.5,7 C4,3.5 10,3.5 13.5,7" style="stroke:#fff;stroke-width:1.5;fill:none;"/><circle cx="7" cy="6.5" r="2.75" style="stroke:#fff;stroke-width:1.5;fill:none;"></circle><circle cx="7" cy="6.5" r=".5" style="stroke:#fff;stroke-width:1.5;fill:#fff;"></circle></svg>',

    // eslint-disable-next-line max-len
    playWhite: '<svg width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    pauseWhite: '<svg width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    fileWhite: '<svg width="14" height="15"><path d="M2,.5 L2,13.5 12,13.5 12,7.5 5.5,7.5 5.5,.5 Z M 8,1.5 L8,5 11,5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;" fill-rule="evenodd"/></svg>',

    // eslint-disable-next-line max-len
    eraserWhite: '<svg width="15" height="15"><path d="M2,12 A1.5,1.5 0 0 1 2,10 L10,2 14.5,6.5 7,14 M10,11 L5.5,6.5 M15,14 L4,14 2,12 M15,13.2 5,13.2" style="stroke:#fff;stroke-width:1;fill:none;"/><path d="M2,12 A1.5,1.5 0 0 1 2,10 L5.5,6.5 10,11 7,14 4,14 Z" style="stroke-width:0;fill:#fff;"/></svg>',

    // eslint-disable-next-line max-len
    cameraWhite: '<svg width="14" height="15"><path d="M1.5,13.5 L.5,12.5 .5,5.5 1.5,4.5 2.5,4.5 4,3 7,3 8.5,4.5 12.5,4.5 13.5,5.5 13.5,12.5 12.5,13.5 Z M 2,9 A 4,4,0,0,0,10,9 A 4,4,0,0,0,2,9 Z M 4.5,9 A 1.5,1.5,0,0,0,7.5,9 A 1.5,1.5,0,0,0,4.5,9 Z M 10.5,6.5 A 1,1,0,0,0,13.5,6.5 A 1,1,0,0,0,10.5,6.5 Z" style="stroke:#fff;stroke-width:1;fill:#fff;" fill-rule="evenodd"/></svg>',
  };

  $('.bpIcon').each(function(key, value ) {
    // logConsoleMessage(
    //  eslint-disable-next-line max-len
    // `Init icons: ${key}, ${value.dataset.icon}, icon:${value.dataset.icon}`);
    $(value).html(bpIcons[value.dataset.icon]);
  });
}

/**
 * Are there any blocks in the Blockly workspace
 * @return {boolean}
 */
function hasCode() {
  let result = false;
  if (Blockly) {
    if (Blockly.Xml) {
      if (Blockly.mainWorkspace) {
        const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        const text = Blockly.Xml.domToText(xml);
        const emptyHeader = Project.getTerminatedEmptyProjectCodeHeader();
        if (text !== emptyHeader) {
          result = true;
        }
      }
    }
  }
  return result;
}
