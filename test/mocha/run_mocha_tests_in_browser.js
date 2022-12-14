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

/**
 * @fileoverview Node.js script to run Mocha tests in Chrome, via webdriver.
 */
const {remote} = require('webdriverio');

module.exports = runMochaTestsInBrowser;

/**
 * Runs the Mocha tests in this directory in Chrome. It uses webdriverio to
 * launch Chrome and load index.html. Outputs a summary of the test results
 * to the console.
 * @return 0 on success, 1 on failure.
 */
async function runMochaTestsInBrowser() {
  const options = {
      capabilities: {
          browserName: 'chrome'
      }
  };
  // Run in headless mode on Travis.
  if (process.env.TRAVIS_CI) {
    options.capabilities['goog:chromeOptions'] = {
      args: ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
    };
  }

  const url = 'file://' + __dirname + '/index.html';
  console.log(`Starting from ${url}`);

  console.log('Starting webdriverio...');
  const browser = await remote(options);

  console.log('Initialized.\nLoading url: ' + url);
  await browser.url(url);

  await browser.waitUntil(async () => {
    const elem = await browser.$('#failureCount');
    const text = await elem.getAttribute('tests_failed');
    return text !== 'unset';
  }, 7000);

  const elem = await browser.$('#failureCount');
  const numOfFailure = await elem.getAttribute('tests_failed');

  console.log('============Blockly Mocha Test Summary=================');
  console.log(numOfFailure);
  console.log(numOfFailure + ' tests failed');
  console.log('============Blockly Mocha Test Summary=================');
  if (parseInt(numOfFailure) !== 0) {
    await browser.deleteSession();
    return 1;
  }
  await browser.deleteSession();
  return 0;
}

if (require.main === module) {
  runMochaTestsInBrowser().catch(e => {
    console.error(e);
    process.exit(1);
  }).then(function(result) {
    if (result) {
      console.log('Mocha tests failed');
      process.exit(1);
    } else {
      console.log('Mocha tests passed');
      process.exit(0);
    }
  });
}
