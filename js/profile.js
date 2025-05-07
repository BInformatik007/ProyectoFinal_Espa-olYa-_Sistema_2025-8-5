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
        .select('first_name, last_name, profile_picture, registered_at')
        .eq('id', userId)
        .single();

    if (userError || !userData) {
        console.error('Error al obtener datos del usuario:', userError);
        return;
    }

    // Calcular días desde el registro
    const firstLogin = new Date(userData.registered_at);
    const today = new Date();
    let diasLogueado = Math.ceil((today - firstLogin) / (1000 * 60 * 60 * 24));
    if (diasLogueado < 1) diasLogueado = 1;

    document.getElementById('profile__data-lessons-days').textContent = diasLogueado;

    // Obtener minutos estudiados sumando duración de las sesiones
    const { data: sessions, error: sessionsError } = await supabase
    .from('lesson_sessions')
    .select('started_at, ended_at')
    .eq('user_id', userId);

    let totalMinutes = 0;

    if (sessions && !sessionsError) {
    sessions.forEach(session => {
        const start = new Date(session.started_at);
        const end = new Date(session.ended_at);
        const minutes = Math.floor((end - start) / 60000); // 60000 ms = 1 minuto
        if (minutes > 0) totalMinutes += minutes;
    });
    }

    document.getElementById('profile__statistics-value-minutes').textContent = totalMinutes;

    // Obtener insignias obtenidas
    const { data: userBadges, error: badgeError } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', userId);

    const totalBadges = userBadges?.length || 0;
    document.getElementById('profile__statistics-value-insignia').textContent = totalBadges;


    // 👤 Mostrar nombre e imagen
    const fullName = `${userData.first_name} ${userData.last_name}`;
    userNameElement.textContent = fullName;
    userImage.src = userData.profile_picture || "../media/img/avatar_img/default-avatar-img.png";

    await actualizarPuntosLeccionesYNivel(userId);
    await actualizarProgresoPorModulo(userId);
    await cargarInsignias(userId);

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

    
    // 🔓 Verificar insignias desbloqueadas
    await verificarInsignias(userId, totalPuntos);
    await mostrarInsignias(userId);
// Lecciones completadas
    const leccionesSuperiores = document.querySelectorAll('#profile__data-lessons-lessons');
    leccionesSuperiores.forEach(el => el.textContent = `${totalLecciones}`);

    const leccionesCaja = document.querySelectorAll('.profile__statistics-box')[0].querySelector('#profile__statistics-value-lessons');
    if (leccionesCaja) leccionesCaja.textContent = `${totalLecciones}`;
}

function obtenerNivelUsuario(puntos) {
    if (puntos >= 30000) return "Experto";
    if (puntos >= 20000) return "Avanzado";
    if (puntos >= 6000) return "Intermedio";
    if (puntos >= 900) return "Aprendiz";
    return "Principiante";
}

// Verifica e inserta insignias desbloqueadas
async function verificarInsignias(userId, totalPoints) {
    const { data: todasLasInsignias, error: errorInsignias } = await supabase
        .from('badges')
        .select('*');

    if (errorInsignias) {
        console.error('Error al obtener insignias:', errorInsignias);
        return;
    }

    const { data: insigniasDesbloqueadas } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

    const idsDesbloqueadas = insigniasDesbloqueadas?.map(b => b.badge_id) || [];

    const nuevasInsignias = todasLasInsignias.filter(badge =>
        totalPoints >= badge.required_points && !idsDesbloqueadas.includes(badge.id)
    );

    for (const badge of nuevasInsignias) {
        await supabase.from('user_badges').insert({
            user_id: userId,
            badge_id: badge.id
        });
        console.log(`Insignia desbloqueada: ${badge.name}`);
    }

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

// ------------------ Barras de Progreso ------------------
document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        const numericValue = parseInt(width, 10) || 0;

        if (progressTexts[index]) {
            progressTexts[index].textContent = `${numericValue}% completado`;
        }
    });
});

// ------------------ Línea de Tiempo ------------------
document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressCircles = document.querySelectorAll('.profile__progress-circle');
    const lineFills = document.querySelectorAll('.profile__progress-line-fill');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        const numericValue = parseInt(width, 10) || 0;

        if (progressTexts[index]) {
            progressTexts[index].textContent = `${numericValue}% completado`;
        }

        if (index === 0 && progressCircles[0]) {
            progressCircles[0].classList.add('active');
        }

        if (lineFills[index]) {
            lineFills[index].style.height = `${numericValue}%`;
        }

        if (numericValue === 100 && progressCircles[index + 1]) {
            progressCircles[index + 1].classList.add('active');
        }
    });
});

