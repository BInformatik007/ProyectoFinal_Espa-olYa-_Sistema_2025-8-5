import { supabase } from './supabaseClient.js';

// Verificación de sesión activa
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        // Redirigir al login si no hay sesión
        window.location.href = '/LP_Esp/html/login.html';
        return;
    }
});

// Variables globales
let respuestasCorrectas = 0;
const totalPreguntas = 24;
let paginaActual = 0;
const totalPaginas = 4;

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    actualizarProgreso();
    actualizarPuntosPaginacion();
});

// Funciones de paginación
function cambiarPagina(nuevaPagina) {
    // Ocultar página actual
    document.querySelector(`#pagina${paginaActual + 1}`).classList.remove('pagina-activa');
    
    // Mostrar nueva página
    paginaActual = nuevaPagina;
    document.querySelector(`#pagina${paginaActual + 1}`).classList.add('pagina-activa');
    
    // Actualizar puntos de paginación
    actualizarPuntosPaginacion();
    
    // Actualizar controles de paginación
    actualizarControlesPaginacion();
}

function actualizarPuntosPaginacion() {
    const puntos = document.querySelectorAll('.punto');
    puntos.forEach((punto, index) => {
        if (index === paginaActual) {
            punto.classList.add('punto-activo');
        } else {
            punto.classList.remove('punto-activo');
        }
    });
}

function actualizarControlesPaginacion() {
    // Deshabilitar/mostrar botones según la página
    const paginas = document.querySelectorAll('.pagina');
    paginas.forEach((pagina, index) => {
        const controles = pagina.querySelector('.controles-paginacion');
        const btnAnterior = controles.querySelector('.btn-secundario');
        const btnSiguiente = controles.querySelector('.btn:not(.btn-secundario)');
        
        // Primera página
        if (index === 0) {
            btnAnterior.disabled = true;
        } else {
            btnAnterior.disabled = false;
        }
        
        // Última página
        if (index === totalPaginas - 1) {
            btnSiguiente.textContent = 'Ver resultados finales';
            btnSiguiente.onclick = mostrarResultadosFinales;
        } else {
            btnSiguiente.textContent = 'Siguiente';
            btnSiguiente.onclick = function() { cambiarPagina(index + 1); };
        }
    });
}

// Funciones de verificación de respuestas
function verificarRespuesta(numPregunta, opcionSeleccionada) {
    const pregunta = document.getElementById(`pregunta${numPregunta}`);
    const feedbackCorrecto = document.getElementById(`feedback${numPregunta}-correcto`);
    const feedbackIncorrecto = document.getElementById(`feedback${numPregunta}-incorrecto`);
    const sugerencia = document.getElementById(`sugerencia${numPregunta}`);
    const opciones = pregunta.querySelectorAll('.opcion');
    
    // Determinar la respuesta correcta según la pregunta
    let respuestaCorrecta = '';
    switch(numPregunta) {
        case 1: respuestaCorrecta = 'a'; break;
        case 4: respuestaCorrecta = 'b'; break;
        case 6: respuestaCorrecta = 'a'; break;
        case 7: respuestaCorrecta = 'c'; break;
        case 9: respuestaCorrecta = 'c'; break;
        case 12: respuestaCorrecta = 'a'; break;
        case 14: respuestaCorrecta = 'b'; break;
        case 17: respuestaCorrecta = 'b'; break;
        case 20: respuestaCorrecta = 'a'; break;
        case 23: respuestaCorrecta = 'a'; break;
    }
    
    // Verificar respuesta
    if (opcionSeleccionada === respuestaCorrecta) {
        // Respuesta correcta
        opciones.forEach(op => {
            if (op.getAttribute('onclick').includes(`'${opcionSeleccionada}'`)) {
                op.classList.add('correcta');
            }
        });
        
        feedbackCorrecto.style.display = 'block';
        feedbackIncorrecto.style.display = 'none';
        sugerencia.style.display = 'none';
        
        // Incrementar contador de respuestas correctas si no se había respondido antes
        if (!pregunta.classList.contains('respondida')) {
            respuestasCorrectas++;
            pregunta.classList.add('respondida');
            actualizarProgreso();
        }
    } else {
        // Respuesta incorrecta
        opciones.forEach(op => {
            const opcionLetra = op.getAttribute('onclick').split("'")[1];
            if (opcionLetra === opcionSeleccionada) {
                op.classList.add('incorrecta');
            }
            if (opcionLetra === respuestaCorrecta) {
                op.classList.add('correcta');
            }
        });
        
        feedbackCorrecto.style.display = 'none';
        feedbackIncorrecto.style.display = 'block';
        sugerencia.style.display = 'block';
        
        // Marcar como respondida pero no incrementar contador
        pregunta.classList.add('respondida');
    }
}

