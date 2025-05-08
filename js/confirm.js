import { supabase } from './supabaseClient.js';

let seconds = 10;
const countdown = document.getElementById("countdown");
const loginBtn = document.getElementById("confirm-login__btn");

if (window.location.hash && !window.location.search) {
    const hash = window.location.hash.substring(1); // Elimina el '#'
    const newUrl = window.location.pathname + '?' + hash;
    window.location.replace(newUrl);
}

// Verificar si Supabase ha procesado correctamente el token
document.addEventListener("DOMContentLoaded", async () => {
    const url = new URL(window.location.href);
    const accessToken = url.searchParams.get('access_token');
    const refreshToken = url.searchParams.get('refresh_token');

    if (accessToken && refreshToken) {
        const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        });

        if (error) {
            console.error("Error al establecer sesión:", error.message);
        } else {
            console.log("Sesión establecida exitosamente con Supabase.");
        }

        // Opcional: limpia los parámetros de la URL
        window.history.replaceState({}, document.title, "/html/confirm.html");
    }
});

// Cuenta regresiva visual
const interval = setInterval(() => {
    seconds--;
    countdown.textContent = seconds;

    if (seconds === 0) {
        clearInterval(interval);
        redirectToLogin();
    }
}, 1000);

// Redirección manual o automática
function redirectToLogin() {
    window.location.replace("../html/login.html");
}

loginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    redirectToLogin();
});
