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

import * as Cookies from 'js-cookie';
import {createNewProject, resetToolBoxSizing} from '../editor';
import {getProjectInitialState, ProjectProfiles} from '../project';
// eslint-disable-next-line camelcase
import {getHtmlText} from '../blockly/language/en/page_text_labels';
import {logConsoleMessage} from '../utility';
import {isExperimental} from '../url_parameters';


/**
 * New Project dialog window
 * @type {{
 *    show: newProjectDialog.show,
 *    isEventHandler: boolean,
 *    reset: newProjectDialog.reset,
 *    initEventHandlers: newProjectDialog.initEventHandlers
 *  }}
 */
export const newProjectDialog = {
  /**
   * Are the dialog event handlers initialized
   * @type {boolean} is true if the initializer has been called otherwise false
   */
  isEventHandler: false,

  /**
   * Set up the event callbacks for the new project dialog
   */
  initEventHandlers: function() {
    if (this.isEventHandler) {
      logConsoleMessage(`New Project dialog handlers already initialized`);
      return;
    }

    // Set up element event handlers
    newProjectModalAcceptClick(); // Handle a click on the Open button
    newProjectModalEnterClick(); // Handle the user pressing the Enter key
    newProjectModalCancelClick(); // Handle a click on the Cancel button
    newProjectModalEscapeClick(); // Handle user clicking on the 'x' icon

    this.isEventHandler = true;
  },

  /**
   *  Displays the new project modal.
   *
   *  Modal dialog that presents user with options to provide a project
   *  name, a description and drop down menu to select a project board
   *  type.
   *
   *  The modal provides options to cancel, escape and accept the new
   *  project details. If accepted, the accept button callback will
   *  update the global project object with a new, empty project.
   */
  show: function() {
    if (!this.isEventHandler) {
      logConsoleMessage(`Initialize New Project dialog event handlers first.`);
      return;
    }

    this.reset();
    populateProjectBoardTypesUIElement();

    // Show the New Project modal dialog box
    $('#new-project-dialog').modal({keyboard: false, backdrop: 'static'});

    // Populate the time stamp fields
    // TODO: These settings only apply to the Edit Project dialog
    const projectTimestamp = new Date();
    $('#edit-project-created-date').html(projectTimestamp);
    $('#edit-project-last-modified').html(projectTimestamp);
  },

  /**
   * Reset the New Project modal input fields
   */
  reset: function() {
    // Reset the values in the form to defaults
    $('#new-project-name').val('');
    $('#new-project-description').val('');
    $('#new-project-dialog-title').html(getHtmlText('editor_new_project_title'));
  },
};

/**
 * Handle the <enter> keypress in the modal form
 */
function newProjectModalEnterClick() {
  // Ignore <enter> key pressed in a form field
  $('#new-project-dialog').on('keydown', function(e) {
    // Let it go if the user is in the description textarea
    if (document.activeElement.id === 'new-project-description') {
      return;
    }

    // The Enter key was pressed
    if (e.key === 'Enter') {
      if (!validateNewProjectForm()) {
        e.preventDefault();
        // eslint-disable-next-line no-invalid-this
        $(this).trigger('submit');
      } else {
        $('#new-project-dialog').modal('hide');
        // Clear the action cookie
        Cookies.remove('action');
        createNewProject();
      }
    }
  });
}

/**
 *  New project modal Accept button onClick handler
 */
function newProjectModalAcceptClick() {
  // Click event handler. When the user clicks the 'Continue'
  // button, validate the form
  // --------------------------------------------------------------
  $('#new-project-continue').on('click', function() {
    // verify that the project contains a valid board type and project name
    if (validateNewProjectForm()) {
      $('#new-project-dialog').modal('hide');
      // Clear the action cookie
      Cookies.remove('action');
      createNewProject();
    }
    // TODO: Add test for existing project before resizing
    // use a short delay to ensure the DOM is fully ready
    // (TODO: may not be necessary)
    // eslint-disable-next-line no-undef
    resetToolBoxSizing(100);
  });
}

