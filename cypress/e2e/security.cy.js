describe('EspañolYa! - Pruebas de seguridad', () => {
    it('Previene intento de XSS en login', () => {
      cy.visit('https://lp-esp.onrender.com/html/login.html');
  
      // Insertar payload XSS en matrícula
      cy.get('.login-form input[name="enrollment"]').type('<script>alert("xss")</script>');
      cy.get('.login-form input[name="password"]').type('falso');
      cy.get('.login-form button[type="submit"]').click();
  
      // Si aparece una alerta, la app es vulnerable
      cy.on('window:alert', (txt) => {
        throw new Error(`¡Vulnerabilidad XSS detectada! Mensaje: ${txt}`);
      });
  
      // Verificar que no redirige ni ejecuta JS
      cy.url().should('include', '/login.html');
    });

    it('Bloquea acceso a perfil sin sesión activa', () => {
        cy.clearLocalStorage(); // Elimina cualquier sesión previa
        cy.visit('https://lp-esp.onrender.com/html/profile.html');
    
        // Debe redirigir al login o mostrar acceso denegado
        cy.url().should('include', '/login.html'); // Ajusta si redirige distinto
        cy.on('window:alert', (msg) => {
            expect(msg).to.include('Matrícula no registrada.');
          });
      });    
  });
  