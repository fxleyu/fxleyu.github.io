/* Offline support for fxleyu.github.io. Bump this version when the app shell changes. */
const CACHE_PREFIX = 'fxleyu-';
const CACHE_NAME = CACHE_PREFIX + 'reading-20260908-v8';
const LEGACY_CACHES = ['precache-v1', 'runtime', 'main-precache-v1', 'main-runtime', 'main-precache-then-runtime'];
const PRECACHE_LIST = [
  './',
  './archive/',
  './search/',
  './offline.html',
  './assets/dist/site.min.css',
  './assets/dist/site.min.js',
  './assets/dist/archive.min.js',
  './search.json',
  './assets/dist/snackbar.min.js',
  './assets/dist/sw-registration.min.js',
  './img/avatar_fxleyu.png',
  './img/favicon.ico'
];

self.addEventListener('install', function (event) {
  // A failed shell download must not replace the working offline version.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(PRECACHE_LIST.map(function (url) {
          return new Request(url, { cache: 'reload' });
        }));
      })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(names.filter(function (name) {
          return (name.indexOf(CACHE_PREFIX) === 0 && name !== CACHE_NAME) || LEGACY_CACHES.indexOf(name) !== -1;
        }).map(function (name) { return caches.delete(name); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate';
  // Revalidate HTML, CSS and scripts together. Never serve an old cached stylesheet
  // immediately while downloading the current document from the network.
  const response = fetch(request, { cache: 'no-cache' });
  event.waitUntil(response.then(function (result) {
    if (!result.ok) return;
    const copy = result.clone();
    return caches.open(CACHE_NAME).then(function (cache) { return cache.put(request, copy); });
  }).catch(function () {}));

  event.respondWith(response.catch(function () {
    return caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(request).then(function (cached) {
        if (cached) return cached;
        // Search queries share one page shell; its cached index filters locally.
        if (isNavigation && url.pathname === new URL('./search/', self.location.href).pathname) return cache.match('./search/');
        if (isNavigation) return cache.match('./offline.html');
        return Response.error();
      });
    });
  }));
});
