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
import * as Chartist from 'chartist';
import {saveAs} from 'file-saver';

import {getComPort} from './client_connection';
import {clientService, serviceConnectionTypes} from './client_service';
import {loadToolbox} from './editor';
import {CodeEditor, getSourceEditor} from './code_editor';
import {getProjectInitialState, Project} from './project';
import {cloudCompile} from './compiler';
import {
  delay, logConsoleMessage, getURLParameter, sanitizeFilename, utils, prettyCode} from './utility';

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
let graph = null;

/**
 * Graph temporary storage array
 *
 * @type {any[]}
 */
// eslint-disable-next-line camelcase
const graph_temp_data = [];

/**
 * Flag that indicates if the graph system is ready
 *
 * @type {boolean}
 */
// eslint-disable-next-line camelcase
let graph_data_ready = false;

/**
 * Graph data series start timestamp
 *
 * @type {null}
 */
// eslint-disable-next-line camelcase
let graph_timestamp_start = null;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
// eslint-disable-next-line camelcase
let graph_timestamp_restart = 0;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {boolean}
 */
// eslint-disable-next-line camelcase
let graph_paused = false;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {boolean}
 */
// eslint-disable-next-line camelcase
let graph_start_playing = false;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {String}
 */
// eslint-disable-next-line camelcase
let graphTempString = '';

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
// eslint-disable-next-line camelcase
let graph_time_multiplier = 0;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
// eslint-disable-next-line camelcase
let graph_interval_id = null;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {number}
 */
const fullCycleTime = 4294967296 / 80000000;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
// eslint-disable-next-line camelcase
let graph_labels = null;

/**
 * TODO: Identify the purpose of this variable
 *
 * @type {Array}
 */
// eslint-disable-next-line camelcase
const graph_csv_data = [];

/**
 * Graph system settings
 *
 * @type {{
 *  graph_type: string,
 *  fullWidth: boolean,
 *  showPoint: boolean,
 *  refreshRate: number,
 *  axisX: {onlyInteger: boolean, type: *},
 *  sampleTotal: number
 * }}
 */
// eslint-disable-next-line camelcase
const graph_options = {
  showPoint: false,
  fullWidth: true,
  axisX: {
    type: Chartist.AutoScaleAxis,
    onlyInteger: true,
  },
  refreshRate: 250,
  sampleTotal: 40,
  graph_type: 'S',
};

/**
 * Array to store source data for the graph system
 *
 * @type {{series: *[]}}
 */
