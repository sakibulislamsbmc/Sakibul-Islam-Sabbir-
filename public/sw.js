const CACHE_NAME = "ss-sabbir-pwa-v5";
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

function isGoogleFontRequest(url) {
  return (
    url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com"
  );
}

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) =>
        Promise.allSettled(PRECACHE_ASSETS.map((asset) => cache.add(asset).catch(() => {}))),
      )
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

  // Cache Google Fonts (CacheFirst) so Bismah & Bangla typography stay crisp offline
  if (isGoogleFontRequest(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request)
          .then((response) => {
            if (response && (response.status === 200 || response.type === "opaque")) {
              const copy = response.clone();
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, copy))
                .catch(() => {});
            }
            return response;
          })
          .catch(() => cached);
      }),
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Never intercept Vite dev modules, source files, API endpoints, or versioned dependency chunks
  if (isDevModuleRequest(url) || url.pathname.startsWith("/api/")) return;

  // Network-first for HTML navigation requests, caching both full URL and pathname
  // so /bismah, /education?section=bismah, and /books open seamlessly without internet
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const copyForExact = response.clone();
            const copyForPath = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, copyForExact).catch(() => {});
                if (url.search) {
                  cache.put(new Request(url.pathname), copyForPath).catch(() => {});
                }
              })
              .catch(() => {});
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((res) => res || caches.match(url.pathname))
            .then((res) => res || caches.match("/bismah"))
            .then((res) => res || caches.match("/education"))
            .then((res) => res || caches.match("/books"))
            .then((res) => res || caches.match("/")),
        ),
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
