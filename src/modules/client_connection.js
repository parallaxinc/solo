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

import {graphingConsole} from './blocklyc';
import {graphReset, graphNewData} from './blocklyc';
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
 * @typedef WebSocketHelloMessage
 * @type {string} type contains the message text
 * @type {number} baud contains the default baud rate
 * @description This is the format of the object passed into a newly opened
 * WebSocket connection.
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
 *  Connect to the BP-Launcher or BlocklyProp Client
 */
export const findClient = function() {
  if (clientService.activeConnection) {
    if (clientService.getPortLastUpdate() > Date.now() - PORT_TIMEOUT) {
      // All good if we received a port update in the past 10 seconds
      return;
    } else {
      // Send a warning
      logConsoleMessage(`WARNING: Expecting a port list from client.`);
    }
  }

  // Try to connect to the BP-Launcher (websocket) first
  logConsoleMessage(`Looking for a client`);

  // TODO: evaluation is always true, probably not what we want here.
  if (!clientService.available &&
      clientService.type !== serviceConnectionTypes.HTTP) {
    // Verify that the web socket is alive
    logConsoleMessage('Connecting to BP Launcher client');
    establishBPLauncherConnection();
  }

  // Check how much time has passed since the port list was received
  // from the BP-Launcher
  if (clientService.type === serviceConnectionTypes.WS) {
    clientService.portListReceiveCountUp++;
    // Is the BP-Launcher taking to long to respond?  If so,
    // close the connection
    if (clientService.isPortListTimeOut()) {
      logConsoleMessage('Timeout waiting for client port list!');
      clientService.closeConnection();
      // Update the toolbar
      propToolbarButtonController();

      // TODO: check to see if this is really necessary - it gets
      //  called by the WS onclose handler
      lostWSConnection();
    }
  }

  // BP-Launcher not found? Try connecting to the BP-Client
  setTimeout(function() {
    if (clientService.type !== serviceConnectionTypes.WS) {
      logConsoleMessage('Trying to connect to the BP Client.');
      establishBPClientConnection();
    }
  }, 1000);

  // If connected to the BP-Client, poll for an updated port list
  if (clientService.type === serviceConnectionTypes.HTTP) {
    logConsoleMessage('From findClient(): looking for com ports');
    checkForComPorts();
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

    // Clear the port list
    // clientService.clearPortList();

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
    connection.onerror = function(error) {
      // Only display a message on the first attempt
      if (clientService.type !== serviceConnectionTypes.NONE) {
        logConsoleMessage('Unable to find websocket client');
        connection.close();
      } else {
        logConsoleMessage('Websocket Communication Error');
        logConsoleMessage(error.message);
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
        logConsoleMessage(`Received a Serial Terminal message`);
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
        } else {
          logConsoleMessage(`Unable to send stream to the terminal`);
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
      logConsoleMessage(`Closing WS: ${event.code}, ${event.message}`);
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
  if (clientService.getPortLastUpdate() === 0) {
    logConsoleMessage(`Port list received`);
  }
  clientService.clearPortList();
  if (message.ports.length > 0) {
    message.ports.forEach(function(port) {
      clientService.addPort(port);
    });
  }
  setPortListUI();
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
      $('#compile-console').val('');
      break;

    case WS_ACTION_MESSAGE_COMPILE:
      wsCompileMessageProcessor(message);
      break;

    case WS_ACTION_CLOSE_COMPILE:
      $('#compile-dialog').modal('hide');
      $('#compile-console').val('');
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
  // logConsoleMessage(`Cmd:${command}: '${text}'`);

  if (command === NS_DOWNLOAD_SUCCESSFUL) {
    clientService.loaderResetDetect = false;
    clientService.loaderIsDone = true;
    appendCompileConsoleMessage('Succeeded.');
  }

  switch (command) {
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
      logConsoleMessage(`Processing launcher cmd:message: ${command}:${text}`);
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
  logConsoleMessage(`Lost WS connection`);
  if (clientService.type !== serviceConnectionTypes.HTTP) {
    clientService.loaderResetDetect = true;

    if (clientService.activeConnection) {
      logConsoleMessage(`Closing socket: ReadyState is:
     ${clientService.activeConnection.readyState}`);
    }
    logConsoleMessage(`Null-ing the active connection`);
    clientService.activeConnection = null;
    clientService.type = serviceConnectionTypes.NONE;
    clientService.available = false;
  }

  propToolbarButtonController();
}

/**
 * Set communication port list. Leave data unspecified when searching
 *
 * @param {Array | null} data
 */
const setPortListUI = function(data = null) {
  if (! data) {
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
  selectComPort(selectedPort);
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
 * Type definition for a BlocklyProp Client interface
 *
 * @typedef {Object} BPClientDataBlock
 * @property {number} version
 * @property {string} version_str
 * @property {string} server
 */

/**
 * Establish a connection to the BlocklyProp-Client (BPC) application
 * Retrieves the BPC's version
 * Sets parameters in the clientService object
 * Calls UI configuration functions
 */
function establishBPClientConnection() {
  logConsoleMessage('establishBPConnection: entry');
  // Load data from the server using a HTTP GET request.
  $.get(clientService.url(), function(/* @type BPClientDataBlock */ data) {
    // {version: 0.7, version_str: "0.7.5", server: "BlocklyPropHTTP"}
    logConsoleMessage(`Connected to client?: ${data.version_str}`);
    if (!clientService.available) {
      let clientVersionString = (typeof data.version_str !== 'undefined') ?
          data.version_str : data.version;
      logConsoleMessage(`Client version is: ${clientVersionString}`);

      if (!data.server || data.server !== 'BlocklyPropHTTP') {
        clientVersionString = '0.0.0';
      }
      checkClientVersionModal(clientVersionString);
      clientService.type = serviceConnectionTypes.HTTP;
      // Connected to the Launcher/Client
      clientService.available = true;
    }
  }).fail(function() {
    logConsoleMessage('Failed to open client connection');
    clientService.type = serviceConnectionTypes.NONE;
    // Not connected to the Launcher/Client
    clientService.available = false;
    clientService.portsAvailable = false;
  }).always( function() {
    // Update the toolbar no mater what happens
    logConsoleMessage('Updating toolbar');
    propToolbarButtonController();
  });
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
  // A valid com port has been selected
  if (comPort !== null) {
    uiComPort.val(comPort);
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
 * Update the list of serial ports available on the host machine
 * NOTE: This function is used by the BP-Client only.
 */
const checkForComPorts = function() {
  try {
    if (clientService.type === serviceConnectionTypes.HTTP) {
      $.get(clientService.url('ports.json'), function(data) {
        logConsoleMessage('Getting a port list');
        setPortListUI(data);
      }).fail(function() {
        setPortListUI(null);
      }).always(function(data) {
        logConsoleMessage(`The data is: ${data}`);
      });
    }
  } catch (e) {
    logConsoleMessage('Unable to get port list. ' + e.message);
    setPortListUI(null);
  }
};

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
