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

// noinspection JSCheckFunctionSignatures

import Blockly from 'blockly/core';

import {graphingConsole, graphReset, graphNewData} from './graph';

import {compileConsoleScrollToBottom} from './blocklyc';
import {appendCompileConsoleMessage} from './blocklyc';
import {clientService, serviceConnectionTypes} from './client_service';
import {serialConsole} from './serial_console';
import {logConsoleMessage, utils} from './utility';
import {propToolbarButtonController} from './toolbar_controller';
import {getPropTerminal} from './prop_term';

/**
 * Enable or disable debug-level console logging
 * @type {boolean}
 */
const debug = false;

/**
 * This is the number of milliseconds that can go by between port updates
 * before the active connection state can be tagged as questionable
 * @type {number}
 */
const PORT_TIMEOUT = 15000;

/**
 * Data returned from the web socket for type 'port-list'
 * @typedef WebSocketMessagePortList
 * @type {string} type
 * @type {Array} ports
 */

/**
 * Type definition for a Launcher web socket "Hello" message
 *
 * @typedef WebSocketHelloMessage
 * @type {string} type contains the message text
 * @type {number} baud contains the default baud rate
 * @description This is the format of the object passed into a newly opened
 * WebSocket connection.
 */

/**
 * Type definition for a BlocklyProp Client interface
 *
 * @typedef {Object} BPClientDataBlock
 * @property {number} version
 * @property {string} version_str
 * @property {string} server
 */

// Status Notice IDs
// const NS_FOUND_PROPELLER = 0;
const NS_DOWNLOADING = 2;
const NS_DOWNLOAD_SUCCESSFUL = 5;

// Error Notice IDs
const NE_DOWNLOAD_FAILED = 102;

/**
 * Constant used in connection init sequence in BP Launcher
 * @type {string}
 */
const WS_TYPE_HELLO_MESSAGE = 'hello-client';
const WS_TYPE_LIST_PORT_MESSAGE = 'port-list';
// const WS_TYPE_PREFERRED_PORT_MESSAGE = 'pref-port';
const WS_TYPE_SERIAL_TERMINAL_MESSAGE = 'serial-terminal';
const WS_TYPE_UI_COMMAND = 'ui-command';

const WS_ACTION_ALERT = 'alert';
const WS_ACTION_OPEN_TERMINAL = 'open-terminal';
const WS_ACTION_CLOSE_TERMINAL = 'close-terminal';
const WS_ACTION_OPEN_GRAPH = 'open-graph';
const WS_ACTION_CLOSE_GRAPH = 'close-graph';
const WS_ACTION_CLEAR_COMPILE = 'clear-compile';
const WS_ACTION_MESSAGE_COMPILE = 'message-compile';
const WS_ACTION_CLOSE_COMPILE = 'close-compile';
const WS_ACTION_CONSOLE_LOG = 'console-log';
const WS_ACTION_CLOSE_WEBSOCKET = 'websocket-close';

/**
 *  Connect to the BP-Launcher
 */
export const findClient = function() {
  if (clientService.activeConnection) {
    if (clientService.getPortLastUpdate() <= (Date.now() - PORT_TIMEOUT)) {
      clientService.portListReceiveCountUp++;
      if (!clientService.isPortListTimeOut()) {
        logConsoleMessage(`WARNING: Expecting a port list from client.`);
      } else {
        logConsoleMessage('Timeout waiting for client port list!');
        propToolbarButtonController();
      }
    }
    return;
  }

  // Try to connect to the BP-Launcher (websocket) first
  logConsoleMessage(`Looking for the BlocklyProp Launcher`);
  clientService.clearLauncherVersion();

  if (!clientService.available) {
    logConsoleMessage('Connecting to BP Launcher client');
    establishBPLauncherConnection();
  }
};

/**
 * Checks for and, if found, uses a newer WebSockets-only client
 *
 * TODO: Refactor this function to use switch statements and sub-functions
 *  to make clear what this function is really doing.
 */
