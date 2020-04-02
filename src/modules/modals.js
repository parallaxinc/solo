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

import {
  LOCAL_PROJECT_STORE_NAME,
  TEMP_PROJECT_STORE_NAME,
} from './constants.js';

import {
  isProjectChanged, resetToolBoxSizing, displayProjectName,
} from './editor.js';

import {isExperimental} from './url_parameters.js';
import {getProjectInitialState} from './project.js';
// eslint-disable-next-line camelcase
import {page_text_label} from './blockly/language/en/messages.js';

/**
 * Start the process to open a new project
 *
 * @description
 * This is code that was refactored out of the editor.js
 * document.ready() handler.
 */
function newProjectModal() {
  // If the current project has been modified, give the user
  // an opportunity to abort the new project process.
  // eslint-disable-next-line no-undef
  if (isProjectChanged()) {
    const message =
            'The current project has been modified. Click OK to\n' +
            'discard the current changes and create a new project.';

    // Default to the Cancel button to prevent inattentive users from
    // inadvertently destroying their projects.
    utils.confirm(
        'Abandon Current Project', message,
        // result is true if the OK button was selected
        (result) => {
          if (!result) {
            // Open up a modal window to get new project details.
            showNewProjectModal();
          }
        },
        'Cancel',
        'OK');
  } else {
    // Reset the values in the form to defaults
    $('#new-project-name').val('');
    $('#new-project-description').val('');
    $('#new-project-dialog-title')
        .html(page_text_label['editor_new_project_title']);

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
  // Set up element event handlers
  newProjectModalCancelClick(); // Handle a click on the Cancel button
  newProjectModalAcceptClick(); // Handle a click on the Open button
  newProjectModalEnterClick(); // Handle the user pressing the Enter key
  newProjectModalEscapeClick(); // Handle user clicking on the 'x' icon


  // let dialog = $("#new-project-board-type");
  populateProjectBoardTypesUIElement($('#new-project-board-type'));

  // Show the New Project modal dialog box
  $('#new-project-dialog').modal({keyboard: false, backdrop: 'static'});

  // Populate the time stamp fields
  // TODO: These settings only apply to the Edit Project dialog
  const projectTimestamp = new Date();
  $('#edit-project-created-date').html(projectTimestamp);
  $('#edit-project-last-modified').html(projectTimestamp);
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

    if (! getProjectInitialState() ||
        typeof(getProjectInitialState().board) === 'undefined' ) {
      // If there is no project, go to home page.
      window.location.href = 'index.html' + window.getAllURLParameters();
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
      window.location.href = 'index.html';
    }
  });
}


/**
 * Verify that the project name and board type form fields have data
 *
 * @return {boolean} True if form contains valid data, otherwise false
 */
function validateNewProjectForm() {
  // Select the 'proj' class
  const project = $('.proj');

  // Validate the jQuery object based on these rules. Supply helpful
  // error messages to use when a rule is violated
  project.validate({
    rules: {
      'new-project-name': 'required',
      'new-project-board-type': 'required',
    },
    messages: {
      'new-project-name': 'Please enter a project name',
      'new-project-board-type': 'Please select a board type',
    },
  });

  return !!project.valid();
}


/**
 *  Validate the required elements of the edit project form
 *
 * @return {boolean}
 */
function validateEditProjectForm() {
  // Select the form element
  const project = $('#edit-project-form');

  // Validate the jQuery object based on these rules. Supply helpful
  // error messages to use when a rule is violated
  project.validate({
    rules: {
      'edit-project-name': 'required',
      'edit-project-board-type': 'required',
    },
    messages: {
      'edit-project-name': 'Please enter a project name',
      'edit-project-board-type': 'Please select a board type',
    },
  });

  return !!project.valid();
}


/**
 *  Open the modal to select a project file to load
 *
 *  @description
 *  If the user selects a file and successfully uploads it, the
 *  project will be stored in localStorage.TEMP_PROJECT_STORE_NAME.
 *  The form Accept button handler should look there when it is
 *  time to process the new project.
 */
function openProjectModal() {
  // Save a copy of the original project in case the page gets reloaded
  if (getProjectInitialState() &&
      getProjectInitialState().name !== 'undefined') {
    window.localStorage.setItem(
        LOCAL_PROJECT_STORE_NAME,
        JSON.stringify(getProjectInitialState()));

    // Has the project been revised. If it has, offer to persist it before
    // opening a new project
    if (isProjectChanged()) {
      const message =
                'The current project has been modified. Click OK to\n' +
                'discard the current changes and open an existing project.';

      utils.confirm(
          'Abandon Current Project', message,
          // result is true if the OK button was selected
          (result) => {
            if (!result) {
              openProjectModalSetHandlers();
            }
          },
          'Cancel',
          'OK');
    } else {
      openProjectModalSetHandlers();
    }
  } else {
    // The project has not changed. Continue with the dialog.
    openProjectModalSetHandlers();
  }
}


