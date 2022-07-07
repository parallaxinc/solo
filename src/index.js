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

import {startSentry} from './modules/sentry';
import {EnableSentry} from './modules/constants';
import {initToolbarIcons} from './modules/load_images';
import {Workbox} from 'workbox-window';

// Load the service worker if the browser supports it.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const wb = new Workbox("/serviceWorker.js");

    // Need to add an 'Update' button to install an updated service worker
    const updateButton = document.querySelector("#installContainer");

    // Fires when the registered service worker has installed but is waiting to activate.
    wb.addEventListener("waiting", (event) => {
      updateButton.classList.add("show");

      updateButton.addEventListener("click", () => {
        // Set up a listener that will reload the page as soon as the previously
        // waiting service worker has taken control.
        wb.addEventListener("controlling", (event) => {
          window.location.reload();
        });

        // Send a message telling the service worker to skip waiting.
        // This will trigger the `controlling` event handler above.
        wb.messageSW({type: "SKIP_WAITING"});
      });
    });

    // It may seem that this is the same as registering a service worker yourself using
    // navigator.serviceWorker.register. However, Workbox.register takes care of waiting
    // until the window load event before registering the service worker. This is desirable
    // in situations where precaching is involved so bandwidth contention that may delay
    // page startup can be avoided.
    wb.register();
  });
}

// Start up the sentry monitor before we run
startSentry()
    .then( (resp) => {
      if (EnableSentry) {
        console.log(`Sentry has started. ${resp}`);
      }
    })
    .catch((err) => {
      console.log(`Sentry failed to start. ${err.message}`)
    });

initToolbarIcons();

console.log(`Starting the editor...`);
import './modules/editor';
