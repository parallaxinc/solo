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


import {logConsoleMessage} from './utility';
import {PropTerm} from './prop_term';
import {getComPort} from './client_connection';

/**
 * Enable debug console messages in this module
 * @type {boolean}
 */
const debug = false;

/**
 * These are the permitted states of the clientService.type property
 *
 * @type {{
 *    NONE: string,
 *    WS: string
 *  }}
 */
export const serviceConnectionTypes = {
  // Constants for the type property

  // BP Client is deprecated
  // HTTP: 'http',

  WS: 'ws',
  NONE: '',
};

/**
 * Client Service Object
 */
export const clientService = {
  /**
   * Has a client (BPC/BPL) successfully connected?
   * @type {boolean}
   * @description Seems that the fact that the connection is available is
   * mirrored in the state of the activeConnection. If activeConnection is
   * null, 'available' must necessarily be false. Conversely, if
   * active connection is not null, the 'available' flag must be true.
   * However, in the case where the browser is connected to a BP Client,
   * the activeConnection will be null since there is no WebSocket object
   * available. So it seems that we might need a virtual field to determine
   * if there is a connection to a BP Client.
   */
  available: false,

  /**
   * Are any serial ports enumerated
   * @type {boolean}
   */
  portsAvailable: false,

  /**
   * This is the URL portion of the address to open the connection. The default
   * is 'localhost', but can be configured to point to a client at any
   * reachable IP/DNS address.
   * @type {string}
   */
  path: 'localhost',

  /**
   *  BlocklyProp Client/Launcher port number
   * @type {number}
   */
  port: 6009,

  /**
   * Connection type: "ws", "http", or ''
   * @type {string}
   * @description The value of this field must be one of the
   * SERVICE_CONNECTION_TYPE_xxx constants are defined in the
   * serviceConnectionTypes object.
   */
  type: serviceConnectionTypes.NONE,

  /**
   * BP Launcher full base64 encoding support flag
   * @type {boolean}
   */
  rxBase64: true,

  /**
   * BP Launcher download message flag
   * @type {boolean}
   */
  loadBinary: false,

  /**
   * BP Launcher result messages log
   * @type {string}
   */
  resultLog: '',

  /**
   * This is set to 0 each time the port list is received, and incremented
   * once each heartbeat
   * @type {number}
   */
  portListReceiveCountUp: 0,

  /**
   * Used differently by BPL and BPC - pointer to connection object
   * @type {WebSocket | null}
   * @description In the context of the BlocklyProp Launcher, activeConnection
   * holds a copy of the WebSocket connection object or null if there is not
   * an active WebSocket connection
   */
  activeConnection: null,

  /**
   * @type {string | null}
   * @description Flag to inform connection methods which modal/class to send
   * characters to be displayed to. Possible settings are:
   *  null - do not stream characters
   *  "term" - Stream characters to a terminal session
   *  "graph" - Stream characters to a graphing session
   */
  sendCharacterStreamTo: null,

  /**
   * The current list of ports available to receive program load commands
   */
  portList: [],

  /**
   * The currently selected port.
   * @type {string} selectedPort contains the selected port string or
   *   an empty string
   */
  selectedPort_: '',

  /**
   * The timestamp of the last port list update.
   * @type {number}
   * @description This is used to verify that there is traffic coming from
   *  the active client connection. The timestamp is updated whenever the
   *  port list is cleared or when a port is added to the list. Both activities
   *  are indicative of traffic received from the client.
   */
  lastPortUpdate_: 0,

  /**
   * The baud rate that will be used to when establishing a terminal session.
   * @type {number}
   * @description The default baud rate is compatible with all devices except
   * the Scribbler series of robots. The Scribbler robots use 9600 baud.
   */
  terminalBaudRate: 115200,

  /**
   * Flag to indicate that an attempt to load a program is in progress.
   *
   * @type {boolean}
   *
   * @description This flag will be set to true if the connection is lost
   * or reset while an active attempt is being made to load a program to the
   * target device.
   */
  loaderResetDetect: false,

  /**
   * Flag to indicate that the Launcher has reported a complete load cycle,
   * regardless of success or failure.
   *
   * @type {boolean}
   *
   * @description This flag is set false at the beginning of a load to device
   * cycle. If the cycle is interrupted by a web socket disconnect, this flag
   * ensures that the application will retry the load process until it receives
   * a message from the Launcher that the load succeeded or failed. Either of
   * these states will reset the flag. The code that manages loader retries
   * relies on this flag and the loaderResetDetect flag to determine if a reload
   * attempt is necessary.
   */
  loaderIsDone: false,

  /**
   * Setter for terminal baud rate
   * @param {number} baudRate
   */
  setTerminalBaudRate: function(baudRate) {
    this.terminalBaudRate = baudRate;
  },

  /**
   * Set a custom URL used to contact the BP Launcher
   * @param {string=} location is the custom URL
   * @param {string=} protocol is one of 'http', 'https', or 'ws'
   * @return {string}
   */
  url: function(location, protocol) {
    return (protocol || window.location.protocol.replace(':', '')) +
        '://' + this.path + ':' + this.port + '/' + (location || '');
  },

  /**
   * Test for port list timeout
   * @return {boolean}
   */
  isPortListTimeOut: function() {
    return this.portListReceiveCountUp > 3;
  },

  /**
   * Getter for the selectedPort property
   * @return {string}
   */
  getSelectedPort: function() {
    return this.selectedPort_;
  },

  /**
   * Set the selectedPort property ony if the new setting is different than
   * the current setting. Any change is reported to the Launcher as the new
   * preferred com port.
   *
   * @param {string} portName
   */
  setSelectedPort: function(portName) {
    // Sentry Solo-6T
    if (this.activeConnection) {
      if (portName !== this.getSelectedPort()) {
        logConsoleMessage(`Setting preferred port to: ${portName}`);
        this.selectedPort_ = portName;
        // Request a port list from the server
        this.activeConnection.send(JSON.stringify({
          type: 'pref-port',
          portPath: portName,
        }));
      }
    }
  },

  /**
   * Add a port to the client port list
   * @param {string} portName
   */
  addPort: function( portName) {
    this.portList.push(portName);
    this.lastPortUpdate_= Date.now();
  },

  /**
   * Clear the existing port list
   */
  clearPortList: function() {
    this.portList = [];
    this.lastPortUpdate_= Date.now();
  },

  /**
   * Get the timestamp for the last port change
   * @return {number}
   */
  getPortLastUpdate: function() {
    return this.lastPortUpdate_;
  },

  /**
   * Send a 'hello' message to the BP Launcher
   */
  wsSendHello: function() {
    /**
     * Web Socket greeting message object
     * @type WebSocketHelloMessage
     */
    const wsMessage = {
      type: 'hello-browser',
    };

    const payload = JSON.stringify(wsMessage);

    if (this.activeConnection) {
      this.activeConnection.send(payload);
    } else {
      logConsoleMessage(
          `Cannot send "hello-browser message. ` +
          `Connection is closed."`);
    }
  },

  /**
   * Send a request for a list of detected ports from the BP Launcher
   */
  wsSendRequestPortList: function() {
    const message = {
      type: 'port-list-request',
      msg: 'port-list-request',
    };
    const payload = JSON.stringify(message);

    if (this.activeConnection) {
      this.activeConnection.send(payload);
    } else {
      logConsoleMessage(
          `Cannot send "port-list-request message. ` +
          `Connection is closed."`);
    }
  },

  /**
   * Send a load-prop message to the BP Launcher
   *
   * @param {string} loadAction
   * @param {object} data
   * @param {string} terminal
   * @param {string} port
   */
  wsSendLoadProp: async function(loadAction, data, terminal, port) {
    const programToSend = {
      type: 'load-prop',
      action: loadAction,
      portPath: port,
      debug: (terminal) ? terminal : 'none',
      extension: data.extension,
      payload: data.binary,
    };

    // Debugging message
    if (debug) {
      logConsoleMessage(`(wsSLP) Sending message to the web socket:`);
      logConsoleMessage(`(wsSLP) Type: ${programToSend.type}`);
      logConsoleMessage(`(wsSLP) Action: ${programToSend.action}`);
      logConsoleMessage(`(wsSLP) Debug: ${programToSend.debug}`);
      logConsoleMessage(`(wsSLP) ComPort: ${programToSend.portPath}`);
      logConsoleMessage(`(wsSLP) Web socket state is: ` +
          `${clientService.activeConnection.readyState}`);
    }

    if (this.activeConnection) {
      if (debug) {
        logConsoleMessage(`(wsSLP) Sending payload to socket`);
      }

      const payload = JSON.stringify(programToSend);

      if (debug) {
        // eslint-disable-next-line max-len
        logConsoleMessage(`Connection state is: ${this.activeConnection.readyState}`);
        logConsoleMessage(`Sending ${payload.length} bytes to the Launcher`);
        // eslint-disable-next-line max-len
        logConsoleMessage(`WS buffer is ${this.activeConnection.bufferedAmount} bytes before transmit`);
      }

      this.loaderResetDetect = false;
      this.loaderIsDone = false;
      this.activeConnection.send(payload);

      if (debug) {
        logConsoleMessage(`WS buffer is ${this.activeConnection.bufferedAmount} ` +
        `bytes after transmit`);
      }
    } else {
      logConsoleMessage(
          `Cannot send "load-prop:${loadAction} message. ` +
          `Connection is closed."`);
    }
  },

  /**
   * Send a serial terminal message to the BP Launcher
   *
   * @param {string} action
   * @param {string} port
   * @param {string} message
   */
  wsSendSerialTerminal(action, port, message) {
    if (!action) {
      throw new Error('Action was not provided in call to wsSendTerminal');
    }
    // Validate the supplied action
    const actions = ['open', 'close', 'msg'];
    const requestedAction = action.toLowerCase();

    if (!actions.includes(requestedAction)) {
      throw new Error(`The supplied action, '${action}', is unsupported.`);
    }

    const messageToSend = {
      type: 'serial-terminal',
      action: requestedAction,
      outTo: 'terminal',
      portPath: port,
      baudrate: this.terminalBaudRate.toString(10),
      msg: message,
    };

    const payload = JSON.stringify(messageToSend);

    if (this.activeConnection) {
      this.activeConnection.send(payload);
    } else {
      logConsoleMessage(
          `Cannot send "serial-terminal message, action: ${requestedAction}. ` +
          `Connection is closed."`);
    }
  },

  /**
   * Version object
   */
  version: {
    /**
     * {string} Constant Semantic versioning, minimum client (BPL/BPC) allowed
     */
    MINIMUM_ALLOWED: '1.0.1',

    /**
     * {string} Constant Semantic versioning, minimum recommended
     * client/launcher version
     */
    RECOMMENDED: '1.0.1',

    // /**
    //  * {string} Constant Semantic versioning, Minimum client/launcher version
    //  * supporting coded/verbose responses.
    //  * NOTE: (remove after MINIMUM_ALLOWED > this)
    //  * @deprecated
    //  */
    // CODED_MINIMUM: '0.7.5',

    /**
      * {string} Semantic versioning, Current version
     *
     */
    current: '1.0.4',

    /**
     * {number} Version as an integer calulated from string representation
     */
    currentAsNumber: 0,

    /**
     * {boolean} current >= MINIMUM_ALLOWED
     */
    isValid: false,

    /**
     * {boolean} current >= RECOMMENDED
     */
    isRecommended: false,

    /**
     * Is the BlocklyProp Client version above or equal to the minimum
     * version supported
     *
     * {boolean} current >= CODED_MINIMUM
     * @deprecated
     */
    isCoded: false,

    /**
     * Returns integer calculated from passed in string representation
     * of version
     * @param {string} rawVersion
     * @return {number}
     */
    getNumeric: function(rawVersion) {
      let tempVersion = rawVersion.split('.');
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
      return (
        Number(tempVersion[0]) << 20 |
        Number(tempVersion[1]) << 10 |
        Number(tempVersion[2]));
    },

    /**
     * Sets self-knowledge of current client/launcher version.
     * @param {string} rawVersion
     */
    set: function(rawVersion) {
      this.current = rawVersion;
      this.currentAsNumber = this.getNumeric(rawVersion);
      this.isValid = (
        this.getNumeric(rawVersion) >=
        this.getNumeric(this.MINIMUM_ALLOWED)
      );
      this.isRecommended = (
        this.getNumeric(rawVersion) >=
        this.getNumeric(this.RECOMMENDED)
      );
    },
  },

  /**
   * Close the current connection and notify interested parties.
   */
  closeConnection: function() {
    logConsoleMessage('Closing the WS connection');
    if (this.activeConnection) {
      logConsoleMessage(
          `WS connection is active. Ready: 
          ${this.activeConnection.readyState}`);
      this.activeConnection.close(1000, 'Normal closure');
      this.activeConnection = null;
    } else {
      logConsoleMessage('WS connection is null');
    }
    this.available = false;
    this.portsAvailable = false;
    this.selectedPort_ = '';
    this.lastPortUpdate_ = 0;
  },
};

/**
 * Initialize the terminal object
 */
export function initTerminal() {
  logConsoleMessage(`Init terminal communications`);

  new PropTerm(
      document.getElementById('serial_console'),

      function(characterToSend) {
        // if (clientService.type === serviceConnectionTypes.HTTP &&
        //     clientService.activeConnection) {
        //   clientService.activeConnection.send(btoa(characterToSend));
        // } else
        if (clientService.type === serviceConnectionTypes.WS) {
          const msgToSend = {
            type: 'serial-terminal',
            outTo: 'terminal',
            portPath: getComPort(),
            baudrate: clientService.terminalBaudRate.toString(10),
            msg: (clientService.rxBase64 ?
                btoa(characterToSend) : characterToSend),
            action: 'msg',
          };
          clientService.activeConnection.send(JSON.stringify(msgToSend));
        }
      },
      null,
  );
}