function establishBPLauncherConnection() {
  if (!clientService.available) {
    let connection;

    try {
      connection = new WebSocket(clientService.url('', 'ws'));
    } catch (e) {
      logConsoleMessage(`Unable to connect to the launcher: ${e.message}`);
      return;
    }

    // Callback executed when the connection is opened
    connection.onopen = function(event) {
      clientService.activeConnection = connection;
      logConsoleMessage(
          `Connection is: ${event.type}, URL: ${event.target.url}.`);
      clientService.wsSendHello();
    };

    // Log errors
    connection.onerror = function() {
      // Only display a message on the first attempt
      if (clientService.type === serviceConnectionTypes.WS) {
        logConsoleMessage('Unable to find client');
        connection.close();
      } else {
        logConsoleMessage('Communication Error');
      }
    };

    // handle messages from the client / launcher
    connection.onmessage = function(e) {
      const wsMessage = JSON.parse(e.data);

      if (wsMessage.type === WS_TYPE_HELLO_MESSAGE) {
        // --- hello handshake - establish new connection
        // type: 'hello-client',
        // version: [String version (semantic versioning)]
        // rxBase64: [boolean, accepts base64-encoded serial streams
        // (all versions transmit base64)]
        checkClientVersionModal(wsMessage.version);
        logConsoleMessage(
            `BlocklyProp Launcher v${wsMessage.version} detected.`);

        clientService.rxBase64 = wsMessage.rxBase64 || false;
        clientService.type = serviceConnectionTypes.WS;
        clientService.available = true;
        clientService.wsSendRequestPortList();
        propToolbarButtonController();
      } else if (wsMessage.type === WS_TYPE_LIST_PORT_MESSAGE) {
        if (debug) {
          logConsoleMessage(`(MsgPump) Received port-list message.`);
        }
        wsProcessPortListMessage(wsMessage);
      } else if (wsMessage.type === WS_TYPE_SERIAL_TERMINAL_MESSAGE &&
          (typeof wsMessage.msg === 'string' ||
              wsMessage.msg instanceof String)) {
        // --- serial terminal/graph
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

        if (clientService.sendCharacterStreamTo &&
            messageText !== '' && wsMessage.packetID >= 0) {
          // is the terminal open?
          if (clientService.sendCharacterStreamTo === 'term') {
            const pTerm = getPropTerminal();
            pTerm.display(messageText);
            pTerm.focus();
          } else {
            // is the graph open?
            graphNewData(messageText);
          }
        }

        // --- UI Commands coming from the client
      } else if (wsMessage.type === WS_TYPE_UI_COMMAND) {
        wsProcessUiCommand(wsMessage);

        // --- older client - disconnect it?
      } else {
        logConsoleMessage('Unknown WS msg: ' + JSON.stringify(wsMessage));
      }
    };

    connection.onclose = function(event) {
      logConsoleMessage(`Closing socket. Status code: ${event.code}`);
      lostWSConnection();
    };
  }
}

/**
 * Process a websocket Port List message
 * @param {object} message
 * @description
 *    wsMessage.ports
 *      {
 *        "type":"port-list",
 *        "ports":[
 *          "cu.usbserial-DN0286UD"
 *        ]
 *      }
 *  wsMessage.ports is a array of available ports
 */
function wsProcessPortListMessage(message) {
  if (debug) {
    logConsoleMessage(`Processing port list message: ${message}`);
  }

  if (debug && clientService.getPortLastUpdate() === 0) {
    logConsoleMessage(`Port list received`);
  }

  clientService.clearPortList();
  if (message.ports.length > 0) {
    message.ports.forEach(function(port) {
      clientService.addPort(port);
    });
  }
  setPortListUI(null);
  clientService.portListReceiveCountUp = 0;
}

/**
 * Process a websocket UI command
 * @param {object} message
 *
 * @description
 * The command object format:
 *    type: 'ui-command',
 *    action: [
 *      'open-terminal', 'open-graph', 'close-terminal', 'close-graph',
 *      'close-compile', 'clear-compile', 'message-compile', 'alert'
 *    ],
 *    msg: [String message]
 */
function wsProcessUiCommand(message) {
  switch (message.action) {
    case WS_ACTION_OPEN_TERMINAL:
      logConsoleMessage(`MSG: Open Terminal`);
      serialConsole();
      break;

    case WS_ACTION_OPEN_GRAPH:
      graphingConsole();
      break;

    case WS_ACTION_CLOSE_TERMINAL:
      logConsoleMessage(`MSG: Close Terminal`);
      $('#console-dialog').modal('hide');
      clientService.sendCharacterStreamTo = null;
      getPropTerminal().display(null);
      break;

    case WS_ACTION_CLOSE_GRAPH:
      $('#graphing-dialog').modal('hide');
      clientService.sendCharacterStreamTo = null;
      graphReset();
      break;

    case WS_ACTION_CLEAR_COMPILE:
      clearCompilerWindow();
      break;

    case WS_ACTION_MESSAGE_COMPILE:
      wsCompileMessageProcessor(message);
      break;

    case WS_ACTION_CLOSE_COMPILE:
      hideCompilerStatusWindow();
      clearCompilerWindow();
      break;

    case WS_ACTION_CONSOLE_LOG:
      logConsoleMessage(message.msg);
      break;

    case WS_ACTION_CLOSE_WEBSOCKET:
      logConsoleMessage('WARNING: Received a WS Close connection from server');
      clientService.closeConnection();
      propToolbarButtonController();
      break;

    case WS_ACTION_ALERT:
      utils.showMessage(Blockly.Msg.DIALOG_BLOCKLYPROP_LAUNCHER, message.msg);
      break;

    default:
      logConsoleMessage(`Unknown message received: ${message.msg}`);
  }
}

/**
 * Process a loader message
 * @param {object} message
 */
