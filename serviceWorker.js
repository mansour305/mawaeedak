/*
  serviceWorker.js

  A simple Service Worker to provide offline support for the Mawaeedak PWA.  It
  implements a basic caching strategy for static assets (CSS, JS, images) and a
  network‑first strategy for API requests.  Register this worker in your React
  application (e.g. in `main.tsx`) by calling `navigator.serviceWorker.register`.

  Note: This is a starting point and may need to be refined depending on your
  application’s caching requirements (e.g. dynamic routes, cache invalidation).
*/

const STATIC_CACHE = 'mawaeedak-static-v1';
const API_CACHE = 'mawaeedak-api-v1';

// List of assets to precache (add more as needed)
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/favicon.ico',
  '/manifest.json',
  '/logo.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (![STATIC_CACHE, API_CACHE].includes(cacheName)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests differently
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      caches.open(API_CACHE).then(async (cache) => {
        try {
          const networkResponse = await fetch(request);
          // Put a clone of the response in the cache for future offline use
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (error) {
          // Network failed – return cached response if available
          return cache.match(request);
        }
      })
    );
    return;
  }

  // For navigation requests and other static assets use a cache‑first strategy
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        return (
          cachedResponse ||
          fetch(request).catch(() => caches.match('/index.html'))
        );
      })
    );
    return;
  }

  // Default: try cache, then network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(request).catch(() => cachedResponse)
      );
    })
  );
});