describe('EspañolYa! - Prueba de rendimiento simple', () => {
    it('Carga en menos de 3 segundos', () => {
      let startTime, endTime;
  
      cy.window().then(() => {
        startTime = performance.now(); // Tiempo inicial
      });
  
      cy.visit('https://lp-esp.onrender.com/html/login.html');
  
      cy.window().then(() => {
        endTime = performance.now(); // Tiempo final después de la carga
  
        const duration = endTime - startTime;
        cy.log(`Tiempo de carga: ${Math.round(duration)} ms`);
        expect(duration).to.be.lessThan(3000); // 3 segundos máximo
      });
    });
  });
  