function verificarTexto(numPregunta, respuestaCorrecta) {
    const respuestaUsuario = document.getElementById(`respuesta${numPregunta}`).value.trim().toLowerCase();
    const pregunta = document.getElementById(`pregunta${numPregunta}`);
    const feedbackCorrecto = document.getElementById(`feedback${numPregunta}-correcto`);
    const feedbackIncorrecto = document.getElementById(`feedback${numPregunta}-incorrecto`);
    const sugerencia = document.getElementById(`sugerencia${numPregunta}`);
    
    if (respuestaUsuario === respuestaCorrecta) {
        // Respuesta correcta
        feedbackCorrecto.style.display = 'block';
        feedbackIncorrecto.style.display = 'none';
        sugerencia.style.display = 'none';
        
        // Incrementar contador si no se había respondido antes
        if (!pregunta.classList.contains('respondida')) {
            respuestasCorrectas++;
            pregunta.classList.add('respondida');
            actualizarProgreso();
        }
    } else {
        // Respuesta incorrecta
        feedbackCorrecto.style.display = 'none';
        feedbackIncorrecto.style.display = 'block';
        sugerencia.style.display = 'block';
        
        // Marcar como respondida pero no incrementar contador
        pregunta.classList.add('respondida');
    }
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}

function drop(ev, respuestaCorrecta) {
    ev.preventDefault();
    const data = ev.dataTransfer.getData("text");
    const elementoArrastrado = document.getElementById(data);
    const textoArrastrado = elementoArrastrado.textContent;
    const preguntaId = ev.target.closest('.pregunta').id;
    const numPregunta = parseInt(preguntaId.replace('pregunta', ''));
    const pregunta = document.getElementById(preguntaId);
    const feedbackCorrecto = document.getElementById(`feedback${numPregunta}-correcto`);
    const feedbackIncorrecto = document.getElementById(`feedback${numPregunta}-incorrecto`);
    const sugerencia = document.getElementById(`sugerencia${numPregunta}`);
    
    // Limpiar zona de arrastre
    ev.target.innerHTML = '';
    
    // Crear nuevo elemento en la zona de arrastre
    const nuevoElemento = document.createElement('div');
    nuevoElemento.textContent = textoArrastrado;
    nuevoElemento.className = 'arrastrar';
    ev.target.appendChild(nuevoElemento);
    
    // Verificar respuesta
    if (textoArrastrado === respuestaCorrecta) {
        // Respuesta correcta
        nuevoElemento.classList.add('correcta');
        feedbackCorrecto.style.display = 'block';
        feedbackIncorrecto.style.display = 'none';
        sugerencia.style.display = 'none';
        
        // Incrementar contador si no se había respondido antes
        if (!pregunta.classList.contains('respondida')) {
            respuestasCorrectas++;
            pregunta.classList.add('respondida');
            actualizarProgreso();
        }
    } else {
        // Respuesta incorrecta
        nuevoElemento.classList.add('incorrecta');
        feedbackCorrecto.style.display = 'none';
        feedbackIncorrecto.style.display = 'block';
        sugerencia.style.display = 'block';
        
        // Marcar como respondida pero no incrementar contador
        pregunta.classList.add('respondida');
    }
}

