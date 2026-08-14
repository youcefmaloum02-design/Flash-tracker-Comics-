const CACHE_NAME = "flash-tracker-v8";

const FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon.png"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => {

        return Promise.all(
          FILES.map(file =>
            cache.add(file).catch(() => null)
          )
        );

      })

  );

  self.skipWaiting();

});


self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys()
      .then(keys => {

        return Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        );

      })

  );

  self.clients.claim();

});


self.addEventListener("fetch", event => {

  if(event.request.method !== "GET"){
    return;
  }

  event.respondWith(

    fetch(event.request)
      .then(response => {

        if(
          response &&
          response.status === 200
        ){

          const copy=response.clone();

          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(
                event.request,
                copy
              );
            });

        }

        return response;

      })
      .catch(() => {

        return caches.match(
          event.request
        );

      })

  );

});