function wsCompileMessageProcessor(message) {
  const [command, text] = parseCompileMessage(message.msg);

  switch (command) {
    case NS_DOWNLOAD_SUCCESSFUL:
      clientService.loaderResetDetect = false;
      clientService.loaderIsDone = true;
      appendCompileConsoleMessage('Succeeded.');
      logConsoleMessage(`Project downloaded successfully`);
      return;

    case NS_DOWNLOADING:
      appendCompileConsoleMessage('.');
      break;

    case NE_DOWNLOAD_FAILED:
      clientService.loaderResetDetect = false;
      clientService.loaderIsDone = true;
      appendCompileConsoleMessage(
          `Failed!\n\n-------- loader messages --------\n` +
        `${clientService.resultLog}`);
      break;

    default:
      clientService.resultLog = clientService.resultLog + text + '\n';
  }
  compileConsoleScrollToBottom();
}

/**
 * Split the compiler message into it's component parts
 *
 * @param {string} message
 * @return {Array}
 * @description The message is formatted as 'nnn-ttttttt...'. Where n is a
 * three digit message mumber and t is the texts of the message. For example:
 * // 000-Scanning port cu.usbserial-DN0286UD
 */
function parseCompileMessage(message) {
  // Split off the command component
  const command = message.split('-', 1);
  const result = [];
  result.push(parseInt(command[0]));
  result.push(message.substr(5));
  return result;
}

/**
 * Lost websocket connection, clean up and restart findClient processing
 */
function lostWSConnection() {
  clientService.loaderResetDetect = true;
  clientService.activeConnection = null;
  clientService.type = serviceConnectionTypes.NONE;
  clientService.available = false;

  // Update the toolbar
  propToolbarButtonController();
}

/**
 * Set comms port list. Leave data unspecified when searching
 *
 * @param {Array | null} data
 */
const setPortListUI = function(data = null) {
  if (! data) {
    if (debug) {
      console.log(`Using internal port list`);
    }
    data = clientService.portList;
  }

  const selectedPort = clearComPortUI();

  // --------------------------------------------------------------------------
  // We must have a non-empty array to work from
  // Solo-#438 - handle 'blank' port name
  // The Launcher now sends an empty string as a port name in the first element
  // of the port list when the user has disconnected the preferred port. The
  // port list will always have at least one available port if the blank entry
  // is in the port list. Otherwise, the port list will either be empty or
  // contain a list of non-blank port names.
  // --------------------------------------------------------------------------
  if (typeof (data) === 'object' && data.length > 0) {
    let blankPort = false;
    data.forEach(function(port) {
      if (debug) {
        console.log(`COM Port: ${port}`);
      }
      if (port.length === 0) {
        blankPort = true;
      }
      addComPortDeviceOption(port);
    });
    if ((data.length === 1 && !blankPort) || data.length > 1) {
      clientService.portsAvailable = true;
    }
  } else {
    // port list is empty, populate it
    addComPortDeviceOption(clientService.available ?
        Blockly.Msg.DIALOG_PORT_SEARCHING : Blockly.Msg.DIALOG_NO_DEVICE);
    clientService.portsAvailable = false;
  }
  // Reset the selected com port if one was defined.
  if (selectedPort) {
    selectComPort(selectedPort);
  }

  propToolbarButtonController();
};

/**
 * checkClientVersionModal
 * Displays a modal with information about the client version if the one
 * being used is outdated. If the version is below the recommended version,
 * the user is warned, and versions below the minimum are alerted.
 * @param {string} rawVersion A string representing the client version in
 *  '0.0.0' format (Semantic versioning)
 */
function checkClientVersionModal(rawVersion) {
  // Record the version reported by the client
  if (rawVersion) {
    logConsoleMessage(`Checking client version: "${rawVersion}"`);
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
        logConsoleMessage('Error: ' + e.message);
      }
    }
  }

  portUI.empty();
  return null;
}

/**
 * Set the selected element in the com port dropdown list
 * @param {string | null} comPort
 */
// eslint-disable-next-line no-unused-vars,require-jsdoc
function selectComPort(comPort) {
  const uiComPort = $('#comPort');

  if (comPort !== null) {
    uiComPort.val(comPort);
    clientService.setSelectedPort(comPort);
    return;
  }

  // Com port is null. Select first com port as a default
  if (uiComPort.val() === null) {
    const options = $('#comPort option');
    if (options.length > 0) {
      uiComPort.val($('#comPort option:first').text());
    }
  }
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

/**
 * Return the selected com port name
 *
 * @return {string}
 */
export const getComPort = function() {
  const commPortSelection = $('#comPort').val();
  if (commPortSelection === Blockly.Msg.DIALOG_PORT_SEARCHING ||
      commPortSelection === Blockly.Msg.DIALOG_NO_DEVICE) {
    return 'none';
  } else {
    return commPortSelection;
  }
};

/**
 * Close the compiler progress window
 */
// noinspection JSCheckFunctionSignatures
const hideCompilerStatusWindow = () => $('#compile-dialog').modal('hide');

/**
 * Clear the compiler progress window
 */
// noinspection JSCheckFunctionSignatures
const clearCompilerWindow = () => $('#compile-console').val('');

