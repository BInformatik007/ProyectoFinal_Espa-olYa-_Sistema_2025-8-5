
// Función para filtrar lecciones por título o categoría

function filtrarLecciones() {
    let input = document.querySelector('.main__filter-input').value.toLowerCase();
    let tarjetas = document.querySelectorAll(".main__lessons-cards");

    tarjetas.forEach(tarjeta => {
        let titulo = tarjeta.querySelector(".main__lessons-cards-content-title").textContent.toLowerCase();
        let categoria = tarjeta.querySelector(".main__lessons-cards-content-category").textContent.toLowerCase();

        if (titulo.includes(input) || categoria.includes(input)) {
            tarjeta.style.display = "block";
        } else {
            tarjeta.style.display = "none";
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
    const botonesFiltro = document.querySelectorAll(".main__filters");
    const lecciones = document.querySelectorAll(".main__lessons-cards");

    botonesFiltro.forEach(boton => {
        boton.addEventListener("click", () => {
            const categoria = boton.textContent.trim();

            lecciones.forEach(leccion => {
                const categoriaLeccion = leccion.querySelector(".main__lessons-cards-content-category").textContent.trim();
                if (categoria === "Buscar lecciones..." || categoria === "") {
                    leccion.style.display = "block"; // Mostrar todo si no hay categoría válida
                } else if (categoriaLeccion === categoria) {
                    leccion.style.display = "block";
                } else {
                    leccion.style.display = "none";
                }
            });
        });
    });
});

if (categoria === "") {
    lecciones.forEach(leccion => leccion.style.display = "block");
}