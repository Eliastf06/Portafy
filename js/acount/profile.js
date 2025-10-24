import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// **FUNCIÓN NUEVA**: Inicializa el Drag and Drop
const initDragAndDrop = (gridElement) => {
    // Verificar si Sortable está disponible
    if (typeof Sortable === 'undefined') {
        console.error('SortableJS no está cargado. Asegúrate de incluir la librería en profile.html');
        return;
    }

    new Sortable(gridElement, {
        animation: 250, // Animación suave
        handle: '.drag-handle', // Elemento que activa el arrastre
        ghostClass: 'sortable-ghost', // Clase para el estilo del fantasma
        onEnd: async (evt) => {
            const projectCards = Array.from(gridElement.children);
            
            // Crear un array de objetos con el ID del proyecto y su nueva posición (índice + 1)
            const updates = projectCards.map((card, index) => ({
                id: parseInt(card.dataset.projectId, 10),
                pos: index + 1, // La posición va de 1 en adelante
            }));

            // Llamar a la función RPC de Supabase para actualizar todas las posiciones
            const { error } = await supabase.rpc('update_project_positions', { updates });

            if (error) {
                console.error('Error al actualizar el orden de los proyectos:', error);
                const toastEvent = new CustomEvent('showToast', {
                    detail: { message: 'No se pudo guardar el nuevo orden.', type: 'error' }
                });
                document.dispatchEvent(toastEvent);
                // Si falla, podrías recargar para revertir el orden visual
                // window.location.reload(); 
            } else {
                const toastEvent = new CustomEvent('showToast', {
                    detail: { message: 'Orden de proyectos actualizado.', type: 'success' }
                });
                document.dispatchEvent(toastEvent);
            }
        },
    });
};


