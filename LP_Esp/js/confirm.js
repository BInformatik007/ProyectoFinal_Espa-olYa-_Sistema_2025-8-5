let seconds = 10;
const countdown = document.getElementById("countdown");
const loginBtn = document.getElementById("confirm-login__btn");

// Actualiza el texto del contador cada segundo
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
// Reemplaza en lugar de guardar en historial
    window.location.replace("/LP_Esp/html/login.html");
}

loginBtn.addEventListener("click", function (e) {
    e.preventDefault();
    redirectToLogin();
});
