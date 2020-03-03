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

import {
    product_banner_host_trigger,
    TestApplicationName,
    ApplicationName
} from './globals';


// Display the BlocklyProp Solo license in a modal window
function showLicense() {
    $('#licenseModal').modal();
}

// Display the application name
function showAppName() {
    let html = 'BlocklyProp<br><strong>Solo</strong>';
    if (window.location.hostname === product_banner_host_trigger) {
        html = 'BlocklyProp<br><strong>' + TestApplicationName + '</strong>';
    }
    $('#nav-logo').html(html);
}


// Display the app name in the banner
function showAppBannerTitle(appName) {
    $('#app-banner-title').html('BlocklyProp ' + appName);
    if (window.location.hostname === product_banner_host_trigger) {
        document.getElementById('nav-logo').style.backgroundImage = 'url(\'src/images/dev-toolkit.png\')';
    }
}

// Set the ending copyright date
function setCopyrightDate(element) {
    let d = new Date();
    element.html(d.getFullYear().toString());
}

let appName = ApplicationName;
if (window.location.hostname === product_banner_host_trigger) {
    appName = TestApplicationName;
}

// License link click event handler
document.getElementById('show-license').onclick = showLicense;

// The browser localStorage object should be empty
window.localStorage.clear();

// Update some UI elements
showAppName();
showAppBannerTitle(appName);
setCopyrightDate($('#footer_copyright'));
setCopyrightDate($('#license-copyright-date'));


