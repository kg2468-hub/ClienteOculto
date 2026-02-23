/* --- pwa-utils.js --- */
/* Script central para gestão de PWA, Versão e Offline */

(function () {
    // 1. Injetar UI Necessária (Indicador Offline) se não existir
    function injectPWAUI() {
        if (!document.getElementById('offline-indicator')) {
            const indicator = document.createElement('div');
            indicator.id = 'offline-indicator';
            indicator.title = 'Você está sem internet ou com instabilidade';
            indicator.innerHTML = '<i class="fas fa-wifi-slash"></i>';
            document.body.appendChild(indicator);
        }
    }

    // 2. Fechar Loader
    function hideLoader() {
        const loader = document.getElementById('loading-screen');
        if (loader) {
            loader.classList.add('loader-hidden');
            setTimeout(() => loader.style.display = 'none', 600);
        }
    }

    // 3. Detecção de Status Online/Offline
    function updateOnlineStatus() {
        const status = navigator.onLine;
        const indicator = document.getElementById('offline-indicator');
        if (indicator) {
            const isInstalled = isStandalone();
            // Só mostra o ícone de offline se estiver instalado (PWA) e sem rede
            if (!status && isInstalled) {
                indicator.classList.add('visible');
            } else {
                indicator.classList.remove('visible');
            }
        }
    }

    // 3. Detecção de modo standalone (instalado)
    function isStandalone() {
        return (window.matchMedia('(display-mode: standalone)').matches) || (window.navigator.standalone) || document.referrer.includes('android-app://');
    }

    // 4. Exibir Versão em todos os lugares
    async function displayVersion() {
        try {
            const response = await fetch(`version.json?v=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                const displays = document.querySelectorAll('#app-version-display');
                displays.forEach(el => el.innerText = data.version);
            }
        } catch (err) { console.error("Erro ao exibir versão:", err); }
    }

    // 5. Gestão de Tema (Dark Mode)
    function toggleTheme() {
        const isDark = document.body.classList.toggle('dark-mode');
        document.documentElement.classList.toggle('dark-mode', isDark);
        localStorage.setItem('dark-mode', isDark);

        // Disparar evento customizado para outros scripts reagirem se necessário
        window.dispatchEvent(new CustomEvent('themechanged', { detail: { isDark } }));

        return isDark;
    }

    // Inicialização
    window.addEventListener('load', () => {
        injectPWAUI();
        updateOnlineStatus();
        displayVersion();

        // Garante que o body tenha a classe se o dark-mode estiver on
        if (localStorage.getItem('dark-mode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    });

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Exportar para uso global
    window.PWAUtils = {
        updateOnlineStatus,
        displayVersion,
        isStandalone,
        hideLoader,
        toggleTheme
    };
})();
