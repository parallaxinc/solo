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
import {appendCompileConsoleMessage} from './blocklyc';
import {APP_STAGE} from './constants';


// noinspection HttpUrlsUsage
/**
 * Submit a project's source code to the cloud compiler
 *
 * @param {string} action One of (compile, bin, eeprom).
 * <pre>
 *    compile:  compile the project code and display the results.
 *
 *    bin:      compile the project code to a binary image and load that image
 *              to the device RAM
 *
 *    eeprom:   compile the project code to a binary image and load that image
 *              to the device EEPROM
 * </pre>
 * @param {string} sourceCode contains the source code to be compiled
 */
export const cloudCompile = async (action, sourceCode) => {
  // Contact the container running cloud compiler. If the browser is connected
  // via https, direct the compile request to the same port and let the load
  // balancer direct the request to the compiler.
  let postUrl = `https://${window.location.hostname}:443/single/prop-c/${action}`;

  // If running locally, assume that the compiler is available locally as
  // well, likely in a Docker container.
  if (window.location.protocol === 'http:') {
    // noinspection HttpUrlsUsage
    postUrl = `http://${window.location.hostname}:5001/single/prop-c/${action}`;
  }

  if (APP_STAGE === 'TEST') {
    // noinspection HttpUrlsUsage
    postUrl = `https://solo.parallax.com/single/prop-c/${action}`;
  }

  // Post the code to the compiler API and await the results
  logConsoleMessage(`Requesting compiler service from ${postUrl}`);

  // Try the compile operation
  try {
    const result = await postToCompiler(postUrl, sourceCode);
    logConsoleMessage(`Compile successful. ${result.success}`);
    if (result.success) {
      appendCompileConsoleMessage(
          `${result['compiler-output']}
              ${result['compiler-error']}\n`);
    } else {
      // Something unexpected has happened while calling the compile service
      if (result) {
        logConsoleMessage(`Compiler service request failed: ${result.state()}`);

        const state = result.state();
        let message = 'Unable to compile the project.\n';
        if (state === 'rejected') {
          message += '\nThe compiler service is temporarily unavailable or';
          message += ' unreachable.\nPlease try again in a few moments.';
        } else {
          message += 'Error "' + result.status + '" has been detected.';
        }
        appendCompileConsoleMessage(message);
      }
    }
    return result;
  } catch (e) {
    logConsoleMessage(`(PTC) Error while compiling`);
    logConsoleMessage(`(PTC) Message: ${e.message}`);
  }

  // hideCompilerStatusWindow();

  // $.ajax({
  //   'method': 'POST',
  //   'url': postUrl,
  //   'data': {'code': sourceCode},
  // }).done(function(data) {
  //   logConsoleMessage(`Receiving compiler service results`);
  //   // The compiler will return one of three payloads:
  //   // Compile-only
  //   // data = {
  //   //     "success": success,
  //   //     "compiler-output": out,
  //   //     "compiler-error": err.decode()
  //   // }
  //   //
  //   // Load to RAM/EEPROM
  //   // data = {
  //   //     "success": success,
  //   //     "compiler-output": out,
  //   //     "compiler-error": err.decode()
  //   //     "binary": base64binary.decode('utf-8')
  //   //     "extension": = extension
  //   // }
  //   //
  //   // General error message
  //   // data = {
  //   //    "success": False,
  //   //    "message": "unknown-action",
  //   //    "data": action
  //   // }
  //   // {success: true, compiler-output: "Succeeded.", compiler-error: ""}
  //
  //   // Check for an error response from the compiler
  //   if (!data || data['compiler-error'] !== '') {
  //     // Get message as a string, or blank if undefined
  //     const message = (typeof data['compiler-error'] === 'string') ?
  //           data['compiler-error'] : '';
  //     appendCompileConsoleMessage(
  //         data['compiler-output'] + data['compiler-error'] + message);
  //   } else {
  //     const loadWaitMsg = (action !== 'compile') ? '\nDownload...' : '';
  //     appendCompileConsoleMessage(
  //         data['compiler-output'] + data['compiler-error'] + loadWaitMsg);
  //
  //     // Execute the callback if one has been provided.
  //     if (data.success && successHandler) {
  //       successHandler(data);
  //     }
  //     compileConsoleScrollToBottom();
  //   }
  // }).fail(function(data) {
  //   // Something unexpected has happened while calling the compile service
  //   if (data) {
  //     logConsoleMessage(`Compiler service request failed: ${data.state()}`);
  //
  //     const state = data.state();
  //     let message = 'Unable to compile the project.\n';
  //     if (state === 'rejected') {
  //       message += '\nThe compiler service is temporarily unavailable or';
  //       message += ' unreachable.\nPlease try again in a few moments.';
  //     } else {
  //       message += 'Error "' + data.status + '" has been detected.';
  //     }
  //     appendCompileConsoleMessage(message);
  //   }
  // });
};


/**
 * Send source code to the compiler
 *
 * @param {string} url is the endpoint that will receive the source
 *    file for compilation
 * @param {string} sourceCode is the source code to be compiled
 * @return {Promise<any>}
 */
const postToCompiler = async function(url, sourceCode = '') {
  logConsoleMessage(`Submitting request to the compiler`);

  // Fetch options
  const fetchInit = {
    method: 'POST',
    mode: 'cors',
    cache: 'no-cache',
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
    },
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    body: sourceCode,
  };

  try {
    const res = await fetch(url, fetchInit);
    logConsoleMessage(`Returning compiled project`);
    return await res.json();
  } catch (err) {
    logConsoleMessage(`Compiler error: ${err.message}`);
  }
};
