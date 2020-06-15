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
  ApplicationName,
  productBannerHostTrigger,
  TestApplicationName} from './constants';
import {getURLParameter, getAllUrlParameters} from './utility';

/**
 * Display the application name
 */
function showAppName() {
  let html = 'BlocklyProp<br><strong>Solo</strong>';
  if (window.location.hostname === productBannerHostTrigger) {
    html = 'BlocklyProp<br><strong>' + TestApplicationName + '</strong>';
  }
  $('#nav-logo').html(html);
}

/**
 * Display the app name in the banner
 * @param {string} appName
 */
function showAppBannerTitle(appName) {
  $('#app-banner-title').html('BlocklyProp ' + appName);
  if (window.location.hostname === productBannerHostTrigger) {
    document.getElementById('nav-logo')
        .style.backgroundImage = 'url(\'src/images/dev-toolkit.png\')';
  }
}

/**
 * Set the ending copyright date
 * @param {HTMLElement} element
 */
function setCopyrightDate(element) {
  const d = new Date();
  element.innerHTML = d.getFullYear().toString();
}

/**
 * Set link onClick handlers
 */
function setClickHandlers() {
  // Display the license in a modal when the link is clicked
  $('#show_license').on('click', () => $('#licenseModal').modal());

  // Set a cookie to let blocklyc that we want to open a project
  // then redirect to the blocklyc editor page
  $('#open-project').on( 'click', () => {
    Cookies.set('action', 'open', {expires: 1});
    window.location = 'blocklyc.html';
  });

  // Set a cookie to let blocklyc that we want to create a new project
  // then redirect to the blocklyc editor page
  $('#new-project').on( 'click', () => {
    Cookies.set('action', 'new', {expires: 1});
    window.location = 'blocklyc.html';
  });
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

// Add experimental URL parameter to the open and new project links, if used
if (getURLParameter('experimental')) {
  $('.editor-link').attr('href', function() {
    return document.location.href + getAllUrlParameters().replace('?', '&');
  });
}
