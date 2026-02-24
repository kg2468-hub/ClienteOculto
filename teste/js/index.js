// --- FUNÇÕES DO MODAL SOBRE ---
function abrirSobre() {
    toggleMenu(false);
    document.getElementById('modal-sobre').style.display = 'flex';
}

function fecharSobre() {
    document.getElementById('modal-sobre').style.display = 'none';
}

window.addEventListener('pageshow', function (event) {
    if (document.body.classList.contains('page-exit')) document.body.classList.remove('page-exit');
    if (document.body.classList.contains('start-water-fill')) document.body.classList.remove('start-water-fill');

    // Pequeno delay para garantir que o layout renderizou antes do fade-in
    setTimeout(() => {
        const content = document.querySelector('.main-content-desktop');
        if (content) content.classList.add('show');
    }, 100);
});

/* --- LÓGICA DE VERSÃO DINÂMICA --- */
let deferredPrompt;
const optInstalar = document.getElementById('opt-instalar');
const updateBanner = document.getElementById('update-banner');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (optInstalar) {
        optInstalar.style.display = 'flex';
        optInstalar.classList.add('install-ready');
    }
});

async function instalarApp() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') { optInstalar.style.display = 'none'; toggleMenu(false); }
        deferredPrompt = null;
    }
}

async function checkVersion() {
    try {
        const response = await fetch(`version.json?v=${Date.now()}`);
        if (!response.ok) return;
        const data = await response.json();
        const serverVersion = data.version;
        const serverChanges = data.changes || "Melhorias gerais de estabilidade.";
        const localVersion = localStorage.getItem('app_version');

        if (!localVersion) {
            localStorage.setItem('app_version', serverVersion);
            return;
        }

        if (serverVersion !== localVersion) {
            exibirBloqueioAtualizacao(serverChanges, serverVersion);
        }
    } catch (err) { console.warn("Erro ao validar versão."); }
}

function exibirBloqueioAtualizacao(changes, version) {
    if (updateBanner) {
        // Se o usuário já ignorou esta versão nesta sessão, não incomoda de novo
        // (Mantido por compatibilidade de check, mas não há botão para fechar mais)
        if (sessionStorage.getItem('update_ignored') === version) return;

        const changesContainer = document.getElementById('update-changes-text');
        if (changesContainer) {
            changesContainer.innerHTML = `<strong>O que mudou:</strong><br>${changes}`;
        }

        updateBanner.style.display = 'flex';
        const overlay = document.getElementById('banner-overlay');
        if (overlay) overlay.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function exibirBannerSucesso(version) {
    const banner = document.getElementById('success-banner');
    const versionText = document.getElementById('current-version-text');
    if (banner) {
        if (versionText) versionText.innerText = `v${version}`;
        banner.style.display = 'flex';
        const overlay = document.getElementById('banner-overlay');
        if (overlay) overlay.style.display = 'block';
        document.body.classList.add('modal-open');
    }
}

function closeSuccessBanner() {
    const banner = document.getElementById('success-banner');
    if (banner) {
        banner.style.display = 'none';
        const overlay = document.getElementById('banner-overlay');
        if (overlay) overlay.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
}

async function forceUpdate() {
    const btn = document.getElementById('btn-update-now');
    if (btn) { btn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i> Atualizando...'; btn.disabled = true; }

    // Pegar versão do servidor antes de limpar para garantir que salvamos a certa
    try {
        const resp = await fetch(`version.json?v=${Date.now()}`);
        const data = await resp.json();
        localStorage.setItem('app_version', data.version);
    } catch (e) { }

    showToast("Limpando cache...");
    if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (let reg of regs) await reg.unregister();
    }
    if ('caches' in window) {
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
    }
    setTimeout(() => { window.location.reload(true); }, 1000);
}

/* --- UI FUNCTIONS E NAVEGAÇÃO --- */
function toggleMenu(show) {
    const modal = document.getElementById('modal-settings');
    if (modal) modal.style.display = show ? 'flex' : 'none';
}

function transitionTo(url) {
    document.body.classList.add('page-exit');
    // Sincronizado com os 0.6s + 0.15s de delay do CSS
    setTimeout(() => { window.location.href = url; }, 800);
}

function navigateToHidrometro() {
    document.body.classList.add('start-water-fill');
    showToast("Acessando leitura...");
    // Sincronizado com os 1.2s do CSS
    setTimeout(() => { window.location.href = 'hidrometro.html'; }, 1500);
}

function showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    if (container.children.length >= 2) container.removeChild(container.firstChild);
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 300); }, 2500);
}

/* --- INICIALIZAÇÃO SW --- */
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) { exibirBloqueioAtualizacao(); }
            });
        });
    });
}

checkVersion();
setInterval(checkVersion, 1000 * 60 * 15);
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkVersion(); });

window.addEventListener('pageshow', () => { checkVersion(); });

