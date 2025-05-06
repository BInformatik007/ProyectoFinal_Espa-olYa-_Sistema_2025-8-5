import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        window.location.href = '../html/login.html';
        return;
    }

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

    if (roleData.name !== 'teacher') {
        document.querySelectorAll('.only-teacher').forEach(el => el.style.display = 'none');
    }

    const moduleMap = {
        "El ensayo": [1, 2, 3, 4, 5, 6, 7, 8, 9],
        "La reseña literaria": [10, 11, 12, 13, 14, 15, 16, 17, 18],
        "El entremés": [19, 20, 21, 22, 23, 24, 25, 26, 27],
        "La poesía sorprendida": [28, 29, 30, 31, 32, 33, 34, 35, 36],
        "La carta de autopresentación": [37, 38, 39, 40, 41, 42, 43, 44, 45]
    };

    const { data: completedLessons, error: completedError } = await supabase
        .from('completed_lessons')
        .select('lesson_id')
        .eq('user_id', session.user.id);

    if (completedError) {
        console.error("Error al obtener lecciones completadas:", completedError.message);
        return;
    }

    const completedIds = completedLessons.map(l => l.lesson_id);

    const moduleCards = document.querySelectorAll('.main__module-cards');

    moduleCards.forEach(card => {
        const title = card.querySelector('.main__module-cards-title')?.textContent.trim();
        const progressBar = card.querySelector('.main__module-cards-progress-bar');

        if (!title || !progressBar) return;

        const lessonIds = moduleMap[title];
        const total = lessonIds.length;
        const completed = lessonIds.filter(id => completedIds.includes(id)).length;
        const progressValue = Math.round((completed / total) * 100);

        progressBar.style.width = `${progressValue}%`;

        if (progressValue === 100) {
            progressBar.style.backgroundColor = '#4CAF50';
        } else if (progressValue >= 50) {
            progressBar.style.backgroundColor = '#FFC107';
        } else {
            progressBar.style.backgroundColor = '#F44336';
        }

        let progressText = card.querySelector('.main__module-cards-progress-text');
        if (!progressText) {
            progressText = document.createElement('p');
            progressText.className = 'main__module-cards-progress-text';
            progressBar.parentElement.appendChild(progressText);
        }
        progressText.textContent = `${progressValue}% completado`;
    });
});

