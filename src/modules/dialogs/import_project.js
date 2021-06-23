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
    logConsoleMessage(`Project import - setting dialog labels`);
    $('#import-project-dialog-title').html(getHtmlText('editor_import'));
    $('#import-project-dialog span').html(getHtmlText('editor_append'));

    // Disable the import dialog Append and Replace buttons
    uiDisableButtons();

    // Clear any previous filename from the Input control
    clearInputFileName();

    // Empty the temp browser storage bucket
    window.localStorage.removeItem(TEMP_PROJECT_STORE_NAME);
    logConsoleMessage(`LocalStorage:Temp project removed`);
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
  importProjectDialog.reset();
}

/**
 * Set up onClick event handler for the Append button
 */
function installAppendClickHandler() {
  $('#selectfile-append').on('click', function() {
    logConsoleMessage(`Import Append project button clicked`);
    appendProjectCode();
    closeImportProjectDialog();
  });
}

/**
 * Set up the onClick event handler for the Replace button
 */
function installReplaceClickHandler() {
  $('#selectfile-replace').on('click', function() {
    logConsoleMessage(`Import Replace project button clicked`);
    closeImportProjectDialog();
    // Replace the existing project. This is the same as loading a new project
    // Copy the stored temp project to the stored local project
    const projectJson = window.localStorage.getItem(TEMP_PROJECT_STORE_NAME);
    if (projectJson) {
      const project = projectJsonFactory(JSON.parse(projectJson));
      if (project) {
        insertProject(project);
        return;
      }
    }

    logConsoleMessage('The imported project cannot be found in storage.');
    utils.showMessage(
        `Project Load Error`,
        `Unable to import the project`,
        () => {
          logConsoleMessage(`Possible project load failure`);
        });
  });
}

/**
 * Set up onClick event handler for the the 'x' control-
 */
function installCancelClickHandler() {
  $('#selectfile-cancel-button').on('click', function() {
    logConsoleMessage(`Import Project - Cancel button selected`);
    closeImportProjectDialog();
  });
}

/**
 * Open project escape ('x') click event handler
 * @description  Trap the modal event that fires when the modal
 * window is closed when the user clicks on the 'x' icon.
 */
function installEscapeClickHandler() {
  $('#open-project-dialog').on('hidden.bs.modal', () => {
    logConsoleMessage(`Import Project - Escape button selected`);
    clearInputFileName();
  });
}

/**
 * Handle onFocus event
 */
