// funcion-buscar.js - Versión optimizada y corregida

// Variable para guardar el filtro activo
let filtroActivo = null;

// Función principal para filtrar lecciones
function filtrarLecciones() {
    const input = document.querySelector('.main__filter-input').value.toLowerCase().trim();
    const tarjetas = document.querySelectorAll(".main__lessons-cards");
    let resultadosEncontrados = false;

    tarjetas.forEach(tarjeta => {
        const titulo = tarjeta.querySelector(".main__lessons-cards-content-title").textContent.toLowerCase();
        const categoria = tarjeta.querySelector(".main__lessons-cards-content-category").textContent.toLowerCase();
        const descripcion = tarjeta.querySelector(".main__lessons-cards-content-description").textContent.toLowerCase();

        // Verificar si coincide con el filtro de categoría (si hay uno activo)
        const coincideCategoria = !filtroActivo || categoria === filtroActivo.toLowerCase();
        
        // Verificar si coincide con el texto de búsqueda
        const coincideTexto = !input || titulo.includes(input) || categoria.includes(input) || descripcion.includes(input);
        
        if (coincideCategoria && coincideTexto) {
            tarjeta.style.display = "block";
            resultadosEncontrados = true;
        } else {
            tarjeta.style.display = "none";
        }
    });

    // Mostrar mensaje si no hay resultados
    mostrarMensajeSinResultados(!resultadosEncontrados && (input.length > 0 || filtroActivo));
}

// Función para filtrar por categoría (con toggle)
function filtrarPorCategoria(categoria) {
    // Si se hace clic en la misma categoría, desactivar el filtro
    if (filtroActivo === categoria) {
        filtroActivo = null;
    } else {
        filtroActivo = categoria;
    }

    // Actualizar estilos de los botones
    actualizarBotonesActivos();
    
    // Aplicar el filtro
    filtrarLecciones();
}

// Función para actualizar los estilos de los botones activos
function actualizarBotonesActivos() {
    document.querySelectorAll('.main__filters').forEach(boton => {
        // Solo aplicamos a botones de categoría (excluimos el botón del icono)
        if (!boton.querySelector('i')) {
            if (boton.textContent === filtroActivo) {
                boton.classList.add('filtro-activo');
            } else {
                boton.classList.remove('filtro-activo');
            }
        }
    });
}

// Función para mostrar mensaje cuando no hay resultados
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

// Evento para búsqueda con Enter
document.querySelector('.main__filter-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        filtrarLecciones();
    }
});

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Añadir evento de búsqueda mientras se escribe (opcional)
    document.querySelector('.main__filter-input').addEventListener('input', filtrarLecciones);
    
    // Mostrar todas las lecciones al inicio
    filtrarLecciones();
});