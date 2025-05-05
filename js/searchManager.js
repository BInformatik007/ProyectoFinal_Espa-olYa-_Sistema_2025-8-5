/**
 * Search Manager Module
 * Handles searching and filtering of resources
 */

export function initSearchManager(fileManager, uiManager) {
    // DOM elements
    const searchInput = document.getElementById('searchInput');
    
    // Set up event listeners
    setupEventListeners();
    
    /**
     * Set up all event listeners for search functionality
     */
    function setupEventListeners() {
      searchInput.addEventListener('input', handleSearch);
    }
    
    /**
     * Handle search input and filter resources
     */
    function handleSearch(e) {
      const searchTerm = e.target.value.trim().toLowerCase();
      const allResources = fileManager.getAllResources();
      
      if (!searchTerm) {
        // If search term is empty, show all resources
        uiManager.renderResources(allResources);
        return;
      }
      
      // Filter resources based on search term
      const filteredResources = allResources.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm)
      );
      
      // Render filtered resources
      uiManager.renderResources(filteredResources, true);
    }
    
    // Public API
    return {
      // No methods needed to be exposed for now
    };
  }