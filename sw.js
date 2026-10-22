/* Kerala by road — offline service worker.
   Bump CACHE when you change index.html or the icons. */
const CACHE = "kerala-v24";
const RUNTIME = "kerala-rt-v24";

const CORE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./favicon.ico",
  "./apple-touch-icon.png",
  "./apple-touch-icon-precomposed.png",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-192.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./photos/us-1.jpg",
  "./photos/us-2.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(
        CORE.map((u) => cache.add(new Request(u, { cache: "reload" })).catch(() => {}))
      );
      self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE && k !== RUNTIME).map((k) => caches.delete(k)));
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  /* Weather must never come from a cache, so let the browser handle it. */
  if (url.hostname === "api.open-meteo.com") return;

  /* Page loads: always go to the network so edits land immediately.
     Without cache:"reload" the browser may answer from its own HTTP cache,
     and GitHub Pages sends max-age=600, so a deploy could take ten minutes
     to appear. Fall back to the cached app only when offline. */
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const fresh = await fetch(new Request(req, { cache: "reload" }));
          const cache = await caches.open(CACHE);
          cache.put("./index.html", fresh.clone());
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE);
          return (await cache.match("./index.html")) || (await cache.match("./")) || Response.error();
        }
      })()
    );
    return;
  }

  /* Own files: cache first, so the app opens instantly and works offline. */
  if (url.origin === location.origin) {
    e.respondWith(
      (async () => {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req, { ignoreSearch: true });
        if (hit) return hit;
        try {
          const fresh = await fetch(req);
          if (fresh && fresh.ok) cache.put(req, fresh.clone());
          return fresh;
        } catch (err) {
          return (await cache.match("./index.html")) || Response.error();
        }
      })()
    );
    return;
  }

  /* Fonts and Wikipedia photos: show the cached copy, refresh it in the background. */
  e.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME);
      const hit = await cache.match(req);
      const net = fetch(req)
        .then((res) => {
          if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
          return res;
        })
        .catch(() => null);
      return hit || (await net) || Response.error();
    })()
  );
});
