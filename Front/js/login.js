document.addEventListener('DOMContentLoaded', () => {

    // Regex para las validaciones
    const forbiddenChars = /['":;,<>/(){}[\]`¬|°\\?¿¡]/;
    const usernameRegex = /^[a-zA-Z0-9]+$/;
    const nameRegex = /^[a-zA-Z\u00C0-\u017F\s]+$/;
    const emailRegex = /^[a-zA-Z0-9_+-]+(\.[a-zA-Z0-9_+-]+)*@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    // Campos del formulario
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const registerUsername = document.getElementById('registerUsername');
    const registerName = document.getElementById('registerName');
    const registerEmail = document.getElementById('registerEmail');
    const registerPassword = document.getElementById('registerPassword');
    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    const registerType = document.getElementById('registerType');

    // Funcionalidad para mostrar/ocultar contraseña
    const passwordInputs = [
        { id: 'loginPassword', toggleId: 'login-password-toggle' },
        { id: 'registerPassword', toggleId: 'register-password-toggle' },
        { id: 'registerConfirmPassword', toggleId: 'confirm-password-toggle' }
    ];

    passwordInputs.forEach(item => {
        const input = document.getElementById(item.id);
        const toggle = document.getElementById(item.toggleId);
        if (input && toggle) {
            toggle.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggle.classList.toggle('fa-eye-slash');
            });
        }
    });

    // Lógica de inicio de sesión
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const contrasena = document.getElementById('loginPassword').value;

            // Validación de caracteres prohibidos en la contraseña
            if (forbiddenChars.test(contrasena)) {
                alert('La contraseña contiene caracteres no permitidos.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/usuarios/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, contrasena }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Inicio de sesión exitoso!');
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = 'profile.html';
                } else {
                    alert(`Error al iniciar sesión: ${data.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocurrió un error al intentar iniciar sesión. Por favor, asegúrate de que el servidor está funcionando.');
            }
        });
    }

    // Lógica de registro con validaciones
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nom_usuario = registerUsername.value.trim();
            const nombre = registerName.value.trim();
            const email = registerEmail.value.trim();
            const contrasena = registerPassword.value;
            const confirmarContrasena = registerConfirmPassword.value;
            const tipo_usuario = registerType.value.trim();

            // Validación del nombre de usuario
            if (!usernameRegex.test(nom_usuario)) {
                alert('El nombre de usuario solo puede contener letras y números, sin espacios ni caracteres especiales.');
                return;
            }

            // Validación del nombre completo
            if (!nameRegex.test(nombre)) {
                alert('El nombre solo puede contener letras y espacios.');
                return;
            }

            // Validación de email
            if (!emailRegex.test(email)) {
                alert('El formato de email no es válido. Asegúrate de que no tenga puntos consecutivos o guiones al inicio/final del dominio.');
                return;
            }
            
            // Validación de contraseña
            if (forbiddenChars.test(contrasena)) {
                alert('La contraseña contiene caracteres no permitidos.');
                return;
            }
            if (contrasena !== confirmarContrasena) {
                alert('Las contraseñas no coinciden.');
                return;
            }

            // Validación del tipo de usuario
            if (forbiddenChars.test(tipo_usuario)) {
                alert('El tipo de usuario contiene caracteres no permitidos.');
                return;
            }

            try {
                const response = await fetch('http://localhost:3000/usuarios/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ nom_usuario, nombre, email, contrasena, tipo_usuario }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Usuario registrado exitosamente!');
                    window.closeModal(document.getElementById('register-modal'));
                    window.openModal(document.getElementById('login-modal'));
                } else {
                    alert(`Error al registrarse: ${data.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocurrió un error al intentar registrarse.');
            }
        });
    }
});