document.addEventListener('DOMContentLoaded', async () => {
    const profileMessage = document.getElementById('profile-message');
    const projectsGrid = document.getElementById('projects-grid');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    const followButtonContainer = document.getElementById('follow-button-container');
    const followersCountContainer = document.getElementById('followers-count-container');
    const followersCountSpan = document.getElementById('followers-count');
    
    const profilePhoto = document.getElementById('profile-photo');
    const profileName = document.getElementById('profile-name');
    const profileOccupation = document.getElementById('profile-occupation');
    const profileDescription = document.getElementById('profile-description');
    const profileSocials = document.getElementById('profile-socials');

    const showMessage = (message, type = 'success') => {
        if (profileMessage) {
            profileMessage.textContent = message;
            profileMessage.className = `profile-message-${type}`;
            profileMessage.style.display = 'block';
        }
    };
    
    const getSocialIconClass = (url) => {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('github.com')) {
            return 'fab fa-github';
        } else if (urlLower.includes('linkedin.com')) {
            return 'fab fa-linkedin';
        } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
            return 'fab fa-twitter';
        } else if (urlLower.includes('instagram.com')) {
            return 'fab fa-instagram';
        } else if (urlLower.includes('facebook.com')) {
            return 'fab fa-facebook';
        } else if (urlLower.includes('tiktok.com')) {
            return 'fab fa-tiktok';
        } else if (urlLower.includes('twitch.tv')) {
            return 'fab fa-twitch';
        } else if (urlLower.includes('youtube.com')) {
            return 'fab fa-youtube';
        } else if (urlLower.includes('discord.gg') || urlLower.includes('discord.com')) {
            return 'fab fa-discord';
        } else if (urlLower.includes('t.me') || urlLower.includes('telegram.org')) {
            return 'fab fa-telegram-plane';
        } else if (urlLower.includes('reddit.com')) {
            return 'fab fa-reddit';
        } else if (urlLower.includes('snapchat.com')) {
            return 'fab fa-snapchat-ghost';
        } else {
            return 'fas fa-link';
        }
    };

    const showProjectModal = (project, authorName) => {
        const imageUrl = project.archivos && project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image';

        // Preparación de datos opcionales para evitar que se muestre el texto "No disponible"
        const descripcion = project.descripcion || 'No disponible';
        const fechaInicio = project.fecha_inicio;
        const fechaFinalizacion = project.fecha_finalizacion;
        const paraQuienSeHizo = project.para_quien_se_hizo;
        const enlaceReferencia = project.enlaces_referencia;
        
        // Renderizado condicional
        const fechasHtml = (fechaInicio || fechaFinalizacion) 
            ? `<p><strong>Fechas:</strong> ${fechaInicio || 'No disponible'} / ${fechaFinalizacion || 'No disponible'}</p>`
            : '';
            
        const paraQuienHtml = paraQuienSeHizo
            ? `<p><strong>Para quién se hizo:</strong> ${paraQuienSeHizo}</p>`
            : '';

        const enlaceHtml = enlaceReferencia 
            ? `<p><strong>Enlace de referencia:</strong>
                <a href="${enlaceReferencia}" target="_blank" class="referencia">${enlaceReferencia}</a>
               </p>` 
            : '';

        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close-btn" aria-label="Cerrar modal">&times;</button>
                    <img src="${imageUrl}" alt="${project.titulo}" class="modal-image">
                    <div class="modal-details">
                        <h2>${project.titulo}</h2>
                        <p>${descripcion}</p>
                        <p><strong>Autor:</strong> ${authorName}</p>
                        ${fechasHtml}
                        ${paraQuienHtml}
                        ${enlaceHtml}
                    </div>
                </div>
            </div>
        `;

        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);

        const modalOverlay = modalContainer.querySelector('.modal-overlay');
        const modalContent = modalContainer.querySelector('.modal-content');
        const modalCloseBtn = modalContainer.querySelector('.modal-close-btn');

        // Microtransición al aparecer
        setTimeout(() => {
            modalOverlay.classList.add('active');
            modalContent.classList.add('active');
        }, 10);

        const closeModal = () => {
            // Microtransición al salir
            modalOverlay.classList.remove('active');
            modalContent.classList.remove('active');
            setTimeout(() => {
                modalContainer.remove();
            }, 300);
        };

        modalCloseBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
        
        // Accesibilidad: Cerrar con la tecla ESC
        document.addEventListener('keydown', function onKeydown(e) {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', onKeydown);
            }
        });
    };


    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('username');
    
    let userIdToLoad;
    let usernameToLoad;
    let isOwnProfile = false;
    let isAdmin = false;

    const { data: { user } } = await supabase.auth.getUser();
    const currentUserId = user?.id; 

    // Funciones de Seguimiento

    const getFollowStatus = async (followedId, followerId) => {
        const { data, error } = await supabase
            .from('seguidores')
            .select('id_seguimiento')
            .eq('id_usuario', followedId) 
            .eq('id_seguidor', followerId) 
            .maybeSingle();

        if (error) {
            console.error('Error al obtener estado de seguimiento:', error);
            return null;
        }
        return data ? data.id_seguimiento : null;
    };

    const countFollowers = async (userId) => {
        const { count, error } = await supabase
            .from('seguidores')
            .select('id_seguimiento', { count: 'exact', head: true })
            .eq('id_usuario', userId);

        if (error) {
            console.error('Error al contar seguidores:', error);
            return 0;
        }
        return count;
    };

    const renderFollowButton = async (followedId, followerId) => {
        if (!followButtonContainer || !followerId || followedId === followerId) {
            if (followButtonContainer) followButtonContainer.innerHTML = '';
            return;
        }

        const followId = await getFollowStatus(followedId, followerId);
        const isFollowing = !!followId;

        const button = document.createElement('button');
        button.className = `follow-btn ${isFollowing ? 'unfollow' : 'follow'}`;
        button.textContent = isFollowing ? 'Dejar de Seguir' : 'Seguir';
        button.setAttribute('aria-label', isFollowing ? 'Dejar de seguir a este usuario' : 'Seguir a este usuario');

        button.addEventListener('click', async () => {
            button.disabled = true;
            try {
                if (isFollowing) {
                    // Dejar de seguir
                    const { error } = await supabase
                        .from('seguidores')
                        .delete()
                        .eq('id_seguimiento', followId);

                    if (error) throw error;
                    // Uso de Toast (Sistema de toast perfecto)
                    const toastEvent = new CustomEvent('showToast', {
                        detail: { message: `Has dejado de seguir a @${usernameToLoad}.`, type: 'success' }
                    });
                    document.dispatchEvent(toastEvent);
                } else {//seguir
                    const { error } = await supabase
                        .from('seguidores')
                        .insert([
                            { id_usuario: followedId, id_seguidor: followerId }
                        ]);

                    if (error) throw error;
                    // Uso de Toast (Sistema de toast perfecto)
                    const toastEvent = new CustomEvent('showToast', {
                        detail: { message: `Ahora sigues a @${usernameToLoad}.`, type: 'success' }
                    });
                    document.dispatchEvent(toastEvent);
                }
                await loadFollowData(followedId, followerId);

            } catch (error) {
                console.error('Error al cambiar el estado de seguimiento:', error);
                // Uso de Toast (Sistema de toast perfecto)
                const toastEvent = new CustomEvent('showToast', {
                    detail: { message: 'Error al procesar el seguimiento.', type: 'error' }
                });
                document.dispatchEvent(toastEvent);
            } finally {
                button.disabled = false;
            }
        });

        followButtonContainer.innerHTML = '';
        followButtonContainer.appendChild(button);
    };

    const loadFollowData = async (followedId, followerId) => {
        const followerCount = await countFollowers(followedId);
        if (followersCountSpan) followersCountSpan.textContent = followerCount;

        if ((isOwnProfile || isAdmin) && followersCountContainer) {
            followersCountContainer.style.display = 'flex';
        } else if (followersCountContainer) {
             followersCountContainer.style.display = 'none';
        }

        await renderFollowButton(followedId, followerId);
    };


    try {
        if (currentUserId) {
            const { data: loggedInUser, error: loggedInUserError } = await supabase
                .from('usuarios')
                .select('is_admin')
                .eq('id', currentUserId)
                .single();
            if (!loggedInUserError && loggedInUser?.is_admin) {
                isAdmin = true;
            }
        }
        
        let userData;
        if (usernameFromUrl) {
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario, is_admin')
                .eq('nom_usuario', usernameFromUrl);
            
            if (userError || !fetchedUserData || fetchedUserData.length === 0) {
                // Si el nombre de usuario no se encuentra, mostrar un error y salir
                // Uso de Toast (Sistema de toast perfecto)
                const toastEvent = new CustomEvent('showToast', {
                    detail: { message: 'Usuario no encontrado o error en la carga.', type: 'error' }
                });
                document.dispatchEvent(toastEvent);
                return;
            }
            userData = fetchedUserData[0];

        } else {
            if (!currentUserId) {
                document.body.style.opacity = '0';
                document.body.style.transition = 'opacity 0.5s ease-out';
                setTimeout(() => {
                    window.location.href = 'discover.html';
                }, 500);
                return; 
            }
            
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario, is_admin')
                .eq('id', currentUserId)
                .maybeSingle();

            if (userError || !fetchedUserData) {
                 // Uso de Toast (Sistema de toast perfecto)
                 const toastEvent = new CustomEvent('showToast', {
                    detail: { message: 'Error al cargar la información de tu cuenta.', type: 'error' }
                });
                document.dispatchEvent(toastEvent);
                 return;
            }
            userData = fetchedUserData;
        }
        
        userIdToLoad = userData.id;
        usernameToLoad = userData.nom_usuario;
        isOwnProfile = (currentUserId && currentUserId === userIdToLoad);

        await loadFollowData(userIdToLoad, currentUserId);

        const { data: perfilData, error: perfilError } = await supabase
            .from('datos_perfil')
            .select('*')
            .eq('id', userIdToLoad)
            .maybeSingle();

        if (perfilError) {
            console.error('Error al cargar la información del perfil:', perfilError);
            // Uso de Toast (Sistema de toast perfecto)
            const toastEvent = new CustomEvent('showToast', {
                detail: { message: 'Error al cargar la información del perfil.', type: 'error' }
            });
            document.dispatchEvent(toastEvent);
            return;
        }

        if (profilePhoto) profilePhoto.src = perfilData?.foto_perfil || 'multimedia/default-profile.png';
        if (profileName) profileName.textContent = userData?.nombre || 'Nombre no disponible';
        if (profileOccupation) profileOccupation.textContent = userData?.tipo_usuario || 'Sin ocupación';
        if (profileDescription) profileDescription.textContent = perfilData?.biografia || 'Sin biografía.';

        if (profileSocials) {
            if (perfilData?.red_social || perfilData?.telefono || perfilData?.direccion) {
                const socialIconClass = perfilData.red_social ? getSocialIconClass(perfilData.red_social) : 'fas fa-link';
                profileSocials.innerHTML = `
                    ${perfilData.red_social ? `<p><a href="${perfilData.red_social}" target="_blank" aria-label="Red social"><i class="${socialIconClass} red-social-icon" aria-hidden="true"></i></a></p>` : ''}
                    ${perfilData.telefono ? `<p><i class="fas fa-phone" aria-hidden="true"></i> ${perfilData.telefono}</p>` : ''}
                    ${perfilData.direccion ? `<p><i class="fas fa-map-marker-alt" aria-hidden="true"></i> ${perfilData.direccion}</p>` : ''}
                `;
            } else {
                profileSocials.innerHTML = '';
            }
        }
        
        // **ACTUALIZACIÓN DE QUERY (PASO 1):** Incluye 'position' y usa .order()
        let query = supabase
            .from('proyectos')
            .select(`
                id_proyectos,
                titulo,
                descripcion,
                fecha_inicio,
                fecha_finalizacion,
                para_quien_se_hizo,
                enlaces_referencia,
                privacidad,
                position, 
                archivos(url)
            `)
            .eq('id', userIdToLoad)
            .order('position', { ascending: true, nullsFirst: false }); 

        if (!isOwnProfile && !isAdmin) {
            query = query.eq('privacidad', false);
        }

        const { data: projectsData, error: projectsError } = await query;

        if (projectsError) {
            console.error('Error al cargar los proyectos:', projectsError);
            // Uso de Toast (Sistema de toast perfecto)
            const toastEvent = new CustomEvent('showToast', {
                detail: { message: 'Error al cargar los proyectos de este usuario.', type: 'error' }
            });
            document.dispatchEvent(toastEvent);
            return;
        }
        
        const renderProjects = (projects) => {
            if (!projectsGrid) return;
            projectsGrid.innerHTML = '';
            if (projects.length === 0) {
                const message = (isOwnProfile || isAdmin) 
                    ? `Este usuario aún no tiene proyectos ${isOwnProfile ? 'públicos o privados' : 'visibles'}.`
                    : 'Este usuario aún no tiene proyectos públicos.';
                projectsGrid.innerHTML = `<p class="text-center">${message}</p>`;
                return;
            }
            projects.forEach(project => {
                const imageUrl = project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image';
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                // **ACTUALIZACIÓN**: Añadir data-attribute para identificar el proyecto (necesario para la actualización de orden)
                projectCard.setAttribute('data-project-id', project.id_proyectos);

                const showActions = isOwnProfile || isAdmin;
                
                // **ACTUALIZACIÓN**: Añadir el drag handle (controlador de arrastre) si el usuario tiene permiso
                projectCard.innerHTML = `
                    ${showActions ? '<i class="fas fa-grip-vertical drag-handle" title="Arrastrar para reordenar"></i>' : ''}
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo} ${showActions && project.privacidad ? '<i class="fas fa-lock" title="Proyecto privado"></i>' : ''}</h3>
                        ${showActions ? `<div class="project-actions"><a href="edit-project.html?id=${project.id_proyectos}" class="edit-project-btn" aria-label="Editar proyecto"><i class="fas fa-pencil-alt"></i></a></div>` : ''}
                    </div>
                `;
                projectsGrid.appendChild(projectCard);

                projectCard.addEventListener('click', (e) => {
                    // Evitar abrir el modal si se está interactuando con el drag handle o los botones de acción
                    if (e.target.closest('.edit-project-btn') || e.target.closest('.drag-handle')) {
                        return;
                    }
                    showProjectModal(project, userData?.nombre || 'Desconocido');
                });
            });
        };

        renderProjects(projectsData);
        
        // **ACTUALIZACIÓN**: Inicializar el drag and drop si el usuario tiene permiso
        if (isOwnProfile || isAdmin) {
            initDragAndDrop(projectsGrid);
        }
        
        if (editProfileBtn) { 
             if (isOwnProfile || isAdmin) {
                editProfileBtn.style.display = 'block';
                editProfileBtn.href = `edit-profile.html?user_id=${userIdToLoad}`;
            } else {
                editProfileBtn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        const toastEvent = new CustomEvent('showToast', {
            detail: { message: 'Ocurrió un error inesperado al cargar el perfil.', type: 'error' }
        });
        document.dispatchEvent(toastEvent);
    }
});
