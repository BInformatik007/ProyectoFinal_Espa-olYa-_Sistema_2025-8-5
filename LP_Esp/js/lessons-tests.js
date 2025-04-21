import { supabase } from './supabaseClient.js';

// Función para que el preview tome el título y descripción de la lección.

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const lessonId = urlParams.get('id');

    if (!lessonId) {
        console.error("No se especificó ningún ID de lección.");
        return;
    }

    const { data, error } = await supabase
        .from('lessons')
        .select('title, description')
        .eq('id', lessonId)
        .single();

    if (error) {
        console.error('Error al obtener la lección:', error.message);
        return;
    }

    // Asignamos el título y la descripción al HTML
    document.querySelector('.main-lessons-tests__preview-title').textContent = data.title;
    document.querySelector('.main-lessons-tests__preview-text').textContent = data.description;
});
