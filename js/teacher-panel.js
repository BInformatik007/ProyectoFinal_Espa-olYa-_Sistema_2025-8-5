
import { supabase } from './supabaseClient.js';
import { requireRole } from './auth.js';

// Solo acceso a profesores
requireRole(['teacher']);

// Cargar estudiantes desde la base de datos
export async function loadStudents() {
    const table = document.getElementById("students-table");
    const body = document.getElementById("students-body");

    table.style.display = "table";
    body.innerHTML = `<tr><td colspan="5" class="no-data">Cargando estudiantes...</td></tr>`;

    // Paso 1: Obtener usuarios con rol de estudiante
    const { data: users, error: userError } = await supabase
        .from('users')
        .select('id, enrollment, first_name, last_name, email, role_id')
        .eq('role_id', 1); // Estudiantes

    if (userError || !users) {
        body.innerHTML = `<tr><td colspan="5" class="no-data">Error al cargar usuarios.</td></tr>`;
        console.error('Error al obtener estudiantes:', userError);
        return;
    }

    if (users.length === 0) {
        body.innerHTML = `<tr><td colspan="5" class="no-data">No hay estudiantes registrados.</td></tr>`;
        return;
    }

    // Paso 2: Obtener datos de completed_lessons
    const { data: completions, error: compError } = await supabase
        .from('completed_lessons')
        .select('user_id, score');

    if (compError) {
        body.innerHTML = `<tr><td colspan="5" class="no-data">Error al cargar estadísticas.</td></tr>`;
        console.error('Error al obtener datos de lecciones completadas:', compError);
        return;
    }

    // Paso 3: Calcular puntos totales y número de lecciones por usuario
    const statsMap = {};
    completions.forEach(entry => {
        if (!statsMap[entry.user_id]) {
            statsMap[entry.user_id] = { total_points: 0, total_lessons: 0 };
        }
        statsMap[entry.user_id].total_points += entry.score;
        statsMap[entry.user_id].total_lessons += 1;
    });

    // Paso 4: Renderizar datos combinados
    body.innerHTML = '';
    users.forEach(user => {
        const stats = statsMap[user.id] || { total_points: 0, total_lessons: 0 };
        body.innerHTML += `
            <tr>
                <td>${user.enrollment}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${stats.total_lessons} lecciones</td>
                <td>${stats.total_points}</td>
            </tr>
        `;
    });
}

// Exponer la función globalmente para usar con onclick
window.loadStudents = loadStudents;
