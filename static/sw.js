// Service Worker — cache-first ONLY for content-hashed immutable assets.
//
// Never cache the shell or navigations: the shell's chunk references change
// every deploy, and if the app sits behind an auth gate (Cloudflare Access),
// the gate must see navigations to manage the session. A shell-caching
// worker blanks every returning visitor after the first redeploy (stale
// shell → purged chunk hashes → SPA fallback answers the JS request with
// index.html 200 → MIME failure) and, behind Access, can wedge the client
// permanently (expired session → sw.js update fetch 302s → update rejected).
//
// Bump CACHE whenever this file's logic changes.

const CACHE = "cf-pwa-v2";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;

  const immutable =
    url.pathname.startsWith("/_app/immutable/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.json";
  if (!immutable) return; // shell, data, /api/* — network, always

  e.respondWith(
    caches.match(e.request).then((cached) => {
      if (cached) return cached;
      return fetch(e.request).then((resp) => {
        // Guard against SPA-fallback poisoning: a missing asset returns the
        // HTML shell with 200 — never cache text/html here.
        const ct = resp.headers.get("content-type") || "";
        if (resp.ok && resp.type === "basic" && !ct.includes("text/html")) {
          const clone = resp.clone();
          caches.open(CACHE).then((c) => c.put(e.request, clone));
        }
        return resp;
      });
    })
  );
});
