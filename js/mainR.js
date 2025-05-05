import { initAuth } from './auth.js';
import { initFileManager } from './fileManager.js';
import { initSearchManager } from './searchManager.js';
import { initUIManager } from './uiManager.js';

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  const role = await initAuth();
  if (!role) return; // User not authenticated
  
  const fileManager = initFileManager();
  const uiManager = initUIManager(role, fileManager);
  const searchManager = initSearchManager(fileManager, uiManager);
  
  // Load resources from Supabase
  fileManager.loadResources();
});