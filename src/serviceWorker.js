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

// import {Workbox} from 'workbox-window';

// import { CacheableResponsePlugin } from "workbox-cacheable-response";
// import { ExpirationPlugin } from "workbox-expiration";
// import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from "workbox-precaching";
// import { registerRoute, NavigationRoute } from "workbox-routing";
// import { NetworkFirst, NetworkOnly, StaleWhileRevalidate, CacheFirst } from "workbox-strategies";
import {precacheAndRoute} from 'workbox-precaching';

// Enable debug mode during development
console.log(`Hostname: ${location.hostname}`)
const DEBUG_MODE = location.hostname.endsWith(".app.local") || location.hostname === "localhost";

const cacheName = 'SoloCache_V1';
const SW_VERSION = '1.0.0';

precacheAndRoute(self.__WB_MANIFEST);

// const divInstall = document.getElementById('installContainer');
// const butInstall = document.getElementById('butInstall');

// workbox.precaching.precacheAndRoute(self.__precacheManifest);

  // self.addEventListener('install', (event) => {
  //   event.waitUntil(caches.open(cacheName).then((cache) => {
  //     console.log(`Adding items to the ${cacheName} cache`)
  //
  //     // Add all the assets in the array to the 'MyFancyCacheName_v1'
  //     // `Cache` instance for later use.
  //     return cache.addAll([
  //       // CSS
  //       '/bootstrap.min.css',
  //       '/main.css',
  //
  //       // Media files
  //       '/media/1x1.gif',
  //       '/media/click.mp3',
  //       '/media/click.ogg',
  //       'media/click.wav',
  //       'media/delete.mp3'
  //     ]);
  //   }));
  // });

  self.addEventListener('fetch', async (event) => {
    // Is this a request for an image?
    if (event.request.destination === 'image') {
      // Open the cache
      event.respondWith(caches.open(cacheName).then((cache) => {
        // Respond with the image from the cache or from the network
        return cache.match(event.request).then((cachedResponse) => {
          return cachedResponse || fetch(event.request.url).then((fetchedResponse) => {
            // Add the network response to the cache for future visits.
            // Note: we need to make a copy of the response to save it in
            // the cache and use the original as the request response.
            cache.put(event.request, fetchedResponse.clone());

            // Return the network response
            return fetchedResponse;
          });
        });
      }));
      // } else {
      //   return;
    }
  });


  /**
   * Root-level service worker
   */
  // const initServiceWorker = () => {
  //   if ('serviceWorker' in navigator) {
  //     // Add listener for PWA installation prompts
  //     pwaBeforeInstall();
  //
  //     console.log(`Preparing to load service worker`);
  //     // Register the service worker
  //     window.addEventListener('load', () => {
  //       console.log(`Launching service worker`);
  //       navigator.serviceWorker.register('/serviceWorker.js')
  //           .then((registration) => {
  //             console.log(`Service worker is registered in scope: ${registration.scope}`);
  //           })
  //           .catch((err) => {
  //             console.log(`Service worker not loaded: ${err.message}`);
  //           });
  //     });
  //   } else {
  //     console.log('Service Worker is not supported.');
  //   }
  // }
  //
  // const pwaBeforeInstall = () => {
  //   window.addEventListener('beforeinstallprompt', (event) => {
  //     // Prevent the mini-infobar from appearing on mobile.
  //     event.preventDefault();
  //     console.log('👍', 'beforeinstallprompt', event);
  //     // Stash the event so it can be triggered later.
  //     window.deferredPrompt = event;
  //     // Remove the 'hidden' class from the 'install' button container.
  //     divInstall.classList.toggle('hidden', false);
  //   });
  // }

self.addEventListener('message', (event) => {
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage(SW_VERSION);
  }
});
