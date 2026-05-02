const CACHE = ‘popote-v3’;

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(cache => {
return cache.addAll([’/’, ‘/index.html’, ‘/manifest.json’, ‘/sw.js’]);
}).catch(() => {})
);
self.skipWaiting();
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
caches.open(CACHE).then(cache =>
cache.match(e.request).then(cached => {
if(cached){
fetch(e.request).then(resp => {
if(resp && resp.status === 200) cache.put(e.request, resp.clone());
}).catch(() => {});
return cached;
}
return fetch(e.request).then(resp => {
if(resp && resp.status === 200) cache.put(e.request, resp.clone());
return resp;
}).catch(() => cached || new Response(‘Hors ligne’, {status:200}));
})
)
);
});