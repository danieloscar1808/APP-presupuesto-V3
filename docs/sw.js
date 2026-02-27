self.addEventListener("install",()=>{});
self.addEventListener("fetch",e=>{e.respondWith(fetch(e.request));});