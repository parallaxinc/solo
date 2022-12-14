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
import {clientService} from './client_service';
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

  // Open the Console window
  $('#console-dialog').modal('show');
}

export const isSerialApi = async () => {
  // Is the Serial API available
  if ('serial' in navigator) {
    console.log(`The serial API is supported`);
    // Prompt user to select any serial port.
    // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
    const filters = [
      {usbVendorId: 0x0403, usbProductId: 0x6001},
      {usbVendorId: 0x0403, usbProductId: 0x6010},
      {usbVendorId: 0x0403, usbProductId: 0x6014},
    ];

    const port = navigator.serial.requestPort(filters)
        .then((device) => {
          console.log(device.productName);
          console.log(device.manufacturerName);
        })
        .catch((error) => {
          console.error(error);
        });
    console.log(`Found port: ${port}`);
  } else {
    console.log(`Problem: The serial API is not supported`);
  }
};

