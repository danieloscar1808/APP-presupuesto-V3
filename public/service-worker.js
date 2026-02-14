const CACHE_NAME = "presupuesto-v1"; // cambia número cuando quieras forzar actualización

const urlsToCache = [
  "/",
];

/* INSTALACIÓN */
self.addEventListener("install", (event) => {
  console.log("Service Worker instalando...");

  self.skipWaiting(); // activa inmediatamente

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* ACTIVACIÓN */
self.addEventListener("activate", (event) => {
  console.log("Service Worker activado");

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Eliminando cache viejo:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );

  return self.clients.claim(); // toma control inmediato
});

/* FETCH */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