/**
 * Set up the callbacks for the open project modal dialog
 */
function openProjectModalSetHandlers() {
  // set title to Open file
  $('#open-project-dialog-title').html(page_text_label['editor_open']);

  openProjectModalCancelClick();
  openProjectModalOpenClick();
  openProjectModalEscapeClick();

  // Import a project .SVG file
  $('#open-project-dialog').modal({keyboard: false, backdrop: 'static'});
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
    // Copy the stored temp project to the stored local project
    const project = window.localStorage.getItem(TEMP_PROJECT_STORE_NAME);
    if (project) {
      window.localStorage.setItem(LOCAL_PROJECT_STORE_NAME, project);
      window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);

      // Redirecting to the editor page. The editor initialization
      // will pick up the project file and present it to the user.
      window.location = 'blocklyc.html';
    } else {
      console.log('The opened project cannot be found in storage.');
      alert('The opened project cannot be found in storage.');
    }
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

    if (!getProjectInitialState() ||
        typeof(getProjectInitialState().board) === 'undefined') {
      // If there is no project, go to home page.
      window.location.href = 'index.html' + window.getAllURLParameters();
    }
  });
}


/**
 * Open project escape ('x') click event handler
 */
function openProjectModalEscapeClick() {
  /* Trap the modal event that fires when the modal window is
     * closed when the user clicks on the 'x' icon.
     */
  $('#open-project-dialog').on('hidden.bs.modal', function() {
    if (!getProjectInitialState() ||
        typeof getProjectInitialState().boardType.name === 'undefined') {
      // If there is no project, go to home page.
      window.location.href = 'index.html';
    }
  });
}


/**
 * Dialog box to allow editing project name and description
 *
 * @description
 * The dialog displays a number of project details.
 */
function editProjectDetails() {
  editOfflineProjectDetails();
}


/**
 *  Present the Edit Project Details modal dialog box
 *
 *  The onClick event handlers for the Cancel and Continue buttons
 *  will manage the project state as required.
 */
function editOfflineProjectDetails() {
  const project = getProjectInitialState();

  // Set the dialog buttons click event handlers
  setEditOfflineProjectDetailsContinueHandler();
  setEditOfflineProjectDetailsCancelHandler();
  setEditOfflineProjectDetailsEnterHandler();

  // Load the current project details into the html form data
  $('#edit-project-name').val(project.name);
  $('#edit-project-description').val(project.description);

  // Display additional project details.
  const projectBoardType = $('#edit-project-board-type-ro');
  projectBoardType.val(project.boardType.name);
  projectBoardType.html(project.description);
  $('#edit-project-created-date-ro').html(project.created);
  $('#edit-project-last-modified-ro').html(project.modified);

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
 * Update the name and description details of the current project
 */
function updateProjectDetails() {
  const project = getProjectInitialState();
  const newName = $('#edit-project-name').val();
  if (!(project.name === newName)) {
    project.name = newName;
    displayProjectName(project.name);
  }

  const newDescription = $('#edit-project-description').val();
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


/*   Load a Project file    */
/**
 *
 */
function initUploadModalLabels() {
  // set the upload modal's title to "import" if offline
  $('#upload-dialog-title').html(page_text_label['editor_import']);
  $('#upload-project span').html(page_text_label['editor_import']);

  // Hide the save-as button.
  $('#save-project-as, save-as-btn').addClass('hidden');

  disableUploadDialogButtons();
}


/**
 * disable to upload dialog buttons until a valid file is uploaded
 */
function disableUploadDialogButtons() {
  document.getElementById('selectfile-replace').disabled = true;
  document.getElementById('selectfile-append').disabled = true;
}


// HELPER FUNCTIONS

/**
 * Populate the UI Project board type drop-down list
 *
 * @param {HTMLElement} element is the <select> HTML element that will
 * be populated with a collection of possible board types
 *
 * @param {boolean }selected is an optional string parameter containing the
 * board type in the list that should be designated as the selected
 * board type.
 */
function populateProjectBoardTypesUIElement(element, selected = null) {
  if (element) {
    // Clear out the board type dropdown menu
    element.empty();

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
    for (const boardTypes in profile) {
      if (Object.prototype.hasOwnProperty.call(profile, boardTypes)) {
        if (boardTypes !== 'default') {
          // Use the experimental tag to show code-only view
          if (boardTypes !== 'propcfile' ||
              (boardTypes === 'propcfile' &&
                  isExperimental.indexOf('propc') > -1)) {
            element.append($('<option />')
                .val(boardTypes)
                .text(profile[boardTypes].description));
          }
        }

        // Optionally set the selected option element
        if (selected && boardTypes === selected) {
          $(element).val(selected);
        }
      }
    }
  }
}


export {
  initUploadModalLabels, editProjectDetails, newProjectModal, openProjectModal,
};
