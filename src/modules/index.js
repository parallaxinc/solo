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
// Start up the sentry monitor before we run
startSentry()
    .then( () => {
      if (EnableSentry) console.log('Sentry has started.');
    })
    .catch((err) => console.log(`Sentry failed to start. Error: ${err.message}`));

import 'bootstrap';
import * as Cookies from 'js-cookie';

import {
  APP_BUILD, APP_QA, APP_VERSION, ApplicationName, EnableSentry,
  productBannerHostTrigger, TestApplicationName,
} from './constants';

import {logConsoleMessage} from './utility';

/**
 * Display the application name
 */
function showAppName() {
  const html = `BlocklyProp<br><strong>${isDevBuild() ? TestApplicationName : 'Solo'}</strong>`;
  const navLogo = document.getElementById('nav-logo');
  if (navLogo) {
    navLogo.innerHTML = html;
  }
}

/**
 * Display the app name in the banner
 * @param {string} appName
 */
function showAppBannerTitle(appName) {
  const element = document.getElementById('app-banner-title');
  if (element) {
    element.innerHTML = `BlocklyProp ${appName}`;
  }

  // Set special logo for dev and QA systems
  if (isDevBuild()) {
    document.getElementById('nav-logo')
        .style.backgroundImage = 'url(\'images/dev-toolkit.png\')';
  }
}

/**
 * Set the ending copyright date
 * @param {HTMLElement} element
 */
function setCopyrightDate(element) {
  const d = new Date();
  const year = d.getFullYear().toString();
  let applicationVersion = `v${APP_VERSION}`;
  if (isDevBuild()) {
    applicationVersion += `.${APP_BUILD}-${APP_QA}`;
  }

  element.innerHTML = `${applicationVersion} &copy; 2015 - ${year}, Parallax Inc.`;
}


/**
 * Set link onClick handlers
 */
function setClickHandlers() {
  // Display the license in a modal when the link is clicked
  document.getElementById('show_license')
      .addEventListener('click', showLicenseEventHandler, false);

  // Set a cookie to let blocklyc that we want to open a project
  // then redirect to the blocklyc editor page
  document.getElementById('open-project')
      .addEventListener('click', openProjectEventHandler, false);

  // Set a cookie to let blocklyc that we want to create a new project
  // then redirect to the blocklyc editor page
  document.getElementById('new-project')
      .addEventListener('click', newProjectEventHandler, false);
}

/**
 * Display the Solo license
 */
function showLicenseEventHandler() {
  $('#licenseModal').modal();
}

/**
 * Handle the 'Open Project' click event
 */
function openProjectEventHandler() {
  Cookies.set('action', 'open', {expires: 1});
  window.location = 'blocklyc.html';
}

/**
 * Handle the 'New Project' click event
 */
function newProjectEventHandler() {
  Cookies.set('action', 'new', {expires: 1});
  window.location = 'blocklyc.html';
}


/**
 * Determine if this is deployed in a test or local dev environment
 *
 * @return {boolean}
 */
function isDevBuild() {
  return (window.location.hostname.indexOf(productBannerHostTrigger) >= 0 ||
      window.location.hostname.indexOf('localhost') >= 0);
}

/**
 * Approximate the browser brand and version
 *
 * @return {(string|string)[]} Returns an array containing the browser brand
 * name and the browser version.
 */
const getBrowserAgent = () => {
  try {
    const navUserAgent = navigator.userAgent;
    let browserName = navigator.appName;
    let browserVersion = ''+parseFloat(navigator.appVersion);
    let tempNameOffset;
    let tempVersionOffset;
    let tempVersion;

    if ((tempVersionOffset=navUserAgent.indexOf('Opera')) !== -1) {
      browserName = 'Opera';
      browserVersion = navUserAgent.substring(tempVersionOffset+6);
      if ((tempVersionOffset=navUserAgent.indexOf('Version')) !== -1) {
        browserVersion = navUserAgent.substring(tempVersionOffset+8);
      }
    } else if ((tempVersionOffset=navUserAgent.indexOf('MSIE')) !== -1) {
      browserName = 'Microsoft Internet Explorer';
      browserVersion = navUserAgent.substring(tempVersionOffset+5);
    } else if ((tempVersionOffset=navUserAgent.indexOf('Chrome')) !== -1) {
      browserName = (navigator.brave !== undefined) ? 'Brave' : 'Chrome';
      browserVersion = navUserAgent.substring(tempVersionOffset+7);
    } else if ((tempVersionOffset=navUserAgent.indexOf('Safari')) !== -1) {
      browserName = 'Safari';
      browserVersion = navUserAgent.substring(tempVersionOffset+7);
      if ((tempVersionOffset=navUserAgent.indexOf('Version')) !== -1) {
        browserVersion = navUserAgent.substring(tempVersionOffset+8);
      }
    } else if ((tempVersionOffset=navUserAgent.indexOf('Firefox')) !== -1) {
      browserName = 'Firefox';
      browserVersion = navUserAgent.substring(tempVersionOffset+8);
    } else if (
      (tempNameOffset=navUserAgent.lastIndexOf(' ')+1) <
        (tempVersionOffset=navUserAgent.lastIndexOf('/')) ) {
      browserName = navUserAgent.substring(tempNameOffset, tempVersionOffset);
      browserVersion = navUserAgent.substring(tempVersionOffset+1);
      if (browserName.toLowerCase() === browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }

    // trim version
    if ((tempVersion=browserVersion.indexOf(';')) !== -1) {
      browserVersion=browserVersion.substring(0, tempVersion);
    }

    if ((tempVersion=browserVersion.indexOf(' ')) !== -1) {
      browserVersion=browserVersion.substring(0, tempVersion);
    }

    return [browserName, browserVersion];
  } catch (err) {
    logConsoleMessage(`Cannot determine browser details. ${err.message}`);
    return ['None', '0'];
  }
};

let appName = ApplicationName;
if (window.location.hostname === productBannerHostTrigger) {
  appName = TestApplicationName;
}

// Get the browser brand and version.
// TODO: Warn user if the browser is not supported
const [brand, version] = getBrowserAgent();
console.log(`BrowserName = ${brand}, Version = ${version}`);

showAppName();
showAppBannerTitle(appName);
setCopyrightDate(document.getElementById('footer_copyright'));
setCopyrightDate(document.getElementById('license-copyright-date'));
setClickHandlers();

// The browser localStorage object should be empty
window.localStorage.clear();

// Add experimental URL parameter to the open and new project links, if used
// if (getURLParameter('experimental')) {
//   $('.editor-link').attr('href', function() {
//     return document.location.href + getAllUrlParameters().replace('?', '&');
//   });
// }
