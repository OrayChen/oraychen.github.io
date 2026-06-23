/* ── Memoire Service Worker ───────────────────────────────────
   Fonts: cache-first (they rarely change).
   Everything else: network-only — never cached.
   ──────────────────────────────────────────────────────────── */

const FONT_CACHE = 'memoire-fonts-v2';

// Install — pre-cache local fonts
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FONT_CACHE).then((cache) => {
      return cache.addAll([
        '/fonts/LXGWWenKaiGB-Regular.ttf',
        '/fonts/LXGWWenKaiMonoGB-Regular.ttf',
      ]).catch(() => {
        // Font files might not exist yet — that's OK
      });
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches (including old all-asset caches)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== FONT_CACHE).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch — only cache fonts; everything else is network-only
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) return;

  // Font files: cache-first
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(FONT_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Everything else: network-only, never cache
  event.respondWith(fetch(request));
});
