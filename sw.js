const CACHE = ‘popote-v4’;

self.addEventListener(‘install’, e => {
e.waitUntil(
caches.open(CACHE).then(cache => {
return Promise.all([
cache.add(new Request(self.location.origin + self.registration.scope.replace(self.location.origin,’’) + ‘index.html’, {cache: ‘reload’})),
]).catch(() => {});
})
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
caches.open(CACHE).then(async cache => {
const cached = await cache.match(e.request);
if(cached) {
// Mettre à jour en arrière-plan
fetch(e.request).then(r => { if(r && r.status===200) cache.put(e.request, r.clone()); }).catch(()=>{});
return cached;
}
try {
const resp = await fetch(e.request);
if(resp && resp.status === 200) cache.put(e.request, resp.clone());
return resp;
} catch(err) {
// Hors ligne : retourner n’importe quelle page en cache
const keys = await cache.keys();
if(keys.length) return cache.match(keys[0]);
return new Response(‘Hors ligne’, {status:200});
}
})
);
});
