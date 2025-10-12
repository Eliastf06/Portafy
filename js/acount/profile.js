
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

        const modalHtml = `
            <div class="modal-overlay">
                <div class="modal-content">
                    <button class="modal-close-btn">&times;</button>
                    <img src="${imageUrl}" alt="${project.titulo}" class="modal-image">
                    <div class="modal-details">
                        <h2>${project.titulo}</h2>
                        <p><strong>Autor:</strong> ${authorName}</p>
                        <p><strong>Descripción:</strong> ${project.descripcion || 'No disponible'}</p>
                        <p><strong>Fecha de inicio:</strong> ${project.fecha_inicio || 'No disponible'}</p>
                        <p><strong>Fecha de finalización:</strong> ${project.fecha_finalizacion || 'No disponible'}</p>
                        <p><strong>Para quién se hizo:</strong> ${project.para_quien_se_hizo || 'No disponible'}</p>
                        ${project.enlaces_referencia ? `
                        <p><strong>Enlace de referencia:</strong>
                            <a href="${project.enlaces_referencia}" target="_blank" class="referencia">${project.enlaces_referencia}</a>
                        </p>` : ''}
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

        setTimeout(() => {
            modalOverlay.classList.add('active');
            modalContent.classList.add('active');
        }, 10);

        const closeModal = () => {
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
                    showMessage(`Has dejado de seguir a @${usernameToLoad}.`, 'success');
                } else {//seguir
                    const { error } = await supabase
                        .from('seguidores')
                        .insert([
                            { id_usuario: followedId, id_seguidor: followerId }
                        ]);

                    if (error) throw error;
                    showMessage(`Ahora sigues a @${usernameToLoad}.`, 'success');
                }
                await loadFollowData(followedId, followerId);

            } catch (error) {
                console.error('Error al cambiar el estado de seguimiento:', error);
                showMessage('Error al procesar el seguimiento.', 'error');
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
                showMessage('Usuario no encontrado o error en la carga.', 'error');
                return;
            }
            userData = fetchedUserData[0];

        } else {
            if (!currentUserId) {
                showMessage('Por favor, inicia sesión para ver tu perfil.', 'error');
                if (editProfileBtn) editProfileBtn.style.display = 'none';
                if (followButtonContainer) followButtonContainer.innerHTML = '';
                return;
            }
            
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario, is_admin')
                .eq('id', currentUserId)
                .maybeSingle();

            if (userError || !fetchedUserData) {
                 showMessage('Error al cargar la información de tu cuenta.', 'error');
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
            showMessage('Error al cargar la información del perfil.', 'error');
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
                    ${perfilData.red_social ? `<p><a href="${perfilData.red_social}" target="_blank"><i class="${socialIconClass} red-social-icon"></i></a></p>` : ''}
                    ${perfilData.telefono ? `<p><i class="fas fa-phone"></i> ${perfilData.telefono}</p>` : ''}
                    ${perfilData.direccion ? `<p><i class="fas fa-map-marker-alt"></i> ${perfilData.direccion}</p>` : ''}
                `;
            } else {
                profileSocials.innerHTML = '';
            }
        }
        
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
                archivos(url)
            `)
            .eq('id', userIdToLoad);

        if (!isOwnProfile && !isAdmin) {
            query = query.eq('privacidad', false);
        }

        const { data: projectsData, error: projectsError } = await query;

        if (projectsError) {
            console.error('Error al cargar los proyectos:', projectsError);
            showMessage('Error al cargar los proyectos de este usuario.', 'error');
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
                const showEditButton = isOwnProfile || isAdmin;
                projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo} ${showEditButton && project.privacidad ? '<i class="fas fa-lock" title="Proyecto privado"></i>' : ''}</h3>
                        ${showEditButton ? `<div class="project-actions"><a href="edit-project.html?id=${project.id_proyectos}" class="edit-project-btn"><i class="fas fa-edit"></i></a></div>` : ''}
                    </div>
                `;
                projectsGrid.appendChild(projectCard);

                projectCard.addEventListener('click', (e) => {
                    if (e.target.closest('.edit-project-btn')) {
                        return;
                    }
                    showProjectModal(project, userData?.nombre || 'Desconocido');
                });
            });
        };
        renderProjects(projectsData);
        
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
        showMessage('Ocurrió un error inesperado al cargar el perfil.', 'error');
    }
});