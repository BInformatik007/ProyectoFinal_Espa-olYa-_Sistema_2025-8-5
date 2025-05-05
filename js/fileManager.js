import { supabase } from './supabaseClient.js';

export function initFileManager() {
  // DOM Elements
  const fileInput = document.getElementById('fileInput');
  const fileTitleInput = document.getElementById('fileTitle');
  const fileThemeSelect = document.getElementById('fileTheme');
  const uploadBtn = document.getElementById('uploadBtn');
  const uploadForm = document.querySelector('.upload-form');
  const dropArea = document.getElementById('drop-area');
  const noResourcesMessage = document.getElementById('no-resources');
  
  // Set up event listeners
  setupEventListeners();
  
  async function setupEventListeners() {
    // Form submission for file upload
    uploadForm.addEventListener('submit', handleFileUpload);
    
    // Drag and drop functionality
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    dropArea.addEventListener('drop', handleDrop, false);
  }
  
  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  function highlight() {
    dropArea.classList.add('drop-active');
  }
  
  function unhighlight() {
    dropArea.classList.remove('drop-active');
  }
  
  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    fileInput.files = files;
  }
  
  async function handleFileUpload(e) {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('Please sign in first');
      return;
    }
    
    const files = fileInput.files;
    if (!files || files.length === 0) {
      alert('Please select at least one file');
      return;
    }
    
    const title = fileTitleInput.value.trim();
    if (!title) {
      alert('Please enter a title for the resource');
      return;
    }
    
    const theme = fileThemeSelect.value;
    if (!theme) {
      alert('Please select a theme for the resource');
      return;
    }
    
    // Process each file
    for (const file of files) {
      await processFile(file, title, theme, user.id);
    }
    
    // Reset form
    uploadForm.reset();
    
    // Refresh resources list
    loadResources();
  }
  
  async function processFile(file, title, theme, userId) {
    try {
      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resources')
        .upload(`${userId}/${Date.now()}-${file.name}`, file);

      if (uploadError) throw uploadError;

      // Get public URL for the uploaded file
      const { data: { publicUrl } } = supabase.storage
        .from('resources')
        .getPublicUrl(uploadData.path);

      // Create resource record in the database
      const { error: dbError } = await supabase
        .from('resources')
        .insert({
          name: title,
          type: getFileType(file.type),
          size: file.size,
          url: publicUrl,
          user_id: userId,
          topic: theme
        });

      if (dbError) throw dbError;
    } catch (error) {
      console.error('Error processing file:', error);
      alert('Error uploading file. Please try again.');
    }
  }
  
  async function removeResource(id) {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Refresh resources list
      loadResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Error deleting resource. Please try again.');
    }
  }
  
  async function loadResources() {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const event = new CustomEvent('resourcesUpdated', { detail: data || [] });
      document.dispatchEvent(event);
      
      updateNoResourcesMessage(data?.length || 0);
    } catch (error) {
      console.error('Error loading resources:', error);
      alert('Error loading resources. Please try again.');
    }
  }
  
  function updateNoResourcesMessage(resourceCount) {
    if (resourceCount === 0) {
      noResourcesMessage.classList.remove('hidden');
    } else {
      noResourcesMessage.classList.add('hidden');
    }
  }
  
  function getFileType(mimeType) {
    if (mimeType.startsWith('image/')) return 'Imagen';
    if (mimeType.startsWith('video/')) return 'Video';
    if (mimeType.startsWith('audio/')) return 'Audio';
    if (mimeType.startsWith('text/')) return 'Texto';
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'Documento';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return 'Hoja de cálculo';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'Presentación';
    return 'Archivo';
  }
  
  return {
    loadResources,
    removeResource
  };
}