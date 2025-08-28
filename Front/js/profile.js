document.addEventListener('DOMContentLoaded', async () => {
    let user = JSON.parse(localStorage.getItem('user'));
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    let profileData;
    let datosPerfil;
    let isMyProfile = false;

    // --- Elementos del DOM del modal de edición ---
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileCloseBtn = document.getElementById('edit-profile-close-btn');
    const editProfileForm = document.getElementById('editProfileForm');
    const profilePhotoInput = document.getElementById('foto-perfil-input');
    const nombrePerfilInput = document.getElementById('nombre-perfil');
    const emailPerfilInput = document.getElementById('email-perfil');
    const biografiaPerfilInput = document.getElementById('biografia-perfil');
    const redSocialPerfilInput = document.getElementById('red-social-perfil');
    const telefonoPerfilInput = document.getElementById('telefono-perfil');
    const direccionPerfilInput = document.getElementById('direccion-perfil');
    const experienciaPerfilInput = document.getElementById('experiencia-perfil');
    const privacidadPerfilSelect = document.getElementById('privacidad-perfil');


    // --- Otros elementos del DOM ---
    const projectsGrid = document.getElementById('projects-grid');
    const editProjectModal = document.getElementById('edit-project-modal');
    const editProjectCloseBtn = document.getElementById('edit-project-close-btn');
    const editProjectForm = document.getElementById('editProjectForm');
    const viewProjectModal = document.getElementById('view-project-modal');
    const viewProjectCloseBtn = document.getElementById('view-project-close-btn');
    const projectDetailsContent = document.getElementById('project-details-content');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    const profilePhotoImg = document.getElementById('profile-photo');
    // Nuevos elementos para la edición de proyectos
    const editProjectPhotoInput = document.getElementById('edit-project-photo-input');
    const editProjectImagePreview = document.getElementById('edit-project-image-preview');


    const showMessage = (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}]: ${message}`);
        alert(message);
    };

    const openModal = (modal) => {
        if (modal) {
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }
    };

    const closeModal = (modal) => {
        if (modal) {
            modal.classList.remove('active');
            if (!document.querySelector('.modal-overlay.active')) {
                document.body.classList.remove('modal-open');
            }
        }
    };

    const getSocialIcon = (url) => {
        if (url.includes('facebook')) return 'fab fa-facebook-f';
        if (url.includes('instagram')) return 'fab fa-instagram';
        if (url.includes('twitter')) return 'fab fa-twitter';
        if (url.includes('linkedin')) return 'fab fa-linkedin-in';
        if (url.includes('github')) return 'fab fa-github';
        if (url.includes('behance')) return 'fab fa-behance';
        if (url.includes('dribbble')) return 'fab fa-dribbble';
        return 'fas fa-link';
    };

    editProfileCloseBtn?.addEventListener('click', () => closeModal(editProfileModal));
    editProjectCloseBtn?.addEventListener('click', () => closeModal(editProjectModal));
    viewProjectCloseBtn?.addEventListener('click', () => closeModal(viewProjectModal));

    window.addEventListener('click', (event) => {
        if (event.target === editProfileModal) {
            closeModal(editProfileModal);
        }
    });

    if (username) {
        try {
            const userResponse = await fetch(`http://localhost:3000/usuarios/${username}`);
            if (userResponse.ok) {
                profileData = await userResponse.json();
                const datosPerfilResponse = await fetch(`http://localhost:3000/datosPerfil/${username}`);
                datosPerfil = datosPerfilResponse.ok ? await datosPerfilResponse.json() : {};
            } else {
                showMessage('No se encontró el perfil del usuario.', 'error');
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Error al obtener el perfil:', error);
            showMessage('Ocurrió un error al cargar el perfil.', 'error');
            window.location.href = 'index.html';
            return;
        }
    } else if (user) {
        profileData = user;
        isMyProfile = true;
        try {
            const datosPerfilResponse = await fetch(`http://localhost:3000/datosPerfil/${user.nom_usuario}`);
            if (datosPerfilResponse.ok) {
                datosPerfil = await datosPerfilResponse.json();
            } else {
                const createResponse = await fetch(`http://localhost:3000/datosPerfil/${user.nom_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nom_usuario: user.nom_usuario }),
                });
                datosPerfil = createResponse.ok ? await createResponse.json().then(data => data.datosPerfil) : {};
            }
        } catch (error) {
            console.error('Error al obtener/crear datos de perfil:', error);
            datosPerfil = {};
        }
    } else {
        showMessage('Debes iniciar sesión para ver esta página.', 'warning');
        window.location.href = 'index.html';
        return;
    }

    if (profileData) {
        document.getElementById('profile-name').textContent = profileData.nombre || 'Nombre Apellido';
        document.getElementById('profile-occupation').textContent = profileData.tipo_usuario || 'Ocupación';
    }

    if (datosPerfil) {
        if (datosPerfil.foto_perfil) {
            profilePhotoImg.src = `http://localhost:3000${datosPerfil.foto_perfil}`;
        } else {
            profilePhotoImg.src = 'multimedia/default-profile.png';
        }
        document.getElementById('profile-description').textContent = datosPerfil.biografia || 'Sin biografía disponible.';
        const socialLinksContainer = document.getElementById('profile-socials');
        socialLinksContainer.innerHTML = '';
        if (datosPerfil.red_social) {
            const links = datosPerfil.red_social.split(',').map(link => link.trim());
            links.forEach(link => {
                if (link) {
                    const iconClass = getSocialIcon(link);
                    const linkElement = document.createElement('a');
                    linkElement.href = link;
                    linkElement.target = '_blank';
                    linkElement.className = 'social-icon';
                    linkElement.innerHTML = `<i class="${iconClass}"></i>`;
                    socialLinksContainer.appendChild(linkElement);
                }
            });
        }
    }

    if (isMyProfile) {
        editProfileBtn.style.display = 'block';
        editProfileBtn.addEventListener('click', () => {
            // Llenar los campos del formulario con los datos actuales
            nombrePerfilInput.value = profileData.nombre || '';
            emailPerfilInput.value = profileData.email || '';
            biografiaPerfilInput.value = datosPerfil.biografia || '';
            redSocialPerfilInput.value = datosPerfil.red_social || '';
            telefonoPerfilInput.value = datosPerfil.telefono || '';
            direccionPerfilInput.value = datosPerfil.direccion || '';
            experienciaPerfilInput.value = datosPerfil.experiencia || '';
            privacidadPerfilSelect.value = datosPerfil.privacidad?.toString() || 'false';
            openModal(editProfileModal);
        });

        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            data.privacidad = data.privacidad === 'true';

            try {
                let fotoPerfilPath = datosPerfil.foto_perfil;

                // Si se seleccionó un archivo, subirlo primero
                const profilePhotoFile = profilePhotoInput.files[0];
                if (profilePhotoFile) {
                    const uploadFormData = new FormData();
                    uploadFormData.append('profilePhoto', profilePhotoFile);
                    
                    const uploadResponse = await fetch('http://localhost:3000/upload/profile-photo', {
                        method: 'POST',
                        body: uploadFormData,
                    });
                    
                    if (uploadResponse.ok) {
                        const uploadResult = await uploadResponse.json();
                        fotoPerfilPath = uploadResult.filePath;
                    } else {
                        showMessage('Error al subir la foto de perfil.', 'error');
                        return;
                    }
                }

                // Actualizar los datos del usuario (nombre, email)
                const userUpdateResponse = await fetch(`http://localhost:3000/usuarios/${profileData.nom_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: data.nombre,
                        email: data.email
                    })
                });

                if (!userUpdateResponse.ok) {
                    throw new Error('Error al actualizar datos de usuario.');
                }

                // Actualizar los datos de perfil (biografía, redes, etc., y la nueva URL de la foto)
                const profileDataUpdateResponse = await fetch(`http://localhost:3000/datosPerfil/${profileData.nom_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        biografia: data.biografia,
                        red_social: data.red_social,
                        telefono: data.telefono,
                        direccion: data.direccion,
                        experiencia: data.experiencia,
                        privacidad: data.privacidad,
                        foto_perfil: fotoPerfilPath
                    })
                });

                if (profileDataUpdateResponse.ok) {
                    showMessage('Perfil actualizado exitosamente.');
                    const updatedDatosPerfil = await profileDataUpdateResponse.json();
                    datosPerfil = updatedDatosPerfil.datosPerfil;
                    closeModal(editProfileModal);
                    window.location.reload();
                } else {
                    showMessage('Error al actualizar el perfil.', 'error');
                }
            } catch (error) {
                console.error('Error al enviar el formulario:', error);
                showMessage('Ocurrió un error. Inténtalo de nuevo.', 'error');
            }
        });
    }

    try {
        if (datosPerfil && datosPerfil.privacidad && !isMyProfile) {
            if (projectsGrid) projectsGrid.innerHTML = '<p>Este perfil es privado. No se pueden mostrar los proyectos.</p>';
            return;
        }

        const projectsResponse = await fetch(`http://localhost:3000/proyectos?nom_usuario=${profileData.nom_usuario}`);
        if (projectsResponse.ok) {
            const proyectos = await projectsResponse.json();
            if (projectsGrid) {
                projectsGrid.innerHTML = '';
                if (proyectos.length > 0) {
                    proyectos.forEach(proyecto => {
                        const projectCard = document.createElement('div');
                        projectCard.className = 'project-card';
                        projectCard.dataset.projectId = proyecto.id_proyecto;
                        projectCard.innerHTML = `
                            <div class="project-image-placeholder">
                                <img src="http://localhost:3000${proyecto.archivos && proyecto.archivos.length > 0 ? proyecto.archivos[0].url : '/multimedia/placeholder.jpg'}" alt="Imagen de Proyecto">
                            </div>
                            <h3 class="project-name">${proyecto.titulo}</h3>
                            ${isMyProfile ? `
                                <div class="project-actions">
                                    <button class="btn-secondary edit-project-btn button-profile" data-project-id="${proyecto.id_proyecto}">Editar Proyecto</button>
                                </div>
                            ` : ''}
                        `;
                        projectsGrid.appendChild(projectCard);
                    });
                } else {
                    projectsGrid.innerHTML = '<p>No hay proyectos para mostrar.</p>';
                }

                if (isMyProfile) {
                    document.querySelectorAll('.edit-project-btn').forEach(button => {
                        button.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const projectId = e.target.dataset.projectId;
                            await loadProjectForEdit(projectId);
                        });
                    });
                }

                document.querySelectorAll('.project-card').forEach(card => {
                    card.addEventListener('click', async (e) => {
                        const projectId = e.currentTarget.dataset.projectId;
                        await loadProjectForView(projectId);
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
    }

    const loadProjectForEdit = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:3000/proyectos/${projectId}`);
            if (response.ok) {
                const project = await response.json();
                document.getElementById('edit-project-id').value = project.id_proyecto;
                document.getElementById('edit-project-title').value = project.titulo;
                document.getElementById('edit-project-description').value = project.descripcion;
                document.getElementById('edit-project-category').value = project.categoria;
                document.getElementById('edit-project-start-date').value = project.fecha_inicio ? new Date(project.fecha_inicio).toISOString().split('T')[0] : '';
                document.getElementById('edit-project-end-date').value = project.fecha_finalizacion ? new Date(project.fecha_finalizacion).toISOString().split('T')[0] : '';
                document.getElementById('edit-project-client').value = project.para_quien_se_hizo || '';
                document.getElementById('edit-project-links').value = project.enlaces_referencia || '';
                document.getElementById('edit-project-privacy').value = project.privacidad?.toString() || 'false';
                
                // Mostrar la imagen actual del proyecto
                if (editProjectImagePreview) {
                    if (project.archivos && project.archivos.length > 0) {
                        editProjectImagePreview.src = `http://localhost:3000${project.archivos[0].url}`;
                        editProjectImagePreview.style.display = 'block';
                    } else {
                        editProjectImagePreview.src = '';
                        editProjectImagePreview.style.display = 'none';
                    }
                }
                // Limpiar el input de archivo
                if (editProjectPhotoInput) {
                    editProjectPhotoInput.value = '';
                }

                openModal(editProjectModal);
            } else {
                showMessage('No se pudo cargar el proyecto para edición.', 'error');
            }
        } catch (error) {
            console.error('Error al cargar el proyecto:', error);
            showMessage('Ocurrió un error al cargar el proyecto.', 'error');
        }
    };

    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const projectId = document.getElementById('edit-project-id').value;
        const formData = new FormData(editProjectForm);
        const data = Object.fromEntries(formData.entries());
        data.privacidad = data.privacidad === 'true';

        try {
            let archivos = [];
            // Si hay archivos existentes, se mantienen
            const existingProjectResponse = await fetch(`http://localhost:3000/proyectos/${projectId}`);
            if (existingProjectResponse.ok) {
                const existingProject = await existingProjectResponse.json();
                if (existingProject.archivos && existingProject.archivos.length > 0) {
                    archivos = existingProject.archivos;
                }
            }

            // Si se seleccionó un nuevo archivo, subirlo primero
            const projectPhotoFile = editProjectPhotoInput.files[0];
            if (projectPhotoFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('projectPhoto', projectPhotoFile);
                
                const uploadResponse = await fetch('http://localhost:3000/upload/project-photo', {
                    method: 'POST',
                    body: uploadFormData,
                });
                
                if (uploadResponse.ok) {
                    const uploadResult = await uploadResponse.json();
                    const newFilePath = uploadResult.filePath;
                    
                    // Reemplazar la URL del primer archivo (asumiendo que solo se maneja uno)
                    if (archivos.length > 0) {
                        archivos[0].url = newFilePath;
                    } else {
                        archivos.push({ url: newFilePath, tipo_archivo: 'image' });
                    }
                } else {
                    showMessage('Error al subir la nueva imagen del proyecto.', 'error');
                    return;
                }
            }
            
            // Reemplazamos los datos de `data` para el campo `archivos`
            const updateData = {
                titulo: data.titulo,
                descripcion: data.descripcion,
                categoria: data.categoria,
                fecha_inicio: data.fecha_inicio,
                fecha_finalizacion: data.fecha_finalizacion,
                para_quien_se_hizo: data.para_quien_se_hizo,
                enlaces_referencia: data.enlaces_referencia,
                privacidad: data.privacidad,
                archivos: archivos
            };

            const response = await fetch(`http://localhost:3000/proyectos/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updateData),
            });

            if (response.ok) {
                showMessage('Proyecto actualizado exitosamente.');
                closeModal(editProjectModal);
                window.location.reload();
            } else {
                showMessage('Error al actualizar el proyecto.', 'error');
            }
        } catch (error) {
            console.error('Error al actualizar proyecto:', error);
            showMessage('Ocurrió un error. Inténtalo de nuevo.', 'error');
        }
    });

    const loadProjectForView = async (projectId) => {
        try {
            const response = await fetch(`http://localhost:3000/proyectos/${projectId}`);
            if (response.ok) {
                const project = await response.json();

                // Ocultar o mostrar el botón de eliminar según el usuario
                if (isMyProfile && user.nom_usuario === project.nom_usuario) {
                    deleteProjectBtn.style.display = 'block';
                } else {
                    deleteProjectBtn.style.display = 'none';
                }
                deleteProjectBtn.dataset.projectId = projectId;

                let linksHtml = '';
                if (project.enlaces_referencia) {
                    const links = project.enlaces_referencia.split(',').map(link => link.trim());
                    linksHtml = `<div class="project-links"><h4>Enlaces de Referencia</h4><ul>${links.map(link => `<li><a href="${link}" target="_blank" class="enlace-refer-profile">${link}</a></li>`).join('')}</ul></div>`;
                }

                projectDetailsContent.innerHTML = `
                    <div class="project-details-header">
                        <h3 class="project-details-title">${project.titulo}</h3>
                        <p class="project-details-category">${project.categoria}</p>
                    </div>
                    <div class="project-details-image-container">
                        <img src="http://localhost:3000${project.archivos && project.archivos.length > 0 ? project.archivos[0].url : '/multimedia/placeholder.jpg'}" alt="Imagen del Proyecto" class="img-view-project">
                    </div>
                    <p class="project-details-description">${project.descripcion}</p><br>
                    <div class="project-details-meta">
                        <p><strong>Fecha de Publicación:</strong> ${new Date(project.fecha_publi).toLocaleDateString()}</p>
                        ${project.fecha_inicio ? `<p><strong>Fecha de Inicio:</strong> ${new Date(project.fecha_inicio).toLocaleDateString()}</p>` : ''}
                        ${project.fecha_finalizacion ? `<p><strong>Fecha de Finalización:</strong> ${new Date(project.fecha_finalizacion).toLocaleDateString()}</p>` : ''}
                        ${project.para_quien_se_hizo ? `<p><strong>Realizado para:</strong> ${project.para_quien_se_hizo}</p>` : ''}
                        ${linksHtml}
                        <p><strong>Privacidad:</strong> ${project.privacidad ? 'Privado' : 'Público'}</p>
                    </div>
                `;
                openModal(viewProjectModal);
            } else {
                showMessage('No se pudo cargar los detalles del proyecto.', 'error');
            }
        } catch (error) {
            console.error('Error al cargar los detalles del proyecto:', error);
            showMessage('Ocurrió un error al cargar los detalles del proyecto.', 'error');
        }
    };

    deleteProjectBtn.addEventListener('click', async () => {
        const projectId = deleteProjectBtn.dataset.projectId;
        if (confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.')) {
            try {
                const response = await fetch(`http://localhost:3000/proyectos/${projectId}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    showMessage('Proyecto eliminado exitosamente.');
                    closeModal(viewProjectModal);
                    window.location.reload();
                } else {
                    showMessage('Error al eliminar el proyecto.', 'error');
                }
            } catch (error) {
                console.error('Error al eliminar proyecto:', error);
                showMessage('Ocurrió un error al eliminar el proyecto.', 'error');
            }
        }
    });
});