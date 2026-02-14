const CACHE_NAME = "presupuesto-v1"; 
// Cambia el número cuando quieras forzar actualización total

const urlsToCache = [
  "/APP-presupuesto-V3/",
];

/* =========================
   INSTALACIÓN
========================= */
self.addEventListener("install", (event) => {
  console.log("Service Worker instalando...");

  // Activa inmediatamente sin esperar
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

/* =========================
   ACTIVACIÓN
========================= */
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

  // Toma control inmediato de todas las pestañas
  return self.clients.claim();
});

/* =========================
   ESCUCHAR MENSAJE PARA ACTUALIZAR
========================= */
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("Forzando activación inmediata");
    self.skipWaiting();
  }
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(event.request);
      })
  );
});
