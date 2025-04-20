// index.js
import { supabase } from './supabaseClient.js';

// Verificación de sesión activa
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirigir al login si no hay sesión
        window.location.href = '/LP_Esp/html/login.html';
        return;
    }

    // (Aquí va tu código actual para las barras de progreso ↓)
    const progressContainers = document.querySelectorAll('.main__module-cards-progress-container');

    progressContainers.forEach(container => {
        const progressBar = container.querySelector('.main__module-cards-progress-bar');
        const progressText = container.querySelector('.main__module-cards-progress-text');

        const progressValue = progressBar.style.width;
        const numericValue = parseInt(progressValue, 10);
        progressText.textContent = `${numericValue}% completado`;
    });
});
