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
import {logConsoleMessage} from './modules/utility';


/**
 * Initialize deferredPrompt for use later to show browser install prompt.
* @type {BeforeInstallPromptEvent}
 */
export let deferredPrompt;

/**
 * Flag to indicate that the app is installed and active.
 * @type {boolean}
 */
export let pwaActive = false;


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


// Load the service worker if the browser supports it.
if ("serviceWorker" in navigator) {
  // Register the service worker only after the page load is complete. This
  // will ensure that all page assets have been loaded before the service worker
  // is registered. The service worker will begin loading assets into a local
  // cache once it is registered.
  window.addEventListener("load", () => {
    logConsoleMessage(`Page has been loaded. Register the root service worker.`)
    // Do nothing if the app is already installed
    if (pwaActive) {
      return;
    }

    const installButtonElement = document.getElementById('btn-install-pwa');
    let wb = null;

    pwaBeforeInstall();

    try {
      logConsoleMessage(`Newing a WorkBox object`);
      wb = new Workbox("./sw.js");
      logConsoleMessage(`Workbox object created`);
    } catch (err) {
      logConsoleMessage(`Workbox init failed: ${err.message}`);
      return;
    }

    installButtonElement.addEventListener('click', async () => {
      console.log(`User clicked the install app button.`)

      // deferredPrompt is a global variable we've been using in the sample to capture the `beforeinstallevent`
      deferredPrompt.prompt();

      // Find out whether the user confirmed the installation or not
      const {outcome} = await deferredPrompt.userChoice;

      // The deferredPrompt can only be used once.
      deferredPrompt = null;

      // Act on the user's choice
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt.');
      } else if (outcome === 'dismissed') {
        console.log('User dismissed the install prompt');
      }

      // Hide the 'Install' button
      pwaInstallButton(false);
    });

    // Fires when the registered service worker has installed but is waiting to activate.
    wb.addEventListener("waiting", (event) => {
      logConsoleMessage(`Service worker is installed but waiting to activate...`);
      logConsoleMessage(`Waiting event: ${event}`);

      // Hide the 'install' button
      pwaInstallButton(false);

      const button = document.getElementById('btn-install-pwa');
      button.addEventListener("click", (event) => {
        console.log(`Install button clicked.`, event)

        // Set up a listener that will reload the page as soon as the previously
        // waiting service worker has taken control.
        wb.addEventListener("controlling", () => {
          window.location.reload();
        });

        // Send a message telling the service worker to skip waiting.
        // This will trigger the `controlling` event handler above.
        wb.messageSW({type: "SKIP_WAITING"});

        // It may seem that this is the same as registering a service worker yourself using
        // navigator.serviceWorker.register. However, Workbox.register takes care of waiting
        // until the window load event before registering the service worker. This is desirable
        // in situations where precaching is involved so bandwidth contention that may delay
        // page startup can be avoided.
        wb.register();
      });
    });

    // Intercept the browser's prompt to install the application
//
// The 'beforeinstallprompt' event fires on devices when a user is about to
// be prompted to "install" a web application. It may be saved for later
// and used to prompt the user at a more suitable time.
//
// Here, the event details are stored in a global variable, deferredPrompt,
// that will be referenced later.
// ----------------------------------------------------------------------------
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log(`Before install prompt fires...`);

      // Log the platforms that the beforeinstallprompt event was sent to.
      // The platforms property is an array of strings. Typically, it should
      // contain a single element, 'web', when the site is viewed from a web
      // browser.
      console.log(`Platforms: ${e.platforms}`);

      // Prevent the mini-info bar from appearing on mobile
      e.preventDefault();

      // Stash the event so it can be triggered later.
      deferredPrompt = e;

      // Update UI notify the user they can install the PWA
      // showInstallPromotion();

      return false;
    });
  });
}

/**
 * Install listener for the 'beforeinstallprompt' event.
 * @param {HTMLElement} button
 */
function pwaBeforeInstall() {
  window.addEventListener('beforeinstallprompt', (event) => {
    console.log(`BeforeInstallPrompt...`)

    // Prevent the mini-info bar from appearing on mobile.
    event.preventDefault();

    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;

    // Remove the 'hidden' class from the 'install' button container.
    console.log(`Show the install button on the toolbar`)

    // Temporarily disable the 'install' button while the details of updating
    // a pwa are addressed.
    // pwaInstallButton(true);
    pwaInstallButton(false);
  });
}

function showInstallPromotion() {
  console.log(`Prompt the user to install the application.`)
}

/**
 * Unregister the application from the browser.
 */
function serviceWorkerUnregister() {
  navigator.serviceWorker.getRegistrations()
      .then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister()
    }
  });
}

/**
 * Set the state of the PWA installation button
 * @param {boolean} enable
 */
export function pwaInstallButton(enable) {
  const installButtonElement = document.getElementById('btn-install-pwa');
  if (enable) {
    logConsoleMessage(`Showing PWA Install button`);
    installButtonElement.classList.remove("hidden");
  } else {
    logConsoleMessage(`Hiding PWA Install button`);
    installButtonElement.classList.add("hidden");
  }
}


/**
 * Set the state of the PWA update button
 * @param {boolean} enable
 */
function pwaUpdateButton(enable) {

}


function getPWADisplayMode() {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
  if (document.referrer.startsWith('android-app://')) {
    return 'twa';
  } else if (navigator.standalone || isStandalone) {
    return 'standalone';
  }
  return 'browser';
}

initToolbarIcons();

logConsoleMessage(`Starting the editor...`);

import './modules/editor';
