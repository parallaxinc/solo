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

/**
 *  Update the state of the Compiler toolbar buttons
 *
 * @param {boolean} connected - is the client launcher connected
 *
 * @constructor
 */
const propToolbarButtonController = (connected) => {
  const project = getProjectInitialState();

  // No buttons are valid if there is no project.
  if (!project) {
    console.log('No active project. Disabling all buttons.');
    disableButtons();
    return;
  }

  // if (projectData && projectData.board === 's3') {
  if (project.boardType.name === 's3') {
    console.log('Updating toolbar for S3 project options');
    /* ----------------------------------------------------------------
     * Hide the buttons that are not required for the S3 robot
     *
     * Find all of the HTML elements that have a class id of 'no-s3'
     * and append a hidden attribute to the selected HTML elements.
     * This currently applies to the elements prop-btn-ram and
     *  prop-btn-graph.
     * --------------------------------------------------------------*/
    $('.no-s3').addClass('hidden');

    // Toggle the client available message to display the short form
    $('#client-available').addClass('hidden');
    $('#client-available-short').removeClass('hidden');
  } else {
    console.log('Updating toolbar for non-S3 project options');
    // Reveal these buttons
    $('.no-s3').removeClass('hidden');

    // Toggle the client available message to display the long form
    $('#client-available').removeClass('hidden');
    $('#client-available-short').addClass('hidden');
  }

  // Update elements when we are connected
  if (connected) {
    // Hide the 'client unavailable' message
    $('#client-unavailable').addClass('hidden');

    /* Enable these buttons:
         *   Compile to RAM
         *   Compile to EEPROM
         *   Open Terminal
         *   Open graphing window
         */
    $('.client-action').removeClass('disabled');
  } else {
    console.log('No client connected. Disabling the loader options');
    disableButtons();
  }
};

/**
 * Disable the toolbar buttons
 */
function disableButtons() {
  // Disable the toolbar buttons
  $('#client-unavailable').removeClass('hidden');
  $('#client-available').addClass('hidden');
  $('#client-available-short').addClass('hidden');
  $('.client-action').addClass('disabled');
}

export {propToolbarButtonController};
