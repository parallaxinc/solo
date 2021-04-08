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
 * Global flag to enable/disable the Sentry logger
 * @type {boolean}
 */
export const EnableSentry = true;

/**
 * Set the application version string
 * @type {string}
 * @description
 * The version string is formatted in the pattern of:
 *
 * {M}.{m}.{p} [-{b#} | {rc#}]
 *
 * where:
 *  {M} is the major release number.
 *  {m} is the minor release number.
 *  {p} is the patch level and always starts at 0 for each combination of
 *      major+minor release numbering.
 *  [...] is optional and used when releasing a beta or release candidate
 *     code package. Within the optional section:
 *     {b#} is the beta release number.
 *     {rc#} is the release candidate number.
 */
export const APP_VERSION = '1.5.7.2-a2';

/**
 * Constant string that represents the base, empty project header
 *
 * @type {string}
 *
 * @description Converting the string to a constant because it is referenced
 * in a number of places. The string is sufficiently complex that it could
 * be misspelled without detection.
 *
 * @deprecated This constant is now located in the Project class.
 */
// eslint-disable-next-line no-unused-vars
const EMPTY_PROJECT_CODE_HEADER = '<xml xmlns="http://www.w3.org/1999/xhtml">';

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
 */
export const TEMP_PROJECT_STORE_NAME = 'tempProject';
export const LOCAL_PROJECT_STORE_NAME = 'localProject';

/**
 * Constant number that represents the maximum length of a project name
 *
 * @type {number}
 */
export const PROJECT_NAME_MAX_LENGTH = 100;

/**
 * Constant number that represents the maximum number of
 * characters of the project name that are displayed in the UI
 *
 * @type {number}
 */
export const PROJECT_NAME_DISPLAY_MAX_LENGTH = 20;

/**
 * This is the name of the test ECS cluster. A matching hostname will
 * trigger a few UI changes to visually confirm that the visitor has reached
 * the test site.
 *
 * @type {string}
 */
export const productBannerHostTrigger = 'solocup.parallax.com';

/**
 * The application brand name in the production system
 * @type {string}
 */
export const ApplicationName = 'Solo';

/**
 * The application brand name as used in the Test system
 * @type {string}
 */
export const TestApplicationName = 'Solocup';

// TODO: Enumerate the OS version
// window.navigator.oscpu
// - Question: is this referring to the navigator.browserspecs in utils.js?
