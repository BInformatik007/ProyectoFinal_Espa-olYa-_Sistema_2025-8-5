import { supabase } from './supabaseClient.js';

// Elementos del DOM
const teacherPanel = document.getElementById('teacher-panel');
const uploadForm = document.getElementById('upload-form');
const resourceFileInput = document.getElementById('resource-file');
const fileInfo = document.getElementById('file-info');
const resourcesContainer = document.getElementById('resources-container');
const noResourcesMsg = document.getElementById('no-resources');
const searchInput = document.getElementById('search-input');
const themeFilter = document.getElementById('theme-filter');
const typeFilter = document.getElementById('type-filter');
const sortSelect = document.getElementById('sort-select');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');
const userEmail = document.getElementById('user-email');
const roleBadge = document.getElementById('role-text');
const roleIcon = document.getElementById('role-icon');
const logoutBtn = document.getElementById('logout-btn');
const resourceModal = document.getElementById('resource-modal');
const closeModalBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalTheme = document.getElementById('modal-theme');
const modalDate = document.getElementById('modal-date');
const modalAuthor = document.getElementById('modal-author');
const modalDescription = document.getElementById('modal-description');
const modalPreview = document.getElementById('modal-preview');
const downloadBtn = document.getElementById('download-btn');
const deleteBtn = document.getElementById('delete-btn');
const confirmModal = document.getElementById('confirm-modal');
const confirmMessage = document.getElementById('confirm-message');
const confirmCancelBtn = document.getElementById('confirm-cancel');
const confirmOkBtn = document.getElementById('confirm-ok');
const notification = document.getElementById('notification');
const notificationMessage = document.getElementById('notification-message');
const notificationIcon = document.getElementById('notification-icon');
const loadingSpinner = document.getElementById('loading-spinner');
const loadingMessage = document.getElementById('loading-message');

// Variables de estado
let currentUser = null;
let currentUserRole = null;
let resources = [];
let filteredResources = [];
let currentPage = 1;
const resourcesPerPage = 9;
let resourceToDelete = null;

// Inicialización
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await checkSession();
    await loadResources();
    setupEventListeners();
  } catch (error) {
    console.error('Initialization error:', error);
    showNotification('Error al inicializar la aplicación', 'error');
  }
});

// Verificar sesión y rol
async function checkSession() {
  showLoading('Verificando sesión...');
  
  const { data: { session }, error } = await supabase.auth.getSession();
  
  if (error || !session) {
    window.location.href = '../html/login.html';
    return;
  }
  
  currentUser = session.user;
  userEmail.textContent = currentUser.email;
  
  // Obtener rol del usuario
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role_id, roles(name)')
    .eq('id', currentUser.id)
    .single();
  
  if (userError) {
    throw new Error('Error al cargar información del usuario');
  }
  
  currentUserRole = userData.roles.name;
  
  // Configurar interfaz según el rol
  if (currentUserRole === 'teacher') {
    roleBadge.textContent = 'Profesor';
    roleIcon.className = 'fas fa-chalkboard-teacher';
    teacherPanel.classList.remove('hidden');
  } else {
    roleBadge.textContent = 'Estudiante';
    roleIcon.className = 'fas fa-user-graduate';
  }
  
  hideLoading();
}

