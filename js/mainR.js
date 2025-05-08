document.addEventListener('DOMContentLoaded', async () => {
  // Verificar autenticación y rol
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    window.location.href = '/login.html';
    return;
  }

  // Obtener información del usuario
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError) {
    console.error('Error al obtener datos del usuario:', userError);
    return;
  }

  // Mostrar panel de subida solo para maestros
  if (userData.role === 'teacher') {
    document.getElementById('teacher-upload-section').classList.remove('hidden');
    setupUploadForm(user.id);
  }

  // Cargar y mostrar recursos
  loadResources();

  // Configurar búsqueda y filtros
  document.getElementById('search-input').addEventListener('input', loadResources);
  document.getElementById('type-filter').addEventListener('change', loadResources);
});

// Configurar formulario de subida
function setupUploadForm(userId) {
  const uploadForm = document.getElementById('upload-form');
  const fileInput = document.getElementById('resource-file');
  
  uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('resource-title').value;
    const description = document.getElementById('resource-description').value;
    const theme = document.getElementById('resource-theme').value;
    const file = fileInput.files[0];
    
    if (!file || !title) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    try {
      // Subir archivo a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `resources/${userId}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('educational-resources')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('educational-resources')
        .getPublicUrl(filePath);
      
      // Determinar tipo de archivo
      const fileType = getFileType(file.name);
      
      // Insertar en la tabla resources
      const { error: dbError } = await supabase
        .from('resources')
        .insert({
          title,
          description,
          theme,
          file_url: publicUrl,
          file_type: fileType,
          file_size: file.size,
          uploaded_by: userId
        });
      
      if (dbError) throw dbError;
      
      alert('Recurso subido exitosamente!');
      uploadForm.reset();
      loadResources();
    } catch (error) {
      console.error('Error al subir recurso:', error);
      alert('Error al subir el recurso');
    }
  });
}

