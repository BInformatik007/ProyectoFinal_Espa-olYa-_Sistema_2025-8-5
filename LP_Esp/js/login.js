import { supabase } from './supabaseClient.js';

// -------------------- Cambio visual entre formularios --------------------
function toggleForm(form) {
    const container = document.querySelector('.container');
    const loginContent = document.querySelector('.login-content');
    const registerContent = document.querySelector('.register-content');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const circles = document.querySelectorAll('.circle-bg');

    if (form === 'register') {
        container.classList.add('register-mode');
        loginContent.classList.add('hidden');
        registerContent.classList.remove('hidden');
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        circles.forEach(circle => circle.style.transform = 'scale(1.2) rotate(180deg)');
    } else {
        container.classList.remove('register-mode');
        registerContent.classList.add('hidden');
        loginContent.classList.remove('hidden');
        registerForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
        circles.forEach(circle => circle.style.transform = 'scale(1) rotate(0)');
    }
}

window.toggleForm = toggleForm;

// -------------------- Función de Registro --------------------
async function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const enrollment = formData.get('enrollment');
    const first_name = formData.get('first_name');
    const last_name = formData.get('last_name');
    const email = formData.get('email');
    const password = formData.get('password');

    // Crear usuario en Supabase Auth
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: 'http://127.0.0.1:5500/LP_Esp/html/confirm.html'  // ✅ Ruta correcta
        }
    });

    if (signUpError) {
        alert('Error al registrarse: ' + signUpError.message);
        return;
    }

    // Esperar a que el usuario esté registrado y confirmado
    const user = signUpData?.user;
    if (!user) {
        alert('No se pudo registrar correctamente el usuario.');
        return;
    }

    // Insertar los datos en tu tabla "users"
    const { error: insertError } = await supabase.from('users').insert({
        id: user.id, // ✅ Este ID debe coincidir con auth.users.id
        enrollment,
        first_name,
        last_name,
        email,
        profile_picture: '../media/img/avatar_img/default-avatar-img.png',
        registered_at: new Date().toISOString()
    });

    if (insertError) {
        alert('Error al guardar información adicional: ' + insertError.message);
        return;
    }

    alert('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
    form.reset();
    toggleForm('login');
}

// -------------------- Función de Login --------------------
async function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);

    const enrollment = formData.get('enrollment');
    const password = formData.get('password');

    // Buscar el correo asociado a la matrícula
    const { data: userRecord, error: lookupError } = await supabase
        .from('users')
        .select('email')
        .eq('enrollment', enrollment)
        .single();

    if (lookupError || !userRecord) {
        alert('Matrícula no registrada.');
        console.log("Resultado de búsqueda:", userRecord, "Error:", lookupError);
        return;
    }

    // Iniciar sesión en Supabase Auth con el correo obtenido
    const { data: session, error: loginError } = await supabase.auth.signInWithPassword({
        email: userRecord.email,
        password
    });

    if (loginError) {
        alert('Error al iniciar sesión: ' + loginError.message);
        return;
    }

    alert('¡Inicio de sesión exitoso!');
    form.reset();
    window.location.href = '/LP_Esp/html/index.html';
}

// -------------------- Eventos --------------------
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registrationForm = document.getElementById('registrationForm');

    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    if (registrationForm) registrationForm.addEventListener('submit', handleRegistration);
});