/* --- LÓGICA DO BANNER INFORMATIVO CORRIGIDA --- */
function inicializarBanner() {
    return new Promise((resolveBanner) => {
        const bannerFiles = [
            'assets/banners/kitressaca.jpg', 'assets/banners/app.png', 'assets/banners/converteMAIS.jpg',
            'assets/banners/atendimento2.mp4', 'assets/banners/onyou.jpg', 'assets/banners/show.png', 'assets/banners/oportunidades_resultados.png'
        ];
        let playlist = [];
        const container = document.getElementById('banner-content');
        const progressBar = document.getElementById('banner-progress-bar');
        const imgDuration = 5000;
        let primeiroCarregamento = true;

        if (!container || !progressBar) { resolveBanner(); return; }

        function shuffle(array) { return array.sort(() => Math.random() - 0.5); }
        function animateProgress(duration) {
            progressBar.style.transition = 'none'; progressBar.style.width = '0%'; void progressBar.offsetWidth;
            progressBar.style.transition = `width ${duration}ms linear`; progressBar.style.width = '100%';
        }

        async function playNext() {
            if (playlist.length === 0) playlist = shuffle([...bannerFiles]);
            const file = playlist.pop();
            const isVideo = file.toLowerCase().endsWith('.mp4');

            container.classList.add('fade-out');
            setTimeout(() => {
                container.innerHTML = '';
                let element;
                if (isVideo) {
                    element = document.createElement('video');
                    element.src = file; element.autoplay = true; element.muted = true; element.playsInline = true; element.setAttribute('preload', 'auto');
                    element.onloadedmetadata = () => { animateProgress(element.duration * 1000); if (primeiroCarregamento) { primeiroCarregamento = false; resolveBanner(); } };
                    element.oncanplay = () => { element.play(); };
                    element.onended = playNext;
                } else {
                    element = document.createElement('img');
                    element.src = file;
                    element.onload = () => { animateProgress(imgDuration); setTimeout(playNext, imgDuration); if (primeiroCarregamento) { primeiroCarregamento = false; resolveBanner(); } };
                }
                element.onerror = () => {
                    container.innerHTML = `<div class="banner-error"><span style="font-size: 13px; font-weight: 800; color: white;">ERRO</span><small style="font-size: 9px; opacity: 0.7; margin-top: 2px; color: white;">Falha ao carregar mídia</small></div>`;
                    animateProgress(3000); setTimeout(playNext, 3000);
                    if (primeiroCarregamento) { primeiroCarregamento = false; resolveBanner(); }
                };
                container.appendChild(element);
                setTimeout(() => { container.classList.remove('fade-out'); }, 50);
            }, 500);
        }
        if (bannerFiles.length > 0) playNext(); else resolveBanner();
    });
}

async function verificarAtualizacao() {
    toggleMenu(false); showToast("Buscando atualizações...");
    try {
        const response = await fetch(`version.json?v=${Date.now()}`);
        if (!response.ok) throw new Error("Falha na rede");
        const data = await response.json();
        const serverVersion = data.version;
        const localVersion = localStorage.getItem('app_version');
        if (serverVersion !== localVersion) {
            exibirBloqueioAtualizacao(data.changes, serverVersion);
        } else {
            exibirBannerSucesso(localVersion);
        }
    } catch (err) { showToast("Erro ao buscar versão ⚠️"); }
}

function pedirLimpezaCache() { toggleMenu(false); document.getElementById('modal-confirm-limpeza').style.display = 'flex'; }
function fecharModalLimpeza() { document.getElementById('modal-confirm-limpeza').style.display = 'none'; }
async function executarLimpezaCache() {
    fecharModalLimpeza(); showToast("Limpando sistema...");
    localStorage.removeItem('app_version');
    if ('caches' in window) { const names = await caches.keys(); await Promise.all(names.map(name => caches.delete(name))); }
    if ('serviceWorker' in navigator) { const regs = await navigator.serviceWorker.getRegistrations(); for (let reg of regs) await reg.unregister(); }
    setTimeout(() => window.location.reload(true), 1200);
}

function toggleDarkMode() {
    if (window.PWAUtils) {
        const isDark = window.PWAUtils.toggleTheme();
        atualizarBotaoTema(isDark);
        showToast(isDark ? "Modo Escuro Ativado" : "Modo Claro Ativado");
    }
}
function atualizarBotaoTema(isDark) {
    const btnTheme = document.getElementById('btn-theme');
    if (btnTheme) { btnTheme.innerHTML = isDark ? '<i class="fas fa-sun" style="color:#f9b233;"></i> Modo Claro' : '<i class="fas fa-moon"></i> Modo Escuro'; }
}
// Inicializa o botão no carregamento
window.addEventListener('load', () => {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    atualizarBotaoTema(isDark);
});

async function inicializarAppCompleto() {
    const aguardarEstatico = new Promise(resolve => { if (document.readyState === 'complete') { resolve(); } else { window.addEventListener('load', resolve); } });
    const aguardarDinamico = Promise.all([checkVersion()]);
    try {
        await Promise.all([aguardarEstatico, aguardarDinamico]);
        await inicializarBanner();
    } catch (erro) { console.error("Erro:", erro); } finally {
        if (window.PWAUtils) {
            window.PWAUtils.hideLoader();
            // Mostra o conteúdo suavemente após o loader sair
            setTimeout(() => {
                const content = document.querySelector('.main-content-desktop');
                if (content) content.classList.add('show');
            }, 300);
        }
    }
}

inicializarAppCompleto();
