/* --- cockpit.js --- */

let reportData = [];
let collaboratorToDeleteIndex = null;

// --- Inicialização ---
window.addEventListener('load', () => {
    // Garante que o indicador de versão e loader funcionem
    if (window.PWAUtils) {
        window.PWAUtils.displayVersion();
        setTimeout(window.PWAUtils.hideLoader, 500);
    }
});

// --- Funções de Navegação ---
window.voltar = function () {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 800);
};

window.addEventListener('pageshow', function (event) {
    if (document.body.classList.contains('page-exit')) document.body.classList.remove('page-exit');
});

// --- Funções do Cockpit ---

function showToast(message, type = 'success') {
    // Tenta usar a função global se existir
    if (typeof window.showToast === 'function') {
        window.showToast(message);
        return;
    }

    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const typeClasses = { success: 'toast-success', error: 'toast-error', info: 'toast-info' };
    toast.className = `toast ${typeClasses[type] || 'toast-info'} fade-in`;

    toast.innerHTML = `<i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showDeleteModal(index) {
    collaboratorToDeleteIndex = index;
    const colabName = reportData[index].nome;
    const modalName = document.getElementById('modalColabName');
    if (modalName) modalName.textContent = colabName;
    const modal = document.getElementById('deleteModal');
    if (modal) modal.style.display = 'flex';
}

function hideDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) modal.style.display = 'none';
    collaboratorToDeleteIndex = null;
}

// Configura o botão de confirmação
document.addEventListener('DOMContentLoaded', () => {
    const btnConfirm = document.getElementById('confirmDeleteBtn');
    if (btnConfirm) {
        btnConfirm.addEventListener('click', () => {
            if (collaboratorToDeleteIndex !== null) {
                executeColaboradorRemoval(collaboratorToDeleteIndex);
                hideDeleteModal();
            }
        });
    }

    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', handleFileUpload);
    }
});

function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    showToast('Processando arquivo...', 'info');
    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            processData(jsonData);
            showToast('Dados carregados com sucesso!');
        } catch (error) {
            showToast('Erro ao ler o arquivo. Verifique o formato.', 'error');
            console.error(error);
        }
    };
    reader.readAsArrayBuffer(file);
}

function processData(data) {
    reportData = [];
    // Inicia da linha 4 (índice 3) para pular cabeçalhos do Cockpit
    for (let i = 3; i < data.length; i++) {
        const row = data[i];
        if (!row || !row[0]) continue;
        reportData.push({
            nome: row[0], vendasGeral: row[2], uvc: formatUVC(row[3]), tkm: row[4],
            marcasExclusivas: row[5], genericoSimilar: row[7], rx: row[9], autoServico: row[11], dermo: row[13]
        });
    }
    const reportDate = document.getElementById('report-date');
    if (reportDate) {
        reportDate.innerText = new Date().toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
    renderCards();
    document.getElementById('report-card').classList.remove('hidden');
    document.getElementById('action-buttons').classList.remove('hidden');
}

function renderCards() {
    const grid = document.getElementById('collaborators-grid');
    if (!grid) return;
    grid.innerHTML = '';
    reportData.forEach((colab, index) => {
        const card = document.createElement('div');
        card.id = `colab-card-${index}`;
        card.className = "colab-card fade-in";
        card.innerHTML = `
            <button onclick="showDeleteModal(${index})" class="no-print colab-delete-btn" title="Excluir Colaborador">
                <i class="fas fa-times"></i>
            </button>
            <h3 class="colab-name">${colab.nome}</h3>
            <div class="colab-data-group">
                ${renderDataItem('Vendas Geral', formatCurrency(colab.vendasGeral), 'colab-data-value highlight')}
                ${renderDataItem('UVC / TKM', `${colab.uvc} <span class="opacity-40mx-1">|</span> ${formatCurrency(colab.tkm)}`)}
                ${renderDataItem('Marcas Exclusivas', formatCurrency(colab.marcasExclusivas))}
                ${renderDataItem('Genérico/Similar', formatCurrency(colab.genericoSimilar))}
                ${renderDataItem('RX', formatCurrency(colab.rx))}
                ${renderDataItem('Auto Serviço', formatCurrency(colab.autoServico))}
                ${renderDataItem('Dermo', formatCurrency(colab.dermo))}
            </div>
        `;
        grid.appendChild(card);
    });
}

function renderDataItem(label, valueHtml, valueClass = 'colab-data-value') {
    return `<div class="colab-data-item">
                <span class="colab-data-label">${label}</span>
                <span class="${valueClass}">${valueHtml}</span>
            </div>`;
}

function formatCurrency(value) {
    let num = parseFloat(value);
    return isNaN(num) ? "R$ 0,00" : num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatUVC(value) {
    let num = parseFloat(value);
    return isNaN(num) ? "0.00" : num.toFixed(2);
}

function executeColaboradorRemoval(index) {
    const cardElement = document.getElementById(`colab-card-${index}`);
    if (cardElement) {
        cardElement.style.opacity = '0';
        cardElement.style.transform = 'scale(0.9)';
        setTimeout(() => {
            reportData.splice(index, 1);
            renderCards();
            showToast('Colaborador removido.', 'info');
        }, 300);
    }
}

// --- Exportação ---

function generateImage() {
    const reportNode = document.getElementById('report-card');
    const container = document.body;
    container.classList.add('exporting');
    showToast('Gerando imagem para download...', 'info');

    html2canvas(reportNode, {
        scale: 2,
        backgroundColor: null,
        useCORS: true,
        logging: false
    }).then(canvas => {
        container.classList.remove('exporting');
        const link = document.createElement('a');
        link.download = `Cockpit_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        showToast('Imagem baixada com sucesso!');
    });
}

