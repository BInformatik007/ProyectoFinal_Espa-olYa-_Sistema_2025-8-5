/**
 * UI Manager Module
 * Handles rendering and user interface interactions
 */

export function initUIManager(roleManager, fileManager) {
    // DOM elements
    const resourcesContainer = document.getElementById('resources');
    const resourceTemplate = document.getElementById('resource-template');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.querySelector('.close-modal');
    
    // Set up event listeners
    setupEventListeners();
    
    /**
     * Set up all event listeners for UI interactions
     */
    function setupEventListeners() {
      // Listen for resource updates
      document.addEventListener('resourcesUpdated', (e) => {
        renderResources(e.detail);
      });
      
      // Modal close button
      closeModal.addEventListener('click', () => {
        closeResourceModal();
      });
      
      // Close modal when clicking outside
      window.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeResourceModal();
        }
      });
      
      // Keyboard event for closing modal with ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
          closeResourceModal();
        }
      });
    }
    
    /**
     * Render resources in the container
     */
    function renderResources(resources, isSearchResult = false) {
      // Clear the container
      resourcesContainer.innerHTML = '';
      
      // Early return if no resources
      if (!resources || resources.length === 0) {
        const noResourcesMsg = document.createElement('p');
        noResourcesMsg.className = 'no-resources';
        noResourcesMsg.textContent = isSearchResult ? 
          'No se encontraron recursos que coincidan con la búsqueda.' : 
          'No hay recursos disponibles.';
        resourcesContainer.appendChild(noResourcesMsg);
        return;
      }
      
      // Create and append resource cards
      resources.forEach(resource => {
        const card = createResourceCard(resource);
        
        // Apply animation class for search results
        if (isSearchResult) {
          card.classList.add('search-animation');
          setTimeout(() => {
            card.classList.add('visible');
          }, 10);
        }
        
        resourcesContainer.appendChild(card);
      });
    }
    
    /**
     * Create a resource card element
     */
    function createResourceCard(resource) {
      // Clone the template
      const card = document.importNode(resourceTemplate.content, true).firstElementChild;
      
      // Set card data
      card.dataset.id = resource.id;
      
      // Set card content
      card.querySelector('.resource-title').textContent = resource.title;
      card.querySelector('.resource-type').textContent = resource.type;
      card.querySelector('.resource-theme').textContent = `Tema: ${resource.theme}`;
      
      // Create preview based on resource type
      const previewEl = card.querySelector('.resource-preview');
      createResourcePreview(previewEl, resource);
      
      // Set up action buttons
      const viewBtn = card.querySelector('.btn-view');
      const deleteBtn = card.querySelector('.btn-delete');
      
      viewBtn.addEventListener('click', () => {
        openResourceModal(resource);
      });
      
      deleteBtn.addEventListener('click', () => {
        if (confirm('¿Está seguro de que desea eliminar este recurso?')) {
          fileManager.removeResource(resource.id);
        }
      });
      
      // Show/hide delete button based on role
      if (!roleManager.isAdmin()) {
        deleteBtn.classList.add('hidden');
      } else {
        deleteBtn.classList.remove('hidden');
      }
      
      return card;
    }
    
    /**
     * Create appropriate preview for a resource based on its type
     */
    function createResourcePreview(container, resource) {
      container.innerHTML = '';
      
      if (resource.type === 'Imagen') {
        const img = document.createElement('img');
        img.src = resource.content;
        img.alt = resource.title;
        container.appendChild(img);
      } else if (resource.type === 'Video') {
        const videoThumb = document.createElement('div');
        videoThumb.className = 'document-preview';
        videoThumb.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 8H2v12a2 2 0 0 0 2 2h12v-2H4V8z"/>
            <path d="M20 2H8a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm-9 12V6l7 4-7 4z"/>
          </svg>
          <span>${resource.fileName}</span>
        `;
        container.appendChild(videoThumb);
      } else if (resource.type === 'Audio') {
        const audioThumb = document.createElement('div');
        audioThumb.className = 'document-preview';
        audioThumb.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span>${resource.fileName}</span>
        `;
        container.appendChild(audioThumb);
      } else {
        // Generic document preview
        const docThumb = document.createElement('div');
        docThumb.className = 'document-preview';
        docThumb.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zM6 20V4h7v5h5v11H6z"/>
          </svg>
          <span>${resource.fileName}</span>
        `;
        container.appendChild(docThumb);
      }
    }
    
    /**
     * Open modal with resource content
     */
    function openResourceModal(resource) {
      modalTitle.textContent = resource.title;
      modalContent.innerHTML = '';
      
      if (resource.type === 'Imagen') {
        const img = document.createElement('img');
        img.src = resource.content;
        img.alt = resource.title;
        modalContent.appendChild(img);
      } else if (resource.type === 'Video') {
        const video = document.createElement('video');
        video.src = resource.content;
        video.controls = true;
        video.autoplay = false;
        modalContent.appendChild(video);
      } else if (resource.type === 'Audio') {
        const audio = document.createElement('audio');
        audio.src = resource.content;
        audio.controls = true;
        modalContent.appendChild(audio);
      } else if (resource.type === 'PDF') {
        const iframe = document.createElement('iframe');
        iframe.src = resource.content;
        iframe.width = '100%';
        iframe.height = '600px';
        modalContent.appendChild(iframe);
      } else {
        // For other file types, offer download
        const downloadLink = document.createElement('a');
        downloadLink.href = resource.content;
        downloadLink.download = resource.fileName;
        downloadLink.className = 'btn-primary';
        downloadLink.textContent = `Descargar ${resource.fileName}`;
        modalContent.appendChild(downloadLink);
      }
      
      // Show modal
      modal.classList.add('active');
    }
    
    /**
     * Close the resource modal
     */
    function closeResourceModal() {
      modal.classList.remove('active');
      
      // Clear modal content after animation completes
      setTimeout(() => {
        modalContent.innerHTML = '';
      }, 300);
    }
    
    // Public API
    return {
      renderResources
    };
  }