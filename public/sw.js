const CACHE_NAME = "ss-sabbir-pwa-v3";
const PRECACHE_ASSETS = [
  "/manifest.webmanifest",
  "/favicon.ico",
  "/favicon.png",
  "/apple-touch-icon.png",
  "/pwa-192x192.png",
  "/pwa-512x512.png",
  "/pwa-maskable-512x512.png",
  "/pdf-worker/pdf.worker.min.mjs",
];

const STATIC_CACHE_PREFIXES = ["/assets/", "/images/", "/pdf-worker/"];
const STATIC_EXACT_PATHS = new Set(PRECACHE_ASSETS);

function isDevModuleRequest(url) {
  return (
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.pathname.startsWith("/__") ||
    url.searchParams.has("v") ||
    url.searchParams.has("t")
  );
}

function isCacheableStaticAsset(url) {
  if (STATIC_EXACT_PATHS.has(url.pathname)) return true;
  return STATIC_CACHE_PREFIXES.some((prefix) => url.pathname.startsWith(prefix));
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .catch(() => {}),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((key) => {
            if (key !== CACHE_NAME) {
              return caches.delete(key);
            }
            return Promise.resolve(false);
          }),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never intercept Vite dev modules, source files, API endpoints, or versioned dependency chunks
  if (isDevModuleRequest(url) || url.pathname.startsWith("/api/")) return;

  // Network-first for HTML navigation requests, caching successful responses so /books works offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => caches.match(request).then((res) => res || caches.match("/books") || caches.match("/"))),
    );
    return;
  }

  // Only cache immutable production assets, PDF worker & PWA icons
  if (!isCacheableStaticAsset(url)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy))
              .catch(() => {});
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    }),
  );
});
