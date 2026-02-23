window.addEventListener('load', () => {
    setTimeout(() => {
        const splash = document.getElementById('splash');
        if (splash) {
            splash.classList.add('fade-out');
        }

        setTimeout(() => {
            // Redireciona após a animação
            window.location.href = 'checklist.html';
        }, 600);
    }, 3500);
});
