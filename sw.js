const CACHE = "fresh-circuit-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./core.js",
  "./ui.js",
  "./manifest.json",
  "./icons/icon.svg"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return Promise.all(ASSETS.map(function (url) {
        return cache.add(url).catch(function () { return null; });
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req).then(function (res) {
      if (res && res.status === 200 && req.url.indexOf(self.location.origin) === 0) {
        const copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req);
    })
  );
});