// Cargar recursos
async function loadResources() {
  try {
    showLoading('Cargando recursos...');
    
    const { data, error } = await supabase
      .from('resources')
      .select(`
        id,
        title,
        description,
        theme,
        file_url,
        file_type,
        file_name,
        file_size,
        created_at,
        updated_at,
        user:uploaded_by(
          id,
          email
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    resources = data || [];
    filteredResources = [...resources];
    
    renderResources();
    updatePagination();
    populateThemeFilter();
    
    if (resources.length === 0) {
      noResourcesMsg.style.display = 'flex';
    } else {
      noResourcesMsg.style.display = 'none';
    }
    
  } catch (error) {
    console.error('Error loading resources:', error);
    showNotification('Error al cargar los recursos', 'error');
    noResourcesMsg.style.display = 'flex';
  } finally {
    hideLoading();
  }
}

// Renderizar recursos
function renderResources() {
  resourcesContainer.innerHTML = '';
  
  const startIndex = (currentPage - 1) * resourcesPerPage;
  const endIndex = startIndex + resourcesPerPage;
  const paginatedResources = filteredResources.slice(startIndex, endIndex);
  
  if (paginatedResources.length === 0) {
    noResourcesMsg.style.display = 'flex';
    return;
  }
  
  noResourcesMsg.style.display = 'none';
  
  paginatedResources.forEach(resource => {
    const resourceCard = document.createElement('div');
    resourceCard.className = 'resource-card';
    
    resourceCard.innerHTML = `
      <div class="resource-preview">
        ${getPreviewIcon(resource.file_type)}
      </div>
      <div class="resource-content">
        <h3 class="resource-title">${resource.title}</h3>
        <p class="resource-description">${resource.description || 'Sin descripción'}</p>
        <div class="resource-meta">
          <span class="resource-type">${getFileTypeName(resource.file_type)}</span>
          <span class="resource-size">${formatFileSize(resource.file_size)}</span>
          <div class="resource-actions">
            <button class="btn-view" data-id="${resource.id}">
              <i class="fas fa-eye"></i> Ver
            </button>
            <button class="btn-download" data-url="${resource.file_url}" data-name="${resource.file_name}">
              <i class="fas fa-download"></i>
            </button>
            ${currentUserRole === 'teacher' ? `
              <button class="btn-delete" data-id="${resource.id}" data-url="${resource.file_url}">
                <i class="fas fa-trash-alt"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    resourcesContainer.appendChild(resourceCard);
  });
  
  // Configurar eventos
  setupResourceEvents();
}

// Configurar eventos para los recursos
function setupResourceEvents() {
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => openResourceModal(btn.dataset.id));
  });
  
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', () => downloadResource(btn.dataset.url, btn.dataset.name));
  });
  
  if (currentUserRole === 'teacher') {
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => confirmDelete(btn.dataset.id, btn.dataset.url));
    });
  }
}

// Abrir modal de recurso
async function openResourceModal(resourceId) {
  try {
    showLoading('Cargando recurso...');
    
    const resource = resources.find(r => r.id === resourceId);
    if (!resource) {
      showNotification('Recurso no encontrado', 'error');
      return;
    }
    
    modalTitle.textContent = resource.title;
    modalTheme.textContent = resource.theme;
    modalDate.textContent = formatDate(resource.created_at);
    modalAuthor.textContent = resource.user.email;
    modalDescription.textContent = resource.description || 'No hay descripción disponible';
    
    // Configurar previsualización según tipo de archivo
    if (resource.file_type.match(/(pdf)/i)) {
      modalPreview.innerHTML = `
        <iframe src="${resource.file_url}#toolbar=0" width="100%" height="500px"></iframe>
      `;
    } else if (resource.file_type.match(/(png|jpg|jpeg|gif|webp)/i)) {
      modalPreview.innerHTML = `
        <img src="${resource.file_url}" alt="${resource.title}" class="preview-img" />
      `;
    } else {
      modalPreview.innerHTML = `
        <div class="generic-preview">
          <i class="${getFileIcon(resource.file_type)} fa-4x"></i>
          <p>${resource.file_name}</p>
          <p>Tipo: ${getFileTypeName(resource.file_type)}</p>
          <p>Tamaño: ${formatFileSize(resource.file_size)}</p>
        </div>
      `;
    }
    
    // Configurar botón de descarga
    downloadBtn.href = resource.file_url;
    downloadBtn.download = resource.file_name;
    
    // Mostrar botón de eliminar solo si es profesor
    deleteBtn.classList.toggle('hidden', currentUserRole !== 'teacher');
    if (currentUserRole === 'teacher') {
      deleteBtn.onclick = () => confirmDelete(resource.id, resource.file_url);
    }
    
    resourceModal.classList.add('active');
    
  } catch (error) {
    console.error('Error opening resource modal:', error);
    showNotification('Error al cargar el recurso', 'error');
  } finally {
    hideLoading();
  }
}

// Subir recurso
async function uploadResource(e) {
  e.preventDefault();
  
  try {
    const title = document.getElementById('resource-title').value.trim();
    const description = document.getElementById('resource-description').value.trim();
    const theme = document.getElementById('resource-theme').value.trim();
    const file = resourceFileInput.files[0];
    
    // Validaciones
    if (!title || !theme || !file) {
      showNotification('Por favor completa todos los campos requeridos', 'error');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // Límite de 10MB
      showNotification('El archivo es demasiado grande (máximo 10MB)', 'error');
      return;
    }
    
    showLoading('Subiendo recurso...');
    
    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    const filePath = `${fileName}`;

    // 1. Subir archivo al storage
    const { error: uploadError } = await supabase.storage
      .from('resources')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) throw uploadError;

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('resources')
      .getPublicUrl(filePath);

    // 3. Insertar registro en la base de datos
    const { data: insertedResource, error: dbError } = await supabase
      .from('resources')
      .insert([{
        title,
        description,
        theme,
        file_url: publicUrl,
        file_type: fileExt,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: currentUser.id
      }])
      .select()
      .single();

    if (dbError) {
      // Si hay error al insertar, eliminar el archivo subido
      await supabase.storage.from('resources').remove([filePath]);
      throw dbError;
    }

    // Actualizar la lista de recursos
    resources.unshift(insertedResource);
    filteredResources = [...resources];
    
    // Limpiar formulario
    uploadForm.reset();
    fileInfo.textContent = '';
    renderResources();
    
    showNotification('Recurso subido correctamente', 'success');
    
  } catch (error) {
    console.error('Error uploading resource:', error);
    showNotification(`Error al subir el recurso: ${handleSupabaseError(error)}`, 'error');
  } finally {
    hideLoading();
  }
}

// Eliminar recurso
async function deleteResource() {
  if (!resourceToDelete) return;
  
  try {
    showLoading('Eliminando recurso...');
    
    // Extraer path del archivo desde la URL
    const path = resourceToDelete.url.split('/storage/v1/object/public/resources/')[1];
    
    // 1. Eliminar archivo del storage
    const { error: storageError } = await supabase.storage
      .from('resources')
      .remove([path]);
    
    if (storageError) throw storageError;
    
    // 2. Eliminar registro de la base de datos
    const { error: dbError } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceToDelete.id);
    
    if (dbError) throw dbError;
    
    // 3. Actualizar la lista local
    resources = resources.filter(r => r.id !== resourceToDelete.id);
    filteredResources = [...resources];
    
    renderResources();
    showNotification('Recurso eliminado correctamente', 'success');
    
  } catch (error) {
    console.error('Error deleting resource:', error);
    showNotification(`Error al eliminar el recurso: ${handleSupabaseError(error)}`, 'error');
  } finally {
    resourceToDelete = null;
    closeConfirmModal();
    hideLoading();
  }
}

// Filtrar recursos
function filterResources() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedTheme = themeFilter.value;
  const selectedType = typeFilter.value.toLowerCase();
  
  filteredResources = resources.filter(resource => {
    const matchesSearch = 
      resource.title.toLowerCase().includes(searchTerm) ||
      (resource.description && resource.description.toLowerCase().includes(searchTerm)) ||
      resource.theme.toLowerCase().includes(searchTerm);
    
    const matchesTheme = selectedTheme ? resource.theme === selectedTheme : true;
    const matchesType = selectedType ? resource.file_type.toLowerCase() === selectedType : true;
    
    return matchesSearch && matchesTheme && matchesType;
  });
  
  currentPage = 1;
  renderResources();
  updatePagination();
}

// Llenar filtro de temas
function populateThemeFilter() {
  const themes = [...new Set(resources.map(r => r.theme))];
  themes.sort();
  
  themeFilter.innerHTML = `
    <option value="">Todos los temas</option>
    ${themes.map(theme => `<option value="${theme}">${theme}</option>`).join('')}
  `;
}

// Ordenar recursos
function sortResources() {
  const sortValue = sortSelect.value;
  
  filteredResources.sort((a, b) => {
    switch (sortValue) {
      case 'newest':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'oldest':
        return new Date(a.created_at) - new Date(b.created_at);
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      default:
        return 0;
    }
  });
  
  renderResources();
}

// Configurar eventos
function setupEventListeners() {
  // Subida de recursos (solo para profesores)
  if (currentUserRole === 'teacher') {
    uploadForm.addEventListener('submit', uploadResource);
    resourceFileInput.addEventListener('change', updateFileInfo);
  }
  
  // Búsqueda y filtros (para todos)
  searchInput.addEventListener('input', debounce(filterResources, 300));
  document.getElementById('clear-search').addEventListener('click', () => {
    searchInput.value = '';
    filterResources();
  });
  themeFilter.addEventListener('change', filterResources);
  typeFilter.addEventListener('change', filterResources);
  sortSelect.addEventListener('change', sortResources);
  
  // Paginación
  prevPageBtn.addEventListener('click', goToPrevPage);
  nextPageBtn.addEventListener('click', goToNextPage);
  
  // Modales
  closeModalBtn.addEventListener('click', closeResourceModal);
  
  // Confirmación
  confirmCancelBtn.addEventListener('click', closeConfirmModal);
  confirmOkBtn.addEventListener('click', deleteResource);
  
  // Logout
  logoutBtn.addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '../html/login.html';
  });
  
  // Cerrar modales al hacer clic fuera
  [resourceModal, confirmModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
      }
    });
  });
}

// Funciones de utilidad
function getFileIcon(fileType) {
  const type = fileType.split('/')[0];
  const fileTypes = {
    'image': 'fas fa-image',
    'video': 'fas fa-video',
    'audio': 'fas fa-music',
    'application': {
      'pdf': 'fas fa-file-pdf',
      'msword': 'fas fa-file-word',
      'vnd.openxmlformats-officedocument.wordprocessingml.document': 'fas fa-file-word',
      'vnd.ms-powerpoint': 'fas fa-file-powerpoint',
      'vnd.openxmlformats-officedocument.presentationml.presentation': 'fas fa-file-powerpoint',
      'vnd.ms-excel': 'fas fa-file-excel',
      'vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'fas fa-file-excel',
      'zip': 'fas fa-file-archive',
      'x-7z-compressed': 'fas fa-file-archive',
      'x-rar-compressed': 'fas fa-file-archive'
    },
    'text': 'fas fa-file-alt'
  };
  
  if (fileTypes[type]) {
    if (typeof fileTypes[type] === 'object') {
      const subtype = fileType.split('/')[1];
      return fileTypes[type][subtype] || 'fas fa-file';
    }
    return fileTypes[type];
  }
  
  return 'fas fa-file';
}

function getPreviewIcon(fileType) {
  const icon = getFileIcon(fileType);
  return `<i class="${icon}"></i>`;
}

function getFileTypeName(fileType) {
  const types = {
    'pdf': 'PDF',
    'doc': 'Documento Word',
    'docx': 'Documento Word',
    'ppt': 'Presentación',
    'pptx': 'Presentación',
    'xls': 'Hoja de cálculo',
    'xlsx': 'Hoja de cálculo',
    'jpg': 'Imagen',
    'jpeg': 'Imagen',
    'png': 'Imagen',
    'gif': 'Imagen',
    'mp4': 'Video',
    'mov': 'Video',
    'avi': 'Video',
    'zip': 'Archivo comprimido',
    'rar': 'Archivo comprimido'
  };
  
  return types[fileType.toLowerCase()] || fileType.toUpperCase();
}

function formatFileSize(bytes) {
  if (!bytes) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
}

function downloadResource(url, fileName) {
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName || url.split('/').pop();
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function showNotification(message, type = 'info') {
  notification.className = `notification ${type}`;
  notificationMessage.textContent = message;
  
  // Configurar icono según tipo
  notificationIcon.className = 
    type === 'error' ? 'fas fa-exclamation-circle' :
    type === 'success' ? 'fas fa-check-circle' :
    'fas fa-info-circle';
  
  notification.classList.add('active');
  
  setTimeout(() => {
    notification.classList.remove('active');
  }, 3000);
}

function handleSupabaseError(error) {
  console.error('Supabase Error:', error);
  
  if (error.code === '23505') {
    return 'Este recurso ya existe';
  } else if (error.code === '42501') {
    return 'No tienes permisos para esta acción';
  } else if (error.message.includes('JWT expired')) {
    return 'Sesión expirada, por favor vuelve a iniciar sesión';
  } else if (error.message.includes('Storage error')) {
    return 'Error al subir el archivo al almacenamiento';
  }
  
  return error.message || 'Error desconocido';
}

function showLoading(message = 'Cargando...') {
  loadingMessage.textContent = message;
  loadingSpinner.classList.remove('hidden');
}

function hideLoading() {
  loadingSpinner.classList.add('hidden');
}

function updatePagination() {
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);
  pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
  
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;
}

function goToPrevPage() {
  if (currentPage > 1) {
    currentPage--;
    renderResources();
    updatePagination();
  }
}

function goToNextPage() {
  const totalPages = Math.ceil(filteredResources.length / resourcesPerPage);
  
  if (currentPage < totalPages) {
    currentPage++;
    renderResources();
    updatePagination();
  }
}

function updateFileInfo() {
  const file = resourceFileInput.files[0];
  if (!file) {
    fileInfo.innerHTML = '';
    return;
  }
  
  fileInfo.innerHTML = `
    <p><strong>Nombre:</strong> ${file.name}</p>
    <p><strong>Tipo:</strong> ${file.type || 'Desconocido'}</p>
    <p><strong>Tamaño:</strong> ${formatFileSize(file.size)}</p>
  `;
}

function confirmDelete(resourceId, fileUrl) {
  resourceToDelete = { id: resourceId, url: fileUrl };
  confirmMessage.textContent = '¿Estás seguro de que deseas eliminar este recurso? Esta acción no se puede deshacer.';
  confirmModal.classList.add('active');
  resourceModal.classList.remove('active');
}

function closeConfirmModal() {
  confirmModal.classList.remove('active');
}

function closeResourceModal() {
  resourceModal.classList.remove('active');
}

function debounce(func, timeout = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => { func.apply(this, args); }, timeout);
  };
}