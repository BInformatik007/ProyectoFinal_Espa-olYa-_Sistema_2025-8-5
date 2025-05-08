describe('EspañolYa! - Prueba de usabilidad con login directo', () => {

    // Ignorar errores JS durante la prueba
    Cypress.on('uncaught:exception', () => false);
  
    it('Inicia sesión y accede al perfil, verificando que "Tu progreso" exista', () => {
      // 1. Ir al login
      cy.visit('https://lp-esp.onrender.com/html/login.html');
  
      // 2. Llenar credenciales
      cy.get('.login-form input[name="enrollment"]').type('5533');
      cy.get('.login-form input[name="password"]').type('12345678');
  
      // 3. Hacer login
      cy.get('.login-form button[type="submit"]').click();
  
      // 4. Esperar redirección al index
      cy.url({ timeout: 10000 }).should('include', 'index.html');
  
      // 5. Clic en el enlace "Perfil" en el header
      cy.get('.header__account-btn a.header__account-link-singup')
        .should('contain', 'Perfil')
        .click();
  
      // 6. Verificar que estamos en profile.html
      cy.url({ timeout: 6000 }).should('include', '/profile.html');
  
      // 7. Verificar presencia del texto "Tu progreso"
      cy.contains('Tu progreso').should('be.visible');
    });
  });
  