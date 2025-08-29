document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica de Cambio de Tema (Modo Oscuro/Claro) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const lightModeIcon = document.querySelector('.light-mode-icon');
    const darkModeIcon = document.querySelector('.dark-mode-icon');
    const appLogoLink = document.querySelector('.app-logo-link');

    const applyTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            localStorage.setItem('theme', 'dark');
            if (lightModeIcon && darkModeIcon) {
                lightModeIcon.style.display = 'none';
                darkModeIcon.style.display = 'inline-block';
            }
            if (appLogoLink) {
                appLogoLink.style.color = 'var(--text-color-light)';
            }
        } else {
            body.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            if (lightModeIcon && darkModeIcon) {
                lightModeIcon.style.display = 'inline-block';
                darkModeIcon.style.display = 'none';
            }
            if (appLogoLink) {
                appLogoLink.style.color = 'var(--text-color-dark)';
            }
        }
    };

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }

    // --- Lógica de Modales y Menú Lateral (AHORA EN ESTE ARCHIVO) ---

    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const uploadModal = document.getElementById('upload-modal');
    const sideMenuOverlay = document.getElementById('side-menu-overlay');
    const mainContent = document.querySelector('main');
    
    const modals = [loginModal, registerModal, uploadModal, sideMenuOverlay];

    const openModal = (modal) => {
        modals.forEach(m => m?.classList.remove('active'));
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
            if (mainContent) mainContent.setAttribute('aria-hidden', 'true');
        }
    };

    const closeModal = (modal) => {
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
    
    

    // Lógica para subir proyecto
    const uploadProjectForm = document.getElementById('uploadProjectForm');
    if (uploadProjectForm) {
        uploadProjectForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const user = JSON.parse(localStorage.getItem('user'));
            if (!user) {
                alert('Debes iniciar sesión para subir un proyecto.');
                closeModal(uploadModal);
                openModal(loginModal);
                return;
            }

            const formData = new FormData(uploadProjectForm);
            formData.append('nom_usuario', user.nom_usuario);

            try {
                const response = await fetch('http://localhost:3000/proyectos', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    alert('Proyecto subido exitosamente!');
                    closeModal(uploadModal);
                    window.location.reload();
                } else {
                    const errorData = await response.json();
                    alert(`Error al subir el proyecto: ${errorData.message}`);
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Ocurrió un error al intentar subir el proyecto. Por favor, asegúrate de que el servidor está funcionando.');
            }
        });
    }

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

    // Lógica para obtener y renderizar proyectos del perfil
    const fetchAndRenderUserProjects = async (username) => {
        try {
            const response = await fetch(`http://localhost:3000/proyectos/usuario/${username}`);
            if (response.ok) {
                const proyectos = await response.json();
                const projectsGrid = document.getElementById('projects-grid');
                projectsGrid.innerHTML = '';
                
                if (proyectos.length > 0) {
                    proyectos.forEach(proyecto => {
                        const projectCardLink = document.createElement('a');
                        projectCardLink.href = `profile.html?username=${proyecto.nom_usuario}`;
                        projectCardLink.className = 'project-card-link';

                        const projectCard = document.createElement('div');
                        projectCard.className = 'project-card';

                        const imageUrl = proyecto.archivos && proyecto.archivos.length > 0
                            ? `http://localhost:3000${proyecto.archivos[0].url}`
                            : 'https://via.placeholder.com/300x200';
                        
                        projectCard.innerHTML = `
                            <div class="project-image-placeholder">
                                <img src="${imageUrl}" alt="Imagen de Proyecto">
                            </div>
                            <h3 class="project-name">${proyecto.titulo}</h3>
                            <p class="project-author">${proyecto.nom_usuario}</p>
                        `;

                        projectCardLink.appendChild(projectCard);
                        projectsGrid.appendChild(projectCardLink);
                    });
                } else {
                    projectsGrid.innerHTML = '<p>No hay proyectos para mostrar.</p>';
                }
            } else {
                const errorData = await response.json();
                console.error('Error al cargar los proyectos del usuario:', errorData.message);
                const projectsGrid = document.getElementById('projects-grid');
                projectsGrid.innerHTML = `<p>${errorData.message}</p>`;
            }
        } catch (error) {
            console.error('Error al cargar los proyectos:', error);
            const projectsGrid = document.getElementById('projects-grid');
            projectsGrid.innerHTML = '<p>Ocurrió un error al cargar los proyectos. Por favor, asegúrate de que el servidor está funcionando.</p>';
        }
    };
    
    // Llamar a la función para cargar proyectos del usuario si el elemento existe
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (username) {
        fetchAndRenderUserProjects(username);
    } else {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            fetchAndRenderUserProjects(user.nom_usuario);
        } else {
            const projectsGrid = document.getElementById('projects-grid');
            if(projectsGrid) {
                projectsGrid.innerHTML = '<p>No hay un usuario seleccionado. Por favor, inicia sesión para ver tu perfil.</p>';
            }
        }
    }

});

// Función para actualizar la información del usuario en el menú lateral
const updateSideMenu = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-open-btn');
    const uploadBtn = document.getElementById('upload-open-btn');
    const userMenuName = document.getElementById('user-menu-name');

    if (user) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (uploadBtn) uploadBtn.style.display = 'block';
        if (userMenuName) {
            userMenuName.textContent = user.nombre;
        }
    } else {
        if (loginBtn) loginBtn.style.display = 'block';
        if (uploadBtn) uploadBtn.style.display = 'none';
        if (userMenuName) {
            userMenuName.textContent = 'NOMBRE APELLIDO';
        }
    }
};

document.addEventListener('DOMContentLoaded', updateSideMenu);