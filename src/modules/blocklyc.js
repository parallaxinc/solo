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

import * as ace from 'ace-builds/src-noconflict/ace';
import * as jsBeautify from 'js-beautify';
import {saveAs} from 'file-saver';

import {EMPTY_PROJECT_CODE_HEADER} from './constants.js';
import {isExperimental} from './url_parameters.js';
import {loadToolbox, getWorkspaceSvg} from './editor.js';
import {CodeEditor} from './code_editor.js';
import {propToolbarButtonController} from './toolbar_controller.js';
import {getPropTerminal} from './prop_term.js';


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {object | null}
 */
let codePropC = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {string | null}
 */
let codeXml = null;


/**
 * TODO: Identify the purpose of this variable
 *
 * @type {null}
 */
let graph = null;


/**
 * Terminal baudrate setting
 *
 * @type {number}
 */
const baudrate = 115200;


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
 * @type {{graph_type: string, fullWidth: boolean, showPoint: boolean, refreshRate: number, axisX: {onlyInteger: boolean, type: *}, sampleTotal: number}}
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
 * Switch the visible pane when a tab is clicked.
 *
 * @param {string} id ID of tab clicked.
 */
function renderContent(id) {
  // Select the active tab.
  const selectedTab = id.replace('tab_', '');
  const isPropcOnlyProject = (projectData.board === 'propcfile');

  // Read the URL for experimental parameters to turn on XML editing
  const allowXmlEditing = isExperimental.indexOf('xedit') > -1;

  if (isPropcOnlyProject) {
    // Show PropC editing UI elements
    $('.propc-only').removeClass('hidden');
  }

  switch (selectedTab) {
    case 'blocks':
      $('.blocklyToolboxDiv').css('display', 'block');

      $('#content_xml').css('display', 'none');
      $('#content_propc').css('display', 'none');
      $('#content_blocks').css('display', 'block');

      $('#btn-view-xml').css('display', 'none');
      $('#btn-view-propc').css('display', 'inline-block');
      $('#btn-view-blocks').css('display', 'none');

      if (allowXmlEditing) {
        if (Blockly && codeXml && codeXml.getValue().length > 40) {
          Blockly.Xml.clearWorkspaceAndLoadFromXml(
              Blockly.Xml.textToDom(codeXml.getValue()),
              Blockly.mainWorkspace);
        }
      }
      // The svgResize method requires a Blockly.WorkspaveSvg object, not
      // a Blockly.Workspace object
      // Blockly.svgResize(Blockly.mainWorkspace);
      Blockly.svgResize(getWorkspaceSvg());
      getWorkspaceSvg().render();
      // Blockly.mainWorkspace.render();
      break;
    case 'propc':
      $('.blocklyToolboxDiv').css('display', 'none');

      $('#content_xml').css('display', 'none');
      $('#content_propc').css('display', 'block');
      $('#content_blocks').css('display', 'none');

      $('#btn-view-xml').css('display', allowXmlEditing ? 'inline-block' : 'none');
      $('#btn-view-blocks').css('display', ((isPropcOnlyProject || allowXmlEditing) ? 'none' : 'inline-block'));
      $('#btn-view-propc').css('display', 'none');

      if (!isPropcOnlyProject) {
        const rawC = prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
        codePropC.setValue(rawC);
        codePropC.gotoLine(0);
      } else {
        if (!codePropC || codePropC.getValue() === '') {
          codePropC.setValue(atob((projectData.code.match(/<field name="CODE">(.*)<\/field>/) || ['', ''])[1] || ''));
          codePropC.gotoLine(0);
        }
        if (codePropC.getValue() === '') {
          let blankProjectCode = '// ------ Libraries and Definitions ------\n';
          blankProjectCode += '#include "simpletools.h"\n\n\n';
          blankProjectCode += '// ------ Global Variables and Objects ------\n\n\n';
          blankProjectCode += '// ------ Main Program ------\n';
          blankProjectCode += 'int main() {\n\n\nwhile (1) {\n\n\n}}';

          const rawC = prettyCode(blankProjectCode);
          codePropC.setValue(rawC);
          codePropC.gotoLine(0);
        }
      }
      break;
    case 'xml':
      $('.blocklyToolboxDiv').css('display', 'none');

      $('#content_xml').css('display', 'block');
      $('#content_propc').css('display', 'none');
      $('#content_blocks').css('display', 'none');

      $('#btn-view-xml').css('display', 'none');
      $('#btn-view-propc').css('display', 'none');
      $('#btn-view-blocks').css('display', 'inline-block');

      // Load project code
      codeXml.setValue(Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace)) || '');
      codeXml.getSession().setUseWrapMode(true);
      codeXml.gotoLine(0);
      break;
  }
}


/**
 * Formats code in editor and sets cursor to the line is was on
 * Used by the code formatter button in the editor UI
 */
// eslint-disable-next-line no-unused-vars
const formatWizard = function() {
  const currentLine = codePropC.getCursorPosition()['row'] + 1;
  codePropC.setValue(prettyCode(codePropC.getValue()));
  codePropC.focus();
  codePropC.gotoLine(currentLine);
};


/**
 * Pretty formatter for C code
 *
 * @param {string} rawCode
 * @return {string}
 */
const prettyCode = function(rawCode) {
  // Prevent JS beautify from improperly formatting reference, dereference, and arrow operators
  rawCode = rawCode
      .replace(/\*([_a-zA-Z\()])/g, '___REFERENCE_OPERATOR___$1')
      .replace(/([_a-zA-Z\()])\*/g, '$1___REFERENCE_OPERATOR___')
      .replace(/&([_a-zA-Z\()])/g, '___DEREFERENCE_OPERATOR___$1')
      .replace(/->/g, '___ARROW_OPERATOR___');

  // run the beautifier
  rawCode = jsBeautify(rawCode, {
    'brace_style': 'expand',
    'indent_size': 2,
  });

  // restore the reference, dereference, and arrow operators
  rawCode = rawCode.replace(/,\n[\s\xA0]+/g, ', ')
      .replace(/___REFERENCE_OPERATOR___/g, '*')
      .replace(/___DEREFERENCE_OPERATOR___/g, '&')
      .replace(/___ARROW_OPERATOR___/g, '->')

      // improve the way functions and arrays are rendered
      .replace(/\)\s*[\n\r]\s*{/g, ') {')
      .replace(/\[([0-9]*)\]\s*=\s*{\s*([0-9xXbBA-F,\s]*)\s*};/g, function(str, m1, m2) {
        m2 = m2.replace(/\s/g, '').replace(/,/g, ', ');
        return '[' + m1 + '] = {' + m2 + '};';
      });

  return (rawCode);
};


/**
 * Toggle the find-replace display style between 'block' and 'none'
 */
