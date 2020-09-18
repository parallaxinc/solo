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

import {displayTerminalConnectionStatus} from './blocklyc';
import {clientService, serviceConnectionTypes} from './client_service';
import {logConsoleMessage} from './utility';
import {getComPort} from './client_connection';
import {getPropTerminal} from './prop_term';

/**
 * Serial Console dialog window manager
 */

/**
 * Flag to indicate that the console window event handler has been set.
 * TODO: This is a bit if a hack. Refactor as needed.
 * @type {boolean}
 */
let initDialogHandler = false;


/**
 * Serial console support
 */
export function serialConsole() {
  clientService.sendCharacterStreamTo = 'term';

  // --------------------------------------------------------
  // Process the serial console with the older BP HTTP client
  // --------------------------------------------------------
  if (clientService.type !== serviceConnectionTypes.WS) {
    if (clientService.portsAvailable) {
      // Container and flag needed to receive and parse initial connection
      // string before serial data begins streaming in.
      let connString = '';
      let connStrYet = false;

      const connection = new WebSocket(
          clientService.url('serial.connect', 'ws'));

      // When the connection is open, open com port
      connection.onopen = function() {
        connString = '';
        connStrYet = false;
        const baudRate = clientService.terminalBaudRate > 0 ?
            ` ${clientService.terminalBaudRate}`: '';
        connection.send(`+++ open port ${getComPort()} ${baudRate}`);
        clientService.activeConnection = connection;
      };

      // Log errors
      connection.onerror = function(error) {
        logConsoleMessage('WebSocket Error');
        logConsoleMessage(error.message);
      };

      // Receive characters
      connection.onmessage = function(e) {
        const pTerm = getPropTerminal();
        // incoming data is base64 encoded
        const charBuffer = atob(e.data);
        if (connStrYet) {
          pTerm.display(charBuffer);
        } else {
          connString += charBuffer;
          if (connString.indexOf(
              clientService.terminalBaudRate.toString(10)) > -1) {
            connStrYet = true;
            displayTerminalConnectionStatus(connString.trim());
          } else {
            pTerm.display(e.data);
          }
        }
        pTerm.focus();
      };

      // Set the event handler exactly once.
      if (!initDialogHandler) {
        initDialogHandler = true;

        $('#console-dialog').on('hidden.bs.modal', function() {
          clientService.sendCharacterStreamTo = null;
          logConsoleMessage(`Closing serial console WS connection`);
          clientService.activeConnection = null;
          connString = '';
          connStrYet = false;
          connection.close();
          displayTerminalConnectionStatus(null);
          getPropTerminal().display(null);
        });
      }
    } else {
      // Remove any previous connection
      logConsoleMessage(`No ports available so closing the WS connection.`);
      clientService.activeConnection = null;

      // Display a "No connected devices" message in the terminal
      displayTerminalConnectionStatus(
          Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT);
      getPropTerminal().display(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES + '\n');

      // Clear the terminal if the user closes it.
      $('#console-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        displayTerminalConnectionStatus(null);
        getPropTerminal().display(null);
      });
    }
  } else if (clientService.type === serviceConnectionTypes.WS) {
    // --------------------------------------------------------------
    //              Using Websocket-only client
    // --------------------------------------------------------------
    let action = 'open';
    const port = getComPort();
    const baudRate = clientService.terminalBaudRate;

    // Update a UI element
    if (port !== 'none') {
      displayTerminalConnectionStatus([
        Blockly.Msg.DIALOG_TERMINAL_CONNECTION_ESTABLISHED,
        port,
        Blockly.Msg.DIALOG_TERMINAL_AT_BAUDRATE,
        baudRate.toString(10),
      ].join[' ']);
    } else {
      displayTerminalConnectionStatus(
          Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES_TO_CONNECT);
      getPropTerminal().display(Blockly.Msg.DIALOG_TERMINAL_NO_DEVICES + '\n');
    }

    // Open the terminal session
    clientService.wsSendSerialTerminal('open', port, 'none');

    // Set the event handler exactly once
    if (!initDialogHandler) {
      initDialogHandler = true;

      // Console window is closing
      $('#console-dialog').on('hidden.bs.modal', function() {
        clientService.sendCharacterStreamTo = null;
        logConsoleMessage(`Closing console window. Action is: ${action}`);
        // Close the serial terminal
        if (action !== 'close') {
          action = 'close';
          displayTerminalConnectionStatus(null);
          clientService.wsSendSerialTerminal(action, port, 'none');
        }
        logConsoleMessage(`Flushing the terminal buffer`);
        // Flush the serial terminal buffer
        getPropTerminal().display(null);
      });
    }
  }

  // Open the Console window
  $('#console-dialog').modal('show');
}

