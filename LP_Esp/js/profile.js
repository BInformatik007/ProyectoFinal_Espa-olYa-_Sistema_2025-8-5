
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

// Función de línea de tiempo para el perfil

document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressCircles = document.querySelectorAll('.profile__progress-circle');
    const lineFills = document.querySelectorAll('.profile__progress-line-fill');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        const numericValue = parseInt(width, 10) || 0;

        // Mostrar el texto correspondiente
        if (progressTexts[index]) {
            progressTexts[index].textContent = `${numericValue}% completado`;
        }

        // Activar el primer círculo siempre
        if (index === 0 && progressCircles[0]) {
            progressCircles[0].classList.add('active');
        }

        // Llenar la línea hacia el siguiente círculo
        if (lineFills[index]) {
            lineFills[index].style.height = `${numericValue}%`;
        }

        // Si el nivel actual está al 100%, activar el siguiente círculo
        if (numericValue === 100 && progressCircles[index + 1]) {
            progressCircles[index + 1].classList.add('active');
        }
    });
});