// eslint-disable-next-line no-unused-vars
const findReplaceCode = function() {
  if (document.getElementById('find-replace').style.display === 'none') {
    document.getElementById('find-replace').style.display = 'block';
  } else {
    document.getElementById('find-replace').style.display = 'none';
  }
};


/**
 * Submit a project's source code to the cloud compiler
 *
 * @param {string} text
 * @param {string} action
 * @param {function} successHandler Define a callback to be executed upon
 *  sucessful compilation
 */
function cloudCompile(text, action, successHandler) {
  // if PropC is in edit mode, get it from the editor, otherwise render it from the blocks.
  let propcCode = '';

  if (codePropC.getReadOnly()) {
    propcCode = prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace));
  } else {
    propcCode = codePropC.getValue();
  }

  if (propcCode.indexOf('EMPTY_PROJECT') > -1) {
    utils.showMessage(Blockly.Msg.DIALOG_EMPTY_PROJECT, Blockly.Msg.DIALOG_CANNOT_COMPILE_EMPTY_PROJECT);
  } else {
    $('#compile-dialog-title').text(text);
    $('#compile-console').val('Compile... ');
    $('#compile-dialog').modal('show');

    let terminalNeeded = null;

    // TODO: propc editor needs UI for settings for terminal and graphing
    if (projectData.board !== 'propcfile') {
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

    // Contact the container running cloud compiler. If the browser is
    // connected via https, direct the compile request to the same port and
    // let the load balancer direct the request to the compiler.
    // --------------------------------------------------------------------
    let postUrl = 'https://' + window.location.hostname + ':443/single/prop-c/' + action;
    if (window.location.protocol === 'http:') {
      postUrl = 'http://' + window.location.hostname + ':5001/single/prop-c/' + action;
    }
    $.ajax({
      'method': 'POST',
      'url': postUrl,
      'data': {'code': propcCode},
    }).done(function(data) {
      console.log(data);

      // Check for an error response from the compiler
      if (!data || data['compiler-error'] != '') {
        // Get message as a string, or blank if undefined
        const message = (typeof data['compiler-error'] === 'string') ? data['compiler-error'] : '';

        // Display the result in the compile console modal <div>
        $('#compile-console').val($('#compile-console').val() +
            data['compiler-output'] + data['compiler-error'] + message);
      } else {
        const loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';

        $('#compile-console').val($('#compile-console').val() +
            data['compiler-output'] + data['compiler-error'] + loadWaitMsg);

        if (data.success && successHandler) {
          successHandler(data, terminalNeeded);
        }

        // Scroll automatically to the bottom after new data is added
        document.getElementById('compile-console').scrollTop =
            document.getElementById('compile-console').scrollHeight;
      }
    }).fail(function(data) {
      // Data appears to be an HTTP response object
      if (data) {
        const message = 'A compiler server error "' + data.status + '" has been detected.';
        $('#compile-console').val($('#compile-console').val() + message);
      }
    });
  }
}


/**
 * Stub function to the cloudCompile function
 */
function compile() {
  cloudCompile('Compile', 'compile', null);
}


/**
 * return the address for the cloud compiler
 * @param {string} action Select the compile option to use,
 * @return {string}
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function getCompilerUrl(action) {
  // Prepare a url for the local Docker environment
  if (window.location.hostname === 'localhost') {
    return window.location.protocol + '//localhost:5001/single/prop-c/' + action;
  }

  // Direct compilation to the cloud compiler service
  return window.location.protocol + '//' + window.location.hostname + 'compile/single/prop-c/' + action;
}


/**
 * Begins loading process
 *
 * @param {string} modalMessage message shown at the top of the compile/load modal.
 * @param {string} compileCommand for the cloud compiler (bin/eeprom).
 * @param {string} loadOption command for the loader (CODE/VERBOSE/CODE_VERBOSE).
 * @param {string} loadAction command for the loader (RAM/EEPROM).
 *
 * USED by the COMPILE, LOAD TO RAM, and LOAD TO EEPROM UI buttons directly (blocklyc.jsp/blocklyc.html)
 */
export function loadInto(modalMessage, compileCommand, loadOption, loadAction) {
  if (clientService.portsAvailable) {
    cloudCompile(modalMessage, compileCommand, function(data, terminalNeeded) {
      // TODO: Linter claims that this expression is always false
      if (clientService.type === 'ws') {
        // Prep for new download messages
        clientService.resultLog = '';
        clientService.loadBinary = false;
        const programToSend = {
          type: 'load-prop',
          action: loadAction,
          payload: data.binary,
          debug: (terminalNeeded) ? terminalNeeded : 'none',
          extension: data.extension,
          portPath: getComPort(),
        };
        clientService.activeConnection.send(JSON.stringify(programToSend));
      } else {
        if (clientService.version.isCoded) {
          // Request load with options from BlocklyProp Client
          $.post(clientService.url('load.action'), {
            'option': loadOption,
            'action': loadAction,
            'binary': data.binary,
            'extension': data.extension,
            'comport': getComPort(),
          }, function(loadData) {
            // Replace response message's consecutive white space with a new-line, then split at new lines
            const message = loadData.message.replace(/\s{2,}/g, '\n').split('\n');
            // If responses have codes, check for all success codes (< 100)
            let success = true;
            const coded = (loadOption === 'CODE' || loadOption === 'CODE_VERBOSE');
            if (coded) {
              message.forEach(function(x) {
                success = success && x.substr(0, 3) < 100;
              });
            }
            // Display results
            let result = '';
            if (success && coded) {
              // Success! Keep it simple
              result = ' Succeeded.';
            } else {
              // Failed (or not coded); Show the details
              const error = [];
              message.forEach(function(x) {
                error.push(x.substr((coded) ? 4 : 0));
              });
              result = ((coded) ? ' Failed!' : '') + '\n\n-------- loader messages --------\n' + error.join('\n');
            }

            $('#compile-console').val($('#compile-console').val() + result);

            // Scroll automatically to the bottom after new data is added
            document.getElementById('compile-console').scrollTop =
                document.getElementById('compile-console').scrollHeight;
            if (terminalNeeded === 'term' && loadData.success) {
              serial_console();
            } else if (terminalNeeded === 'graph' && loadData.success) {
              graphing_console();
            }
          });
        } else {
          // TODO: Remove this once client_min_version is >= minCodedVer
          // Request load without options from old BlocklyProp Client
          $.post(clientService.url('load.action'), {
            'action': loadAction,
            'binary': data.binary,
            'extension': data.extension,
            'comport': getComPort(),
          }, function(loadData) {
            $('#compile-console').val($('#compile-console').val() + loadData.message);

            // Scroll automatically to the bottom after new data is added
            document.getElementById('compile-console').scrollTop =
                document.getElementById('compile-console').scrollHeight;
            if (terminalNeeded === 'term' && loadData.success) {
              serial_console();
            } else if (terminalNeeded === 'graph' && loadData.success) {
              graphing_console();
            }
          });
        }
      }
    });
  } else if (clientService.available) {
    utils.showMessage(Blockly.Msg.DIALOG_NO_DEVICE, Blockly.Msg.DIALOG_NO_DEVICE_TEXT);
  } else {
    utils.showMessage(Blockly.Msg.DIALOG_DEVICE_COMM_ERROR, Blockly.Msg.DIALOG_DEVICE_COMM_ERROR_TEXT);
  }
}


