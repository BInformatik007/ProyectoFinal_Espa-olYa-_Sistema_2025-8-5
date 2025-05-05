import { supabase } from '../js/supabaseClient.js';

export async function requireRole(allowedRoles) {
    try {
        // Obtener la sesión del usuario
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
            console.error("Error obteniendo sesión:", sessionError);
            window.location.href = '../index.html';
            return null;
        }

        const userId = session.user.id;

        // Obtener el rol del usuario
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role_id')
            .eq('id', userId)
            .single();

        if (userError || !userData) {
            console.error("Error obteniendo usuario:", userError);
            window.location.href = '../html/unauthorized.html';
            return null;
        }

        // Obtener el nombre del rol
        const { data: roleData, error: roleError } = await supabase
            .from('roles')
            .select('name')
            .eq('id', userData.role_id)
            .single();

        if (roleError || !roleData) {
            console.error("Error obteniendo rol:", roleError);
            window.location.href = '../html/unauthorized.html';
            return null;
        }

        // Verificar si el rol está permitido
        if (!allowedRoles.includes(roleData.name)) {
            console.warn("Acceso denegado para:", roleData.name);
            window.location.href = '../html/unauthorized.html';
            return null;
        }

        // Retornar el rol si todo está correcto
        return roleData.name;
    } catch (error) {
        console.error("Error inesperado en requireRole:", error);
        window.location.href = '../html/login.html';
        return null;
    }
}
