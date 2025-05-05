import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = '../html/login.html';
        return;
    }

    // Obtener rol del usuario
    const { data: userData } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', session.user.id)
        .single();

    const { data: roleData } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userData.role_id)
        .single();

    // Ocultar secciones si no es profesor
    if (roleData.name !== 'teacher') {
        document.querySelectorAll('.only-teacher').forEach(el => el.style.display = 'none');
    }

    // Código actual de progreso
    const progressContainers = document.querySelectorAll('.main__module-cards-progress-container');

    progressContainers.forEach(container => {
        const progressBar = container.querySelector('.main__module-cards-progress-bar');
        const progressText = container.querySelector('.main__module-cards-progress-text');

        const progressValue = progressBar.style.width;
        const numericValue = parseInt(progressValue, 10);
        progressText.textContent = `${numericValue}% completado`;
    });
});
