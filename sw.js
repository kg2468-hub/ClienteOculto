const CACHE_NAME = 'checklist-v1';
const ASSETS = [
  './',
  './index.html',
  './PagueMenosLogo.png',
  './manifest.json'
];

// Instala e faz o cache dos arquivos
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// Responde as requisições usando o cache (Permite uso offline)
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request))
  );
});
