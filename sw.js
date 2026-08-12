const CACHE='aprf-shell-v2';
const ASSETS=[
  './',
  './index.html',
  './app-config.js?v=2',
  './manifest.webmanifest?v=2',
  './icon-192-v2.png',
  './icon-512-v2.png',
  './apple-touch-icon-v2.png'
];

self.addEventListener('install',event=>{
  event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith(
    caches.match(event.request).then(cached=>{
      const network=fetch(event.request).then(resp=>{
        if(resp && resp.ok){
          const copy=resp.clone();
          caches.open(CACHE).then(cache=>cache.put(event.request,copy));
        }
        return resp;
      }).catch(()=>cached);

      // Abre o shell imediatamente pelo cache e atualiza em segundo plano.
      return cached || network;
    })
  );
});
