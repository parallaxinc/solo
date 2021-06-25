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
import {getHtmlText} from '../blockly/language/en/page_text_labels';
import {insertProject, isProjectChanged} from '../editor';
import {getProjectInitialState, projectJsonFactory} from '../project';
import {logConsoleMessage, utils} from '../utility';
import {loadProjectFile} from '../project/project_io';

/**
 * @module openProject
 */

/**
 * New Project dialog window
 * @type {{
 *    isEventHandler: boolean,
 *    isProjectFileValid: boolean,
 *    initEventHandlers: openProjectDialog.initEventHandlers,
 *    show: openProjectDialog.show,
 *    reset: openProjectDialog.reset
 *  }}
 *
 * @description The Open Project dialog event handlers are set in a single
 * call to the initEventHandlers() method. This should be invoked during the
 * editor page load event.
 *
 * The dialog is opened when the show() method is invoked. Currently, this
 * triggers a number of asynchronous events that ultimately culminate with
 * a copy of the project file loaded into the browser's local storage. The
 * sequence of events follows this path:
 *
 * The Open Project dialog is displayed to the user. The user clicks on the
 * 'select file' control. This opens a File Manager dialog where the user
 * selects a file to open. When the OK button from the File Manager is
 * selected, The 'select file' onChange event fires and invokes the
 * uploadHandler() function.
 *
 * The uploadHandler function sets a callback to process the file after it
 * is read from the users file system. The callback parses the project file
 * and determines if the file is formatted properly. If it is, the
 * UploadHandler() function converts the project to a JSON object and stores
 * it in the browser's localStorage in the TEMP_FILE bucket.
 */
export const openProjectDialog = {
  /**
   * Indicator for the validity of the imported project
   * @type {boolean} is true if the imported project has been loaded into the
   * localStorage temporary project buffer
   * @deprecated This field is not longer used.
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
      logConsoleMessage(`Open Project dialog handlers already initialized`);
      return;
    }

    // Set up element event handlers
    installOpenProjectModalOpenClick(); // Handle a click on the Open button
    installOpenProjectModalCancelClick(); // Handle a click on the Cancel button
    installOpenProjectModalEscapeClick(); // Handle user clicking on the 'x' icon
    installOpenProjectSelectedFileOnChange(); // Handle selected file onChange event

    // Record that the event handlers have been installed so subsequent attempts to
    // do this again will not cause multiple handlers for the same event from being
    // installed.
    this.isEventHandler = true;
  },

  /**
   *  Displays the open project modal.
   */
  show: function() {
    if (!this.isEventHandler) {
      console.log(`Initialize "Open Project" dialog event handlers first.`);
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
      openProjectDialogWindow();
    } else {
      const message =
          'The current project has been modified. Click Yes to\n' +
          'discard the current changes and open an existing project.';

      utils.confirmYesNo(
          'Checking Project Changes',
          message,
          function(result) {
            if (result) {
              openProjectDialogWindow();
            }
          });
    }
  },

  /**
   * Reset the Open Project dialog filename field
   */
  reset: function() {
    // Set title to Open file
    $('#open-project-dialog-title').html(getHtmlText('editor_open'));
    uiDisableOpenButton();
    this.clearFilename();
    this.clearLocalTempStorage();
  },

  /**
   * Clear the file name from the select file Input control
   */
  clearFilename: function() {
    const filenameInput = $('#open-project-select-file');
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
 * Enable the dialog's Open button
 */
function uiEnableOpenButton() {
  const element = document.getElementById('open-project-select-file-open');
  if (element) {
    element.classList.remove('disabled');
  }
}

/**
 * Disable the dialog's Open button
 */
function uiDisableOpenButton() {
  const element = document.getElementById('open-project-select-file-open');
  if (element) {
    element.classList.add('disabled');
  }
}

/**
 * Open a modal dialog to prompt user for the project file name
 */
function openProjectDialogWindow() {
  $('#open-project-dialog').modal({
    keyboard: false,
    backdrop: 'static',
    show: true,
  });
}

/**
 * Close the Open Project dialog window
 * @description This function wraps the jQuery call into Bootstrap
 */
function closeDialogWindow() {
  $('#open-project-dialog').modal('hide');
  logConsoleMessage(`Closing the 'Open Project' dialog`);
}

/**
 * Handle the onChange event for the file selection dialog
 */
function installOpenProjectSelectedFileOnChange() {
  $('#open-project-select-file').on('change', function(event) {
    selectProjectFile(event)
        .catch( (reject) => {
          closeDialogWindow();
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
  const input = document.getElementById('open-project-select-file');
  const currentFile = input.files;
  if (currentFile.length === 0) {
    logConsoleMessage(`No file selected`);
    uiDisableOpenButton();
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

    openProjectDialog.isProjectFileValid = true;

    logConsoleMessage(`Project conversion successful. A copy is in local storage`);
    uiEnableOpenButton();
  }
  return true;
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
function installOpenProjectModalOpenClick() {
  $('#open-project-select-file-open').on('click', () => {
    logConsoleMessage(`User elected to open the project`);
    closeDialogWindow();

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
function installOpenProjectModalCancelClick() {
  $('#open-project-select-file-cancel').on('click', () => {
    logConsoleMessage(`Open Dialog: cancelled`);
    closeDialogWindow();
    openProjectDialog.clearLocalTempStorage();

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
 * @description  Trap the modal event that fires when the modal
 * window is closed when the user clicks on the 'x' icon.
 */
function installOpenProjectModalEscapeClick() {
  $('#open-project-dialog').on('hidden.bs.modal', () => {
    openProjectDialog.clearFilename();
  });
}
