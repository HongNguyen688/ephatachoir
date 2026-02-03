const CACHE_NAME = "ephata-cache-v1";

const STATIC_FILES = [
  "/",
  "/about.html",
  "/index.html",
  "/life.html",
  "/performance.html",
  "/weeklysongs.html",
  "/archives/nama__chuachiupheprua.html",
  "/archives/nama__cn1-muavong.html",
  "/archives/nama__cn2-muavong.html",
  "/archives/nama__cn3-muavong.html",
  "/archives/nama__cn4-muavong.html",
  "/archives/nama__giangsinh25.html",
  "/archives/nama__Legdthanhgia.html",
  "/archives/nama__Lehienlinh.html",
  "/archives/nama__muathuongnien-cn2.html",
  "/archives/nama__muathuongnien-cn3.html",
  "/archives/nama__muathuongnien-cn4.html",
  "/archives/nama__muathuongnien-cn5.html",
  "/statics/images/logo.png",
  "/statics/css/style.css",
  "/statics/css/detailweeklysongs.css",
  "/statics/css/performance.css",
  "/statics/css/responsive.css",
  "/statics/css/style.css",
  "/statics/js/index.js",
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_FILES)),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      );
    }),
  );
  // Take control of the page immediately
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Handle PDFs separately
  if (url.pathname.endsWith(".pdf")) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {
          // If we have it cached → return it (works offline)
          if (cachedResponse) {
            return cachedResponse;
          }

          // Not cached → try network
          return fetch(event.request)
            .then((networkResponse) => {
              // Save to cache for next time / offline use
              if (networkResponse && networkResponse.status === 200) {
                cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // Network failed and no cache → return nothing or a fallback
              //  return Response.error() → let page handle 404
              return new Response("PDF not available offline", {
                status: 503,
                statusText: "Service Unavailable",
              });
            });
        });
      }),
    );
    return;
  }

  // Everything else: cache-first + network fallback + offline shell fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).catch(() => {
        // Most common offline fallback: return the app shell
        return caches.match("/index.html");
      });
    }),
  );
});
