const CACHE_NAME = 'imgrunner-static-v1';
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/css/resize-v4.css',
  '/css/app.css',
  '/js/shared-utils.js',
  '/js/i18n.js',
  '/js/presets.js',
  '/js/resize-v4.js',
  '/js/site-config.js',
  '/js/global-telemetry.js',
  '/js/bug-report.js',
  '/favicon.svg',
  '/favicon-48.png',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(CORE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names
        .filter((name) => name !== CACHE_NAME)
        .map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') return response;

        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      });
    })
  );
});
