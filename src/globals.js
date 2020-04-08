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


/* Error logging */
// Sentry.init({dsn: 'https://27707de6f602435b8c6bf1702efafd1d@sentry.io/2751639'});


/**
 * Global variable that holds the original version of the loaded
 * project.
 *
 * This should be updated with a current copy of the project after
 * every save and save-as operation.
 *
 * @type {object}
 */
// let projectData = null;


/**
 * The application brand name in the production system
 *
 * TODO: Constant 'ApplicationName' is moving to ./modules/constants.js
 *
 * @type {string}
 */
// const ApplicationName = 'Solo';


/**
 * The application brand name as used in the Test system
 *
 * TODO: Constant 'TestApplicationName' is moving to ./modules/constants.js
 *
 * @type {string}
 */
// const TestApplicationName = 'Solocup';


/**
 * This is the name of the test ECS cluster. A matching hostname will
 * trigger a few UI changes to visually confirm that the visitor has reached
 * the test site.
 *
 * TODO: Constant 'productBannerHostTrigger' is moving to ./modules/constants.js
 *
 * @type {string}
 */
// const productBannerHostTrigger = 'solocup.parallax.com';




/**
 *  The root URL string that points to the base of the static web page content
 *
 *  @description
 *  The hosting web page must contain a <meta> tag that sets this attribute
 *
 *      <meta name="cdn" content="src/">
 *
 * @type {*|jQuery}
 */
// const CDN_URL = $('meta[name=cdn]').attr("content");


// TODO: Enumerate the OS version
// window.navigator.oscpu
// - Question: is this referring to the navigator.browserspecs in utils.js?


/**
 * Constant number that represents the maximum length of a project name
 *
 * @type {number}
 */
// const PROJECT_NAME_MAX_LENGTH = 100;


/**
 * Constant number that represents the maximum number of
 * characters of the project name that are displayed in the UI
 *
 * @type {number}
 */
// const PROJECT_NAME_DISPLAY_MAX_LENGTH = 20;



/**
 * The broswer-based serial terminal object
 * @type {object}
 */
// var pTerm;


/**
 * The name used to store a project that is being loaded from
 * offline storage.
 *
 * temp... is used to persist the imported SVG file. This file is a
 * candidate until the user selects the 'Open' button to confirm that
 * this file is the one to be loaded into the app.
 *
 * local... is used as the project that will either replace the
 * current project or be appended to the current project.
 *
 * @type {string}
 *
 * @description
 * These constants are also defined in the module subsystem in the constants.js file.
 *
 */
// const TEMP_PROJECT_STORE_NAME = 'tempProject';
// const LOCAL_PROJECT_STORE_NAME = 'localProject';

