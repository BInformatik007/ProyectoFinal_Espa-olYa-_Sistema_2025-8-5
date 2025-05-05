// LP_Esp/js/loadFooter.js

// Función para cargar el footer
function loadFooter() {
    // Intentar cargar desde diferentes rutas posibles
    const tryPaths = [
      '../html/footer.html',  // Ruta absoluta
      '../components/footer.html',       // Ruta relativa desde /html/
      'components/footer.html'           // Ruta alternativa
    ];
  
    const tryFetch = async (path) => {
      try {
        const response = await fetch(path);
        if (!response.ok) throw new Error('No se pudo cargar');
        return await response.text();
      } catch (error) {
        console.error(`Error con ruta ${path}:`, error);
        return null;
      }
    };
  
    const loadWithRetries = async (index = 0) => {
      if (index >= tryPaths.length) {
        // Mostrar footer de respaldo si todas fallan
        showFallbackFooter();
        return;
      }
  
      const html = await tryFetch(tryPaths[index]);
      if (html) {
        const footerContainer = document.createElement('div');
        footerContainer.innerHTML = html;
        document.body.appendChild(footerContainer);
        markActiveLink();
      } else {
        loadWithRetries(index + 1);
      }
    };
  
    loadWithRetries();
  }
  
  // Marcar enlace activo
  function markActiveLink() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.footer__link').forEach(link => {
      const linkPage = link.getAttribute('href').split('/').pop();
      if (linkPage === currentPage) {
        link.classList.add('active');
      }
    });
  }
  
  // Footer de respaldo
  function showFallbackFooter() {
    const fallbackHTML = `
    <section class="sections-group footer-section">
      <footer class="footer" style="text-align:center;padding:20px;">
        © ${new Date().getFullYear()} EspañolYa - Todos los derechos reservados
        <div style="margin-top:10px;">
          <a href="../html/index.html">Inicio</a> | 
          <a href="../html/lessons.html">Lecciones</a> | 
          <a href="../html/challenge.html">Desafíos</a> | 
          <a href="../html/profile.html">Perfil</a>
        </div>
      </footer>
    </section>`;
    document.body.insertAdjacentHTML('beforeend', fallbackHTML);
  }
  
  // Cargar al iniciar
  document.addEventListener('DOMContentLoaded', loadFooter);