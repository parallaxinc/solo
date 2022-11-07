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
// import * as Chartist from 'chartist';
// import {saveAs} from 'file-saver';

import {getComPort} from './client_connection';
import {clientService, serviceConnectionTypes} from './client_service';
import {loadToolbox} from './editor';
import {CodeEditor, getSourceEditor} from './code_editor';
import {getProjectInitialState, Project} from './project';
import {cloudCompile} from './compiler';
import {
  delay, logConsoleMessage,
  // getURLParameter, sanitizeFilename,
  utils, prettyCode} from './utility';

// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {null}
//  */
// let graph = null;
//
// /**
//  * Graph temporary storage array
//  *
//  * @type {any[]}
//  */
// // eslint-disable-next-line camelcase
// const graph_temp_data = [];
//
// /**
//  * Flag that indicates if the graph system is ready
//  *
//  * @type {boolean}
//  */
// // eslint-disable-next-line camelcase
// let graph_data_ready = false;
//
// /**
//  * Graph data series start timestamp
//  *
//  * @type {null}
//  */
// // eslint-disable-next-line camelcase
// let graph_timestamp_start = null;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {number}
//  */
// // eslint-disable-next-line camelcase
// let graph_timestamp_restart = 0;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {boolean}
//  */
// // eslint-disable-next-line camelcase
// let graph_paused = false;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {boolean}
//  */
// // eslint-disable-next-line camelcase
// let graph_start_playing = false;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {String}
//  */
// // eslint-disable-next-line camelcase
// let graphTempString = '';
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {number}
//  */
// // eslint-disable-next-line camelcase
// let graph_time_multiplier = 0;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {null}
//  */
// // eslint-disable-next-line camelcase
// let graph_interval_id = null;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {number}
//  */
// const fullCycleTime = 4294967296 / 80000000;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {null}
//  */
// // eslint-disable-next-line camelcase
// let graph_labels = null;
//
// /**
//  * TODO: Identify the purpose of this variable
//  *
//  * @type {Array}
//  */
// // eslint-disable-next-line camelcase
// const graph_csv_data = [];
//
// /**
//  * Graph system settings
//  *
//  * @type {{
//  *  graph_type: string,
//  *  fullWidth: boolean,
//  *  showPoint: boolean,
//  *  refreshRate: number,
//  *  axisX: {onlyInteger: boolean, type: *},
//  *  sampleTotal: number
//  * }}
//  */
// // eslint-disable-next-line camelcase
// const graph_options = {
//   showPoint: false,
//   fullWidth: true,
//   axisX: {
//     type: Chartist.AutoScaleAxis,
//     onlyInteger: true,
//   },
//   refreshRate: 250,
//   sampleTotal: 40,
//   graph_type: 'S',
// };
//
// /**
//  * Array to store source data for the graph system
//  *
//  * @type {{series: *[]}}
//  */
// // eslint-disable-next-line camelcase
// const graph_data = {
//   series: [
//     // add more here for more possible lines...
//     [], [], [], [], [], [], [], [], [], [],
//   ],
// };
//

/**
 * Display a dialog window that warns of an attempt to compile
 * an empty project.
 *
 * @param {string} title is the text to include in the dialog title bar
 * @param {string} body is the text that is displayed in the body of the dialog
 */
const showCannotCompileEmptyProject = (title, body) => {
  utils.showMessage(title, body);
};

/**
 *  Display the compiler status modal window
 * @param {string} titleBar is the text that will appear in the modal title bar
 */
const showCompilerStatusWindow = (titleBar) => {
  $('#compile-dialog-title').text(titleBar);
  $('#compile-console').val('Compiling... ');
  $('#compile-dialog').modal('show');
};

/**
 * This is the onClick event handler for the compile toolbar button
 */
export const compile = async () => {
  const codePropC = getSourceEditor();

  // if PropC is in edit mode, get it from the editor, otherwise
  // render it from the blocks.
  const propcCode = (codePropC.getReadOnly()) ?
      prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace)) :
      codePropC.getValue();

  if (propcCode.indexOf('EMPTY_PROJECT') > -1) {
    showCannotCompileEmptyProject(
        Blockly.Msg.DIALOG_EMPTY_PROJECT, Blockly.Msg.DIALOG_CANNOT_COMPILE_EMPTY_PROJECT);
    return;
  }

  showCompilerStatusWindow('Compile');
  await cloudCompile('compile', propcCode)
      .then(() => compileConsoleScrollToBottom())
      .catch((err) => {
        console.log(`Compiler failed due to: ${err}`);
        if (err ==='Failed to fetch') {
          compileConsoleScrollToBottom();
          appendCompileConsoleMessage(
              // eslint-disable-next-line max-len
              '\nThe compiler is unavailable.\nPlease check your network connection and try again.');
        }
      });
};

