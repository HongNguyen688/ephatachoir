// ============================================================
// CĐ Ephata Service Worker — Offline PWA (v6)
// ============================================================
const CACHE_VERSION = 'v6';
const CACHE_NAME = `ephata-cache-${CACHE_VERSION}`;

// Assets to pre-cache
const STATIC_SHELL = [
  '/www/manifest.json',
  '/www/statics/css/style.css',
  '/www/statics/css/responsive.css',
  '/www/statics/css/weeklysong.css',
  '/www/statics/css/detailweeklysongs.css',
  '/www/statics/css/performance.css',
  '/www/statics/css/life.css',
  '/www/statics/js/index.js',
  '/www/statics/images/logo.png',
  '/www/data/weeks.json',
  '/www/data/performances.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.allSettled(STATIC_SHELL.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter(n => n.startsWith('ephata-') && n !== CACHE_NAME).map(n => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Skip cross-origin and non-GET
  if (url.origin !== self.location.origin || req.method !== 'GET') return;

  // 1. SKIP navigation/HTML entirely for Safari redirect safety
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/')) {
    return;
  }

  // 2. JSON: Network-first
  if (url.pathname.endsWith('.json')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // 3. Audio / PDF: Cache-first
  if (url.pathname.match(/\.(m4a|mp3|pdf)$/i)) {
    event.respondWith(
      caches.match(req).then(cached => {
        return cached || fetch(req).then(res => {
          if (res.ok && !res.redirected) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  // 4. Assets (CSS/JS/Images): Stale-While-Revalidate
  event.respondWith(
    caches.match(req).then(cached => {
      const net = fetch(req).then(res => {
        if (res.ok && !res.redirected) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => null);

      // If we have a cached version, return it immediately
      // If not, wait for the network but fallback to standard fetch if net fails
      return cached || net || fetch(req);
    })
  );
});
