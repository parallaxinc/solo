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
import * as Cookies from 'js-cookie';

import {LOCAL_PROJECT_STORE_NAME} from './constants.js';
import {TEMP_PROJECT_STORE_NAME} from './constants.js';

import {createNewProject, isProjectChanged, insertProject} from './editor.js';
import {resetToolBoxSizing, displayProjectName} from './editor.js';
import {uploadHandler, uploadMergeCode} from './editor.js';

import {isExperimental} from './url_parameters.js';
import {getProjectInitialState, ProjectProfiles} from './project.js';
import {Project, projectJsonFactory} from './project';

// eslint-disable-next-line camelcase
import {page_text_label} from './blockly/language/en/messages.js';
import {utils, logConsoleMessage} from './utility';

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/*  New Project Modal Dialog Handlers                                        */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

/**
 * Start the process to open a new project
 *
 * @description
 * This is code that was refactored out of the editor.js
 * document.ready() handler.
 */
export function newProjectModal() {
  // If the current project has been modified, give the user an opportunity
  // to abort the new project process.
  if (isProjectChanged()) {
    const promiseFn = () => {
      return new Promise((resolve, reject) => {
        utils.confirm(
            'Abandon Current Project',
            `The current project has been modified. Click OK to\n
    discard the current changes and create a new project.`,
            (result) => {
              // result is true if the OK button was selected
              if (result) {
                reject( new Error('User wishes to keep existing project'));
              } else {
                resolve(true);
              }
            },
            'Cancel',
            'OK'
        );
      });
    };

    promiseFn()
        .then(() => {
          logConsoleMessage(`Opening New Project modal...`);
          showNewProjectModal();
        })
        .catch((e) => {
          logConsoleMessage(`ThenCatch: ${e.message}`);
        });
  } else {
    // Open up a modal window to get new project details.
    showNewProjectModal();
  }
}

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
function showNewProjectModal() {
  resetNewProjectModalUI();

  // Set up element event handlers
  newProjectModalCancelClick(); // Handle a click on the Cancel button
  newProjectModalAcceptClick(); // Handle a click on the Open button
  newProjectModalEnterClick(); // Handle the user pressing the Enter key
  newProjectModalEscapeClick(); // Handle user clicking on the 'x' icon

  populateProjectBoardTypesUIElement();

  // Show the New Project modal dialog box
  $('#new-project-dialog').modal({keyboard: false, backdrop: 'static'});

  // Populate the time stamp fields
  // TODO: These settings only apply to the Edit Project dialog
  const projectTimestamp = new Date();
  $('#edit-project-created-date').html(projectTimestamp);
  $('#edit-project-last-modified').html(projectTimestamp);
}

/**
 * Reset the New Project modal input fields
 */
function resetNewProjectModalUI() {
  // Reset the values in the form to defaults
  $('#new-project-name').val('');
  $('#new-project-description').val('');
  $('#new-project-dialog-title')
      .html(page_text_label['editor_new_project_title']);
}
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
 * Verify that the project name and board type form fields have data
 *
 * @return {boolean} True if form contains valid data, otherwise false
 */
