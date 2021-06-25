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

// eslint-disable-next-line camelcase
import {LOCAL_PROJECT_STORE_NAME, TEMP_PROJECT_STORE_NAME} from '../constants';
import {insertProject, isProjectChanged} from '../editor';
import {getProjectInitialState, projectJsonFactory} from '../project';
import {appendProjectCode} from '../project/project_controller';
import {logConsoleMessage, utils} from '../utility';
import {getHtmlText} from '../blockly/language/en/page_text_labels';
import {loadProjectFile} from '../project/project_io';

/**
 * Import Project dialog window
 * @type {{
 *    isEventHandler: boolean,
 *    isProjectFileValid: boolean,
 *    initEventHandlers: importProjectDialog.initEventHandlers,
 *    show: importProjectDialog.show,
 *    reset: importProjectDialog.reset
 *  }}
 */
export const importProjectDialog = {
  /**
   * Indicator for the validity of the imported project
   * @type {boolean} is true if the impoted project has been loaded into the
   * localStorage temporary project buffer
   */
  isProjectFileValid: false,

  /**
   * Are the dialog event handlers initialized
   * @type {boolean} is true if the initializer has been called otherwise false
   */
  isEventHandler: false,

  /**
   * Set up the event callbacks for the open project dialog
   */
  initEventHandlers: function() {
    if (this.isEventHandler) {
      logConsoleMessage(`Import Project dialog handlers already initialized`);
      return;
    }

    // Set up element event handlers
    installAppendClickHandler(); // Handle a click on the Append button
    installReplaceClickHandler(); // Handle a click on the Replace button
    installCancelClickHandler(); // Handle a click on the Cancel button
    installEscapeClickHandler(); // Handle user clicking on the 'x' icon
    installOnFocusHandler(); // Handle on focus event
    installFileOnChangeHandler(); // Handle select file onChange

    this.isEventHandler = true;
  },

  /**
   *  Displays the open project modal.
   */
  show: function() {
    if (!this.isEventHandler) {
      logConsoleMessage(`Initialize dialog event handlers first.`);
      return;
    }

    this.reset();

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
      openImportProjectDialog();
    } else {
      const message =
          'The current project has been modified. Click Yes to\n' +
          'discard the current changes and open an existing project.';

      utils.confirmYesNo(
          'Checking Project Changes',
          message,
          function(result) {
            if (result) {
              openImportProjectDialog();
            }
          });
    }
  },

  /**
   * Reset the Open Project dialog filename field
   */
  reset: function() {
    $('#import-project-dialog-title').html(getHtmlText('editor_import'));
    $('#import-project-dialog span').html(getHtmlText('editor_append'));

    // Disable the import dialog Append and Replace buttons
    uiDisableButtons();
    this.clearFileName();
    window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
  },

  /**
   * Clear any previous filename from the Input control
   */
  clearFileName: function() {
    const filenameInput = $('#selectfile');
    if (filenameInput.length > 0) {
      const filename = filenameInput[0].value;
      if (filename.length > 0) {
        filenameInput[0].value = '';
      }
    }
  },

  /**
   * Clear the project that is loaded into the temporary localstorage bucket
   */
  clearLocalTempStorage: function() {
    logConsoleMessage(`Clearing temporary project from local storage`);
    window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
  },
};

/**
 * Disable the dialog's Append and Replace buttons
 */
function uiDisableButtons() {
  const appendButtonElement = document.getElementById('selectfile-append');
  if (appendButtonElement) {
    appendButtonElement.classList.add('disabled');
  }
  const replaceButtonElement = document.getElementById('selectfile-replace');
  if (replaceButtonElement) {
    replaceButtonElement.classList.add('disabled');
  }
}

/**
 * Enable the dialog's Append and Replace buttons
 */
function uiEnableButtons() {
  const appendButtonElement = document.getElementById('selectfile-append');
  if (appendButtonElement) {
    appendButtonElement.classList.remove('disabled');
  }
  const replaceButtonElement = document.getElementById('selectfile-replace');
  if (replaceButtonElement) {
    replaceButtonElement.classList.remove('disabled');
  }
}

/**
 * Import a project to append to or replace the current project
 */