// Función para mostrar resultados finales
function mostrarResultadosFinales() {
    const porcentaje = Math.round((respuestasCorrectas / totalPreguntas) * 100);
    const modal = document.getElementById('modal-resultados');
    const tituloResultado = document.getElementById('titulo-resultado');
    const contenidoResultado = document.getElementById('contenido-resultado');
    
    // Configurar el contenido según el porcentaje
    contenidoResultado.innerHTML = `
        <p>Has respondido correctamente ${respuestasCorrectas} de ${totalPreguntas} preguntas.</p>
        <p><strong>Porcentaje de aciertos: ${porcentaje}%</strong></p>
    `;
    
    if (porcentaje >= 90) {
        tituloResultado.textContent = '¡Felicidades! 🎉';
        contenidoResultado.innerHTML += `
            <p style="color: #27ae60; font-weight: bold;">¡Excelente trabajo! Dominas el presente simple.</p>
            <p>Sigue practicando para mantener tus conocimientos.</p>
        `;
    } else if (porcentaje >= 70) {
        tituloResultado.textContent = '¡Buen trabajo! 👍';
        contenidoResultado.innerHTML += `
            <p style="color: #f39c12; font-weight: bold;">Vas por buen camino, pero hay algunos conceptos por reforzar.</p>
            <p>Revisa las preguntas incorrectas y vuelve a intentarlo.</p>
        `;
    } else {
        tituloResultado.textContent = 'No te desanimes 💪';
        contenidoResultado.innerHTML += `
            <p style="color: #e74c3c; font-weight: bold;">Necesitas más práctica con el presente simple.</p>
            <p>Revisa las sugerencias y vuelve a intentarlo. ¡Tú puedes!</p>
        `;
    }
    
    contenidoResultado.innerHTML += `
        <button class="btn" style="margin-top: 20px;" onclick="reiniciarLeccion()">Reintentar lección</button>
    `;
    
    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modal-resultados').style.display = 'none';
}

function reiniciarLeccion() {
    respuestasCorrectas = 0;
    paginaActual = 0;
    actualizarProgreso();
    cambiarPagina(0);
    cerrarModal();
    
    // Limpiar todas las respuestas
    for (let i = 1; i <= totalPreguntas; i++) {
        // Limpiar feedbacks
        if (document.getElementById(`feedback${i}-correcto`)) {
            document.getElementById(`feedback${i}-correcto`).style.display = 'none';
            document.getElementById(`feedback${i}-incorrecto`).style.display = 'none';
            document.getElementById(`sugerencia${i}`).style.display = 'none';
        }
        
        // Limpiar inputs de texto
        if (document.getElementById(`respuesta${i}`)) {
            document.getElementById(`respuesta${i}`).value = '';
        }
        
        // Limpiar selección múltiple
        const opciones = document.querySelectorAll(`#pregunta${i} .opcion`);
        if (opciones) {
            opciones.forEach(op => {
                op.classList.remove('correcta', 'incorrecta');
            });
        }
        
        // Limpiar zonas de arrastre
        const zonasArrastre = document.querySelectorAll(`#pregunta${i} .zona-arrastre`);
        if (zonasArrastre) {
            zonasArrastre.forEach(zona => {
                zona.innerHTML = '';
            });
        }
        
        // Quitar clase de respondida
        const pregunta = document.getElementById(`pregunta${i}`);
        if (pregunta) {
            pregunta.classList.remove('respondida');
        }
    }
}

function actualizarProgreso() {
    const porcentaje = (respuestasCorrectas / totalPreguntas) * 100;
    document.getElementById('barra-progreso').style.width = `${porcentaje}%`;
}