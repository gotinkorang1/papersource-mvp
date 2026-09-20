// Bump the shell version whenever the offline document or icons change so
// installed clients do not keep an obsolete app chrome indefinitely.
const CACHE_NAME = "papersource-shell-v4";
const SHELL = ["/", "/offline.html", "/icon.svg", "/icons/papersource-logo.png"];

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Keep private, tokenised, and stateful journeys out of the offline shell.
  // A shared device must never replay an order, quote, payment, or auth page
  // from a previous browser session.
  const privatePrefixes = [
    "/api/",
    "/admin",
    "/account",
    "/auth",
    "/cart",
    "/checkout",
    "/forgot-password",
    "/login",
    "/order",
    "/pay",
    "/quote",
    "/quick-order",
    "/register",
    "/request-quote",
    "/reset-password",
    "/signup",
  ];
  if (request.method !== "GET" || url.origin !== self.location.origin || privatePrefixes.some((prefix) => url.pathname === prefix || url.pathname.startsWith(`${prefix}/`))) return;
  event.respondWith(fetch(request).then((response) => {
    if (response.ok && (request.mode === "navigate" || response.headers.get("content-type")?.includes("image/"))) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then((cached) => cached ?? caches.match("/offline.html"))));
});
