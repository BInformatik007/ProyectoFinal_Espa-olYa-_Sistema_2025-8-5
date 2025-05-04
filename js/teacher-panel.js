import { supabase } from './supabaseClient.js';
import { requireRole } from './auth.js';

// 🔒 Solo acceso a profesores
requireRole(['teacher']);

// 🔁 Cargar estudiantes desde la base de datos
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

    // Paso 2: Obtener estadísticas de todos los usuarios
    const { data: stats, error: statsError } = await supabase
        .from('statistics')
        .select('user_id, total_points, total_lessons');

    if (statsError) {
        body.innerHTML = `<tr><td colspan="5" class="no-data">Error al cargar estadísticas.</td></tr>`;
        console.error('Error al obtener estadísticas:', statsError);
        return;
    }

    // Paso 3: Mostrar datos combinados
    body.innerHTML = '';
    users.forEach(user => {
        const stat = stats.find(s => s.user_id === user.id);
        body.innerHTML += `
            <tr>
                <td>${user.enrollment}</td>
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${stat?.total_points ?? 0}</td>
                <td>${stat?.total_lessons ?? 0} lecciones</td>
            </tr>
        `;
    });
}

// Exponer la función globalmente para usar con onclick
window.loadStudents = loadStudents;
