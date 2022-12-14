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
// import {BrowserTracing} from '@sentry/tracing';
// import {APP_STAGE, APP_VERSION, EnableSentry} from './constants';

/**
 * Initialize the Sentry logger
 */
// const startSentry = async () => {
//   if (! EnableSentry) {
//     console.log(`WARNING: Sentry is disabled.`);
//     return;
//   }
//
//   if (APP_STAGE === 'PROD') {
//     await Sentry.init({
//       dsn: 'https://82d15347f0e14577b144aa2b1931d953@o461706.ingest.sentry.io/4503921053794304',
//       integrations: [
//         new BrowserTracing(),
//       ],
//       release: `Solo:${APP_VERSION}`,
//       debug: true,
//       maxBreadcrumbs: 100,
//       attachStacktrace: true,
//       tracesSampleRate: 1.0,
//       autoSessionTracking: true,
//     });
//   } else {
//     await Sentry.init({
//       dsn: 'https://b1ce76e2275a468e8a45038a7a308e35@o461706.ingest.sentry.io/4504278687809536',
//       integrations: [
//         new BrowserTracing(),
//       ],
//       release: `SoloCup:${APP_VERSION}`,
//       debug: true,
//       maxBreadcrumbs: 100,
//       attachStacktrace: true,
//       tracesSampleRate: 1.0,
//       autoSessionTracking: true,
//     });
//   }
// };
//
// export {startSentry};
