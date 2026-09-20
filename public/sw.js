/**
 * Service Worker — Pass-through / Bypass Cache
 * Deletes any existing caches and forwards all requests to the network.
 * This fixes local caching issues in development and allows hot reloads to work.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => {
        console.log('[SW] Deleting cache:', key);
        return caches.delete(key);
      }));
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Pass-through all requests directly to the network
  event.respondWith(fetch(event.request));
});