// Cargar recursos desde Supabase
async function loadResources() {
  const searchQuery = document.getElementById('search-input').value;
  const typeFilter = document.getElementById('type-filter').value;
  
  let query = supabase
    .from('resources')
    .select(`
      id,
      title,
      description,
      theme,
      file_url,
      file_type,
      file_size,
      uploaded_by,
      created_at,
      profiles:uploaded_by (username)
    `)
    .order('created_at', { ascending: false });
  
  // Aplicar filtros
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,theme.ilike.%${searchQuery}%`);
  }
  
  if (typeFilter) {
    query = query.eq('file_type', typeFilter);
  }
  
  const { data: resources, error } = await query;
  
  const resourcesGrid = document.getElementById('resources-grid');
  
  if (error) {
    resourcesGrid.innerHTML = '<div class="error-message">Error al cargar recursos</div>';
    return;
  }
  
  if (resources.length === 0) {
    resourcesGrid.innerHTML = '<div class="no-resources">No se encontraron recursos</div>';
    return;
  }
  
  // Generar el DataGrid
  resourcesGrid.innerHTML = `
    <div class="grid-header">
      <div>Título</div>
      <div>Tema</div>
      <div>Tipo</div>
      <div>Autor</div>
      <div>Fecha</div>
      <div>Acciones</div>
    </div>
  `;
  
  resources.forEach(resource => {
    const resourceItem = document.createElement('div');
    resourceItem.className = 'grid-item';
    resourceItem.innerHTML = `
      <div>${resource.title}</div>
      <div>${resource.theme || '-'}</div>
      <div class="file-type ${resource.file_type}">
        <i class="${getFileIcon(resource.file_type)}"></i> ${getFileTypeName(resource.file_type)}
      </div>
      <div>${resource.profiles?.username || 'Desconocido'}</div>
      <div>${new Date(resource.created_at).toLocaleDateString()}</div>
      <div class="actions">
        <button class="btn-view" data-id="${resource.id}">
          <i class="fas fa-eye"></i> Ver
        </button>
        <a href="${resource.file_url}" download class="btn-download">
          <i class="fas fa-download"></i>
        </a>
      </div>
    `;
    
    resourcesGrid.appendChild(resourceItem);
  });
  
  // Configurar eventos para los botones de vista
  document.querySelectorAll('.btn-view').forEach(btn => {
    btn.addEventListener('click', () => showResourceDetails(btn.dataset.id));
  });
}

// Mostrar detalles del recurso en modal
async function showResourceDetails(resourceId) {
  const { data: resource, error } = await supabase
    .from('resources')
    .select(`
      *,
      profiles:uploaded_by (username)
    `)
    .eq('id', resourceId)
    .single();
  
  if (error) {
    console.error('Error al cargar recurso:', error);
    return;
  }
  
  const modal = document.getElementById('resource-modal');
  document.getElementById('modal-title').textContent = resource.title;
  document.getElementById('modal-description').textContent = resource.description || 'Sin descripción';
  document.getElementById('modal-theme').textContent = resource.theme || 'Sin tema';
  document.getElementById('modal-type').textContent = getFileTypeName(resource.file_type);
  document.getElementById('modal-author').textContent = resource.profiles?.username || 'Desconocido';
  document.getElementById('modal-date').textContent = new Date(resource.created_at).toLocaleString();
  
  // Configurar vista previa según el tipo de archivo
  const previewContainer = document.getElementById('modal-preview');
  previewContainer.innerHTML = '';
  
  if (resource.file_type === 'pdf') {
    previewContainer.innerHTML = `
      <iframe src="${resource.file_url}" frameborder="0" style="width:100%; height:500px;"></iframe>
    `;
  } else if (['image'].includes(resource.file_type)) {
    previewContainer.innerHTML = `
      <img src="${resource.file_url}" alt="${resource.title}" style="max-width:100%; max-height:500px;">
    `;
  } else if (['video'].includes(resource.file_type)) {
    previewContainer.innerHTML = `
      <video controls style="max-width:100%;">
        <source src="${resource.file_url}" type="video/mp4">
        Tu navegador no soporta videos HTML5.
      </video>
    `;
  } else if (['audio'].includes(resource.file_type)) {
    previewContainer.innerHTML = `
      <audio controls style="width:100%;">
        <source src="${resource.file_url}" type="audio/mpeg">
        Tu navegador no soporta audio HTML5.
      </audio>
    `;
  } else {
    previewContainer.innerHTML = `
      <p>No hay vista previa disponible para este tipo de archivo.</p>
    `;
  }
  
  // Configurar botón de descarga
  document.getElementById('download-btn').href = resource.file_url;
  
  // Mostrar botón de eliminar solo para maestros
  const deleteBtn = document.getElementById('delete-btn');
  deleteBtn.classList.add('hidden');
  
  // Verificar si el usuario actual es el que subió el recurso
  const { data: { user } } = await supabase.auth.getUser();
  if (user.id === resource.uploaded_by) {
    deleteBtn.classList.remove('hidden');
    deleteBtn.onclick = () => deleteResource(resource.id);
  }
  
  // Mostrar modal
  modal.classList.remove('hidden');
  
  // Configurar cierre del modal
  document.querySelector('.close-modal').onclick = () => {
    modal.classList.add('hidden');
  };
}

// Eliminar recurso
async function deleteResource(resourceId) {
  if (!confirm('¿Estás seguro de que deseas eliminar este recurso?')) return;
  
  try {
    // Primero obtener la URL del archivo para eliminarlo del storage
    const { data: resource, error: getError } = await supabase
      .from('resources')
      .select('file_url')
      .eq('id', resourceId)
      .single();
    
    if (getError) throw getError;
    
    // Extraer la ruta del archivo (eliminando el dominio)
    const filePath = resource.file_url.split('/storage/v1/object/public/educational-resources/')[1];
    
    // Eliminar de storage
    const { error: storageError } = await supabase.storage
      .from('educational-resources')
      .remove([filePath]);
    
    if (storageError) throw storageError;
    
    // Eliminar de la base de datos
    const { error: dbError } = await supabase
      .from('resources')
      .delete()
      .eq('id', resourceId);
    
    if (dbError) throw dbError;
    
    alert('Recurso eliminado correctamente');
    loadResources();
    document.getElementById('resource-modal').classList.add('hidden');
  } catch (error) {
    console.error('Error al eliminar recurso:', error);
    alert('Error al eliminar el recurso');
  }
}

// Funciones auxiliares
function getFileType(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  if (['pdf'].includes(ext)) return 'pdf';
  if (['doc', 'docx'].includes(ext)) return 'document';
  if (['ppt', 'pptx'].includes(ext)) return 'presentation';
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return 'image';
  if (['mp3', 'wav'].includes(ext)) return 'audio';
  if (['mp4', 'mov', 'avi'].includes(ext)) return 'video';
  return 'other';
}

function getFileTypeName(type) {
  const names = {
    pdf: 'PDF',
    document: 'Documento',
    presentation: 'Presentación',
    image: 'Imagen',
    audio: 'Audio',
    video: 'Video',
    other: 'Otro'
  };
  return names[type] || type;
}

function getFileIcon(type) {
  const icons = {
    pdf: 'fa-file-pdf',
    document: 'fa-file-word',
    presentation: 'fa-file-powerpoint',
    image: 'fa-file-image',
    audio: 'fa-file-audio',
    video: 'fa-file-video',
    other: 'fa-file'
  };
  return icons[type] || 'fa-file';
}