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
import {baudrate, getComPort} from './client_connection';

/**
 * These are the permitted states of the clientService.type property
 *
 * @type {{
 *    NONE: string,
 *    HTTP: string,
 *    WS: string
 *  }}
 */
export const serviceConnectionTypes = {
  // Constants for the type property
  HTTP: 'http',
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
   *  the active client connection. Sort of a poor man's watchdog.
   */
  lastPortUpdate_: 0,

  /**
   * Set a custom URL used to contact the BP Launcher
   * @param {string=} location is the custom URL
   * @param {string=} protocol is one of 'http', 'https', or 'ws'
   * @return {string}
   */
  url: function(location, protocol) {
    return (protocol || window.location.protocol.replace(':', '')) + '://' + this.path + ':' + this.port + '/' + (location || '');
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
   * Setter for the selectedPort property
   * @param {string} portName
   */
  setSelectedPort: function(portName) {
    logConsoleMessage(`Setting preferred port to: ${portName}`);
    this.selectedPort_ = portName;
    // Request a port list from the server
    this.activeConnection.send(JSON.stringify({
      type: 'pref-port',
      portPath: portName,
    }));
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
  },

  /**
   * Get the timestamp for the last port change
   * @return {number}
   */
  getPortLastUpdate: function() {
    return this.lastPortUpdate_;
  },

  /**
   * Version object
   */
  version: {
    /**
     * {string} Constant Semantic versioning, minimum client (BPL/BPC) allowed
     */
    MINIMUM_ALLOWED: '0.7.0',

    /**
     * {string} Constant Semantic versioning, minimum recommended
     * client/launcher version
     */
    RECOMMENDED: '1.0.1',

    /**
     * {string} Constant Semantic versioning, Minimum client/launcher version
     * supporting coded/verbose responses.
     * NOTE: (remove after MINIMUM_ALLOWED > this)
     */
    CODED_MINIMUM: '0.7.5',

    /**
      * {string} Semantic versioning, Current version
     *
     */
    current: '0.0.0',

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
     * {boolean} current >= CODED_MINIMUM
     */
    isCoded: false,

    /**
     * Returns integer calculated from passed in string representation
     * of version
     * @param {number} rawVersion
     * @return {number}
     */
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
      return (
        Number(tempVersion[0]) << 20 |
        Number(tempVersion[1]) << 10 |
        Number(tempVersion[2]));
    },

    /**
     * Sets self-knowledge of current client/launcher version.
     * @param {number} rawVersion
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
      // remove after MINIMUM_ALLOWED is greater
      this.isCoded = (
        this.getNumeric(rawVersion) >=
        this.getNumeric(this.CODED_MINIMUM)
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
        if (clientService.type === serviceConnectionTypes.HTTP &&
            clientService.activeConnection) {
          clientService.activeConnection.send(btoa(characterToSend));
        } else if (clientService.type === serviceConnectionTypes.WS) {
          const msgToSend = {
            type: 'serial-terminal',
            outTo: 'terminal',
            portPath: getComPort(),
            // TODO: Correct baudrate reference
            baudrate: baudrate.toString(10),
            msg: (clientService.rxBase64 ?
                btoa(characterToSend) : characterToSend),
            action: 'msg',
          };
          clientService.activeConnection.send(JSON.stringify(msgToSend));
        }
      },
      null
  );
}