/**
 *  New project modal Cancel button onClick handler
 */
function newProjectModalCancelClick() {
  // Set up the click even handler for the "New Project" modal
  // dialog return to the splash screen if the user clicks the
  // cancel button
  // ----------------------------------------------------------
  // This is also handling the 'Edit Project Details' modal
  // dialog box
  // ----------------------------------------------------------
  $('#new-project-cancel').on('click', () => {
    // Dismiss the modal in the UX
    $('#new-project-dialog').modal('hide');
    // Clear the action cookie
    Cookies.remove('action');

    if (! getProjectInitialState() ||
        typeof(getProjectInitialState().board) === 'undefined' ) {
      // If there is no project, go to home page.
      // window.location.href = 'index.html' + window.getAllURLParameters();
    }

    // if the project is being edited, clear the fields and close the modal
    $('#new-project-board-dropdown').removeClass('hidden');
    $('#edit-project-details-static').addClass('hidden');

    $('#new-project-board-type').val('');
    $('#edit-project-board-type').html('');
    $('#edit-project-created-date').html('');
    $('#edit-project-last-modified').html('');
  });
}

/**
 * New project modal 'x' click handler
 *
 * This is fired when the user clicks on the 'x' to dismiss
 * the dialog.
 */
function newProjectModalEscapeClick() {
  // Trap the modal event that fires when the modal window is
  // closed when the user clicks on the 'x' icon.
  $('#new-project-dialog').on('hidden.bs.modal', function() {
    if (!getProjectInitialState() ||
        typeof(getProjectInitialState().board) === 'undefined') {
      // If there is no project, go to home page.
      // window.location.href = 'index.html';
    }
  });
}

/**
 * Populate the UI Project board type drop-down list
 * @description
 * element is the <select> HTML element that will be populated with a
 * collection of possible board types
 *
 * selected is an optional string parameter
 * containing the board type in the list that should be designated as the
 * selected board type.
 */
function populateProjectBoardTypesUIElement() {
  const element = $('#new-project-board-type');
  if (!element) {
    logConsoleMessage(`Unable to find Board Type UI element.`);
    return;
  }

  // Clear out the board type dropdown menu
  const length = element[0].options.length;
  for (let i = length-1; i >= 0; i--) {
    element[0].options[i].remove();
  }

  // Populate the board type dropdown menu with a header first,
  element.append($('<option />')
      .val('')
      .text(getHtmlText('project_create_board_type_select'))
      .attr('disabled', 'disabled')
      .attr('selected', 'selected'),
  );

  // then populate the dropdown with the board types
  // defined in propc.js in the 'profile' object
  // (except 'default', which is where the current project's type is stored)
  for (const board in ProjectProfiles) {
    if (Object.prototype.hasOwnProperty.call(ProjectProfiles, board)) {
      if (board !== 'default') {
        // Use the experimental tag to show code-only view
        if (board !== 'propcfile' ||
            (board === 'propcfile' &&
                isExperimental.indexOf('propc') > -1)) {
          if (board !== 'unknown') {
            // Exclude the 'unknown' board type. It is used only when
            // something has gone wrong during a project load operation
            element.append($('<option />')
                .val(ProjectProfiles[board].name)
                .text(ProjectProfiles[board].description));
          }
        }
      }
    }
  }
}

/**
 * Verify that the project name and board type form fields have data
 *
 * @return {boolean} True if form contains valid data, otherwise false
 */
function validateNewProjectForm() {
  // Get a reference to the input form element
  const projectElement = $('.proj');

  // Validate the jQuery object based on these rules. Supply helpful
  // error messages to use when a rule is violated
  projectElement.validate({
    rules: {
      'new-project-name': 'required',
      'new-project-board-type': 'required',
    },
    messages: {
      'new-project-name': 'Please enter a project name',
      'new-project-board-type': 'Please select a board type',
    },
  });

  return !!projectElement.valid();
}
