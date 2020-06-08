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


import 'bootstrap/js/modal';
import 'jquery-validation';
import {displayProjectName} from './editor.js';
import {getProjectInitialState} from './project';

/**
 *  Validate the required elements of the edit project form
 *
 * @return {boolean}
 */
function validateEditProjectForm() {
  // Select the form element
  const projectElement = $('#edit-project-form');

  // Validate the jQuery object based on these rules. Supply helpful
  // error messages to use when a rule is violated
  projectElement.validate({
    rules: {
      'edit-project-name': 'required',
      'edit-project-board-type': 'required',
    },
    messages: {
      'edit-project-name': 'Please enter a project name',
      'edit-project-board-type': 'Please select a board type',
    },
  });

  return !!projectElement.valid();
}

/**
 *  Present the Edit Project Details modal dialog box
 *
 *  The onClick event handlers for the Cancel and Continue buttons
 *  will manage the project state as required.
 */
export function editProjectDetails() {
  const project = getProjectInitialState();

  // Set the dialog buttons click event handlers
  setEditOfflineProjectDetailsContinueHandler();
  setEditOfflineProjectDetailsCancelHandler();
  setEditOfflineProjectDetailsEnterHandler();

  // Load the current project details into the html form data
  $('#edit-project-name').val(project.name);
  $('#edit-project-description').val(project.description);

  // Display project board type.
  const elementProjectBoardType = $('#edit-project-board-type-ro');
  elementProjectBoardType.html(project.boardType.name.toUpperCase());

  // Display the project create and last modified time stamps
  const createDate = new Date(project.created);
  const modifiedDate = new Date(project.modified);
  $('#edit-project-created-date-ro').html(createDate.toLocaleDateString());
  $('#edit-project-last-modified-ro').html(modifiedDate.toLocaleDateString());

  // Show the dialog
  $('#edit-project-dialog').modal({keyboard: false, backdrop: 'static'});
}

/**
 *  Handle the Enter key press when processing a form
 */
function setEditOfflineProjectDetailsEnterHandler() {
  // Ignore <enter> key pressed in a form field
  $('#edit-project-dialog').on('keydown', (e) => {
    // Let it go if the user is in the description textarea
    if (document.activeElement.id === 'edit-project-description') {
      return;
    }

    if (e.key === 'Enter') {
      if (!validateEditProjectForm()) {
        e.preventDefault();
        // eslint-disable-next-line no-invalid-this
        $(this).trigger('submit');
      } else {
        $('#new-project-dialog').modal('hide');
        // Update project details.
        updateProjectDetails();
      }
    }
  });
}

/**
 *  Edit Project Details - Continue button onClick event handler
 */
function setEditOfflineProjectDetailsContinueHandler() {
  $('#edit-project-continue').on('click', function() {
    // verify that the project contains a valid board type and project name
    if (validateEditProjectForm()) {
      // Hide the Edit Project modal dialog
      $('#edit-project-dialog').modal('hide');

      updateProjectDetails();
    }
  });
}

/**
 * Update the name and description details of the current project from the
 * DOM elements for those fields
 */
function updateProjectDetails() {
  updateProjectNameDescription(
      $('#edit-project-name').val(),
      $('#edit-project-description').val()
  );
}

/**
 * Update the project object name and description
 * @param {string} newName
 * @param {string} newDescription
 */
function updateProjectNameDescription(newName, newDescription) {
  const project = getProjectInitialState();

  if (!(project.name === newName)) {
    project.name = newName;
    displayProjectName(project.name);
  }

  if (!(project.description === newDescription)) {
    project.description = newDescription;
  }
}

/**
 *  Edit Project Details - Cancel button onClick event handler
 */
function setEditOfflineProjectDetailsCancelHandler() {
  $('#edit-project-cancel').on('click', () => {
    // if the project is being edited, clear the fields and close the modal
    $('#edit-project-board-dropdown').removeClass('hidden');
    $('#edit-project-details-ro').addClass('hidden');
    $('#edit-project-board-type-select').val('');

    $('#edit-project-board-type-ro').html('');
    $('#edit-project-created-date-ro').html('');
    $('#edit-project-last-modified-ro').html('');

    // Hide the Edit Project modal dialog
    $('#edit-project-dialog').modal('hide');
  });
}

