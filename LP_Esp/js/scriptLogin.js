function toggleForm(form) {
    const container = document.querySelector('.container');
    const loginContent = document.querySelector('.login-content');
    const registerContent = document.querySelector('.register-content');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const circles = document.querySelectorAll('.circle-bg');
  
    if (form === 'register') {
      container.classList.add('register-mode');
      loginContent.classList.add('hidden');
      registerContent.classList.remove('hidden');
      loginForm.classList.add('hidden');
      registerForm.classList.remove('hidden');
      circles.forEach(circle => circle.style.transform = 'scale(1.2) rotate(180deg)');
    } else {
      container.classList.remove('register-mode');
      registerContent.classList.add('hidden');
      loginContent.classList.remove('hidden');
      registerForm.classList.add('hidden');
      loginForm.classList.remove('hidden');
      circles.forEach(circle => circle.style.transform = 'scale(1) rotate(0)');
    }
  }
  
  function handleLogin(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    console.log('Datos de inicio de sesión:', {
      matricula: formData.get('matricula'),
      password: formData.get('password')
    });
    
    form.reset();
    alert('¡Inicio de sesión exitoso!');
  }
  
  function handleRegistration(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    
    console.log('Datos del formulario:', {
      matricula: formData.get('matricula'),
      nombres: formData.get('nombres'),
      apellidos: formData.get('apellidos'),
      email: formData.get('email'),
      password: formData.get('password'),
      terminos: formData.get('terminos')
    });
    
    form.reset();
    alert('¡Registro exitoso! Por favor, inicia sesión.');
    toggleForm('login');
  }