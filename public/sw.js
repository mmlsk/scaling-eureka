const CACHE_VERSION = 5;
const CACHE_NAME = `lifeos-v${CACHE_VERSION}`;
const BASE_PATH = '/scaling-eureka';
const STATIC_ASSETS = [
  `${BASE_PATH}/`,
  `${BASE_PATH}/dashboard/`,
  `${BASE_PATH}/calculators/`
];

// Install: pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategies
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // Cache-first for Google Fonts
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  // Stale-while-revalidate for weather API
  if (url.hostname === 'api.open-meteo.com') {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        cache.match(event.request).then(cached => {
          const fetchPromise = fetch(event.request).then(response => {
            if (response.ok) cache.put(event.request, response.clone());
            return response;
          }).catch(() => cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Network-first for same-origin (Next.js pages)
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Network-first for everything else
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});

// Background sync for offline state persistence
self.addEventListener('sync', event => {
  if (event.tag === 'sync-state') {
    event.waitUntil(syncState());
  }
});

async function syncState() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'sync-state' }));
}
