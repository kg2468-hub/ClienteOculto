/**
 * js/dark-mode.js
 * Script de inicialização rápida para evitar o "flash" de luz branca.
 * Deve ser incluído no <head> de todos os arquivos HTML.
 */
(function () {
    const isDark = localStorage.getItem('dark-mode') === 'true';
    if (isDark) {
        document.documentElement.classList.add('dark-mode');
        // Usar um estilo temporário para evitar flash
        const style = document.createElement('style');
        style.innerHTML = 'html, body { background-color: #0f172a !important; color: #f8fafc !important; transition: none !important; }';
        style.id = 'theme-lock';
        document.head.appendChild(style);

        window.addEventListener('load', () => {
            document.body.classList.add('dark-mode');
            setTimeout(() => {
                const lock = document.getElementById('theme-lock');
                if (lock) lock.remove();
            }, 100);
        });
    }
})();
