// Variables globales
let uploadedResources = [];
        
// Elementos del DOM
const fileInput = document.getElementById('fileInput');
const fileDropZone = document.getElementById('fileDropZone');
const fileName = document.getElementById('fileName');
const uploadButton = document.getElementById('uploadButton');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const statusMessage = document.getElementById('statusMessage');
const resourcesGrid = document.getElementById('resourcesGrid');

// Event Listeners
fileDropZone.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
fileDropZone.addEventListener('dragover', handleDragOver);
fileDropZone.addEventListener('dragleave', handleDragLeave);
fileDropZone.addEventListener('drop', handleDrop);
uploadButton.addEventListener('click', uploadResource);

// Funciones
function handleFileSelect(e) {
    const files = e.target.files;
    if (files.length > 0) {
        displayFileInfo(files[0]);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    fileDropZone.style.borderColor = '#3498db';
    fileDropZone.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    fileDropZone.style.borderColor = '#ddd';
    fileDropZone.style.backgroundColor = '';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    handleDragLeave(e);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        displayFileInfo(files[0]);
    }
}

function displayFileInfo(file) {
    fileName.textContent = file.name;
    fileDropZone.classList.add('has-file');
}

function uploadResource() {
    // Validación básica
    const title = document.getElementById('resource-title').value.trim();
    const type = document.getElementById('resource-type').value;
    const theme = document.getElementById('resource-theme').value;
    const description = document.getElementById('resource-description').value.trim();
    
    if (!title || !type || !theme || !description || !fileInput.files[0]) {
        showStatusMessage('Por favor complete todos los campos obligatorios', 'error');
        return;
    }
    
    // Simular subida con progreso
    progressBar.style.display = 'block';
    statusMessage.style.display = 'none';
    uploadButton.disabled = true;
    
    let progressValue = 0;
    const progressInterval = setInterval(() => {
        progressValue += Math.random() * 10;
        if (progressValue >= 100) {
            progressValue = 100;
            clearInterval(progressInterval);
            completeUpload();
        }
        progress.style.width = `${progressValue}%`;
    }, 200);
    
    function completeUpload() {
        const file = fileInput.files[0];
        const resource = {
            id: Date.now(),
            title: title,
            author: document.getElementById('resource-author').value || 'Tú',
            type: type,
            theme: theme,
            description: description,
            file: {
                name: file.name,
                size: formatFileSize(file.size),
                url: URL.createObjectURL(file)
            },
            date: new Date().toLocaleDateString(),
            link: document.getElementById('resource-link').value || null
        };
        
        uploadedResources.unshift(resource);
        renderResources();
        
        showStatusMessage('Recurso subido exitosamente', 'success');
        resetForm();
        
        setTimeout(() => {
            progressBar.style.display = 'none';
            progress.style.width = '0%';
        }, 2000);
        
        uploadButton.disabled = false;
    }
}

function renderResources() {
    // Limpiar grid (excepto el primer recurso de ejemplo)
    while (resourcesGrid.children.length > 1) {
        resourcesGrid.removeChild(resourcesGrid.lastChild);
    }
    
    // Añadir recursos subidos al inicio
    uploadedResources.forEach(resource => {
        const card = document.createElement('div');
        card.className = 'resource-card';
        card.innerHTML = `
            <div class="resource-header">
                <h3 class="resource-title">${resource.title}</h3>
                <div class="resource-meta">
                    <span class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"/>
                        </svg>
                        ${resource.author}
                    </span>
                    <span class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z"/>
                        </svg>
                        ${resource.date}
                    </span>
                    <span class="meta-item">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                        </svg>
                        ${resource.file.size}
                    </span>
                </div>
            </div>
            <div class="resource-description">
                ${resource.description}
            </div>
            <div class="resource-actions">
                <a href="${resource.file.url}" target="_blank" class="action-button primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"/>
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/>
                    </svg>
                    Vista previa
                </a>
                <a href="${resource.file.url}" download="${resource.file.name}" class="action-button secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                        <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708l3 3z"/>
                    </svg>
                    Descargar
                </a>
            </div>
        `;
        resourcesGrid.insertBefore(card, resourcesGrid.children[1]);
    });
    
    // Actualizar contador
    document.getElementById('resultsCount').textContent = 
        `${uploadedResources.length + 1} recursos encontrados`;
}

function resetForm() {
    document.getElementById('resource-title').value = '';
    document.getElementById('resource-author').value = '';
    document.getElementById('resource-type').value = '';
    document.getElementById('resource-theme').value = '';
    document.getElementById('resource-description').value = '';
    document.getElementById('resource-link').value = '';
    fileInput.value = '';
    fileName.textContent = '';
    fileDropZone.classList.remove('has-file');
}

function showStatusMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    statusMessage.style.display = 'block';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Inicialización
renderResources();