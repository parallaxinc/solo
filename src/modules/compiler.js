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

// import * as Sentry from '@sentry/browser';
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
 *
 * @return {Promise} Resolves to an object containing the compiled binary.
 * reject will return a string error message.
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
  try {
    logConsoleMessage(`Sending compiler request to '${postUrl}'`);
    const result = await postToCompiler(postUrl, sourceCode);
    if (result.success) {
      console.log(`Compiler success`);
      appendCompileConsoleMessage(
          `${result['compiler-output']}${result['compiler-error']}\n`);
    } else {
      // Something unexpected has happened while calling the compiler service
      console.log(`Compiler failed`);
      if (!result) console.log(`Result is undefined`);
      if (result) {
        const state = result.success;
        let message = '\nError: Unable to compile the project.\n';
        if (state === 'rejected') {
          message += '\nThe compiler service is temporarily unavailable or';
          message += ' unreachable.\nPlease try again in a few moments.';
        } else {
          message += `\n${result['compiler-error']}`;
        }
        appendCompileConsoleMessage(message);
        // Sentry.captureMessage(message);
      }
    }
    return result;
  } catch (e) {
    logConsoleMessage(`(PTC) Error while compiling`);
    logConsoleMessage(`(PTC) Message: ${e.message}`);
    return Promise.reject(e.message);
  }
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
  try {
    const res = await fetch(
        url,
        {
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
        });
    return await res.json();
  } catch (err) {
    logConsoleMessage(`Compiler error: ${err.message}`);
    return Promise.reject(err);
  }
};
