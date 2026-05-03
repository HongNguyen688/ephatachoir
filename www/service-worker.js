// CĐ Ephata Service Worker — Offline PWA (v15)
// ============================================================
const CACHE_VERSION = 'v15';
const CACHE_NAME = `ephata-cache-${CACHE_VERSION}`;

// Assets to pre-cache
const STATIC_SHELL = [
  '/',
  '/index.html',
  '/weeklysongs.html',
  '/song-detail.html',
  '/performance.html',
  '/life.html',
  '/about.html',
  '/pdf-viewer.html',
  '/thongbao.html',
  '/manifest.json',
  '/statics/css/style.css',
  '/statics/css/responsive.css',
  '/statics/css/weeklysong.css',
  '/statics/css/detailweeklysongs.css',
  '/statics/css/performance.css',
  '/statics/css/life.css',
  '/statics/js/index.js',
  '/statics/js/pagination.js',
  '/statics/js/pdf.min.js',
  '/statics/js/pdf.worker.min.js',
  '/statics/images/logo.png',
  '/data/weeks.json',
  '/data/performances.json',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(STATIC_SHELL.map(url => {
        // Cache with cache busting to securely get latest on install
        return fetch(url + '?t=' + Date.now()).then(response => {
          if (!response.ok) throw new Error('Failed ' + url);
          // Store under the clean URL as key
          return cache.put(url, response);
        });
      }).map(p => p.catch(e => console.warn('PWA Pre-cache failed for', e))))
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

  // Skip cross-origin and non-GET requests, skip admin panel
  if (url.origin !== self.location.origin || req.method !== 'GET' || url.pathname.startsWith('/admin')) return;

  // 1. HTML / Navigation: Network-first
  // Use ignoreSearch: true during match to allow parameterized URLs like song-detail.html?date=...
  if (req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res.ok && !res.redirected) {
             const copy = res.clone();
             caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => {
          return caches.match(req, { ignoreSearch: true }).then(cached => {
            return cached || caches.match('/index.html');
          });
        })
    );
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
        .catch(() => caches.match(req, { ignoreSearch: true }))
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

      return cached || net || fetch(req);
    })
  );
});
