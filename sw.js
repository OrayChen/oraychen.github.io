/* ── Memoire Service Worker ───────────────────────────────────
   Cache-first strategy for static assets,
   network-first for pages.
   ──────────────────────────────────────────────────────────── */

const CACHE_NAME = 'memoire-v9';
const STATIC_ASSETS = [
  '/',
  '/styles/reset.css',
  '/styles/tokens.css',
  '/styles/typography.css',
  '/styles/layout.css',
  '/styles/components.css',
  '/styles/animations.css',
  '/styles/pages/home.css',
  '/styles/pages/post.css',
  '/styles/pages/archive.css',
  '/styles/pages/404.css',
  '/scripts/main.js',
  '/manifest.json',
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — cache-first for static, network-first for HTML
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // API requests: never cache
  if (url.pathname.startsWith('/api/')) return;

  // HTML pages: network-first
  if (request.mode === 'navigate' || request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static assets: cache-first
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});
