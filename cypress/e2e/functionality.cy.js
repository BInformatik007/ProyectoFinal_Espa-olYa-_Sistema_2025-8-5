describe('EspañolYa! - Registro e intento de Login', () => {
  const matricula = `2023${Math.floor(Math.random() * 10000)}`;
  const email = `test${Math.floor(Math.random() * 10000)}@correo.com`;
  const password = 'Test1234!';
  const nombres = 'Juan';
  const apellidos = 'Prueba';

  it('Debería registrarse y fallar el login por correo no confirmado', () => {
    // 1. Ir al login
    cy.visit('https://lp-esp.onrender.com/html/login.html');

    // 2. Esperar a que cargue el botón de registro
    cy.get('button')
      .contains('REGISTRARSE')
      .should('be.visible')
      .click();

    // 3. Llenar el formulario de registro
    cy.get('.register-form input[name="enrollment"]').type(matricula);
    cy.get('.register-form input[name="first_name"]').type(nombres);
    cy.get('.register-form input[name="last_name"]').type(apellidos);
    cy.get('.register-form input[name="email"]').type(email);
    cy.get('.register-form input[name="password"]').type(password);
    cy.get('.register-form input[name="terminos"]').check({ force: true });

    // 4. Enviar formulario
    cy.get('.register-form button[type="submit"]').click();

    // 5. Esperar a mensaje de confirmación
    cy.on('window:alert', (msg) => {
      expect(msg).to.include('¡Registro exitoso! Revisa tu correo para confirmar tu cuenta.');
    });

    // 6. Volver a iniciar sesión
    cy.get('.register-content button')
      .contains('INICIAR SESIÓN')
      .should('be.visible')
      .click();

    // 7. Llenar login
    cy.get('.login-form input[name="enrollment"]').type(matricula);
    cy.get('.login-form input[name="password"]').type(password);
    cy.get('.login-form button[type="submit"]').click();

    // 8. Verificar que no accede (correo no confirmado)
    cy.contains('Error al iniciar sesión:', { matchCase: false }).should('exist');
  });
});
