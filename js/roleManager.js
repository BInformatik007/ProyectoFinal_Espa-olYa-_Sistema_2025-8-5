/**
 * Role Manager Module
 * Handles the role-based functionality of the application
 */

export function initRoleManager() {
    // Initial role (default to Usuario)
    let currentRole = localStorage.getItem('currentRole') || 'Usuario';
    
    // DOM elements
    const roleSelector = document.getElementById('role');
    const adminPanel = document.getElementById('admin-panel');
    
    // Set initial role in the selector
    roleSelector.value = currentRole;
    
    // Role change handler
    roleSelector.addEventListener('change', (e) => {
      currentRole = e.target.value;
      localStorage.setItem('currentRole', currentRole);
      updateUI();
    });
    
    /**
     * Updates the UI based on the current role
     */
    function updateUI() {
      if (currentRole === 'teacher') {
        adminPanel.classList.remove('hidden');
        showAdminActions();
      } else {
        adminPanel.classList.add('hidden');
        hideAdminActions();
      }
    }
    
    /**
     * Shows admin-specific UI elements
     */
    function showAdminActions() {
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.classList.remove('hidden');
      });
    }
    
    /**
     * Hides admin-specific UI elements
     */
    function hideAdminActions() {
      document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.classList.add('hidden');
      });
    }
    
    /**
     * Checks if the current user is an administrator
     * @returns {boolean} True if the user is an administrator
     */
    function isAdmin() {
      return currentRole === 'teacher';
    }
    
    // Public API
    return {
      isAdmin,
      updateUI,
      getCurrentRole: () => currentRole
    };
  }