function validateNewProjectForm() {
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

/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/*  Open Project Modal Dialog Handlers                                       */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

/**
 *  Open the modal to select a project file to load
 *
 *  @description
 *  If the user selects a file and successfully uploads it, the
 *  project will be stored in localStorage.TEMP_PROJECT_STORE_NAME.
 *  The form Accept button handler should look there when it is
 *  time to process the new project.
 */
export function openProjectModal() {
  // Save a copy of the original project in case the page gets reloaded
  if (getProjectInitialState() &&
      getProjectInitialState().name !== 'undefined') {
    window.localStorage.setItem(
        LOCAL_PROJECT_STORE_NAME,
        JSON.stringify(getProjectInitialState()));
  }

  // Has the project been revised. If it has, offer to persist it before
  // opening a new project
  if (!isProjectChanged()) {
    openProject();
  } else {
    const message =
        'The current project has been modified. Click Yes to\n' +
        'discard the current changes and open an existing project.';

    utils.confirmYesNo(
        'Checking Project Changes',
        message,
        function(result) {
          if (result) {
            openProject();
          }
        });
  }
}

/**
 * Open a modal dialog to prompt user for the project file name
 */
function openProject() {
  openProjectModalSetHandlers();

  // set title to Open file
  $('#open-project-dialog-title').html(page_text_label['editor_open']);

  // Clear any previous filename
  const filenameInput = $('#open-project-select-file');
  if (filenameInput.length > 0) {
    const filename = filenameInput[0].value;
    if (filename.length > 0) {
      filenameInput[0].value = '';
    }
  }

  // Open the modal dialog. The event handlers will take it from here.
  logConsoleMessage(`Open Project modal is opening`);
  $('#open-project-dialog').modal({
    keyboard: false,
    backdrop: 'static',
    show: true,
  });
}

/**
 * Set up the callbacks for the open project modal dialog
 */
function openProjectModalSetHandlers() {
  openProjectModalCancelClick();
  openProjectModalOpenClick();
  openProjectModalEscapeClick();
}


/**
 * Connect an event handler to the 'Open' button in the Open
 * Project modal dialog.
 *
 * @description
 * When a project is selected, the code responsible for retrieving the project
 * from disk, uploadHandler(), will store it in the browser's localStorage
 * under the key value TEMP_PROJECT_STORE_NAME. That same code will return
 * control to the Open Project modal, where the user can select Open or
 * Cancel.
 *
 * This event handler is invoked when the user selects the Open button. It
 * looks for a project in the browser's local storage with a key value of
 * TEMP_PROJECT_STORE_NAME. If one is found, it simply copies the project
 * to a new key in the browser's local storage with the key
 * LOCAL_PROJECT_STORE_NAME and removes the temporary copy stored in
 * TEMP_PROJECT_STORE_NAME. It then redirects the browser to the editor page,
 * where other code will look for a project in the browser's local storage
 * under the LOCAL_PROJECT_STORE_NAME key and load it into the editor canvas
 * if a project is found there.
 */
function openProjectModalOpenClick() {
  $('#open-project-select-file-open').on('click', () => {
    logConsoleMessage(`User elected to open the project`);
    $('#open-project-dialog').modal('hide');
    if (Cookies.get('action')) {
      Cookies.remove('action');
    }

    // Copy the stored temp project to the stored local project
    const projectJson = window.localStorage.getItem(TEMP_PROJECT_STORE_NAME);
    if (projectJson) {
      const project = projectJsonFactory(JSON.parse(projectJson));
      if (project) {
        insertProject(project);
        return;
      }
    }

    logConsoleMessage('The opened project cannot be found in storage.');
    utils.showMessage(
        `Project Load Error`,
        `Unable to load the project`,
        () => {
          logConsoleMessage(`Possible project load failure`);
        });
  });
}

/**
 * Open project cancel button clicked event handler
 */
function openProjectModalCancelClick() {
  // Set button onClick event handlers
  // ----------------------------------------------------------
  // This is also handling the 'Edit Project Details' modal
  // dialog box
  // ----------------------------------------------------------
  $('#open-project-select-file-cancel').on('click', () => {
    // Dismiss the modal in the UX
    $('#open-project-dialog').modal('hide');

    if (Cookies.get('action')) {
      Cookies.remove('action');
    }
    const project = getProjectInitialState();
    if (!project) {
      logConsoleMessage('Project has disappeared.');
      return;
    }

    if (typeof(project.boardType) === 'undefined') {
      logConsoleMessage('Project board type is undefined');
    }
  });
}

/**
 * Open project escape ('x') click event handler
 */
function openProjectModalEscapeClick() {
  $('#open-project-dialog').on('hidden.bs.modal', () => {
    // Trap the modal event that fires when the modal window is closed when
    // the user clicks on the 'x' icon.
    if (Cookies.get('action')) {
      Cookies.remove('action');
    }
    // Remove the event handler
    $('#open-project-select-file-open').off('click');
  });
}

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


/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/*            HELPER FUNCTIONS                                               */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */

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
      .text(page_text_label['project_create_board_type_select'])
      .attr('disabled', 'disabled')
      .attr('selected', 'selected')
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

      // Optionally set the selected option element
      // if (selected && board === selected) {
      //   $(element).val(selected);
      // }
    }
  }
}
