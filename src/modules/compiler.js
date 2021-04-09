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

import {getSourceEditor} from './code_editor';
import {getProjectInitialState} from './project';
import {prettyCode} from './editor';
import {logConsoleMessage} from './utility';
import {appendCompileConsoleMessage} from './blocklyc';
import {compileConsoleScrollToBottom} from './blocklyc';
import {showCannotCompileEmptyProject} from './modals';

/**
 * Submit a project's source code to the cloud compiler
 *
 * @param {string} text
 * @param {string} action
 * @param {function} successHandler Define a callback to be executed upon
 *  sucessful compilation
 */
export const cloudCompile = (text, action, successHandler) => {
  const codePropC = getSourceEditor();
  const project = getProjectInitialState();

  // if PropC is in edit mode, get it from the editor, otherwise
  // render it from the blocks.
  const propcCode = (codePropC.getReadOnly()) ?
      prettyCode(Blockly.propc.workspaceToCode(Blockly.mainWorkspace)) :
      codePropC.getValue();

  if (propcCode.indexOf('EMPTY_PROJECT') > -1) {
    showCannotCompileEmptyProject();
  } else {
    $('#compile-dialog-title').text(text);
    $('#compile-console').val('Compile... ');
    $('#compile-dialog').modal('show');

    let terminalNeeded = null;

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

    // ------------------------------------------------------------------------
    // Contact the container running cloud compiler. If the browser is
    // connected via https, direct the compile request to the same port and let
    // the load balancer direct the request to the compiler.
    // When operating from localhost, expect to find the compiler container on
    // localhost as well. There is no override for this at the moment.
    // ------------------------------------------------------------------------
    let postUrl = `https://${window.location.hostname}:443/single/prop-c/${action}`;
    if (window.location.protocol === 'http:') {
      postUrl = `http://${window.location.hostname}:5001/single/prop-c/${action}`;
    }

    // Post the code to the compiler API and await the results
    logConsoleMessage(`Requesting compiler service`);
    $.ajax({
      'method': 'POST',
      'url': postUrl,
      'data': {'code': propcCode},
    }).done(function(data) {
      logConsoleMessage(`Receiving compiler service results`);
      // The compiler will return one of three payloads:
      // Compile-only
      // data = {
      //     "success": success,
      //     "compiler-output": out,
      //     "compiler-error": err.decode()
      // }
      //
      // Load to RAM/EEPROM
      // data = {
      //     "success": success,
      //     "compiler-output": out,
      //     "compiler-error": err.decode()
      //     "binary": base64binary.decode('utf-8')
      //     "extension": = extension
      // }
      //
      // General error message
      // data = {
      //    "success": False,
      //    "message": "unknown-action",
      //    "data": action
      // }
      // {success: true, compiler-output: "Succeeded.", compiler-error: ""}

      // Check for an error response from the compiler
      if (!data || data['compiler-error'] !== '') {
        // Get message as a string, or blank if undefined
        const message = (typeof data['compiler-error'] === 'string') ?
            data['compiler-error'] : '';
        appendCompileConsoleMessage(
            data['compiler-output'] + data['compiler-error'] + message);
      } else {
        const loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';
        appendCompileConsoleMessage(
            data['compiler-output'] + data['compiler-error'] + loadWaitMsg);

        if (data.success && successHandler) {
          successHandler(data, terminalNeeded);
        }
        compileConsoleScrollToBottom();
      }
    }).fail(function(data) {
      // Something unexpected has happened while calling the compile service
      if (data) {
        logConsoleMessage(`Compiler service request failed: ${data.state()}`);

        const state = data.state();
        let message = 'Unable to compile the project.\n';
        if (state === 'rejected') {
          message += '\nThe compiler service is temporarily unavailable or';
          message += ' unreachable.\nPlease try again in a few moments.';
        } else {
          message += 'Error "' + data.status + '" has been detected.';
        }
        appendCompileConsoleMessage(message);
      }
    });
  }
};