// ------------------ Layouts ------------------
document.getElementById('profile__edit-profile').addEventListener('click', () => {
    document.getElementById('edit-profile-modal').classList.remove('hidden');
});

document.getElementById('close-edit-profile').addEventListener('click', () => {
    document.getElementById('edit-profile-modal').classList.add('hidden');
});

document.getElementById('profile__config-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('hidden');
});

document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
});

// ------------------ Cerrar sesión ------------------
document.getElementById('logout').addEventListener('click', async () => {
    const { error } = await supabase.auth.signOut();

    localStorage.removeItem('user_role');

    if (error) {
        alert('Error al cerrar sesión: ' + error.message);
    } else {
        window.location.href = '../html/login.html';
    }
});


// Verificación de sesión activa
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirigir al login si no hay sesión
        window.location.href = '../html/login.html';
        return;
    }
});

// ------------------ Mostrar botón solo a profesores ------------------
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return;

    const userId = session.user.id;

    const { data: user, error: userError } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', userId)
        .single();

    if (userError || !user) return;

    const { data: role, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', user.role_id)
        .single();

    if (roleError || !role) return;

    if (role.name === 'teacher') {
        const teacherPanelBtn = document.getElementById('go-to-teacher-panel');
        if (teacherPanelBtn) {
            teacherPanelBtn.classList.remove('hidden');
            teacherPanelBtn.addEventListener('click', () => {
                window.location.href = '../html/teacher-panel.html';
            });
        }
    }
});

// ------------------ Función para cargar insignias ------------------
async function mostrarInsignias(userId) {
    const { data: todas, error: e1 } = await supabase.from('badges').select('*');
    const { data: obtenidas, error: e2 } = await supabase
        .from('user_badges')
        .select('badge_id')
        .eq('user_id', userId);

    if (e1 || e2) {
        console.error('Error al cargar insignias:', e1 || e2);
        return;
    }

    const obtenidasIds = obtenidas.map(b => b.badge_id);
    const container = document.getElementById('insignia-container');
    container.innerHTML = '';

    todas.forEach(badge => {
        const div = document.createElement('div');
        div.classList.add('profile__insignia-box');

        if (obtenidasIds.includes(badge.id)) {
            div.classList.add('profile__insignia-box', 'unlocked');
            div.innerHTML = `
                <div class="profile__insignia-img-container unlocked">
                    <i class="fa-solid fa-award profile__insignia-icons"></i>
                </div>
                <p class="profile__insignia-name">${badge.name}</p>
                <p class="profile__insignia-description">${badge.description}</p>
            `;
        } else {
            div.classList.add('profile__insignia-box', 'locked');
            div.innerHTML = `
                <div class="profile__insignia-img-container locked">
                    <i class="fa-solid fa-lock profile__insignia-icons"></i>
                </div>
                <p class="profile__insignia-name">${badge.name}</p>
                <p class="profile__insignia-required">🔒 ${badge.required_points} pts</p>
            `;
        }
        

        container.appendChild(div);
    });
}

document.getElementById('trigger-file-upload').addEventListener('click', () => {
    document.getElementById('new-profile-pic').click();
});

document.getElementById('save-profile').addEventListener('click', async () => {
    const fileInput = document.getElementById('new-profile-pic');
    const file = fileInput.files[0];

    if (!file) {
        alert('Selecciona una imagen primero.');
        return;
    }

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (!session || sessionError) {
        console.error('No hay sesión activa.');
        return;
    }

    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = `${fileName}`;

    // Subir imagen al bucket
    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
            upsert: true,
            contentType: file.type
        });

    if (uploadError) {
        console.error('Error al subir la imagen:', uploadError.message);
        alert('Error al subir la imagen.');
        return;
    }

    // Obtener URL pública
    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    // Actualizar URL en tabla users
    const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', userId);

    if (updateError) {
        console.error('Error al actualizar perfil:', updateError.message);
        alert('Error al guardar la imagen de perfil.');
        return;
    }

    // Mostrar la nueva imagen en el perfil
    document.querySelector('.profile__profile-img').src = publicUrl;

    alert('Imagen de perfil actualizada con éxito.');
});
