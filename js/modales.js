// --- Lógica de la interfaz de usuario y modales ---
document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Modales y Menú Lateral ---
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const uploadModal = document.getElementById('upload-modal');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const mainContent = document.querySelector('main');
    
    const modals = [loginModal, registerModal, uploadModal, sideMenuOverlay];

    window.openModal = (modal) => {
        modals.forEach(m => m?.classList.remove('active'));
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
        }
    };

    window.closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
        }
        if (!modals.some(m => m?.classList.contains('active'))) {
            document.body.classList.remove('modal-open');
            if (mainContent) mainContent.removeAttribute('aria-hidden');
        }
    };

    // Eventos de apertura
    document.getElementById('login-open-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });

    document.getElementById('side-menu-upload-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('user')) {
            openModal(uploadModal);
        } else {
            alert('Debes iniciar sesión para subir un proyecto.');
            openModal(loginModal);
        }
    });

    document.getElementById('upload-open-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('user')) {
            openModal(uploadModal);
        } else {
            alert('Debes iniciar sesión para subir un proyecto.');
            openModal(loginModal);
        }
    });

    document.getElementById('menu-toggle-btn')?.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(sideMenuOverlay);
    });

    // Eventos de cierre
    document.getElementById('login-close-btn')?.addEventListener('click', () => closeModal(loginModal));
    document.getElementById('register-close-btn')?.addEventListener('click', () => closeModal(registerModal));
    document.getElementById('upload-close-btn')?.addEventListener('click', () => closeModal(uploadModal));
    document.getElementById('menu-close-btn')?.addEventListener('click', () => closeModal(sideMenuOverlay));

    // Cierre de modales al hacer clic fuera del contenido
    modals.forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                // Cierra el modal solo si el clic fue directamente en el overlay y no en el contenido
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // Lógica de cambio entre modales de login y registro
    document.getElementById('switch-to-register')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(loginModal);
        openModal(registerModal);
    });

    document.getElementById('switch-to-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal(registerModal);
        openModal(loginModal);
    });

});