// eslint-disable-next-line camelcase
const graph_data = {
  series: [
    // add more here for more possible lines...
    [], [], [], [], [], [], [], [], [], [],
  ],
};


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
export const loadInto = async (
  modalTitleBarMessage, compileCommand, loadOption, loadAction) => {
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

  showCompilerStatusWindow(modalTitleBarMessage);

  try {
  // Compile the project code
    await cloudCompile(compileCommand, propcCode)
        .then( async (data) => {
          // Stop here if the compile failed.
          if (!data.success) {
            return;
          }

          const terminalNeeded = isTerminalWindowRequired();

          if (clientService.type === serviceConnectionTypes.WS) {
            appendCompileConsoleMessage(`Download...`);

            // Send the compile submission via a web socket
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
 * Graphing console
 */
// eslint-disable-next-line camelcase,require-jsdoc
export function graphingConsole() {
  clientService.sendCharacterStreamTo = 'graph';

  if (getGraphSettingsFromBlocks()) {
    if (graph === null) {
      graphReset();
      graphTempString = '';
      graph = new Chartist.Line('#serial_graphing', graph_data, graph_options);
      if (getURLParameter('debug')) {
        logConsoleMessage(graph_options.toString());
      }
    } else {
      graph.update(graph_data, graph_options);
    }

    if (clientService.type === serviceConnectionTypes.WS &&
        clientService.portsAvailable) {
      const messageToSend = {
        type: 'serial-terminal',
        outTo: 'graph',
        portPath: getComPort(),
        baudrate: clientService.terminalBaudRate.toString(10),
        msg: 'none',
        action: 'open',
      };

      if (messageToSend.portPath !== 'none') {
        displayTerminalConnectionStatus([
          Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED,
          messageToSend.portPath,
          Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE,
          messageToSend.baudrate,
        ].join(' '));
      } else {
        displayTerminalConnectionStatus(
            Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT);
      }

      clientService.activeConnection.send(JSON.stringify(messageToSend));

      // eslint-disable-next-line camelcase
      if (!graph_interval_id) {
        graphStartStop('start');
      }

      $('#graphing-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        graphStartStop('stop');
        if (messageToSend.action !== 'close') {
          // because this is getting called multiple times.... ?
          messageToSend.action = 'close';
          displayTerminalConnectionStatus(null);
          clientService.activeConnection.send(JSON.stringify(messageToSend));
        }
      });
    } else {
      // create simulated graph?
      displayTerminalConnectionStatus(
          Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT);
    }

    $('#graphing-dialog').modal('show');
    if (document.getElementById('btn-graph-play')) {
      // eslint-disable-next-line max-len
      document.getElementById('btn-graph-play').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
    }
  } else {
    utils.showMessage(
        Blockly.Msg.DIALOG_MISSING_BLOCKS,
        Blockly.Msg.DIALOG_MISSING_BLOCKS_GRAPHING);
  }
}

/**
 * getGraphSettingsFromBlocks
 * @description sets the graphing engine's settings and graph labels
 * based on values in the graph setup and output blocks
 * @return {boolean} true if the appropriate graphing blocks are
 *  present and false if they are not
 */
function getGraphSettingsFromBlocks() {
  const project = getProjectInitialState();
  // TODO: propc editor needs UI for settings for terminal and graphing
  if (project.boardType.name === 'propcfile') {
    return false;
  }
  const graphSettingsBlocks = Blockly
      .getMainWorkspace()
      .getBlocksByType('graph_settings');

  if (graphSettingsBlocks.length > 0) {
    logConsoleMessage('found settings');
    const graphOutputBlocks = Blockly
        .getMainWorkspace()
        .getBlocksByType('graph_output');
    // eslint-disable-next-line camelcase
    graph_labels = [];
    if (graphOutputBlocks.length > 0) {
      logConsoleMessage('found block');
      let i = 0;
      while (graphOutputBlocks[0].getField('GRAPH_LABEL' + i)) {
        graph_labels.push(
            graphOutputBlocks[0].getFieldValue('GRAPH_LABEL' + i));
        i++;
      }
    } else {
      return false;
    }

    graph_options.refreshRate = 100; // Number(graph_settings_str[0]);

    graph_options.graph_type = {
      'AUTO': 'S',
      'FIXED': 'S',
      'AUTOXY': 'X',
      'FIXEDXY': 'X',
      'AUTOSC': 'O',
      'FIXEDSC': 'O',
    }[graphSettingsBlocks[0].getFieldValue('YSETTING')];


    if (graphSettingsBlocks[0].getFieldValue('YMIN') ||
        graphSettingsBlocks[0].getFieldValue('YMAX')) {
      graph_options.axisY = {
        type: Chartist.AutoScaleAxis,
        low: Number(graphSettingsBlocks[0].getFieldValue('YMIN') || '0'),
        high: Number(graphSettingsBlocks[0].getFieldValue('YMAX') || '100'),
        onlyInteger: true,
      };
    } else {
      graph_options.axisY = {
        type: Chartist.AutoScaleAxis,
        onlyInteger: true,
      };
    }
    $('#graph_x-axis_label').css('display', 'block');
    graph_options.showPoint = false;
    graph_options.showLine = true;
    if (graph_options.graph_type === 'X') {
      $('#graph_x-axis_label').css('display', 'none');
      if (graphSettingsBlocks[0].getFieldValue('XMIN') ||
          graphSettingsBlocks[0].getFieldValue('XMAX')) {
        graph_options.axisX = {
          type: Chartist.AutoScaleAxis,
          low: Number(graphSettingsBlocks[0].getFieldValue('XMIN') || '0'),
          high: Number(graphSettingsBlocks[0].getFieldValue('XMAX') || '100'),
          onlyInteger: true,
        };
      } else {
        graph_options.axisX = {
          type: Chartist.AutoScaleAxis,
          onlyInteger: true,
        };
      }
      graph_options.showPoint = true;
      graph_options.showLine = false;
    }

    if (graph_options.graph_type === 'S' || graph_options.graph_type === 'X') {
      graph_options.sampleTotal = Number(
          graphSettingsBlocks[0].getFieldValue('XAXIS') || '10');
    }
    return true;
  } else {
    return false;
  }
}

/**
 * Graphing system control
 *
 * @param {string} action
 * Supported actions:
 *     start
 *     play
 *     stop
 *     pause
 *     clear
 */
export const graphStartStop = function(action) {
  if (action === 'start' || action === 'play') {
    graph_new_labels();
    // eslint-disable-next-line camelcase
    if (graph_interval_id) {
      clearInterval(graph_interval_id);
    }
    // eslint-disable-next-line camelcase
    graph_interval_id = setInterval(function() {
      graph.update(graph_data);
      graph_update_labels();
    }, graph_options.refreshRate);
  } else if (action === 'stop' || action === 'pause') {
    clearInterval(graph_interval_id);
    // eslint-disable-next-line camelcase
    graph_interval_id = null;
  }
  if (action === 'stop') {
    // eslint-disable-next-line camelcase
    graph_paused = false;
    graphReset();
    graphPlay('play');
  }
  if (action === 'clear') {
    graphReset();
  }
  if (action === 'play') {
    if (graph_data.series[0].length === 0) {
      graphReset();
    }
    // eslint-disable-next-line camelcase
    graph_paused = false;
    // eslint-disable-next-line camelcase
    graph_start_playing = true;
  }
  if (action === 'pause' && graph_temp_data.slice(-1)[0]) {
    // eslint-disable-next-line camelcase
    graph_paused = true;
    graphTempString = '';
    // eslint-disable-next-line camelcase
    graph_timestamp_start = 0;
    // eslint-disable-next-line camelcase
    graph_time_multiplier = 0;
    // eslint-disable-next-line camelcase
    graph_timestamp_restart = graph_temp_data.slice(-1)[0][0];
  }
};

/**
 * Graph the data represented in the stream parameter
 *
 * @param {string} stream
 */
// eslint-disable-next-line camelcase,require-jsdoc
export function graphNewData(stream) {
  // Check for a failed connection:
  if (stream.indexOf('ailed') > -1) {
    displayTerminalConnectionStatus(stream);
  } else {
    let row;
    let ts = 0;

    for (let k = 0; k < stream.length; k++) {
      if (stream[k] === '\n') {
        stream[k] = '\r';
      }
      // eslint-disable-next-line camelcase
      if (stream[k] === '\r' && graph_data_ready) {
        // eslint-disable-next-line camelcase
        if (!graph_paused) {
          graph_temp_data.push(graphTempString.split(','));
          row = graph_temp_data.length - 1;
          ts = Number(graph_temp_data[row][0]) || 0;

          // convert to seconds:
          // Uses Propeller system clock (CNT) left shifted by 16.
          // Assumes 80MHz clock frequency.
          ts = ts / 1220.703125;
        }
        // eslint-disable-next-line camelcase
        if (!graph_timestamp_start || graph_timestamp_start === 0) {
          // eslint-disable-next-line camelcase
          graph_timestamp_start = ts;
          // eslint-disable-next-line camelcase
          if (graph_start_playing) {
            // eslint-disable-next-line camelcase
            graph_timestamp_start -= graph_timestamp_restart;
            // eslint-disable-next-line camelcase
            graph_timestamp_restart = 0;
          }
        }
        // eslint-disable-next-line camelcase
        if (row > 0 && !graph_start_playing) {
          if (parseFloat(graph_temp_data[row][0]) <
              parseFloat(graph_temp_data[row - 1][1])) {
            // eslint-disable-next-line camelcase
            graph_time_multiplier += fullCycleTime;
          }
        }
        // eslint-disable-next-line camelcase
        graph_start_playing = false;
        // eslint-disable-next-line camelcase
        if (!graph_paused) {
          // eslint-disable-next-line camelcase
          graph_temp_data[row].unshift(ts + graph_time_multiplier -
              // eslint-disable-next-line camelcase
              graph_timestamp_start);
          // eslint-disable-next-line camelcase
          let graph_csv_temp =
              (Math.round(graph_temp_data[row][0] * 10000) / 10000) + ',';

          if (graph_options.graph_type === 'X') {
            // xy scatter plot
            let jk = 0;
            for (let j = 2; j < graph_temp_data[row].length; j = j + 2) {
              // eslint-disable-next-line camelcase
              graph_csv_temp += graph_temp_data[row][j] + ',' +
                  graph_temp_data[row][j + 1] + ',';
              graph_data.series[jk].push({
                x: graph_temp_data[row][j] || null,
                y: graph_temp_data[row][j + 1] || null,
              });
              if (graph_temp_data[row][0] > graph_options.sampleTotal) {
                graph_data.series[jk].shift();
              }
              jk++;
            }
          } else {
            // Time series graph
            for (let j = 2; j < graph_temp_data[row].length; j++) {
              // eslint-disable-next-line camelcase
              graph_csv_temp += graph_temp_data[row][j] + ',';
              graph_data.series[j - 2].push({
                x: graph_temp_data[row][0],
                y: graph_temp_data[row][j] || null,
              });
              // TODO: if this slows performance too much - explore changing
              //  the stylesheet
              // eslint-disable-next-line max-len
              //  (https://stackoverflow.com/questions/50036922/change-a-css-stylesheets-selectors-properties/50036923#50036923)
              $('.ct_line').css('stroke-width', '2.5px');
              if (graph_temp_data[row][0] > graph_options.sampleTotal) {
                graph_data.series[j - 2].shift();
              }
            }
          }

          graph_csv_data.push(graph_csv_temp.slice(0, -1).split(','));

          // limits total number of data points collected to prevent
          // memory issues
          if (graph_csv_data.length > 15000) {
            graph_csv_data.shift();
          }
        }

        graphTempString = '';
      } else {
        // eslint-disable-next-line camelcase
        if (!graph_data_ready) { // wait for a full set of data to
          if (stream[k] === '\r') { // come in before graphing, ends up
            // eslint-disable-next-line camelcase
            graph_data_ready = true; // tossing the first point but prevents
          } // garbage from mucking up the graph.
        } else {
          // make sure it's a number, comma, CR, or LF
          if ('-0123456789.,\r\n'.indexOf(stream[k]) > -1) {
            graphTempString += stream[k];
          }
        }
      }
    }
  }
}

/**
 * Reset the graphing system
 */
// eslint-disable-next-line camelcase,require-jsdoc
export function graphReset() {
  graph_temp_data.length = 0;
  graph_csv_data.length = 0;
  for (let k = 0; k < 10; k++) {
    graph_data.series[k] = [];
  }
  if (graph) {
    graph.update(graph_data, graph_options, true);
  }
  graphTempString = '';
  // eslint-disable-next-line camelcase
  graph_timestamp_start = 0;
  // eslint-disable-next-line camelcase
  graph_time_multiplier = 0;
  // eslint-disable-next-line camelcase
  graph_timestamp_restart = 0;
  // eslint-disable-next-line camelcase
  graph_data_ready = false;
}

/**
 * Draw graph
 *
 * @param {string} setTo
 */
export function graphPlay(setTo) {
  if (document.getElementById('btn-graph-play')) {
    // eslint-disable-next-line camelcase
    const play_state = document.getElementById('btn-graph-play').innerHTML;
    if (setTo !== 'play' &&
        (play_state.indexOf('pause') > -1 ||
            play_state.indexOf('<!--p') === -1)) {
      document.getElementById('btn-graph-play')
          // eslint-disable-next-line max-len
          .innerHTML = '<!--play--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
      if (!setTo) {
        graphStartStop('pause');
      }
    } else {
      document.getElementById('btn-graph-play')
          // eslint-disable-next-line max-len
          .innerHTML = '<!--pause--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
      // eslint-disable-next-line camelcase
      if (!graph_interval_id && !setTo) {
        graphStartStop('play');
      }
    }
  }
}

/**
 * Save a graph to the local file system
 */
export function downloadGraph() {
  utils.prompt(
      Blockly.Msg.DIALOG_DOWNLOAD_GRAPH_DIALOG,
      'BlocklyProp_Graph',
      function(value) {
        if (value) {
          // Make sure filename is safe
          value = sanitizeFilename(value);

          const svgGraph = document.getElementById('serial_graphing');
          const pattern = new RegExp('xmlns="http://www.w3.org/2000/xmlns/"', 'g');
          const findY = 'class="ct-label ct-horizontal ct-end"';
          // eslint-disable-next-line max-len
          const chartStyle = '<style>.ct-grid-background,.ct-line{fill:none}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-grid{stroke:rgba(0,0,0,.2);stroke-width:1px;stroke-dasharray:2px}.ct-area{stroke:none;fill-opacity:.1}.ct-line{stroke-width:1px}.ct-point{stroke-width:5px}.ct-series-a{stroke:#00f}.ct-series-b{stroke:#0bb}.ct-series-c{stroke:#0d0}.ct-series-d{stroke:#dd0}.ct-series-e{stroke:#f90}.ct-series-f{stroke:red}.ct-series-g{stroke:#d09}.ct-series-h{stroke:#90d}.ct-series-i{stroke:#777}.ct-series-j{stroke:#000}text{font-family:sans-serif;fill:rgba(0,0,0,.4);color:rgba(0,0,0,.4);font-size:.75rem;line-height:1;overflow:visible}</style>';
          let svgxml = new XMLSerializer().serializeToString(svgGraph);

          svgxml = svgxml.replace(pattern, '');
          svgxml = svgxml.replace(/foreignObject/g, 'text');

          // Look for '[<', '<], or '0-9'
          svgxml = svgxml.replace(/([<|</])a\d+:/g, '$1');

          svgxml = svgxml.replace(/xmlns: /g, '');
          svgxml = svgxml.replace(/x="10" /g, 'x="40" ');

          svgxml = svgxml.substring(svgxml.indexOf('<svg'), svgxml.length - 6);
          const foundY = svgxml.indexOf(findY);
          // eslint-disable-next-line max-len
          const theY = parseFloat(svgxml.substring(svgxml.indexOf(' y="', foundY + 20) + 4, svgxml.indexOf('"', svgxml.indexOf(' y="', foundY + 20) + 4)));
          const regY = new RegExp('y="' + theY + '"', 'g');
          svgxml = svgxml.replace(regY, 'y="' + (theY + 12) + '"');
          const breakpoint = svgxml.indexOf('>') + 1;
          // eslint-disable-next-line max-len
          svgxml = svgxml.substring(0, breakpoint) + chartStyle + svgxml.substring(breakpoint, svgxml.length);
          // eslint-disable-next-line max-len
          svgxml = svgxml.replace(/<text style="overflow: visible;" ([xy])="([0-9.-]+)" ([xy])="([0-9.-]+)" [a-z]+="[0-9.]+" [a-z]+="[0-9.]+"><span[0-9a-zA-Z =.":;/-]+>([0-9.-]+)<\/span>/g, '<text $1="$2" $3="$4">$5');

          const blob = new Blob([svgxml], {type: 'image/svg+xml'});
          saveAs(blob, value + '.svg');
        }
      });
}

/**
 * Download the graph as a csv file to the local file system
 */
export function downloadCSV() {
  utils.prompt(
      Blockly.Msg.DIALOG_DOWNLOAD_DATA_DIALOG,
      'BlocklyProp_Data',
      function(value) {
        if (value) {
          // Make sure filename is safe
          value = sanitizeFilename(value);

          // eslint-disable-next-line camelcase
          const graph_csv_temp = graph_csv_data.join('\n');
          const idx1 = graph_csv_temp.indexOf('\n') + 1;
          const idx2 = graph_csv_temp.indexOf('\n', idx1 + 1);
          const blob = new Blob(
              [
                graph_csv_temp.substring(0, idx1) +
                  graph_csv_temp.substring(idx2 + 1,
                      graph_csv_temp.length - 1),
              ],
              {type: 'text/csv'});
          saveAs(blob, value + '.csv');
        }
      });
}

/**
 * Graph new lables
 */
// eslint-disable-next-line camelcase,require-jsdoc
function graph_new_labels() {
  // eslint-disable-next-line camelcase
  let graph_csv_temp = '';
  let labelsvg = '<svg width="60" height="300">';
  // eslint-disable-next-line camelcase
  graph_csv_temp += '"time",';
  let labelClass = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  let labelPre = ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
  if (graph_options.graph_type === 'X') {
    labelClass = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7];
    // eslint-disable-next-line max-len
    labelPre = ['x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: '];
  }
  for (let t = 0; t < graph_labels.length; t++) {
    // eslint-disable-next-line max-len
    labelsvg += '<g id="labelgroup' + (t + 1) + '" transform="translate(0,' + (t * 30 + 25) + ')">';
    // eslint-disable-next-line max-len
    labelsvg += '<rect x="0" y = "0" width="60" height="26" rx="3" ry="3" id="label' + (t + 1) + '" ';
    // eslint-disable-next-line max-len
    labelsvg += 'style="stroke:1px;stroke-color:blue;" class="ct-marker-' + labelClass[t] + '"/><rect x="3" y="12"';
    // eslint-disable-next-line max-len
    labelsvg += 'width="54" height="11" rx="3" ry="3" id="value' + (t + 1) + 'bkg" style="fill:rgba';
    // eslint-disable-next-line max-len
    labelsvg += '(255,255,255,.7);stroke:none;"/><text id="label' + (t + 1) + 'text" x="3" ';
    // eslint-disable-next-line max-len
    labelsvg += 'y="9" style="font-family:Arial;font-size: 9px;fill:#fff;font-weight:bold;">' + labelPre[t];
    // eslint-disable-next-line max-len
    labelsvg += graph_labels[t] + '</text><text id="gValue' + (t + 1) + '" x="5" y="21" style="text-align: right;"';
    labelsvg += 'font-family:Arial;font-size: 10px;fill:#000;"></text></g>';
    // eslint-disable-next-line camelcase
    graph_csv_temp += '"' + graph_labels[t].replace(/"/g, '_') + '",';
  }
  labelsvg += '</svg>';
  graph_csv_data.push(graph_csv_temp.slice(0, -1));
  $('#serial_graphing_labels').html(labelsvg);
}

/**
 * Update the labels on the graph
 */
// eslint-disable-next-line camelcase,require-jsdoc
function graph_update_labels() {
  const row = graph_temp_data.length - 1;
  if (graph_temp_data[row]) {
    const col = graph_temp_data[row].length;
    for (let w = 2; w < col; w++) {
      const theLabel = document.getElementById('gValue' + (w - 1).toString(10));
      if (theLabel) {
        theLabel.textContent = graph_temp_data[row][w];
      }
    }
  }
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
