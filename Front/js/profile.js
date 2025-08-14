document.addEventListener('DOMContentLoaded', async () => {
    let user = JSON.parse(localStorage.getItem('user'));
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    let profileData;
    let datosPerfil;
    let isMyProfile = false;

    const editProfileBtn = document.getElementById('edit-profile-btn');
    const editProfileModal = document.getElementById('edit-profile-modal');
    const editProfileCloseBtn = document.getElementById('edit-profile-close-btn');
    const editProfileForm = document.getElementById('editProfileForm');

    const showMessage = (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}]: ${message}`);
        alert(message);
    };

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

    document.getElementById('profile-name').textContent = profileData.nombre || 'Nombre Apellido';
    document.getElementById('profile-occupation').textContent = profileData.tipo_usuario || 'Ocupación';
    document.getElementById('profile-description').textContent = datosPerfil.biografia || 'Sin biografía.';
    
    const profilePhoto = document.getElementById('profile-photo');
    if (datosPerfil.foto_perfil) {
        profilePhoto.src = `http://localhost:3000${datosPerfil.foto_perfil}`;
    }

    const socialsDiv = document.getElementById('profile-socials');
    socialsDiv.innerHTML = '';
    if (datosPerfil.red_social) {
        socialsDiv.innerHTML = `<a href="${datosPerfil.red_social}" target="_blank" class="social-link"><i class="fab fa-github"></i> Red Social</a>`;
    }

    if (isMyProfile && editProfileBtn) {
        editProfileBtn.style.display = 'block';
        editProfileBtn.addEventListener('click', () => {
            if (editProfileModal) {
                editProfileModal.classList.add('active');
                
                // Llenar los campos con los datos actuales, incluidos los nuevos campos
                document.getElementById('editName').value = profileData.nombre || '';
                document.getElementById('editOccupation').value = profileData.tipo_usuario || '';
                document.getElementById('editBio').value = datosPerfil.biografia || '';
                document.getElementById('editSocial').value = datosPerfil.red_social || '';
                document.getElementById('editPhone').value = datosPerfil.telefono || '';
                document.getElementById('editAddress').value = datosPerfil.direccion || '';
                document.getElementById('editExperience').value = datosPerfil.experiencia || '';
                document.getElementById('editPrivacy').checked = datosPerfil.privacidad;
            }
        });
    }

    if (editProfileCloseBtn) {
        editProfileCloseBtn.addEventListener('click', () => {
            if (editProfileModal) {
                editProfileModal.classList.remove('active');
            }
        });
    }

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const formData = new FormData(form);

            const userUpdateData = {
                nombre: formData.get('nombre'),
                tipo_usuario: formData.get('tipo_usuario')
            };

            const datosPerfilUpdateData = {
                biografia: formData.get('biografia'),
                red_social: formData.get('red_social'),
                telefono: formData.get('telefono'),
                direccion: formData.get('direccion'),
                experiencia: formData.get('experiencia'),
                privacidad: formData.get('privacidad') === 'on' ? true : false,
            };
            
            const fileInput = document.getElementById('editPhoto');
            if (fileInput.files.length > 0) {
                const photoData = new FormData();
                photoData.append('profilePhoto', fileInput.files[0]);
                try {
                    const photoResponse = await fetch('http://localhost:3000/upload/profile-photo', {
                        method: 'POST',
                        body: photoData,
                    });
                    const photoResult = await photoResponse.json();
                    if (photoResponse.ok) {
                        datosPerfilUpdateData.foto_perfil = photoResult.filePath;
                    } else {
                        showMessage('Error al subir la foto de perfil.', 'error');
                        return;
                    }
                } catch (error) {
                    console.error('Error de red al subir la foto:', error);
                    showMessage('Error de red al subir la foto de perfil.', 'error');
                    return;
                }
            }

            try {
                const userResponse = await fetch(`http://localhost:3000/usuarios/${user.nom_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(userUpdateData),
                });
                
                if (!userResponse.ok) {
                    const errorData = await userResponse.json();
                    showMessage(`Error al actualizar los datos de usuario: ${errorData.message}`, 'error');
                    console.error('Detalles del error:', errorData);
                    return;
                }
                const updatedUserResponse = await userResponse.json();
                localStorage.setItem('user', JSON.stringify(updatedUserResponse.user));
                user = updatedUserResponse.user;
            } catch (error) {
                console.error('Error al actualizar los datos de usuario:', error);
                showMessage('Ocurrió un error de conexión al actualizar los datos de usuario.', 'error');
                return;
            }

            try {
                const datosPerfilResponse = await fetch(`http://localhost:3000/datosPerfil/${user.nom_usuario}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(datosPerfilUpdateData),
                });
                
                if (datosPerfilResponse.ok) {
                    showMessage('Perfil actualizado exitosamente.', 'success');
                    location.reload();
                } else {
                    const errorData = await datosPerfilResponse.json();
                    showMessage(`Error al actualizar el perfil: ${errorData.message}`, 'error');
                    console.error('Detalles del error:', errorData);
                }
            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                showMessage('Ocurrió un error de conexión al actualizar el perfil. Por favor, revisa que el servidor esté en funcionamiento.', 'error');
            }
        });
    }

    try {
        const projectsGrid = document.getElementById('user-projects-grid');
        // Vuelve la lógica de privacidad que no se usaba en la versión simplificada
        if (datosPerfil.privacidad && !isMyProfile) {
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
                        projectCard.innerHTML = `
                            <div class="project-image-placeholder">
                                <img src="http://localhost:3000${proyecto.archivos && proyecto.archivos.length > 0 ? proyecto.archivos[0].url : '/multimedia/placeholder.jpg'}" alt="Imagen de Proyecto">
                            </div>
                            <h3 class="project-name">${proyecto.titulo}</h3>
                        `;
                        projectsGrid.appendChild(projectCard);
                    });
                } else {
                    projectsGrid.innerHTML = '<p>No hay proyectos para mostrar.</p>';
                }
            }
        }
    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
    }
});
