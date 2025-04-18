
// Función de pestañas para el perfil

document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".profile__tab-button");
    const tabContents = document.querySelectorAll(".profile__tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            // Eliminar clase activa de todos
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(tab => tab.classList.remove("active"));

            // Activar el botón y el contenido correspondiente
            button.classList.add("active");
            document.getElementById(button.getAttribute("data-tab")).classList.add("active");
        });
    });
});

// Función de barras de progreso para el perfil

document.addEventListener("DOMContentLoaded", () => {
    const progressContainers = document.querySelectorAll('.profile__main-progress-bar-container');

    progressContainers.forEach(container => {
    const progressBar = container.querySelector('.profile__main-progress-bar');
    const progressText = container.querySelector('.profile__main-progress-text');
    
      // Obtenemos la cadena que indica el ancho, p. ej. "65%"
    const progressValue = progressBar.style.width; // "65%"
    
      // Extraemos solo el número (ej: 65) para luego volver a agregar el símbolo
    const numericValue = parseInt(progressValue, 10);
    
      // Mostramos “65% completado” (o lo que corresponda) debajo de la barra
    progressText.textContent = `${numericValue}% completado`;
    });
});