function copyImageToClipboard() {
    if (!navigator.clipboard || !navigator.clipboard.write) {
        showToast('Navegador não suporta esta função. Use "Baixar".', 'error');
        return;
    }

    const reportNode = document.getElementById('report-card');
    document.body.classList.add('exporting');
    showToast('Gerando imagem para cópia...', 'info');

    html2canvas(reportNode, { scale: 2, backgroundColor: null }).then(canvas => {
        document.body.classList.remove('exporting');
        canvas.toBlob(blob => {
            if (!blob) return;
            navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
                .then(() => showToast('Imagem copiada!'))
                .catch(() => showToast('Falha ao copiar.', 'error'));
        }, 'image/png');
    });
}

function copyToWhatsApp() {
    if (reportData.length === 0) return showToast('Sem dados para copiar.', 'error');

    let text = `📊 *RESUMO DE VENDAS DIÁRIO* 📊\n📅 ${new Date().toLocaleDateString('pt-BR')}\n\n`;
    reportData.forEach(c => {
        text += `👤 *${c.nome.toUpperCase()}*\n`;
        text += `💵 *Geral:* ${formatCurrency(c.vendasGeral)}\n`;
        text += `🎯 *UVC:* ${c.uvc}  |  🎟 *TKM:* ${formatCurrency(c.tkm)}\n`;
        text += `⭐ *Marcas Excl.:* ${formatCurrency(c.marcasExclusivas)}\n`;
        text += `💊 *Genérico/Sim.:* ${formatCurrency(c.genericoSimilar)}\n`;
        text += `🩺 *RX:* ${formatCurrency(c.rx)}\n`;
        text += `🛒 *Auto Serviço:* ${formatCurrency(c.autoServico)}\n`;
        text += `🧴 *Dermo:* ${formatCurrency(c.dermo)}\n`;
        text += `═══════════════════\n`;
    });

    navigator.clipboard.writeText(text).then(() => {
        showToast('Texto copiado!');
    }).catch(() => {
        showToast('Erro ao copiar.', 'error');
    });
}