/**
 * The onClick event handler for the Compile to RAM and Compile to EEPROM
 * UI toolbar buttons of the same names.
 *
 * @param {string} modalTitleBarMessage message shown at the top of the
 *  compile/load modal.
 * @param {string} compileCommand for the cloud compiler (bin/eeprom).
 * @param {string} loadOption command for the loader
 *  (CODE/VERBOSE/CODE_VERBOSE).
 * @param {string} loadAction command for the loader (RAM/EEPROM).
 *
 * USED by the COMPILE, LOAD TO RAM, and LOAD TO EEPROM UI buttons directly
 *
 * @description: Console logging uses the identifier (LOAI).
 */
export const loadInto = async (modalTitleBarMessage, compileCommand, loadOption, loadAction) => {
  // Handle potential issues
  if (! clientService.portsAvailable) {
    if (clientService.available) {
      utils.showMessage(
          Blockly.Msg.DIALOG_NO_DEVICE,
          Blockly.Msg.DIALOG_NO_DEVICE_TEXT);
    } else {
      utils.showMessage(
          Blockly.Msg.DIALOG_DEVICE_COMM_ERROR,
          Blockly.Msg.DIALOG_DEVICE_COMM_ERROR_TEXT);
    }
    return;
  }

  // Retrieve the source code
  const codePropC = getSourceEditor();

  // if PropC is in edit mode, get it from the editor, otherwise
  // render it from the blocks.
  const propcCode = (codePropC.getReadOnly()) ?
      prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace)) :
      codePropC.getValue();

  if (propcCode.indexOf('EMPTY_PROJECT') > -1) {
    showCannotCompileEmptyProject(
        Blockly.Msg.DIALOG_EMPTY_PROJECT,
        Blockly.Msg.DIALOG_CANNOT_COMPILE_EMPTY_PROJECT);
    return;
  }

  showCompilerStatusWindow(modalTitleBarMessage);

  try {
    // Compile the project code
    await cloudCompile(compileCommand, propcCode)
        .then( async (data) => {
          // Stop here if the compiler failed.
          if (!data.success) {
            return;
          }

          const terminalNeeded = isTerminalWindowRequired();

          if (clientService.type === serviceConnectionTypes.WS) {
            appendCompileConsoleMessage(`Download...`);

            // Send the compiler submission via a web socket
            clientService.resultLog = '';
            clientService.loadBinary = false;

            await (async () => {
              const port = getComPort();

              await clientService.wsSendLoadProp(
                  loadAction, data, terminalNeeded, port);

              for (let loop = 0; loop < 5; loop++) {
                await delay(800);
                if (clientService.loaderIsDone) break;

                if (clientService.loaderResetDetect) {
                  logConsoleMessage(`Waiting for connection... (${loop+1} of 5)`);
                  if (clientService.activeConnection !== null) {
                    if (clientService.activeConnection.readyState === 1) {
                      // Resubmit the project to the Launcher
                      logConsoleMessage(`Resubmitting download`);
                      await clientService.wsSendLoadProp(
                          loadAction, data, terminalNeeded, port);
                    }
                  }
                }
              }
            })();
          }
        });
  } catch (e) {
    logConsoleMessage(`Catching : ${e.message}`);
  }
};

/**
 * Evaluate the project to determine if a terminal or graph window is required
 * when the project is run on the device
 *
 * @return {string}
 */
