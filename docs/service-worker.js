const CACHE_NAME="pwa-presupuesto-v3-v1";
const URLS_TO_CACHE=["/APP-presupuesto-V3/","/APP-presupuesto-V3/index.html"];

self.addEventListener("install",e=>{
 e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(URLS_TO_CACHE)));
 self.skipWaiting();
});
self.addEventListener("activate",e=>{
 e.waitUntil(caches.keys().then(keys=>Promise.all(keys.map(k=>k!==CACHE_NAME?caches.delete(k):null))));
 self.clients.claim();
});
self.addEventListener("fetch",e=>{
 e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).catch(()=>caches.match("/APP-presupuesto-V3/index.html"))));
});