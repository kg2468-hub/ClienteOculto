// Carrega os dados salvos ou inicia histórico vazio
let historico = JSON.parse(localStorage.getItem('hidrometro_pro_dados')) || [];
let graficoBarra = null; let graficoStatus = null; let acaoConfirmacaoPendente = null;

// Função utilitária para pegar a data atual no fuso local no formato YYYY-MM-DD
function getHojeYYYYMMDD() {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
}

window.addEventListener('load', () => {
    configurarDataHoje();
    atualizarUI();
    setTimeout(() => {
        if (window.PWAUtils) window.PWAUtils.hideLoader();
    }, 1000);
});


function configurarDataHoje() {
    const dataHojeElement = document.getElementById('data-hoje');
    if (dataHojeElement) {
        dataHojeElement.innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
}

function confirmarAcao(titulo, mensagem, callback) {
    document.getElementById('confirm-titulo').innerText = titulo;
    document.getElementById('confirm-mensagem').innerText = mensagem;
    acaoConfirmacaoPendente = callback;
    document.getElementById('modal-confirmacao').style.display = 'flex';
}

window.fecharConfirmacao = function () { document.getElementById('modal-confirmacao').style.display = 'none'; acaoConfirmacaoPendente = null; }

const btnConfirmarAcao = document.getElementById('btn-confirmar-acao');
if (btnConfirmarAcao) {
    btnConfirmarAcao.addEventListener('click', () => { if (acaoConfirmacaoPendente) acaoConfirmacaoPendente(); window.fecharConfirmacao(); });
}

window.fecharModal = function (id) { document.getElementById(id).style.display = 'none'; }

window.registrarLeitura = function () {
    const valor = parseFloat(document.getElementById('leitura').value);
    if (isNaN(valor)) return alert("Insira uma leitura válida.");
    confirmarAcao("Salvar Leitura", `Confirma o registro de ${valor} m³ para hoje?`, () => {
        historico.push({ id: Date.now(), data: new Date().toISOString(), leitura: valor });
        salvarERefrescar(); document.getElementById('leitura').value = '';
    });
}

window.abrirModalEdicao = function (id = null) {
    const modal = document.getElementById('modal-edicao');
    const inputId = document.getElementById('edit-index');
    const inputData = document.getElementById('edit-data');
    const inputLeitura = document.getElementById('edit-leitura');

    // Impede a seleção de datas futuras no calendário
    inputData.max = getHojeYYYYMMDD();

    if (id) {
        document.getElementById('titulo-modal-edicao').innerText = "Editar Medição";
        const registro = historico.find(h => h.id === id);
        inputId.value = id; inputData.value = registro.data.split('T')[0]; inputLeitura.value = registro.leitura;
    } else {
        document.getElementById('titulo-modal-edicao').innerText = "Adicionar Antiga";
        inputId.value = "-1"; inputData.value = ""; inputLeitura.value = "";
    }
    modal.style.display = 'flex';
}

window.salvarEdicao = function () {
    const id = parseInt(document.getElementById('edit-index').value);
    const dataRef = document.getElementById('edit-data').value;
    const valorRef = parseFloat(document.getElementById('edit-leitura').value);

    if (!dataRef || isNaN(valorRef)) return alert("Preencha corretamente.");

    // Trava final no script para não aceitar medições futuras
    if (dataRef > getHojeYYYYMMDD()) {
        return alert("Não é permitido salvar medições em datas futuras.");
    }

    confirmarAcao("Salvar Alterações", "Deseja salvar esta modificação no histórico?", () => {
        const dataIso = new Date(dataRef + "T12:00:00").toISOString();
        if (id !== -1) { const index = historico.findIndex(h => h.id === id); historico[index].data = dataIso; historico[index].leitura = valorRef; }
        else { historico.push({ id: Date.now(), data: dataIso, leitura: valorRef }); }
        salvarERefrescar(); window.fecharModal('modal-edicao');
    });
}

window.excluirRegistro = function (id) {
    confirmarAcao("Excluir Registro", "Esta medição será apagada definitivamente. Continuar?", () => {
        historico = historico.filter(h => h.id !== id); salvarERefrescar();
    });
}

function salvarERefrescar() {
    historico.sort((a, b) => new Date(a.data) - new Date(b.data));
    for (let i = 0; i < historico.length; i++) {
        if (i === 0) { historico[i].consumoCalculado = 0; historico[i].diasAusentes = 0; }
        else {
            historico[i].consumoCalculado = Math.max(0, historico[i].leitura - historico[i - 1].leitura);
            const dataAtual = new Date(historico[i].data); const dataAnterior = new Date(historico[i - 1].data);
            dataAtual.setHours(0, 0, 0, 0); dataAnterior.setHours(0, 0, 0, 0);
            const diffDays = Math.round(Math.abs(dataAtual - dataAnterior) / (1000 * 60 * 60 * 24));
            historico[i].diasAusentes = diffDays > 1 ? diffDays - 1 : 0;
        }
    }
    localStorage.setItem('hidrometro_pro_dados', JSON.stringify(historico)); atualizarUI();
}

window.atualizarUI = function () {
    renderizarLista();
    const consumoDiario = document.getElementById('consumo-diario');
    const statusTexto = document.getElementById('status-texto');
    if (historico.length > 0) {
        const ultimo = historico[historico.length - 1];
        if (consumoDiario) consumoDiario.innerHTML = `${ultimo.consumoCalculado.toFixed(3)} <small>m³</small>`;
        analisarAnormalidade(ultimo.consumoCalculado);
    } else {
        if (consumoDiario) consumoDiario.innerHTML = `0.000 <small>m³</small>`;
        if (statusTexto) statusTexto.innerText = "---";
        renderizarGraficos([], 0, 1);
    }
}

function renderizarLista() {
    const lista = document.getElementById('lista-historico');
    if (!lista) return;
    lista.innerHTML = '';
    [...historico].reverse().forEach(item => {
        let alertaHtml = item.diasAusentes > 0 ? `<div class="alerta-gap">⚠️ ${item.diasAusentes} dia(s) sem registro</div>` : '';
        lista.innerHTML += `
            <div class="history-item-container">${alertaHtml}
                <div class="history-item">
                    <div class="history-info"><strong>${item.leitura.toFixed(3)} m³</strong><span>${new Date(item.data).toLocaleDateString('pt-BR')} | Consumo: ${item.consumoCalculado.toFixed(3)}</span></div>
                    <div class="history-actions">
                        <button onclick="abrirModalEdicao(${item.id})"><i class="fas fa-edit"></i></button>
                        <button class="btn-del" onclick="excluirRegistro(${item.id})"><i class="fas fa-trash-alt"></i></button>
                    </div>
                </div>
            </div>`;
    });
}

function analisarAnormalidade(consumo) {
    const statusDiv = document.getElementById('status-alerta');
    const texto = document.getElementById('status-texto');
    if (!statusDiv || !texto) return;

    if (historico.length < 3) {
        texto.innerText = "Coletando...";
        statusDiv.classList.remove('anormal');
        renderizarGraficos(historico, consumo, consumo || 1);
        return;
    }

    const limite = (historico.reduce((acc, curr) => acc + curr.consumoCalculado, 0) / historico.length) * 1.4;
    const ultimo = historico[historico.length - 1];

    if (ultimo.diasAusentes > 0) {
        const mediaDiasAcumulados = consumo / (ultimo.diasAusentes + 1);
        if (mediaDiasAcumulados > limite) {
            texto.innerText = "Vazamento? (Alta)";
            statusDiv.classList.add('anormal');
        } else {
            texto.innerText = "Acumulado";
            statusDiv.classList.remove('anormal');
        }
    } else {
        if (consumo > limite) {
            texto.innerText = "Vazamento?";
            statusDiv.classList.add('anormal');
        } else {
            texto.innerText = "Normal";
            statusDiv.classList.remove('anormal');
        }
    }

    renderizarGraficos(historico, consumo, limite);
}

function renderizarGraficos(dadosGlobais, consumoAtual, limiteAtual) {
    const ultimosDados = dadosGlobais.slice(-7);
    const labelsBarra = ultimosDados.map(d => {
        let dataStr = new Date(d.data).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
        return d.diasAusentes > 0 ? `${dataStr} (${d.diasAusentes + 1}d)` : dataStr;
    });

    const valoresBarra = ultimosDados.map(d => d.consumoCalculado);
    const estiloElement = document.getElementById('tipo-grafico');
    const estilo = estiloElement ? estiloElement.value : 'bar';
    const typeGrafico = estilo === 'area' ? 'line' : estilo;

    const bgColors = ultimosDados.map(d => {
        if (d.diasAusentes > 0) return '#f9b233';
        return d.consumoCalculado > limiteAtual ? '#ff3b30' : '#1a1a1a';
    });

    const chartCanvas = document.getElementById('meuGrafico');
    if (chartCanvas) {
        const ctxBarra = chartCanvas.getContext('2d');
        if (graficoBarra) graficoBarra.destroy();
        graficoBarra = new Chart(ctxBarra, {
            type: typeGrafico,
            data: {
                labels: labelsBarra,
                datasets: [{
                    label: 'Consumo (m³)',
                    data: valoresBarra,
                    backgroundColor: estilo === 'area' ? 'rgba(26, 26, 26, 0.2)' : bgColors,
                    borderColor: estilo === 'bar' ? 'transparent' : '#1a1a1a',
                    borderWidth: 2,
                    fill: estilo === 'area',
                    tension: 0.3,
                    pointBackgroundColor: bgColors,
                    pointRadius: estilo !== 'bar' ? 4 : 0,
                    borderRadius: estilo === 'bar' ? 4 : 0
                }]
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: { x: { grid: { display: false } } }
            }
        });
    }

    const statusCanvas = document.getElementById('graficoStatus');
    if (statusCanvas) {
        const ctxStatus = statusCanvas.getContext('2d');
        if (graficoStatus) graficoStatus.destroy();

        const ultimo = ultimosDados[ultimosDados.length - 1] || { consumoCalculado: 0, diasAusentes: 0 };
        let corMedidor = '#34c759';
        if (ultimo.diasAusentes > 0) {
            corMedidor = (consumoAtual / (ultimo.diasAusentes + 1)) > limiteAtual ? '#ff3b30' : '#f9b233';
        } else if (consumoAtual > limiteAtual) {
            corMedidor = '#ff3b30';
        }

        graficoStatus = new Chart(ctxStatus, {
            type: 'doughnut',
            data: { labels: ['Consumo', 'Folga'], datasets: [{ data: [consumoAtual, Math.max(0, limiteAtual - consumoAtual)], backgroundColor: [corMedidor, '#eeeeee'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false }, tooltip: { enabled: false } } }
        });
    }
}

window.gerarPDF = function () {
    if (historico.length === 0) return alert("Não há dados.");
    const { jsPDF } = window.jspdf; const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.text("RELATÓRIO DE CONSUMO", 14, 20); doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.autoTable({ startY: 35, head: [['Data', 'Leitura', 'Consumo (m³)']], body: historico.map(h => [new Date(h.data).toLocaleDateString('pt-BR'), h.leitura.toFixed(3), h.consumoCalculado.toFixed(3)]), headStyles: { fillColor: [0, 0, 0] } });
    doc.save("Relatorio_Agua.pdf");
}

window.exportarDados = function () {
    if (historico.length === 0) return alert("Sem dados.");
    const a = document.createElement('a'); a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(historico)); a.download = "backup_hidrometro.json";
    document.body.appendChild(a); a.click(); a.remove();
}

window.importarDados = function (event) {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        try { const dados = JSON.parse(e.target.result); if (Array.isArray(dados)) { confirmarAcao("Importar Backup", "Isso substituirá os dados atuais. Continuar?", () => { historico = dados; salvarERefrescar(); }); } }
        catch (err) { alert("Arquivo corrompido."); }
    }; reader.readAsText(file); event.target.value = '';
}

window.voltar = function () {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
};

window.addEventListener('pageshow', function (event) {
    if (document.body.classList.contains('page-exit')) document.body.classList.remove('page-exit');
});
