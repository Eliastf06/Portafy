document.addEventListener('DOMContentLoaded', () => {

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

    // Manejar el botón de cerrar sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('user');
            alert('Sesión cerrada correctamente.');
            window.location.href = 'index.html';
        });
    }

});

// Función para actualizar la información del usuario en el menú lateral
const updateSideMenu = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-open-btn');
    const uploadBtn = document.getElementById('upload-open-btn');
    const userMenuName = document.getElementById('user-menu-name');

    if (user) {
        loginBtn.style.display = 'none';    // if (loginBtn) loginBtn.style.display = 'none';
        uploadBtn.style.display = 'block';  // if (uploadBtn) uploadBtn.style.display = 'block';
        if (userMenuName) {
            userMenuName.textContent = user.nombre;
        }
    } else {
        loginBtn.style.display = 'block';   // if (loginBtn) loginBtn.style.display = 'block';
        uploadBtn.style.display = 'none';   // if (uploadBtn) uploadBtn.style.display = 'none';
        if (userMenuName) {
            userMenuName.textContent = 'Nombre Apellido';
        }
    }
};

document.addEventListener('DOMContentLoaded', updateSideMenu);