import { supabase } from './supabaseClient.js';

// Verificación de sesión activa
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirigir al login si no hay sesión
        window.location.href = '/LP_Esp/html/login.html';
        return;
    }
});