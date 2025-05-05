import { supabase } from './supabaseClient.js';

document.addEventListener("DOMContentLoaded", async () => {
    const userNameElement = document.querySelector('.profile__user-name');
    const userImage = document.querySelector('.profile__profile-img');

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
        console.error('No hay sesión activa o hubo un error al obtenerla');
        return;
    }

    const userId = session.user.id;

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, profile_picture')
        .eq('id', userId)
        .single();

    if (userError || !userData) {
        console.error('Error al obtener datos del usuario:', userError);
        return;
    }

    const fullName = `${userData.first_name} ${userData.last_name}`;
    userNameElement.textContent = fullName;
    userImage.src = userData.profile_picture || "../media/img/avatar_img/default-avatar-img.png";

    await actualizarPuntosLeccionesYNivel(userId);
    await actualizarProgresoPorModulo(userId);
});

// ------------------ Puntos, Lecciones y Nivel ------------------

async function actualizarPuntosLeccionesYNivel(userId) {
    const { data, error } = await supabase
        .from('completed_lessons')
        .select('score')
        .eq('user_id', userId);

    if (error) {
        console.error('Error al obtener puntos:', error.message);
        return;
    }

    const totalPuntos = data.reduce((acc, row) => acc + row.score, 0);
    const totalLecciones = data.length;
    const nivel = obtenerNivelUsuario(totalPuntos);

    // Nivel
    document.querySelector('.profile__user-level').textContent = nivel;

    // Puntuación
    document.querySelector('#profile__data-lessons-points').textContent = `${totalPuntos}`;
    document.querySelector('#profile__statistics-value-points').textContent = `${totalPuntos}`;

    // Lecciones completadas
    const leccionesSuperiores = document.querySelectorAll('#profile__data-lessons-lessons');
    leccionesSuperiores.forEach(el => el.textContent = `${totalLecciones}`);

    const leccionesCaja = document.querySelectorAll('.profile__statistics-box')[0].querySelector('#profile__statistics-value-lessons');
    if (leccionesCaja) leccionesCaja.textContent = `${totalLecciones}`;
}

function obtenerNivelUsuario(puntos) {
    if (puntos >= 20000) return "Experto";
    if (puntos >= 15000) return "Avanzado";
    if (puntos >= 4000) return "Intermedio";
    if (puntos >= 900) return "Aprendiz";
    return "Principiante";
}

// ------------------ Progreso por Módulo ------------------

async function actualizarProgresoPorModulo(userId) {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    const { data: completed, error: completedError } = await supabase
        .from('completed_lessons')
        .select('lesson_id')
        .eq('user_id', userId);

    if (completedError || !completed) {
        console.error('Error al obtener lecciones completadas:', completedError);
        return;
    }

    const lessonIds = completed.map(cl => cl.lesson_id);

    const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id, module_name');

    if (lessonsError || !lessons) {
        console.error('Error al obtener lecciones:', lessonsError);
        return;
    }

    const moduleProgress = {};
    for (let lesson of lessons) {
        if (lessonIds.includes(lesson.id)) {
            moduleProgress[lesson.module_name] = (moduleProgress[lesson.module_name] || 0) + 1;
        }
    }

    const moduleNames = ["El ensayo", "La reseña literaria", "El entremés", "La poesía sorprendida", "La carta de autopresentación"];
    moduleNames.forEach((name, index) => {
        const completedCount = moduleProgress[name] || 0;
        let percent = Math.min(100, Math.round((completedCount / 9) * 100));
        progressBars[index].style.width = percent + "%";
        progressTexts[index].textContent = `${percent}% completado`;
    });

    // Activar círculos
    const progressCircles = document.querySelectorAll('.profile__progress-circle');
    const lineFills = document.querySelectorAll('.profile__progress-line-fill');
    progressBars.forEach((bar, index) => {
        const percent = parseInt(bar.style.width, 10);
        if (index === 0) {
            progressCircles[0].classList.add('active');
        }
        if (lineFills[index]) {
            lineFills[index].style.height = `${percent}%`;
        }
        if (percent === 100 && progressCircles[index + 1]) {
            progressCircles[index + 1].classList.add('active');
        }
    });
}

// ------------------ Pestañas ------------------

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".profile__tab-button");
    const tabContents = document.querySelectorAll(".profile__tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            const targetTab = button.getAttribute("data-tab");

            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(tab => tab.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(targetTab).classList.add("active");
        });
    });
});