function installOnFocusHandler() {
  $('#selectfile').focus(function() {
    logConsoleMessage(`Resetting select file validation messages`);
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
  //   if (event.target.files[0] && event.target.files[0].name.length > 0) {
  //     uploadHandler(event.target.files, [
  //       'selectfile-replace',
  //       'selectfile-append',
  //     ]).catch( (err) => {
  //       uiDisableButtons();
  //     });
  //   } else {
  //     uiDisableButtons();
  //   }
  // });
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

  /** WORKING HERE **/

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

/**
 *  Retrieve an SVG project file from local storage.
 *
 *  This is the .selectfile.onChange() event handler.
 *  This function loads an .svg file, parses it for reasonable values
 *  and then stores the verified resulting project into the browser's
 *  localStorage.
 *
 * @param {FileList} files
 * @param {Array?} elements contains an array of HTMLElement ids that
 * identify the UI controls to enable when a valid project file has been
 * loaded.
 */
// async function uploadHandler(files, elements = null) {
//   // const result = await loadProjectFile(files);
//   // console.log(`Returning: Status: ${result.status}, Message: ${result.message}`);
//   // if (result.status !== 0) {
//   //   return false;
//   // }
//
//
//   // Sanity checks
//   if (!files || files.length === 0) {
//     logConsoleMessage(`UploadHandler: files list is empty`);
//     return;
//   }
//
//   const fileBlob = new Blob(files, {type: 'text/strings'});
//   const filename = files[0].name;
//   const fileType = files[0].type;
//   const UploadReader = new FileReader();
//
//   // This will fire is something goes sideways
//   UploadReader.onerror = function() {
//     logConsoleMessage(`File upload filename is missing`);
//   };
//
//   // TODO: Refactor this to ES5 for support in Safari and Opera
//   // eslint-disable-next-line no-unused-vars
//   const textPromise = fileBlob.text()
//       .then((xml) => {
//         if (xml && xml.length > 0) {
//           if (parseProjectFileString(filename, fileType, xml)) {
//             // Enable all buttons in the UI dialog
//             if (elements) {
//               elements.forEach(function(item, index, array) {
//                 const element = $(`#${item}`);
//                 if (element) {
//                   element.removeClass('disabled');
//                 }
//               });
//             }
//           } else {
//             logConsoleMessage(`Project file "${filename}" is Invalid`);
//           }
//         } else {
//           // TODO: Add message to the open dialog window
//           logConsoleMessage(`The selected project file appears to be empty`);
//         }
//       })
//       .catch((err) => {
//         logConsoleMessage(`${err.message}`);
//       });
// }

/**
 * Convert the project string into a JSON object and store that the results in
 * the browser's localStorage temporary project store.
 * @param {string} filename
 * @param {string} fileType
 * @param {string} xmlString
 * @return {boolean} true if the file is converted to a project, otherwise false
 */
// function parseProjectFileString(filename, fileType, xmlString) {
//   // The project board type string
//   const uploadBoardType = getProjectBoardTypeName(xmlString);
//
//   // The text name of the project
//   const projectName = filename.substring(0, filename.lastIndexOf('.'));
//   logConsoleMessage(`Loading project :=> ${projectName}`);
//
//   // TODO: Solo #261
//   // Loop through blocks to verify blocks are supported for the project
//   // board type
//   // validateProjectBlockList(this.result);
//
//   // Flag to indicate that we are importing a file that
//   // was exported from the blockly.parallax.com site
//   let isSvgeFile = false;
//
//   // We need to support our rouge .svge type
//   if (fileType === '') {
//     const name = filename;
//     if (name.slice(name.length - 4) === 'svge') {
//       isSvgeFile = true;
//     }
//   }
//
//   // validate file, screen for potentially malicious code.
//   if ((fileType === 'image/svg+xml' || isSvgeFile) &&
//       xmlString.indexOf('<svg blocklyprop="blocklypropproject"') === 0 &&
//       xmlString.indexOf('<!ENTITY') === -1 &&
//       xmlString.indexOf('CDATA') === -1 &&
//       xmlString.indexOf('<!--') === -1) {
//     // Check to see if there is a project already loaded. If there is, check
//     // the existing project's board type to verify that the new project is
//     // of the same type
//     // ----------------------------------------------------------------------
//     // if (getProjectInitialState() &&
//     //     uploadBoardType !== getProjectInitialState().boardType.name) {
//     //   // Display a modal?
//     //   $('#selectfile-verify-boardtype').css('display', 'block');
//     // } else {
//     //   $('#selectfile-verify-boardtype').css('display', 'none');
//     // }
//
//     // ----------------------------------------------------------------------
//     // File processing is done. The projectXmlCode variable holds the
//     // XML string for the project that was just loaded. Convert the code
//     // into a new Project object and persist it into the browser's
//     // localStorage
//     // ----------------------------------------------------------------------
//     const tmpProject = filestreamToProject(
//         projectName, xmlString, uploadBoardType);
//
//     if (tmpProject) {
//       // Save the project to the browser store
//       window.localStorage.setItem(
//           TEMP_PROJECT_STORE_NAME,
//           JSON.stringify(tmpProject.getDetails()));
//
//       // These may no longer be necessary
//       importProjectDialog.isProjectFileValid = true;
//       // openProjectDialog.isProjectFileValid = true;
//
//       logConsoleMessage(
//           `Project conversion successful. A copy is in local storage`);
//       return true;
//     }
//   }
//   return false;
// }