function openImportProjectDialog() {
  $('#import-project-dialog').modal({
    keyboard: false,
    backdrop: 'static',
  });
}

/**
 * Close the Import Project modal dialog window
 */
function closeImportProjectDialog() {
  $('#import-project-dialog').modal('hide');
}

/**
 * Set up onClick event handler for the Append button
 */
function installAppendClickHandler() {
  $('#selectfile-append').on('click', function() {
    appendProjectCode();
    closeImportProjectDialog();
  });
}

/**
 * Set up the onClick event handler for the Replace button
 */
function installReplaceClickHandler() {
  $('#selectfile-replace').on('click', function() {
    let errorMessage = '';
    // Replace the existing project. This is the same as loading a new project
    // Copy the stored temp project to the stored local project
    const projectJson = window.localStorage.getItem(TEMP_PROJECT_STORE_NAME);
    if (!projectJson) {
      errorMessage = 'The imported project cannot be found in storage.';
    } else {
      const project = projectJsonFactory(JSON.parse(projectJson));
      if (!project) {
        errorMessage = 'The imported project cannot be found in storage.';
      } else {
        insertProject(project);
      }
    }

    closeImportProjectDialog();

    if (errorMessage.length > 0) {
      utils.showMessage(
          `Project Load Error`,
          `Unable to import the project`,
          () => {
            logConsoleMessage(`Possible project load failure`);
          });
    }
  });
}

/**
 * Set up onClick event handler for the the 'x' control-
 */
function installCancelClickHandler() {
  $('#selectfile-cancel-button').on('click', function() {
    importProjectDialog.clearLocalTempStorage();
    closeImportProjectDialog();
  });
}

/**
 * Open project escape ('x') click event handler
 * @description  Trap the modal event that fires when the modal
 * window is closed when the user clicks on the 'x' icon.
 */
function installEscapeClickHandler() {
  $('#import-project-dialog').on('hidden.bs.modal', () => {
    importProjectDialog.clearFileName();
  });
}

/**
 * Handle onFocus event
 */
function installOnFocusHandler() {
  $('#selectfile').focus(function() {
    $('#selectfile-verify-notvalid').css('display', 'none');
    $('#selectfile-verify-valid').css('display', 'none');
    $('#selectfile-verify-boardtype').css('display', 'none');
  });
}

/**
 * Handle Select File onChange event, triggered when a filename has
 * been selected from the UI file selector
 */
function installFileOnChangeHandler() {
  // Attach handler to process a project file when it is selected in the
  // Import Project File hamburger menu item.
  const selectControl = document.getElementById('selectfile');
  selectControl.addEventListener('change', (event) => {
    selectProjectFile(event)
        .catch( (reject) => {
          logConsoleMessage(`Select project file rejected: ${reject}`);
          closeImportProjectDialog();
          const message =
              `Unable to load the selected project file. The error reported is: "${reject}."`;
          utils.showMessage('Project Load Error', message);
        });
  });
}

/**
 * Process the selected project file
 *
 * @param {Event} event
 * @return {Promise<boolean>}
 */
async function selectProjectFile(event) {
  // This code detects the sequence where the user has selected a project file, clicks
  // on the 'Choose File' button again and the selects the 'Cancel' button in the file
  // chooser dialog window.
  const input = document.getElementById('selectfile');
  const currentFile = input.files;
  if (currentFile.length === 0) {
    logConsoleMessage(`No file selected`);
    uiDisableButtons();
    return false;
  }

  if (event.target.files[0] && event.target.files[0].name.length > 0) {
    logConsoleMessage(`User selected project: ${event.target.files[0].name}`);

    const /** @type module:project_io.ProjectLoadResult */ result =
        await loadProjectFile(event.target.files);
    if ((! result) || (result.status !== 0)) {
      return Promise.reject(result.message);
    }

    // Copy the project into browser local storage and let the modal event handler
    // decide what to do with it
    window.localStorage.setItem(
        TEMP_PROJECT_STORE_NAME,
        JSON.stringify(result.project.getDetails()));

    // TODO: These may no longer be necessary
    importProjectDialog.isProjectFileValid = true;

    logConsoleMessage(`Project conversion successful. A copy is in local storage`);
    uiEnableButtons();
  }
  return true;
}