/**
 * Serial console support
 */
// eslint-disable-next-line camelcase,require-jsdoc
function serial_console() {
  clientService.sendCharacterStreamTo = 'term';

  // HTTP client
  // TODO: Linter claims that this expression is always false
  if (clientService.type !== 'ws') {
    if (clientService.portsAvailable) {
      // Container and flag needed to receive and parse initial connection
      // string before serial data begins streaming in.
      let connString = '';
      let connStrYet = false;

      // open a websocket to the BPC for just the serial communications
      const connection = new WebSocket(clientService.url('serial.connect', 'ws'));

      // When the connection is open, open com port
      connection.onopen = function() {
        connString = '';
        connStrYet = false;
        connection.send('+++ open port ' + getComPort() + (baudrate ? ' ' + baudrate : ''));
        clientService.activeConnection = connection;
      };

      // Log errors
      connection.onerror = function(error) {
        console.log('WebSocket Error');
        console.log(error);
      };

      // Receive characters
      connection.onmessage = function(e) {
        // incoming data is base64 encoded
        const charBuffer = atob(e.data);
        if (connStrYet) {
          pTerm.display(charBuffer);
        } else {
          connString += charBuffer;
          if (connString.indexOf(baudrate.toString(10)) > -1) {
            connStrYet = true;
            displayTerminalConnectionStatus(connString.trim());
          } else {
            pTerm.display(e.data);
          }
        }
        pTerm.focus();
      };

      // When the user closed the console, close the serial comms connection
      $('#console-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        clientService.activeConnection = null;
        connString = '';
        connStrYet = false;
        connection.close();
        displayTerminalConnectionStatus(null);
        pTerm.display(null);
      });
    } else {
      // Remove any previous connection
      clientService.activeConnection = null;

      // Display a "No connected devices" message in the terminal
      displayTerminalConnectionStatus(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT);
      pTerm.display(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES + '\n');

      // Clear the terminal if the user closes it.
      $('#console-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        displayTerminalConnectionStatus(null);
        pTerm.display(null);
      });
    }
  } else if (clientService.type === 'ws') { // TODO: Condition always false warning
    // using Websocket-only client

    const messageToSend = {
      type: 'serial-terminal',
      outTo: 'terminal',
      portPath: getComPort(),
      baudrate: baudrate.toString(10),
      msg: 'none',
      action: 'open',
    };

    if (messageToSend.portPath !== 'none') {
      displayTerminalConnectionStatus([
        Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED,
        messageToSend.portPath,
        Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE,
        messageToSend.baudrate,
      ].join[' ']);
    } else {
      displayTerminalConnectionStatus(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT);
      pTerm.display(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES + '\n');
    }

    clientService.activeConnection.send(JSON.stringify(messageToSend));

    $('#console-dialog').on('hidden.bs.modal', function() {
      clientService.sendCharacterStreamTo = null;
      if (messageToSend.action !== 'close') { // because this is getting called multiple times...?
        messageToSend.action = 'close';
        displayTerminalConnectionStatus(null);
        clientService.activeConnection.send(JSON.stringify(messageToSend));
      }
      pTerm.display(null);
    });
  }

  $('#console-dialog').modal('show');
}

/**
 * Display information about the serial connection to the device
 * @param {string | null} connectionInfo text to display above the console or graph
 */
function displayTerminalConnectionStatus(connectionInfo) {
  $('.connection-string').html(connectionInfo ? connectionInfo : '');
}


/**
 * Graphing console
 */
// eslint-disable-next-line camelcase,require-jsdoc
function graphing_console() {
  clientService.sendCharacterStreamTo = 'graph';

  if (getGraphSettingsFromBlocks()) {
    if (graph === null) {
      graph_reset();
      graphTempString = '';
      graph = new Chartist.Line('#serial_graphing', graph_data, graph_options);
      if (window.getURLParameter('debug')) {
        console.log(graph_options);
      }
    } else {
      graph.update(graph_data, graph_options);
    }

    // TODO: Condition is always null warning
    if (clientService.type === 'http' && clientService.portsAvailable) {
      // Container and flag needed to receive and parse initial connection
      // string before serial data begins streaming in.
      let connString = '';
      let connStrYet = false;
      const connection = new WebSocket(clientService.url('serial.connect', 'ws'));

      // When the connection is open, open com port
      connection.onopen = function() {
        connection.send('+++ open port ' + getComPort() + (baudrate ? ' ' + baudrate : ''));
        graphStartStop('start');
      };

      // Log errors
      connection.onerror = function(error) {
        console.log('WebSocket Error');
        console.log(error);
      };

      connection.onmessage = function(e) {
        const charBuffer = atob(e.data);
        if (connStrYet) {
          graph_new_data(charBuffer);
        } else {
          connString += charBuffer;
          if (connString.indexOf(baudrate.toString(10)) > -1) {
            connStrYet = true;
            displayTerminalConnectionStatus(connString.trim());
          } else {
            graph_new_data(charBuffer);
          }
        }
      };

      $('#graphing-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        connection.close();
        graphStartStop('stop');
        connString = '';
        connStrYet = false;
        displayTerminalConnectionStatus(null);
      });
    } else if (clientService.type === 'ws' && clientService.portsAvailable) {
      const messageToSend = {
        type: 'serial-terminal',
        outTo: 'graph',
        portPath: getComPort(),
        baudrate: baudrate.toString(10),
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
        displayTerminalConnectionStatus(Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT);
      }

      clientService.activeConnection.send(JSON.stringify(messageToSend));

      // eslint-disable-next-line camelcase
      if (!graph_interval_id) {
        graphStartStop('start');
      }

      $('#graphing-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        graphStartStop('stop');
        if (messageToSend.action !== 'close') { // because this is getting called multiple times.... ?
          messageToSend.action = 'close';
          displayTerminalConnectionStatus(null);
          clientService.activeConnection.send(JSON.stringify(messageToSend));
        }
      });
    } else {
      // create simulated graph?
      displayTerminalConnectionStatus(Blockly.Msg.DIALOG_GRAPH_NO_DEVICES_TO_CONNECT);
    }

    $('#graphing-dialog').modal('show');
    if (document.getElementById('btn-graph-play')) {
      document.getElementById('btn-graph-play').innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
    }
  } else {
    utils.showMessage(Blockly.Msg.DIALOG_MISSING_BLOCKS, Blockly.Msg.DIALOG_MISSING_BLOCKS_GRAPHING);
  }
}

