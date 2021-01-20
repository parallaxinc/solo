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

import {startSentry} from './sentry';
startSentry();

import 'bootstrap';
import * as Cookies from 'js-cookie';

import {
  APP_VERSION,
  ApplicationName,
  productBannerHostTrigger,
  TestApplicationName} from './constants';

/**
 * Display the application name
 */
function showAppName() {
  let html = 'BlocklyProp<br><strong>Solo</strong>';
  if (window.location.hostname === productBannerHostTrigger) {
    html = 'BlocklyProp<br><strong>' + TestApplicationName + '</strong>';
  }
  document.getElementById('nav-logo').innerHTML = html;
}

/**
 * Display the app name in the banner
 * @param {string} appName
 */
function showAppBannerTitle(appName) {
  document.getElementById('app-banner-title').innerText =
      `BlocklyProp ${appName}`;
  if (window.location.hostname === productBannerHostTrigger) {
    document.getElementById('nav-logo').style.backgroundImage =
        'url(\'src/images/dev-toolkit.png\')';
  }
}

/**
 * Set the ending copyright date
 * @param {HTMLElement} element
 */
function setCopyrightDate(element) {
  const d = new Date();
  const year = d.getFullYear().toString();
  element.innerHTML = `v${APP_VERSION} &copy; 2015 - ${year}, Parallax Inc.`;
}

/**
 * Set link onClick handlers
 */
function setClickHandlers() {
  // Display the license in a modal when the link is clicked

  document.getElementById('show_license').onclick =
      () => $('#licenseModal').modal();
  // () => document.getElementById('licenseModal').modal();

  // Set a cookie to let blocklyc that we want to open a project
  // then redirect to the blocklyc editor page
  document.getElementById('open-project').onclick = () => {
    Cookies.set('action', 'open', {expires: 1});
    window.location = 'blocklyc.html';
  };

  // Set a cookie to let blocklyc that we want to create a new project
  // then redirect to the blocklyc editor page
  document.getElementById('new-project').onclick = () => {
    Cookies.set('action', 'new', {expires: 1});
    window.location = 'blocklyc.html';
  };
}

let appName = ApplicationName;
if (window.location.hostname === productBannerHostTrigger) {
  appName = TestApplicationName;
}

showAppName();
showAppBannerTitle(appName);
setCopyrightDate(document.getElementById('footer_copyright'));
setCopyrightDate(document.getElementById('license-copyright-date'));
setClickHandlers();

// The browser localStorage object should be empty
window.localStorage.clear();
