const CACHE = ‘popote-v4’;

self.addEventListener(‘install’, e => {
self.skipWaiting();
e.waitUntil(
caches.open(CACHE).then(cache => {
// Mettre en cache toutes les ressources de l’app
return cache.addAll([
‘./’,
‘./index.html’,
‘./sw.js’,
‘./manifest.json’,
‘./icon.png’
]).catch(() => {});
})
);
});

self.addEventListener(‘activate’, e => {
e.waitUntil(
caches.keys().then(keys =>
Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
)
);
self.clients.claim();
});

self.addEventListener(‘fetch’, e => {
if(e.request.method !== ‘GET’) return;
e.respondWith(
caches.open(CACHE).then(async cache => {
// Stratégie : cache d’abord, réseau en arrière-plan
const cached = await cache.match(e.request);
const fetchPromise = fetch(e.request).then(resp => {
if(resp && resp.status === 200 && resp.type !== ‘opaque’){
cache.put(e.request, resp.clone());
}
return resp;
}).catch(() => null);

```
return cached || fetchPromise || new Response('Hors ligne - Popote fonctionne sans connexion', {
status: 200,
headers: {'Content-Type': 'text/plain;charset=utf-8'}
});
})
```

);
});
