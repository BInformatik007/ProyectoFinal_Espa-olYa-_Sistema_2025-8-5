import { supabase } from '../js/supabaseClient.js';

export async function requireRole(allowedRoles) {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session?.user) {
        window.location.href = '../html/login.html';
        return;
    }

    const userId = session.user.id;

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role_id')
        .eq('id', userId)
        .single();

    if (userError || !userData) {
        console.error("Error obteniendo usuario:", userError);
        window.location.href = '../html/unauthorized.html';
        return;
    }

    const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('name')
        .eq('id', userData.role_id)
        .single();

    if (roleError || !roleData) {
        console.error("Error obteniendo rol:", roleError);
        window.location.href = '../html/unauthorized.html';
        return;
    }

    if (!allowedRoles.includes(roleData.name)) {
        console.warn("Acceso denegado para:", roleData.name);
        window.location.href = '../html/unauthorized.html';
    }
}
