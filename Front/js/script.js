// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Cambio de Tema (Modo Oscuro/Claro) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    // Función para aplicar el tema
    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
        }
    };

    // Detectar preferencia del sistema o tema guardado
    const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDarkMode) {
        applyTheme('dark');
    } else {
        applyTheme('light'); // Default to light if no preference and no saved theme
    }

    // Event listener para el botón de cambio de tema
    if (themeToggle) { // Asegúrate de que el elemento existe antes de añadir el listener
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }


    // --- Lógica de Modales ---

    // Obtener elementos de los modales y botones
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const uploadModal = document.getElementById('upload-modal');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');

    const loginOpenBtn = document.getElementById('login-open-btn'); // Icono de bombilla
    const loginCloseBtn = document.getElementById('login-close-btn');
    const registerOpenLink = document.getElementById('register-link'); // Enlace en modal de login
    const loginOpenLink = document.getElementById('login-link'); // Enlace en modal de register
    const registerCloseBtn = document.getElementById('register-close-btn');

    const uploadOpenBtn = document.getElementById('upload-open-btn'); // Botón 'SUBIR' en header
    const sideMenuUploadBtn = document.getElementById('side-menu-upload-btn'); // Botón 'Subir proyecto' en menú lateral
    const uploadCloseBtn = document.getElementById('upload-close-btn');

    const menuToggleBtn = document.getElementById('menu-toggle-btn');
    const menuCloseBtn = document.getElementById('menu-close-btn');

    // Función genérica para abrir un modal
    const openModal = (modal) => {
        if (modal) {
            modal.classList.add('active');
            // Opcional: añadir clase al body para deshabilitar scroll
            document.body.classList.add('modal-open');
        }
    };

    // Función genérica para cerrar un modal
    const closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
            // Opcional: quitar clase del body para habilitar scroll
            document.body.classList.remove('modal-open');
        }
    };

    // Event listeners para abrir modales
    if (loginOpenBtn) loginOpenBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(loginModal); });
    if (uploadOpenBtn) uploadOpenBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(uploadModal); });
    if (sideMenuUploadBtn) sideMenuUploadBtn.addEventListener('click', (e) => { e.preventDefault(); closeModal(sideMenuOverlay); openModal(uploadModal); }); // Cierra menú antes de abrir modal

    // Event listeners para cerrar modales
    if (loginCloseBtn) loginCloseBtn.addEventListener('click', () => closeModal(loginModal));
    if (registerCloseBtn) registerCloseBtn.addEventListener('click', () => closeModal(registerModal));
    if (uploadCloseBtn) uploadCloseBtn.addEventListener('click', () => closeModal(uploadModal));

    // Cerrar modal al hacer click fuera del contenido (en el overlay)
    [loginModal, registerModal, uploadModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal(modal);
                }
            });
        }
    });

    // Lógica para cambiar entre modal de Login y Registro
    if (registerOpenLink) {
        registerOpenLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(loginModal);
            openModal(registerModal);
        });
    }

    if (loginOpenLink) {
        loginOpenLink.addEventListener('click', (e) => {
            e.preventDefault();
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

    // --- Lógica del Menú Lateral ---
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', () => {
            if (sideMenuOverlay) {
                sideMenuOverlay.classList.add('active');
                document.body.classList.add('menu-open'); // Clase para evitar scroll del body
            }
        });
    }

    if (menuCloseBtn) {
        menuCloseBtn.addEventListener('click', () => {
            if (sideMenuOverlay) {
                sideMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Cerrar menú lateral al hacer clic fuera (en el overlay)
    if (sideMenuOverlay) {
        sideMenuOverlay.addEventListener('click', (e) => {
            if (e.target === sideMenuOverlay) {
                sideMenuOverlay.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    }

    // Manejo de la subida de archivos (simulado)
    const uploadArea = document.querySelector('.upload-area');
    const projectFilesInput = document.getElementById('project-files');

    if (uploadArea && projectFilesInput) {
        uploadArea.addEventListener('click', () => {
            projectFilesInput.click(); // Simular clic en el input de tipo file
        });

        projectFilesInput.addEventListener('change', () => {
            if (projectFilesInput.files.length > 0) {
                alert(`Archivos seleccionados: ${projectFilesInput.files.length}. Nombres: ${Array.from(projectFilesInput.files).map(f => f.name).join(', ')}`);
                // Aquí podrías añadir lógica para mostrar miniaturas o nombres de archivos
            }
        });
    }

    // Previene el comportamiento por defecto de submit en los formularios (para desarrollo)
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Formulario enviado (comportamiento real no implementado)');
            // Aquí iría la lógica para enviar datos a un backend
            // closeModal(form.closest('.modal-overlay')); // Cerrar el modal después de enviar
        });
    });

});