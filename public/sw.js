// Bump the shell version whenever the offline document or icons change so
// installed clients do not keep an obsolete app chrome indefinitely.
const CACHE_NAME = "papersource-shell-v2";
const SHELL = ["/", "/offline.html", "/icons/papersource-192.svg", "/icons/papersource-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/") || url.pathname.startsWith("/admin") || url.pathname.startsWith("/checkout") || url.pathname.startsWith("/account") || url.pathname.startsWith("/login")) return;
  event.respondWith(fetch(request).then((response) => {
    if (response.ok && (request.mode === "navigate" || response.headers.get("content-type")?.includes("image/"))) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  }).catch(() => caches.match(request).then((cached) => cached ?? caches.match("/offline.html"))));
});
