/* --- sw.js --- */
/**
 * Service Worker para ClienteOculto (IA)
 * Estratégia Híbrida: 
 * - Cache-First para App Shell (carregamento ultra-rápido, atualização MANUAL via prompt)
 * - Network-First para APIs e checagem de versão
 */

// Prefixo para o nome do cache
const CACHE_NAME_PREFIX = 'cliente-oculto-v';

// Função para buscar a versão atual e retornar o nome completo do cache
const getCacheName = async () => {
    try {
        const resp = await fetch('./version.json?t=' + Date.now());
        const data = await resp.json();
        return `${CACHE_NAME_PREFIX}${data.version}`;
    } catch (e) {
        return `${CACHE_NAME_PREFIX}1.0.0`;
    }
};

// Lista de arquivos essenciais (App Shell)
const ASSETS = [
    './',
    './index.html',
    './checklist.html',
    './animacao.html',
    './arquivosapoio.html',
    './hidrometro.html',
    './historico.html',
    './manifest.json',
    './version.json',
    './css/global.css',
    './css/animacao.css',
    './css/hidrometro.css',
    './css/historico.css',
    './css/checklist.css',
    './css/arquivosapoio.css',
    './js/index.js',
    './js/checklist.js',
    './js/animacao.js',
    './js/hidrometro.js',
    './js/historico.js',
    './js/arquivosapoio.js',
    './js/pwa-utils.js',
    './js/dark-mode.js',
    './assets/images/icone_novo.png',
    './assets/images/PagueMenosLogo.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'https://cdn.jsdelivr.net/npm/chart.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap'
];

// Instalação: Salva o App Shell no cache
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        getCacheName().then(cacheName => {
            return caches.open(cacheName).then(cache => {
                console.log('[SW] Instalando App Shell em:', cacheName);
                return cache.addAll(ASSETS);
            });
        })
    );
});

// Ativação: Limpa caches antigos
self.addEventListener('activate', (event) => {
    event.waitUntil(
        getCacheName().then(currentCache => {
            return caches.keys().then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key.startsWith(CACHE_NAME_PREFIX) && key !== currentCache) {
                            console.log('[SW] Removendo cache obsoleto:', key);
                            return caches.delete(key);
                        }
                    })
                );
            });
        })
    );
    self.clients.claim();
});

// Interpetação de Requisições (Fetch)
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Detecta se a requisição vem do PWA instalado (pelo parâmetro mode ou pelo referrer)
    const isPWA = url.searchParams.get('mode') === 'pwa' ||
        (event.request.referrer && event.request.referrer.includes('mode=pwa'));

    // 1. Estratégia Network-First para APIs e Version Tracking
    if (url.pathname.includes('version.json') || url.hostname.includes('googleapis.com')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response.status === 200) {
                        const resClone = response.clone();
                        getCacheName().then(cacheName => {
                            caches.open(cacheName).then(cache => cache.put(event.request, resClone));
                        });
                    }
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // 2. Estratégia de Cache Diferenciada
    // Se estiver no PWA instalado: Cache-First estrito (não atualiza sozinho)
    // Se estiver no Navegador: Stale-While-Revalidate (atualiza naturalmente como um site)
    if (isPWA) {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                return cachedResponse || fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        const resClone = networkResponse.clone();
                        getCacheName().then(cacheName => {
                            caches.open(cacheName).then(cache => cache.put(event.request, resClone));
                        });
                    }
                    return networkResponse;
                });
            }).catch(() => new Response('Offline', { status: 503 }))
        );
    } else {
        // Modo Navegador (Online-first / Fluido) - Stale-While-Revalidate
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                const fetchPromise = fetch(event.request).then(networkResponse => {
                    if (networkResponse.status === 200) {
                        const resClone = networkResponse.clone();
                        getCacheName().then(cacheName => {
                            caches.open(cacheName).then(cache => cache.put(event.request, resClone));
                        });
                    }
                    return networkResponse;
                }).catch(() => { });
                return cachedResponse || fetchPromise;
            })
        );
    }
});
