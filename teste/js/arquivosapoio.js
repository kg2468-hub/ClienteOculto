// Configurações da API do Google Drive
const API_KEY = 'AIzaSyC1MWoMoeVxISL-XvVfo3eSzSBXJUpio44';
const FOLDER_ID = '1Cj2KQhZU9gRKR8CwH7iDq8GuFT4yfoYj';

let allFiles = [];

window.addEventListener('load', () => {
    if (API_KEY === 'SUA_API_KEY_AQUI') {
        const listElement = document.getElementById('file-list');
        if (listElement) listElement.innerHTML = '<div class="empty-state">Configuração Pendente: A chave da API não foi informada.</div>';
        return;
    }
    fetchFiles();
});

async function fetchFiles() {
    const listElement = document.getElementById('file-list');
    try {
        const response = await fetch(`https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+trashed=false&fields=files(id,name,mimeType,webContentLink,webViewLink,iconLink,size)&key=${API_KEY}`);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error ? errorData.error.message : 'Erro na requisição');
        }

        const data = await response.json();
        if (data.files && data.files.length > 0) {
            allFiles = data.files;
            renderFileList(allFiles);
        } else {
            listElement.innerHTML = '<div class="empty-state">Nenhum arquivo encontrado na pasta de apoio.</div>';
        }
    } catch (error) {
        console.error('Erro ao buscar arquivos:', error);
        listElement.innerHTML = `<div class="empty-state">Erro ao carregar arquivos: <br><small>${error.message}</small></div>`;
    }
}

function renderFileList(files) {
    const listElement = document.getElementById('file-list');
    listElement.innerHTML = '';

    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';

        const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
        const iconClass = getFileIcon(file.mimeType);
        const fileSize = file.size ? formatBytes(file.size) : '';

        item.innerHTML = `
            <div class="file-info" onclick="${isFolder ? '' : `previewFile('${file.id}', '${file.name}')`}">
                <i class="${iconClass} file-icon"></i>
                <div class="file-details">
                    <span class="file-name">${file.name}</span>
                    <span class="file-meta">${fileSize}</span>
                </div>
            </div>
            <div class="file-actions">
                <a href="${file.webViewLink}" target="_blank" title="Abrir no Google Drive"><i class="fas fa-external-link-alt"></i></a>
                ${file.webContentLink ? `<a href="${file.webContentLink}" title="Baixar"><i class="fas fa-download"></i></a>` : ''}
            </div>
        `;
        listElement.appendChild(item);
    });
}

window.filtrarArquivos = function (query) {
    const filtered = allFiles.filter(f => f.name.toLowerCase().includes(query.toLowerCase()));
    renderFileList(filtered);
}

function getFileIcon(mimeType) {
    if (mimeType.includes('pdf')) return 'fas fa-file-pdf text-danger';
    if (mimeType.includes('image')) return 'fas fa-file-image text-primary';
    if (mimeType.includes('word') || mimeType.includes('text')) return 'fas fa-file-word text-info';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'fas fa-file-excel text-success';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'fas fa-file-powerpoint text-warning';
    if (mimeType.includes('folder')) return 'fas fa-folder text-warning';
    return 'fas fa-file text-secondary';
}

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

window.previewFile = function (id, name) {
    const modal = document.getElementById('preview-modal');
    const iframe = document.getElementById('preview-iframe');
    const title = document.getElementById('preview-title');

    title.innerText = name;
    iframe.src = `https://drive.google.com/file/d/${id}/preview`;
    modal.style.display = 'flex';
}

window.closePreview = function () {
    const modal = document.getElementById('preview-modal');
    const iframe = document.getElementById('preview-iframe');
    iframe.src = '';
    modal.style.display = 'none';
}

window.voltar = function () {
    document.body.classList.add('page-exit');
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 450);
}

// Fechar modal ao clicar fora
window.onclick = function (event) {
    const modal = document.getElementById('preview-modal');
    if (event.target == modal) {
        closePreview();
    }
}