/**
 * getGraphSettingsFromBlocks
 * @description sets the graphing engine's settings and graph labels
 * based on values in the graph setup and output blocks
 * @return {boolean} true if the appropriate graphing blocks are present and false if they are not
 */
function getGraphSettingsFromBlocks() {
  // TODO: propc editor needs UI for settings for terminal and graphing
  if (projectData.board === 'propcfile') {
    return false;
  }
  const graphSettingsBlocks = Blockly.getMainWorkspace().getBlocksByType('graph_settings');

  if (graphSettingsBlocks.length > 0) {
    console.log('found settings');
    const graphOutputBlocks = Blockly.getMainWorkspace().getBlocksByType('graph_output');
    // eslint-disable-next-line camelcase
    graph_labels = [];
    if (graphOutputBlocks.length > 0) {
      console.log('found block');
      let i = 0;
      while (graphOutputBlocks[0].getField('GRAPH_LABEL' + i)) {
        graph_labels.push(graphOutputBlocks[0].getFieldValue('GRAPH_LABEL' + i));
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


    if (graphSettingsBlocks[0].getFieldValue('YMIN') || graphSettingsBlocks[0].getFieldValue('YMAX')) {
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
      if (graphSettingsBlocks[0].getFieldValue('XMIN') || graphSettingsBlocks[0].getFieldValue('XMAX')) {
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
      graph_options.sampleTotal = Number(graphSettingsBlocks[0].getFieldValue('XAXIS') || '10');
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
const graphStartStop = function(action) {
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
    graph_reset();
    graph_play('play');
  }
  if (action === 'clear') {
    graph_reset();
  }
  if (action === 'play') {
    if (graph_data.series[0].length === 0) {
      graph_reset();
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
 * Update the list of serial ports available on the host machine
 * NOTE: This function is used by the BP-Client only.
 * The BP-Launcher handles this differently inside of blocklypropclient.js
 */
const checkForComPorts = function() {
  // TODO: We need to evaluate this when using web sockets ('ws') === true
  try {
    if (clientService.type !== 'ws') {
      $.get(clientService.url('ports.json'), function(data) {
        setPortListUI(data);
      }).fail(function() {
        setPortListUI();
      });
    }
  } catch (e) {
    console.log('Unable to get port list. %s', e.message);
    setPortListUI();
  }
};

export const selectComPort = function(comPort) {
  if (comPort !== null) {
    $('#comPort').val(comPort);
  }
  if ($('#comPort').val() === null && $('#comPort option').size() > 0) {
    $('#comPort').val($('#comPort option:first').text());
  }
};


/**
 * Check for active com ports when the DOM processing has finished
 */
$(document).ready(function() {
  // Display the app name in the upper-left corner of the page
  showAppName();
  checkForComPorts();
});


/**
 * Return the selected com port name
 *
 * @return {string}
 */
export const getComPort = function() {
  const commPortSelection = $('#comPort').val();
  if (commPortSelection === Blockly.Msg.DIALOG_PORT_SEARCHING || commPortSelection === Blockly.Msg.DIALOG_NO_DEVICE) {
    return 'none';
  } else {
    return commPortSelection;
  }
};


/**
 * Save a project to the local file system
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function downloadPropC() {
  const propcCode = Blockly.propc.workspaceToCode(Blockly.mainWorkspace);
  const isEmptyProject = propcCode.indexOf('EMPTY_PROJECT') > -1;
  if (isEmptyProject) {
    // The project is empty, so warn and exit.
    utils.showMessage(Blockly.Msg.DIALOG_EMPTY_PROJECT, Blockly.Msg.DIALOG_CANNOT_SAVE_EMPTY_PROJECT);
  } else {
    // Make sure the filename doesn't have any illegal characters
    const value = sanitizeFilename(projectData.name);

    let sideFileContent = '.c\n>compiler=C\n>memtype=cmm main ram compact\n';
    sideFileContent += '>optimize=-Os\n>-m32bit-doubles\n>-fno-exceptions\n>defs::-std=c99\n';
    sideFileContent += '>-lm\n>BOARD::ACTIVITYBOARD';

    const fileCblob = new Blob([propcCode], {type: 'text/plain'});
    const fileSIDEblob = new Blob([value + sideFileContent], {type: 'text/plain'});

    const zip = new JSZip();
    const sideFolder = zip.folder(value);
    sideFolder.file(value + '.c', fileCblob);
    sideFolder.file(value + '.side', fileSIDEblob);

    sideFolder.generateAsync({type: 'blob'}).then(function(blob) { // 1) generate the zip file
      saveAs(blob, value + '.zip');                                 // 2) trigger the download
    }, function(err) {
      utils.showMessage(Blockly.Msg.DIALOG_ERROR, Blockly.Msg.DIALOG_SIDE_FILES_ERROR + err);
    });
  }
}


/**
 * Sanitize a string into an OS-safe filename
 *
 * @param {string} input string representing a potential filename
 * @return {string}
 */
function sanitizeFilename(input) {
  // if the input is not a string, or is an empty string, return a
  // generic filename
  if (typeof input !== 'string' || input.length < 1) {
    return 'my_project';
  }

  // replace OS-illegal characters or phrases
  input = input.replace(/[\/\?<>\\:\*\|"]/g, '_')
      // eslint-disable-next-line no-control-regex
      .replace(/[\x00-\x1f\x80-\x9f]/g, '_')
      .replace(/^\.+$/, '_')
      .replace(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i, '_')
      .replace(/[\. ]+$/, '_');

  // if the filename is too long, truncate it
  if (input.length > 31) {
    return input.substring(0, 30);
  }

  return input;
}


/**
 * Graph the data represented in the stream parameter
 *
 * @param {string} stream
 */
// eslint-disable-next-line camelcase,require-jsdoc
function graph_new_data(stream) {
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
          if (parseFloat(graph_temp_data[row][0]) < parseFloat(graph_temp_data[row - 1][1])) {
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
          let graph_csv_temp = (Math.round(graph_temp_data[row][0] * 10000) / 10000) + ',';

          if (graph_options.graph_type === 'X') {   // xy scatter plot
            let jk = 0;
            for (let j = 2; j < graph_temp_data[row].length; j = j + 2) {
              // eslint-disable-next-line camelcase
              graph_csv_temp += graph_temp_data[row][j] + ',' + graph_temp_data[row][j + 1] + ',';
              graph_data.series[jk].push({
                x: graph_temp_data[row][j] || null,
                y: graph_temp_data[row][j + 1] || null,
              });
              if (graph_temp_data[row][0] > graph_options.sampleTotal) {
                graph_data.series[jk].shift();
              }
              jk++;
            }
          } else {    // Time series graph
            for (j = 2; j < graph_temp_data[row].length; j++) {
              // eslint-disable-next-line camelcase
              graph_csv_temp += graph_temp_data[row][j] + ',';
              graph_data.series[j - 2].push({
                x: graph_temp_data[row][0],
                y: graph_temp_data[row][j] || null,
              });
              $('.ct_line').css('stroke-width', '2.5px');  // TODO: if this slows performance too much - explore changing the stylesheet (https://stackoverflow.com/questions/50036922/change-a-css-stylesheets-selectors-properties/50036923#50036923)
              if (graph_temp_data[row][0] > graph_options.sampleTotal) {
                graph_data.series[j - 2].shift();
              }
            }
          }

          graph_csv_data.push(graph_csv_temp.slice(0, -1).split(','));

          // limits total number of data points collected to prevent memory issues
          if (graph_csv_data.length > 15000) {
            graph_csv_data.shift();
          }
        }

        graphTempString = '';
      } else {
        // eslint-disable-next-line camelcase
        if (!graph_data_ready) {            // wait for a full set of data to
          if (stream[k] === '\r') {       // come in before graphing, ends up
            // eslint-disable-next-line camelcase
            graph_data_ready = true;    // tossing the first point but prevents
          }                               // garbage from mucking up the graph.
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
function graph_reset() {
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
// eslint-disable-next-line camelcase,require-jsdoc
function graph_play(setTo) {
  if (document.getElementById('btn-graph-play')) {
    // eslint-disable-next-line camelcase
    const play_state = document.getElementById('btn-graph-play').innerHTML;
    if (setTo !== 'play' && (play_state.indexOf('pause') > -1 || play_state.indexOf('<!--p') === -1)) {
      document.getElementById('btn-graph-play').innerHTML = '<!--play--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M4,3 L4,11 10,7 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
      if (!setTo) {
        graphStartStop('pause');
      }
    } else {
      document.getElementById('btn-graph-play').innerHTML = '<!--pause--><svg xmlns="http://www.w3.org/2000/svg" width="14" height="15"><path d="M5.5,2 L4,2 4,11 5.5,11 Z M8.5,2 L10,2 10,11 8.5,11 Z" style="stroke:#fff;stroke-width:1;fill:#fff;"/></svg>';
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
// eslint-disable-next-line no-unused-vars,require-jsdoc
function downloadGraph() {
  utils.prompt(Blockly.Msg.DIALOG_DOWNLOAD_GRAPH_DIALOG, 'BlocklyProp_Graph', function(value) {
    if (value) {
      // Make sure filename is safe
      value = sanitizeFilename(value);

      const svgGraph = document.getElementById('serial_graphing');
      const pattern = new RegExp('xmlns="http://www.w3.org/2000/xmlns/"', 'g');
      const findY = 'class="ct-label ct-horizontal ct-end"';
      const chartStyle = '<style>.ct-grid-background,.ct-line{fill:none}.ct-point{stroke-width:10px;stroke-linecap:round}.ct-grid{stroke:rgba(0,0,0,.2);stroke-width:1px;stroke-dasharray:2px}.ct-area{stroke:none;fill-opacity:.1}.ct-line{stroke-width:1px}.ct-point{stroke-width:5px}.ct-series-a{stroke:#00f}.ct-series-b{stroke:#0bb}.ct-series-c{stroke:#0d0}.ct-series-d{stroke:#dd0}.ct-series-e{stroke:#f90}.ct-series-f{stroke:red}.ct-series-g{stroke:#d09}.ct-series-h{stroke:#90d}.ct-series-i{stroke:#777}.ct-series-j{stroke:#000}text{font-family:sans-serif;fill:rgba(0,0,0,.4);color:rgba(0,0,0,.4);font-size:.75rem;line-height:1;overflow:visible}</style>';
      let svgxml = new XMLSerializer().serializeToString(svgGraph);

      svgxml = svgxml.replace(pattern, '');
      svgxml = svgxml.replace(/foreignObject/g, 'text');
      svgxml = svgxml.replace(/([<|</])a[0-9]+:/g, '$1');
      svgxml = svgxml.replace(/xmlns: /g, '');
      svgxml = svgxml.replace(/x="10" /g, 'x="40" ');

      svgxml = svgxml.substring(svgxml.indexOf('<svg'), svgxml.length - 6);
      const foundY = svgxml.indexOf(findY);
      const theY = parseFloat(svgxml.substring(svgxml.indexOf(' y="', foundY + 20) + 4, svgxml.indexOf('"', svgxml.indexOf(' y="', foundY + 20) + 4)));
      const regY = new RegExp('y="' + theY + '"', 'g');
      svgxml = svgxml.replace(regY, 'y="' + (theY + 12) + '"');
      const breakpoint = svgxml.indexOf('>') + 1;
      svgxml = svgxml.substring(0, breakpoint) + chartStyle + svgxml.substring(breakpoint, svgxml.length);
      svgxml = svgxml.replace(/<text style="overflow: visible;" ([xy])="([0-9.-]+)" ([xy])="([0-9.-]+)" [a-z]+="[0-9.]+" [a-z]+="[0-9.]+"><span[0-9a-zA-Z =.":;/-]+>([0-9.-]+)<\/span>/g, '<text $1="$2" $3="$4">$5');

      const blob = new Blob([svgxml], {type: 'image/svg+xml'});
      saveAs(blob, value + '.svg');
    }
  });
}


/**
 * Download the graph as a csv file to the local file system
 */
function downloadCSV() {
  utils.prompt(Blockly.Msg.DIALOG_DOWNLOAD_DATA_DIALOG, 'BlocklyProp_Data', function(value) {
    if (value) {
      // Make sure filename is safe
      value = sanitizeFilename(value);

      // eslint-disable-next-line camelcase
      const graph_csv_temp = graph_csv_data.join('\n');
      const idx1 = graph_csv_temp.indexOf('\n') + 1;
      const idx2 = graph_csv_temp.indexOf('\n', idx1 + 1);
      const blob = new Blob([graph_csv_temp.substring(0, idx1) + graph_csv_temp.substring(idx2 + 1, graph_csv_temp.length - 1)], {type: 'text/csv'});
      saveAs(blob, value + '.csv');
    }
  });
}


/**
 *
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
    labelPre = ['x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: ', 'x: ', 'y: '];
  }
  for (let t = 0; t < graph_labels.length; t++) {
    labelsvg += '<g id="labelgroup' + (t + 1) + '" transform="translate(0,' + (t * 30 + 25) + ')">';
    labelsvg += '<rect x="0" y = "0" width="60" height="26" rx="3" ry="3" id="label' + (t + 1) + '" ';
    labelsvg += 'style="stroke:1px;stroke-color:blue;" class="ct-marker-' + labelClass[t] + '"/><rect x="3" y="12"';
    labelsvg += 'width="54" height="11" rx="3" ry="3" id="value' + (t + 1) + 'bkg" style="fill:rgba';
    labelsvg += '(255,255,255,.7);stroke:none;"/><text id="label' + (t + 1) + 'text" x="3" ';
    labelsvg += 'y="9" style="font-family:Arial;font-size: 9px;fill:#fff;font-weight:bold;">' + labelPre[t];
    labelsvg += graph_labels[t] + '</text><text id="gValue' + (t + 1) + '" x="5" y="21" style="align:right;';
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
 *Display the application name
 */
function showAppName() {
  const html = 'BlocklyProp<br><strong>Solo</strong>';
  $('#nav-logo').html(html);
}


/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */
/* ------------------------------------------------------------------------- */


/**
 * Initialize Blockly
 *
 * Called on page load. Loads a Blockly project onto the editor pallet
 *
 * @param {!Blockly} blockly Instance of Blockly from iframe.
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function initOldVersionCode(blockly) {
  if (!codePropC) {
    codePropC = new CodeEditor('propcfile');

    codePropC = ace.edit('code-propc');
    codePropC.setTheme('ace/theme/chrome');
    codePropC.getSession().setMode('ace/mode/c_cpp');
    codePropC.getSession().setTabSize(2);
    codePropC.$blockScrolling = Infinity;
    codePropC.setReadOnly(true);

    // if the project is a propc code-only project, enable code editing.
    if (projectData.board === 'propcfile') {
      codePropC.setReadOnly(false);
    }
  }

  if (!codeXml && isExperimental.indexOf('xedit') > -1) {
    codeXml = ace.edit('code-xml');
    codeXml.setTheme('ace/theme/chrome');
    codeXml.getSession().setMode('ace/mode/xml');
  }

  window.Blockly = blockly;

  // TODO: Replace string length check with code that detects the first <block> xml element.
  if (projectData) {
    // Looking for the first <block> XML element
    const searchTerm = '<block';

    if (!projectData.code || projectData.code.indexOf(searchTerm) < 0) {
      projectData.code = EMPTY_PROJECT_CODE_HEADER + '</xml>';
    }
    if (projectData.board !== 'propcfile') {
      loadToolbox(projectData.code);
    }
  }
}


/**
 * Initialize Blockly
 *
 * Called on page load. Loads a Blockly project onto the editor pallet
 *
 * @param {!Blockly} blockly Instance of Blockly from iframe.
 */
function init(blockly) {
  // TODO: Why is this happening?
  window.Blockly = blockly;

  if (projectData) {
    // Looking for the first <block> XML element
    const searchTerm = '<block';

    if (projectData.board !== 'propcfile') {
      codePropC = new CodeEditor(projectData.board);
      loadToolbox(projectData.code);
    }
    if (!projectData.code || projectData.code.indexOf(searchTerm) < 0) {
      projectData.code = EMPTY_PROJECT_CODE_HEADER + '</xml>';
    }
  } else {
    projectData.code = EMPTY_PROJECT_CODE_HEADER + '</xml>';
  }
}

// ---------------------------------------


/**
 * Client Service Object
 */
export const clientService = {
  available: false,             // {boolean} Has a client (BPC/BPL) successfully connected
  portsAvailable: false,        // {boolean} Are any serial ports enumerated
  path: 'localhost',            // {string} usually "localhost", but can be configured to point to a client at any reachable IP/DNS address
  port: 6009,                   // {number} BlocklyProp Client/Launcher port number
  type: null,                   // {string} null, "ws", "http"

  rxBase64: true,               // {boolean} BP Launcher full base64 encoding support flag
  loadBinary: false,            // {boolean} BP Launcher download message flag
  resultLog: '',                // {boolean} BP Launcher result log

  portListReceiveCountUp: 0,    // This is set to 0 each time the port list is received, and incremented once each 4 second heartbeat
  activeConnection: null,       // Used differently by BPL and BPC - pointer to connection object

  sendCharacterStreamTo: null,  // {string} null, "term", or "graph". Flag to inform connection methods which modal/class to send characters to be displayed to

  url: function(location, protocol) {
    return (protocol || window.location.protocol.replace(':', '')) + '://' + this.path + ':' + this.port + '/' + (location || '');
  },
  version: {
    // Constants
    MINIMUM_ALLOWED: '0.7.0', // {string} Semantic versioning, minimum client (BPL/BPC) allowed
    RECOMMENDED: '0.11.0',    // {string} Semantic versioning, minimum recommended client/launcher version
    CODED_MINIMUM: '0.7.5',   // {string} Semantic versioning, Minimum client/launcher version supporting coded/verbose responses (remove after MINIMUM_ALLOWED > this)

    // Variables
    current: '0.0.0',         // {string} Semantic versioning, Current version
    currentAsNumber: 0,       // {number} Version as an integer calulated from string representation
    isValid: false,           // {boolean} current >= MINIMUM_ALLOWED
    isRecommended: false,     // {boolean} current >= RECOMMENDED
    isCoded: false,           // {boolean} current >= CODED_MINIMUM

    // Returns integer calculated from passed in string representation of version
    getNumeric: function(rawVersion) {
      let tempVersion = rawVersion.toString().split('.');
      tempVersion.push('0');

      if (tempVersion.length < 3) {
        if (tempVersion.length === 1) {
          tempVersion = '0.0.0';
        } else {
          tempVersion.unshift('0');
        }
      }

      // Allow for any of the three numbers to be between 0 and 1023.
      // Equivalent to: (Major * 104856) + (Minor * 1024) + Revision.
      return (Number(tempVersion[0]) << 20 | Number(tempVersion[1]) << 10 | Number(tempVersion[2]));
    },

    // Sets self-knowledge of current client/launcher version.
    set: function(rawVersion) {
      this.current = rawVersion;
      this.currentAsNumber = this.getNumeric(rawVersion);
      this.isValid = (this.getNumeric(rawVersion) >= this.getNumeric(this.MINIMUM_ALLOWED));
      this.isRecommended = (this.getNumeric(rawVersion) >= this.getNumeric(this.RECOMMENDED));
      this.isCoded = (this.getNumeric(rawVersion) >= this.getNumeric(this.CODED_MINIMUM));   // remove after MINIMUM_ALLOWED is greater
    },
  },
};

// Status Notice IDs
const NS_DOWNLOADING                 = 2;   // 002;
const NS_DOWNLOAD_SUCCESSFUL         = 5;   // 005;

// Error Notice IDs
const NE_DOWNLOAD_FAILED             = 102;


$(document).ready(function() {
  findClient();
  setInterval(findClient, 3500);
});

const findClient = function() {
  // Try to connect to the BP-Launcher (websocket) first
  // TODO: evaluation is always true, probably not what we want here.
  if (!clientService.available && clientService.type !== 'http') {
    establishBPLauncherConnection();
  }

  // Check how much time has passed since the port list was received from the BP-Launcher
  if (clientService.type === 'ws') {
    clientService.portListReceiveCountUp++;

    // Is the BP-Launcher taking to long to respond?  If so, close the connection
    if (clientService.portListReceiveCountUp > 2) {
      clientService.activeConnection.close();
      // TODO: check to see if this is really necesssary - it get's called by the WS onclose handler
      lostWSConnection();
    }
  }

  // BP-Launcher not found? Try connecting to the BP-Client
  if (clientService.type !== 'ws') {
    establishBPClientConnection();
  }

  // If connected to the BP-Client, poll for an updated port list
  if (clientService.type === 'http') {
    checkForComPorts();
  }
};


/**
 * Set button state for the Compiler toolbar
 * @deprecated Replaced with propToolbarButtonController(), located in the
 * toolbar_controller module.
 */
/*
const setPropToolbarButtons = function() {
  if (clientService.available) {
    if (projectData && projectData.board === 's3') {
      // Hide the buttons that are not required for the S3 robot
      $('.no-s3').addClass('hidden');
      $('#client-available').addClass('hidden');
      // Reveal the short client available message
      $('#client-available-short').removeClass('hidden');
    } else {
      // Reveal these buttons
      $('.no-s3').removeClass('hidden');
      $('#client-available').removeClass('hidden');
      $('#client-available-short').addClass('hidden');
    }

    $('#client-unavailable').addClass('hidden');
    $('.client-action').removeClass('disabled');
  } else {
    // Disable the toolbar buttons
    $('#client-unavailable').removeClass('hidden');
    $('#client-available').addClass('hidden');
    $('#client-available-short').addClass('hidden');
    $('.client-action').addClass('disabled');
  }
};
*/

/**
 *  Update the state of the Compiler toolbar buttons
 *
 * @param {boolean} connected
 *
 * @deprecated
 * WARNING!
 * This function is moving to the toolbar_controller.js module.
 */
/*
const propToolbarButtonController = (connected) => {
  if (projectData && projectData.board === 's3') {
    // ----------------------------------------------------------------
    // Hide the buttons that are not required for the S3 robot
    //
    // Find all of the HTML elements that have a class id of 'no-s3'
    // and append a hidden attribute to the selected HTML elements.
    // This currently applies to the elements prop-btn-ram and
    // prop-btn-graph.
    // ----------------------------------------------------------------
    $('.no-s3').addClass('hidden');

    // Toggle the client available message to display the short form
    $('#client-available').addClass('hidden');
    $('#client-available-short').removeClass('hidden');
  } else {
    // Reveal these buttons
    $('.no-s3').removeClass('hidden');

    // Toggle the client available message to display the long form
    $('#client-available').removeClass('hidden');
    $('#client-available-short').addClass('hidden');
  }

  // Update elements when we are connected
  if (connected) {
    // Hide the 'client unavailable' message
    $('#client-unavailable').addClass('hidden');

    // Enable these buttons:
    //   Compile to RAM
    //   Compile to EEPROM
    //   Open Terminal
    //   Open graphing window
    // --------------------------------------------------------------
     $('.client-action').removeClass('disabled');
  } else {
    // Disable the toolbar buttons
    $('#client-unavailable').removeClass('hidden');
    $('#client-available').addClass('hidden');
    $('#client-available-short').addClass('hidden');
    $('.client-action').addClass('disabled');
  }
};
*/

/**
 * checkClientVersionModal
 * Displays a modal with information about the client version if the one
 * being used is outdated. If the version is below the recommended version,
 * the user is warned, and versions below the minimum are alerted.
 * @param {string} rawVersion A string representing the client version in
 *  '0.0.0' format (Semantic versioning)
 */
function checkClientVersionModal(rawVersion) {
  if (rawVersion) {
    clientService.version.set(rawVersion);
  }
  if (!clientService.version.isRecommended) {
    $('.bpc-version').addClass('hidden');

    if (clientService.version.currentAsNumber === 0) {
      $('#client-unknown-span').removeClass('hidden');
    } else if (clientService.version.isValid) {
      $('#client-warning-span').removeClass('hidden');
    } else {
      $('#client-danger-span').removeClass('hidden');
    }

    $('.client-required-version').html(clientService.version.RECOMMENDED);
    if (clientService.version.currentAsNumber === 0) {
      $('.client-your-version').html('<b>UNKNOWN</b>');
    } else {
      $('.client-your-version').html(clientService.version.current);
    }
    $('#client-version-modal').modal('show');
  }
}

/**
 * Establish a connection to the BlocklyProp-Client (BPC) application
 * Retrieves the BPC's version
 * Sets parameters in the clientService object
 * Calls UI configuration functions
 */
const establishBPClientConnection = function() {
  // Load data from the server using a HTTP GET request.
  $.get(clientService.url(), function(data) {
    if (!clientService.available) {
      let clientVersionString = (typeof data.version_str !== 'undefined') ? data.version_str : data.version;
      if (!data.server || data.server !== 'BlocklyPropHTTP') {
        clientVersionString = '0.0.0';
      }

      checkClientVersionModal(clientVersionString);

      clientService.type = 'http';
      clientService.available = true;         // Connected to the Launcher/Client

      // Set the compiler toolbar elements
      // setPropToolbarButtons();
      propToolbarButtonController(clientService.available);
    }
  }).fail(function() {
    clientService.type = null;
    clientService.available = false;            // Not connected to the Launcher/Client
    clientService.portsAvailable = false;

    // Set the compiler toolbar elements
    // setPropToolbarButtons();
    propToolbarButtonController(clientService.available);
  });
};


/**
 * Create a modal that allows the user to set a different port or path
 * to the BlocklyProp-Client or -Launcher
 *
 * TODO: Add fields for setting a different path to the compile service (for anyone wanting to host their own)
 */
// eslint-disable-next-line no-unused-vars
const configureConnectionPaths = function() {
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
 * Checks for and, if found, uses a newer WebSockets-only client
 *
 * TODO: Refactor this function to use switch statements and sub-functions
 *  to make clear what this function is really doing.
 */
function establishBPLauncherConnection() {
  // TODO: set/clear and load buttons based on status
  if (!clientService.available) {
    // Clear the port list
    setPortListUI();

    const connection = new WebSocket(clientService.url('', 'ws'));
    connection.onopen = function() {
      if (clientService.activeConnection !== null) {
        clientService.activeConnection.close();
      }

      const wsMessage = {
        type: 'hello-browser',
        baud: baudrate,
      };
      clientService.activeConnection = connection;
      connection.send(JSON.stringify(wsMessage));
    };

    // Log errors
    connection.onerror = function(error) {
      // Only display a message on the first attempt
      if (!clientService.type) {
        console.log('Unable to find websocket client');
        connection.close();
      } else {
        console.log('Websocket Communication Error');
        console.log(error);
      }
    };

    // handle messages from the client
    connection.onmessage = function(e) {
      const wsMessage = JSON.parse(e.data);

      // set this to zero to note that the connection is still alive (heartbeat)
      clientService.portListReceiveCountUp = 0;

      // --- hello handshake - establish new connection
      if (wsMessage.type === 'hello-client') {
        // type: 'hello-client',
        // version: [String version (semantic versioning)]
        // rxBase64: [boolean, accepts base64-encoded serial streams (all versions transmit base64)]
        checkClientVersionModal(wsMessage.version);

        if (window.getURLParameter('debug')) {
          console.log('Websocket client/launcher found - version ' + wsMessage.version);
        }

        clientService.rxBase64 = wsMessage.rxBase64 || false;
        clientService.type = 'ws';
        clientService.available = true;     // Connected to the Launcher/Client

        // Set the compiler toolbar elements
        // setPropToolbarButtons();
        propToolbarButtonController(clientService.available);

        const portRequestMsg = JSON.stringify({
          type: 'port-list-request',
          msg: 'port-list-request',
        });
        connection.send(portRequestMsg);

        // --- com port list/change
      } else if (wsMessage.type === 'port-list') {
        // type: 'port-list',
        // ports: ['port1', 'port2', 'port3'...]
        setPortListUI(wsMessage.ports);

        // --- serial terminal/graph
      } else if (wsMessage.type === 'serial-terminal' &&
          (typeof wsMessage.msg === 'string' || wsMessage.msg instanceof String)) {
        // sometimes some weird stuff comes through...
        // type: 'serial-terminal'
        // msg: [String Base64-encoded message]

        let messageText;
        try {
          messageText = atob(wsMessage.msg);
        } catch (error) {
          // only show the error if it's something other than base-64 encoding
          if (error.toString().indexOf('\'atob\'') < 0) {
            console.error(error);
          }
          messageText = wsMessage.msg;
        }

        if (clientService.sendCharacterStreamTo && messageText !== '' && wsMessage.packetID) {
          // is the terminal open?
          if (clientService.sendCharacterStreamTo === 'term') {
            const pTerm = getPropTerminal();
            pTerm.display(messageText);
            pTerm.focus();
          } else {    // is the graph open?
            graph_new_data(messageText);
          }
        }

        // --- UI Commands coming from the client
      } else if (wsMessage.type === 'ui-command') {
        // type: 'ui-command',
        // action: [
        //  'open-terminal',
        //  'open-graph',
        //  'close-terminal',
        //  'close-graph',
        //  'close-compile',
        //  'clear-compile',
        //  'message-compile',
        //  'alert'
        //  ],
        // msg: [String message]

        if (wsMessage.action === 'open-terminal') {
          serial_console();
        } else if (wsMessage.action === 'open-graph') {
          graphing_console();
        } else if (wsMessage.action === 'close-terminal') {
          $('#console-dialog').modal('hide');
          clientService.sendCharacterStreamTo = null;
          getPropTerminal().display(null);
        } else if (wsMessage.action === 'close-graph') {
          $('#graphing-dialog').modal('hide');
          clientService.sendCharacterStreamTo = null;
          graph_reset();
        } else if (wsMessage.action === 'clear-compile') {
          $('#compile-console').val('');
        } else if (wsMessage.action === 'message-compile') {
          // Messages are coded; check codes, log all and filter out NS_DOWNLOADING duplicates
          const msg = wsMessage.msg.split('-');
          if (msg[0] !== NS_DOWNLOADING || !clientService.loadBinary) {
            clientService.resultLog = clientService.resultLog + msg[1] + '\n';
            clientService.loadBinary |= (msg[0] === NS_DOWNLOADING);
          }
          if (msg[0] == NS_DOWNLOAD_SUCCESSFUL) {
            // Success! Keep it simple
            $('#compile-console').val($('#compile-console').val() + ' Succeeded.');
          } else if (msg[0] == NE_DOWNLOAD_FAILED) {
            // Failed! Show the details
            $('#compile-console').val($('#compile-console').val() + ' Failed!\n\n-------- loader messages --------\n' + clientService.resultLog);
          } else {
            // Show progress during downloading
            $('#compile-console').val($('#compile-console').val() + '.');
          }

          // Scroll automatically to the bottom after new data is added
          const compileConsoleObj = document.getElementById('compile-console');
          compileConsoleObj.scrollTop = compileConsoleObj.scrollHeight;
        } else if (wsMessage.action === 'close-compile') {
          $('#compile-dialog').modal('hide');
          $('#compile-console').val('');
        } else if (wsMessage.action === 'console-log') {
          console.log(wsMessage.msg);
        } else if (wsMessage.action === 'websocket-close') {
          clientService.activeConnection.close();
        } else if (wsMessage.action === 'alert') {
          utils.showMessage(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER, wsMessage.msg);
        }

        // --- older client - disconnect it?
      } else {
        console.log('Unknown WS msg: ' + JSON.stringify(wsMessage));
      }
    };

    connection.onclose = function() {
      lostWSConnection();
    };
  }
}

/**
 * Lost websocket connection, clean up and restart findClient processing
 */
function lostWSConnection() {
  if (clientService.type !== 'http') {
    clientService.activeConnection = null;
    clientService.type = null;
    clientService.available = false;        // Not connected to the Launcher/Client
  }

  // Set the compiler toolbar elements
  // setPropToolbarButtons();
  propToolbarButtonController(clientService.available);

  // Clear ports list
  setPortListUI();
}


// set communication port list
// leave data unspecified when searching
const setPortListUI = function(data) {
  data = (data ? data : 'searching');
  const selectedPort = clearComPortUI();

  if (typeof (data) === 'object' && data.length > 0) {
    data.forEach(function(port) {
      addComPortDeviceOption(port);
    });
    clientService.portsAvailable = true;
  } else {
    addComPortDeviceOption(clientService.available ?
        Blockly.Msg.DIALOG_PORT_SEARCHING : Blockly.Msg.DIALOG_NO_DEVICE);
    clientService.portsAvailable = false;
  }
  selectComPort(selectedPort);
};


/**
 *  Clear the com port drop-down
 *
 * @return {string | jQuery} the currently selected value in the drop-down
 * before the element is cleared.
 */
function clearComPortUI() {
  const portUI = $('#comPort');
  if (portUI) {
    try {
      const port = portUI.val();
      portUI.empty();
      return port;
    } catch (e) {
      if (e) {
        console.log('Error: %s', e.message);
      }
    }
  }

  portUI.empty();
  return null;
}


/**
 *  Add a device port to the Com Port drop-down list
 *
 * @param {string }port
 */
function addComPortDeviceOption(port) {
  if (typeof(port) === 'string') {
    $('#comPort').append($('<option>', {text: port}));
  }
}


// -------------------------------

export {
  compile,  init, renderContent, downloadCSV,
};

