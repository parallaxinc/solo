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

// eslint-disable-next-line camelcase
import {page_text_label} from '../blockly/language/en/messages';
import {LOCAL_PROJECT_STORE_NAME, TEMP_PROJECT_STORE_NAME} from '../constants';
import {isProjectChanged, resetToolBoxSizing} from '../editor';
import {uploadHandler, uploadMergeCode} from '../editor';
import {getProjectInitialState} from '../project';
import {logConsoleMessage, utils} from '../utility';


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
    importProjectModalAppendClick(); // Handle a click on the Append button
    importProjectModalReplaceClick(); // Handle a click on the Replace button
    importProjectModalCancelClick(); // Handle a click on the Cancel button
    importProjectModalEscapeClick(); // Handle user clicking on the 'x' icon
    importProjectModalOnFocus(); // Handle on focus event
    importProjectModalSelectFileOnChange(); // Handle select file onChange

    this.isEventHandler = true;
    logConsoleMessage(`Import Project dialog handlers initialized.`);
  },

  /**
   *  Displays the open project modal.
   */
  show: function() {
    importProjectFromStorage(); // This will be replaced with the code below

    if (!this.isEventHandler) {
      logConsoleMessage(`Initialize dialog event handlers first.`);
      return;
    }

    logConsoleMessage(`Import Project dialog: show`);
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
      importProject();
    } else {
      const message =
          'The current project has been modified. Click Yes to\n' +
          'discard the current changes and open an existing project.';

      utils.confirmYesNo(
          'Checking Project Changes',
          message,
          function(result) {
            if (result) {
              importProject();
            }
          });
    }
  },

  /**
   * Reset the Open Project dialog filename field
   */
  reset: function() {
    logConsoleMessage(`Setting dialog labels`);
    $('#import-project-dialog-title').html(page_text_label['editor_import']);
    $('#import-project-dialog span').html(`Span import project`);
    // page_text_label['editor_import']);

    // Hide the save-as button.
    // $('#save-project-as, #save-as-btn').addClass('hidden');

    // Disable the import dialog Append and Replace buttons
    logConsoleMessage(
        `Disabling the Import Project Append and Replace buttons`);
    document.getElementById('selectfile-replace').disabled = true;
    document.getElementById('selectfile-append').disabled = true;

    // Clear any previous filename from the Input control
    clearInputFileName();
  },
};

/**
 * Import a project to append to or replace the current project
 */
function importProject() {

}

/**
 * Set up onClick event handler for the Append button
 */
function importProjectModalAppendClick() {
  $('#selectfile-append').on('click', function() {
    logConsoleMessage(`Import Append project button clicked`);

    // Set the status message in the modal dialog
    // This only happens after the import project dialog has fired
    if (importProjectDialog.isProjectFileValid === true) {
      $('#selectfile-verify-valid').css('display', 'block');
      document.getElementById('selectfile-replace').disabled = false;
      document.getElementById('selectfile-append').disabled = false;
      // uploadedXML = xmlString;
    } else {
      $('#selectfile-verify-notvalid').css('display', 'block');
      document.getElementById('selectfile-replace').disabled = true;
      document.getElementById('selectfile-append').disabled = true;
    }
  });
}

/**
 * Set up the onClick event handler for the Replace button
 */
function importProjectModalReplaceClick() {
  $('#selectfile-replace').on('click', function() {
    logConsoleMessage(`Import Replace project button clicked`);
  });
}

/**
 * Set up onClick event handler for the the 'x' control-
 */
function importProjectModalCancelClick() {
  $('#selectfile-cancel-button').on('click', function() {
    logConsoleMessage(`Import Cancel project import button clicked`);
    clearInputFileName();
  });
}

/**
 * Open project escape ('x') click event handler
 * @description  Trap the modal event that fires when the modal
 * window is closed when the user clicks on the 'x' icon.
 */
function importProjectModalEscapeClick() {
  $('#open-project-dialog').on('hidden.bs.modal', () => {
    clearInputFileName();
  });
}

/**
 * Handle onFocus event
 */
function importProjectModalOnFocus() {
  $('#selectfile').focus(function() {
    logConsoleMessage(`Resetting select file validation messages`);
    $('#selectfile-verify-notvalid').css('display', 'none');
    $('#selectfile-verify-valid').css('display', 'none');
    $('#selectfile-verify-boardtype').css('display', 'none');
  });

}
/**
 * Import project file from disk
 */
export function importProjectFromStorage() {
  logConsoleMessage(`Launching Import Project dialog process.`);

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
 * Handle Select File onChange event
 */
function importProjectModalSelectFileOnChange() {
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

/**
 * Import Project Cancel button click event handler
 */
function cancelImportProjectHandler() {
  logConsoleMessage(`The import has been cancelled.`);
  window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
}

/**
 * Clear the file name from the select file Input control
 */
function clearInputFileName() {
  // Clear any previous filename from the Input control
  const filenameInput = $('#selectfile');
  if (filenameInput.length > 0) {
    const filename = filenameInput[0].value;
    if (filename.length > 0) {
      filenameInput[0].value = '';
    }
  }
}
