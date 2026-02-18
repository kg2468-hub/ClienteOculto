/* --- sw.js --- */

// Função para buscar a versão atual do servidor
const getVersion = async () => {
    try {
        // O timestamp (?v=...) evita que o SW use uma versão cacheada do próprio JSON
        const resp = await fetch('./version.json?v=' + Date.now());
        const data = await resp.json();
        return `checklist-pm-${data.version}`;
    } catch (e) {
        // Fallback caso o JSON falhe ou esteja offline durante a instalação
        return 'checklist-pm-v1.0.0';
    }
};

const ASSETS = [
    './',
    './index.html',
    './checklist.html',
    './icone_novo.png',
    './PagueMenosLogo.png',
    './manifest.json',
    './hidrometro.html',
    './historico.html',
    './arquivosapoio.html',
    './version.json', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// Instalação: Cria o cache baseado na versão do JSON
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        getVersion().then(cacheName => {
            return caches.open(cacheName).then(cache => {
                console.log('Instalando cache:', cacheName);
                return cache.addAll(ASSETS);
            });
        })
    );
});

// Ativação: Remove qualquer cache que não seja o da versão atual
self.addEventListener('activate', (event) => {
    event.waitUntil(
        getVersion().then(cacheName => {
            return caches.keys().then(keys => {
                return Promise.all(
                    keys.map(key => {
                        if (key !== cacheName) {
                            console.log('Removendo cache antigo:', key);
                            return caches.delete(key);
                        }
                    })
                );
            });
        })
    );
    self.clients.claim();
});

// Estratégia: Network First (Rede primeiro, Cache depois)
// Essencial para garantir que o usuário sempre receba a versão mais nova se houver internet
self.addEventListener('fetch', (event) => {
    // Ignora requisições de outras origens (como fontes externas se desejar) ou foca apenas no essencial
    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Se a rede estiver OK, atualiza o cache com a nova resposta
                const resClone = response.clone();
                getVersion().then(cacheName => {
                    caches.open(cacheName).then(cache => {
                        // Apenas faz cache de requisições GET bem-sucedidas
                        if (event.request.method === 'GET' && response.status === 200) {
                            cache.put(event.request, resClone);
                        }
                    });
                });
                return response;
            })
            .catch(() => {
                // Se a rede falhar (Offline), busca no cache
                return caches.match(event.request);
            })
    );
});
