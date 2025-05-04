import { supabase } from './supabaseClient.js';

// Variables para filtros activos
let filtroCategoria = null;
let filtroNivel = null;

// -------------------- FILTRADO GENERAL --------------------
function filtrarLecciones() {
    const input = document.querySelector('.main__filter-input').value.toLowerCase().trim();
    const tarjetas = document.querySelectorAll(".main__lessons-cards");
    let resultadosEncontrados = false;

    tarjetas.forEach(tarjeta => {
        const titulo = tarjeta.querySelector(".main__lessons-cards-content-title").textContent.toLowerCase();
        const categoria = tarjeta.querySelector(".main__lessons-cards-content-category").textContent.toLowerCase();
        const descripcion = tarjeta.querySelector(".main__lessons-cards-content-description").textContent.toLowerCase();
        const nivel = tarjeta.getAttribute("data-level")?.toLowerCase();

        const coincideCategoria = !filtroCategoria || categoria === filtroCategoria.toLowerCase();
        const coincideNivel = !filtroNivel || nivel === filtroNivel.toLowerCase();
        const coincideTexto = !input || titulo.includes(input) || categoria.includes(input) || descripcion.includes(input);

        if (coincideCategoria && coincideNivel && coincideTexto) {
            tarjeta.style.display = "block";
            resultadosEncontrados = true;
        } else {
            tarjeta.style.display = "none";
        }
    });

    mostrarMensajeSinResultados(!resultadosEncontrados && (input || filtroCategoria || filtroNivel));
}

// -------------------- FILTRO POR CATEGORÍA --------------------
document.getElementById('categoriaSelect').addEventListener('change', function () {
    const seleccion = this.value;
    filtroCategoria = seleccion === '' ? null : seleccion;
    filtrarLecciones();
});

// -------------------- FILTRO POR NIVEL --------------------
document.querySelectorAll('.main__filter-nivel').forEach(boton => {
    boton.addEventListener('click', () => {
        const nivel = boton.getAttribute('data-nivel');

        // Si se vuelve a hacer clic en el mismo, quitar filtro
        if (filtroNivel === nivel) {
            filtroNivel = null;
        } else {
            filtroNivel = nivel;
        }

        // Actualizar estilos visuales
        actualizarBotonesNivel();
        filtrarLecciones();
    });
});

function actualizarBotonesNivel() {
    document.querySelectorAll('.main__filter-nivel').forEach(boton => {
        const nivel = boton.getAttribute('data-nivel');
        boton.classList.toggle('filtro-activo', nivel === filtroNivel);
    });
}

// -------------------- MENSAJE SIN RESULTADOS --------------------
function mostrarMensajeSinResultados(mostrar) {
    const contenedor = document.querySelector('.main__lessons-cards-container');
    let mensaje = document.getElementById('mensaje-sin-resultados');

    if (mostrar) {
        if (!mensaje) {
            mensaje = document.createElement('div');
            mensaje.id = 'mensaje-sin-resultados';
            mensaje.textContent = 'No se encontraron lecciones que coincidan con tu búsqueda';
            mensaje.style.textAlign = 'center';
            mensaje.style.padding = '20px';
            mensaje.style.color = '#666';
            contenedor.appendChild(mensaje);
        }
    } else if (mensaje) {
        mensaje.remove();
    }
}

// -------------------- BUSCAR AL ESCRIBIR O ENTER --------------------
document.querySelector('.main__filter-input').addEventListener('input', filtrarLecciones);
document.querySelector('.main__filter-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') filtrarLecciones();
});

// -------------------- SESIÓN ACTIVA --------------------
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/LP_Esp/html/login.html';
        return;
    }

    // Filtrado inicial
    filtrarLecciones();
});
