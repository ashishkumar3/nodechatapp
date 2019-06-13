const staticCacheName = "site-static-v0.3";
const dynamicCache = "site-dynamic-v0";
// store the assets from the response we get from a particular request provided in assets array.
const assets = [
  "/",
  "/index.html",
  // "/chat.html",
  "/js/app.js",
  // "/js/chat.js",
  "/js/libs/deparam.js",
  "/js/libs/jquery.js",
  "/js/libs/moment.js",
  "/js/libs/mustache.js",
  "/css/styles.css",
  "/fallback.html"
];

self.addEventListener("install", event => {
  // console.log("service worker has been installed.");
  // store the cache
  event.waitUntil(
    caches
      .open(staticCacheName)
      .then(cacheRes => {
        console.log("caching assets");
        cacheRes.addAll(assets);
      })
      .catch(err => console.log("Something wrong caching assets."))
  );
});

// activate service worker
self.addEventListener("activate", event => {
  // console.log("service worker has been activated.");
  // delete the old cache present.
  event.waitUntil(
    caches.keys().then(keys => {
      // console.log(keys);
      return Promise.all(
        keys
          .filter(key => key !== staticCacheName && key !== dynamicCache)
          .map(key => caches.delete(key))
      );
    })
  );
});

// fetch events
self.addEventListener("fetch", event => {
  // console.log("fetch event", event);
  // check in our cache if something matches the request get it from the cache otherwise make fetch request.
  event.respondWith(
    caches
      .match(event.request)
      .then(cacheRes => {
        // if not in cache make fetch request.
        return (
          cacheRes ||
          fetch(event.request).then(fetchRes => {
            return caches.open(dynamicCache).then(cache => {
              cache.put(event.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch(() => {
        if (event.request.url.indexOf(".html") > -1) {
          return caches.match("/fallback.html");
        }
      })
  );
});
