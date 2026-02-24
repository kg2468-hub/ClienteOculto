let avaliacoes = [];

window.addEventListener('load', () => {
    carregarHistorico();
});

function carregarHistorico() {
    const data = localStorage.getItem('historico_avaliacoes');
    if (data) {
        avaliacoes = JSON.parse(data);
        // Ordenar por data (mais recente primeiro)
        avaliacoes.sort((a, b) => new Date(b.data) - new Date(a.data));
    }
    renderizarLista();
}

function renderizarLista(filtro = '') {
    const listElement = document.getElementById('history-list');
    listElement.innerHTML = '';

    const filtradas = avaliacoes.filter(av =>
        av.loja.toLowerCase().includes(filtro.toLowerCase()) ||
        av.data.includes(filtro)
    );

    if (filtradas.length === 0) {
        listElement.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>Nenhuma avaliação encontrada.</p>
            </div>
        `;
        return;
    }

    filtradas.forEach(av => {
        const scoreClass = av.nota >= 90 ? 'score-high' : av.nota >= 70 ? 'score-mid' : 'score-low';
        const dataFormatada = new Date(av.data).toLocaleDateString('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-header">
                <span class="store-name">${av.loja}</span>
                <span class="date">${dataFormatada}</span>
            </div>
            <div class="card-body">
                <div>Nota Final: <span class="score-badge ${scoreClass}">${av.nota}%</span></div>
                <div style="margin-top:5px; color:#666; font-size:12px">Avaliador: ${av.avaliador}</div>
            </div>
            <div class="card-actions">
                <button class="btn-action btn-view" onclick="visualizarRelatorio('${av.id}')">
                    <i class="fas fa-eye"></i> Ver
                </button>
                <button class="btn-action btn-share" onclick="compartilharZap('${av.id}')">
                    <i class="fab fa-whatsapp"></i> Zap
                </button>
                <button class="btn-action btn-delete" onclick="excluirAvaliacao('${av.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        listElement.appendChild(card);
    });
}

window.filtrar = function (valor) {
    renderizarLista(valor);
}

window.visualizarRelatorio = function (id) {
    const av = avaliacoes.find(a => a.id === id);
    if (!av) return;

    const content = document.getElementById('report-content');
    content.innerHTML = `
        <h2>${av.loja}</h2>
        <div class="report-item">
            <p class="report-label">Data e Hora</p>
            <p class="report-value">${new Date(av.data).toLocaleString()}</p>
        </div>
        <div class="report-item">
            <p class="report-label">Avaliador</p>
            <p class="report-value">${av.avaliador}</p>
        </div>
        <div class="report-item">
            <p class="report-label">Nota Final</p>
            <p class="report-value" style="font-weight:bold; font-size:20px">${av.nota}%</p>
        </div>
        <div class="report-item">
            <p class="report-label">Resumo Detalhado</p>
            <p class="report-value" style="white-space: pre-wrap;">${av.resumoZap}</p>
        </div>
    `;

    document.getElementById('modal-report').style.display = 'flex';
}

window.fecharModal = function () {
    document.getElementById('modal-report').style.display = 'none';
}

window.excluirAvaliacao = function (id) {
    if (confirm('Tem certeza que deseja excluir esta avaliação permanentemente?')) {
        avaliacoes = avaliacoes.filter(av => av.id !== id);
        localStorage.setItem('historico_avaliacoes', JSON.stringify(avaliacoes));
        renderizarLista();
    }
}

window.compartilharZap = function (id) {
    const av = avaliacoes.find(a => a.id === id);
    if (!av) return;

    const texto = encodeURIComponent(av.resumoZap);
    window.open(`https://api.whatsapp.com/send?text=${texto}`, '_blank');
}

window.voltar = function () {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
}

window.addEventListener('pageshow', function (event) {
    if (document.body.classList.contains('page-exit')) document.body.classList.remove('page-exit');
});

// Fechar modal ao clicar fora
window.onclick = function (event) {
    const modal = document.getElementById('modal-report');
    if (event.target == modal) {
        fecharModal();
    }
}
