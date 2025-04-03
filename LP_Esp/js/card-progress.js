document.addEventListener("DOMContentLoaded", () => {
    const progressContainers = document.querySelectorAll('.main__module-cards-progress-container');

    progressContainers.forEach(container => {
    const progressBar = container.querySelector('.main__module-cards-progress-bar');
    const progressText = container.querySelector('.main__module-cards-progress-text');
    
      // Obtenemos la cadena que indica el ancho, p. ej. "65%"
    const progressValue = progressBar.style.width; // "65%"
    
      // Extraemos solo el número (ej: 65) para luego volver a agregar el símbolo
    const numericValue = parseInt(progressValue, 10);
    
      // Mostramos “65% completado” (o lo que corresponda) debajo de la barra
    progressText.textContent = `${numericValue}% completado`;
    });
});
