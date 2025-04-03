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