const isTerminalWindowRequired = () => {
  const project = getProjectInitialState();
  let terminalNeeded = '';

  // TODO: propc editor needs UI for settings for terminal and graphing
  if (project.boardType.name !== 'propcfile') {
    const consoleBlockList = [
      'console_print', 'console_print_variables', 'console_print_multiple',
      'console_scan_text', 'console_scan_number', 'console_newline',
      'console_clear', 'console_move_to_position', 'oled_font_loader',
      'activitybot_display_calibration', 'scribbler_serial_send_text',
      'scribbler_serial_send_char', 'scribbler_serial_send_decimal',
      'scribbler_serial_send_decimal', 'scribbler_serial_send_ctrl',
      'scribbler_serial_cursor_xy',
    ];

    let consoleBlockCount = 0;
    for (let i = 0; i < consoleBlockList.length; i++) {
      consoleBlockCount += Blockly.getMainWorkspace()
          .getBlocksByType(consoleBlockList[i], false).length;
    }

    if (consoleBlockCount > 0) {
      terminalNeeded = 'term';
    } else if (Blockly.getMainWorkspace()
        .getBlocksByType('graph_settings', false).length > 0) {
      terminalNeeded = 'graph';
    }
  }
  return terminalNeeded;
};

/**
 * Display information about the serial connection to the device
 * @param {string | null} connectionInfo text to display above
 *  the console or graph
 */
export function displayTerminalConnectionStatus(connectionInfo) {
  $('.connection-string').html(connectionInfo ? connectionInfo : '');
}


/**
 * Blockly initialization
 * @param {!Blockly} data is the global blockly object
 */
export function initializeBlockly(data) {
  const project = getProjectInitialState();
  if (project) {
    if (project.boardType.name !== 'propcfile') {
      new CodeEditor(project.boardType.name);
      loadToolbox(project.code);
    }
  }
}

/**
 * Create a modal that allows the user to set a different port or path
 * to the BlocklyProp-Client or -Launcher
 */
export const configureConnectionPaths = function() {
  // All of this code is building the UI for the Configure
  // BlocklyProp Client dialog.
  const pathPortInput = $('<form/>', {
    class: 'form-inline',
  });

  // This is hard-coding the HTTP protocol for the BlocklyProp Client
  $('<span/>', {
    class: 'space_right',
  }).text('http://').appendTo(pathPortInput);

  // Add the form group to the DOM for the input field defined next
  const domainNameGroup = $('<div/>', {
    class: 'form-group',
  }).appendTo(pathPortInput);

  // Default the domain input box
  $('<input/>', {
    id: 'domain_name',
    type: 'text',
    class: 'form-control',
    value: clientService.path,
  }).appendTo(domainNameGroup);

  // Hard code the ':' between the domain name and port input fields
  $('<span/>', {
    class: 'space_left space_right',
  }).text(':').appendTo(pathPortInput);

  // Add the form group to the DOM for the next input field
  const domainPortGroup = $('<div/>', {
    class: 'form-group',
  }).appendTo(pathPortInput);

  // Get the port number
  $('<input/>', {
    id: 'port_number',
    type: 'number',
    class: 'form-control',
    value: clientService.port,
  }).appendTo(domainPortGroup);

  // Show the modal dialog
  utils.confirm(
      Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER_CONFIGURE_TITLE,
      pathPortInput, function(action) {
        if (action) {
          clientService.path = $('#domain_name').val();
          clientService.port = $('#port_number').val();
        }
      }, Blockly.Msg.DIALOG_SAVE_TITLE);
};

/**
 * Append text to the compiler progress dialog window
 * @param {string} message
 */
export function appendCompileConsoleMessage(message) {
  const element = $('#compile-console');
  const text = element.val();
  element.val(text + message);
//  $('#compile-console').val($('#compile-console').val() + message);
}

/**
 * Scroll to the bottom of the compiler output dialog
 * @description UI code to scroll the text area to the bottom line
 */
export function compileConsoleScrollToBottom() {
  const compileConsoleObj = document.getElementById('compile-console');
  compileConsoleObj.scrollTop = compileConsoleObj.scrollHeight;
}

/**
 * Are there any blocks in the Blockly workspace
 * @return {boolean}
 */
export const hasCode = () => {
  let result = false;
  if (Blockly) {
    if (Blockly.Xml) {
      if (Blockly.mainWorkspace) {
        const xml = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        const text = Blockly.Xml.domToText(xml);
        const emptyHeader = Project.getTerminatedEmptyProjectCodeHeader();
        const emptyHeaderV2 = Project.getTerminatedEmptyProjectCodeHeaderV2();
        if (! (text === emptyHeader || text === emptyHeaderV2)) {
          result = true;
        }
      }
    }
  }
  return result;
};
