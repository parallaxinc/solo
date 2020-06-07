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
import Blockly from 'blockly/core';

import {TEMP_PROJECT_STORE_NAME} from './constants.js';

import {isProjectChanged} from './editor.js';
import {resetToolBoxSizing, displayProjectName} from './editor.js';
import {uploadHandler, uploadMergeCode} from './editor.js';
import {getProjectInitialState} from './project';

// eslint-disable-next-line camelcase
import {page_text_label} from './blockly/language/en/messages.js';
import {utils, logConsoleMessage} from './utility';

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


/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/*  Import Project Modal Dialog Handlers                                     */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */


/**
 * Import project file from disk
 */
export function importProjectFromStorage() {
  logConsoleMessage(`Launching Import Project dialog process.`);
  initUploadModalLabels();

  // Reject import request if the current project has
  // not been persisted to storage
  if (isProjectChanged()) {
    logConsoleMessage(`Project change detected before import`);
    utils.showMessage(
        Blockly.Msg.DIALOG_UNSAVED_PROJECT,
        Blockly.Msg.DIALOG_SAVE_BEFORE_ADD_BLOCKS);
  } else {
    // Reset the import/append modal to its default state when closed
    const dialog = $('#import-project-dialog');
    dialog.on('hidden.bs.modal', () => {
      resetUploadImportDialog();
    });
    importProjectSetCallbacks();
    window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
    dialog.modal({keyboard: false, backdrop: 'static'});
  }
}

/**
 * Set the upload modal's title to "import"
 */
export function initUploadModalLabels() {
  logConsoleMessage(`Setting dialog labels`);
  $('#import-project-dialog-title').html(page_text_label['editor_import']);
  $('#import-project-dialog span').html(page_text_label['editor_import']);

  // Hide the save-as button.
  $('#save-project-as, #save-as-btn').addClass('hidden');

  // Disable the import dialog Append and Replace buttons
  logConsoleMessage(`Disabling the Import Project Append and Replace buttons`);
  document.getElementById('selectfile-replace').disabled = true;
  document.getElementById('selectfile-append').disabled = true;
}

/**
 * Set up the dialog "Choose File" onChange handler
 */
function importProjectSetCallbacks() {
  logConsoleMessage(`Setting Import Project callbacks`);
  // Attach handler to process a project file when it is selected in the
  // Import Project File hamburger menu item.
  const selectControl = document.getElementById('selectfile');
  selectControl.addEventListener('change', (e) => {
    logConsoleMessage(`SelectFile onChange event: ${e.message}`);
    uploadHandler(e.target.files);
    logConsoleMessage(`We should expect to eventually see a project file.`);
    // const localProject = projectJsonFactory(
    //     JSON.parse(
    //         window.localStorage.getItem(LOCAL_PROJECT_STORE_NAME)));
    // setupWorkspace(localProject, function() {
    //   window.localStorage.removeItem(LOCAL_PROJECT_STORE_NAME);
    // });
    //
    // // Create an instance of the CodeEditor class
    // codeEditor = new CodeEditor(localProject.boardType.name);
    // if (!codeEditor) {
    //   console.log('Error allocating CodeEditor object');
    // }
    //
    // // Set the compile toolbar buttons to unavailable
    // propToolbarButtonController();
  });

  // Clear the select project file dialog event handler
  $('#selectfile-cancel-button').on('click', () => {
    cancelImportProjectHandler();
  });

  // Import project modal dialog Replace Project button onClick event handler
  $('#selectfile-replace').on('click', () => uploadMergeCode(false));

  // Import project modal dialog Append Project button onClick event handler
  $('#selectfile-append').on('click', () => uploadMergeCode(true));
}

/**
 * Import Project Cancel button click event handler
 */
function cancelImportProjectHandler() {
  logConsoleMessage(`The import has been cancelled.`);
  window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
}
/**
 * Reset the upload/import modal window to defaults after use
 */
function resetUploadImportDialog() {
  // reset the title of the modal
  $('import-project-dialog-title').html(page_text_label['editor_import']);

  // hide "append" button
  $('#selectfile-append').removeClass('hidden');

  // change color of the "replace" button to blue and change text to "Open"
  $('#selectfile-replace')
      .removeClass('btn-primary')
      .addClass('btn-danger')
      .html(page_text_label['editor_button_replace']);

  // reset the blockly toolbox sizing to ensure it renders correctly:
  // eslint-disable-next-line no-undef
  resetToolBoxSizing(100);
}
