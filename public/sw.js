/* AI Resume PWA service worker.
 * Deliberately never caches API, authentication, payment, or user-specific responses.
 */
const CACHE_PREFIX = "ai-resume-pwa";
// Bump when the worker strategy changes so clients discard bundles cached by
// earlier versions of the app.
const STATIC_CACHE = `${CACHE_PREFIX}-static-v2`;
const OFFLINE_CACHE = `${CACHE_PREFIX}-offline-v1`;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/android-chrome-192x192.png",
  "/icons/android-chrome-512x512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(OFFLINE_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith(CACHE_PREFIX) && ![STATIC_CACHE, OFFLINE_CACHE].includes(key))
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

function isSensitiveOrDynamic(url) {
  if (url.origin !== self.location.origin) return true;
  const path = url.pathname.toLowerCase();

  return (
    path.startsWith("/api/") ||
    path.startsWith("/auth") ||
    path.startsWith("/login") ||
    path.startsWith("/signup") ||
    path.startsWith("/payment") ||
    path.startsWith("/checkout") ||
    path.startsWith("/builder") ||
    path.startsWith("/resume-builder") ||
    path.startsWith("/print-resume") ||
    path.startsWith("/account") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/_next/data/")
  );
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Navigation is network-first. Never cache personalized HTML.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(OFFLINE_CACHE);
        return (await cache.match(OFFLINE_URL)) || Response.error();
      })
    );
    return;
  }

  if (isSensitiveOrDynamic(url)) return;

  // Cache only same-origin static assets, never arbitrary data or HTML.
  const isStaticAsset =
    url.pathname.startsWith("/_next/static/") ||
    /\.(?:css|js|mjs|woff2?|ttf|otf|png|jpe?g|webp|svg|ico|avif)$/i.test(url.pathname);

  if (!isStaticAsset) return;

  // Next.js chunk names may remain stable during a dev-server session. A
  // cache-first response can then combine fresh server HTML with stale React
  // code and cause a hydration mismatch. Prefer a fresh asset and retain the
  // cached version only as an offline fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && response.type === "basic") {
          caches.open(STATIC_CACHE)
            .then((cache) => cache.put(request, response.clone()))
            .catch(() => {});
        }
        return response;
      })
      .catch(async () => {
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match(request)) || Response.error();
      })
  );
});
