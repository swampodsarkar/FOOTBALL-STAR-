// This file exists only to destroy any service worker left behind by the
// previous PWA builds. On the next navigation the browser checks for an update
// to the registered /sw.js, fetches this file, installs it, and it immediately
// unregisters itself — freeing the app from the stale cache trap.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    self.registration
      .unregister()
      .then(() => self.clients.claim())
      .catch(() => {})
  );
});
