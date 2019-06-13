self.addEventListener("install", event => {
  console.log("service worker has been installed.");
});

// activate service worker
self.addEventListener("activate", event => {
  console.log("service worker has been activated.");
});
