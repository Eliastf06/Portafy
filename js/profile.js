// js/profile.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const profileMessage = document.getElementById('profile-message');
    const projectsGrid = document.getElementById('projects-grid');
    const editProfileBtn = document.getElementById('edit-profile-btn');
    
    // Elementos del perfil para rellenar
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
    
    // Función para determinar la clase del icono de la red social
    const getSocialIconClass = (url) => {
        const urlLower = url.toLowerCase();
        if (urlLower.includes('github.com')) {
            return 'fab fa-github';
        } else if (urlLower.includes('linkedin.com')) {
            return 'fab fa-linkedin';
        } else if (urlLower.includes('twitter.com') || urlLower.includes('x.com')) {
            return 'fab fa-x';
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

    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('username');
    
    let userIdToLoad;
    let usernameToLoad;
    let isOwnProfile = false;

    const { data: { user } } = await supabase.auth.getUser();

    try {
        let userData;
        if (usernameFromUrl) {
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario')
                .eq('nom_usuario', usernameFromUrl);
            
            if (userError || !fetchedUserData || fetchedUserData.length === 0) {
                showMessage('Usuario no encontrado o error en la carga.', 'error');
                return;
            }
            // Tomar el primer resultado para evitar el error de múltiples filas
            userData = fetchedUserData[0]; 

        } else {
            if (!user) {
                showMessage('Por favor, inicia sesión para ver tu perfil.', 'error');
                if (editProfileBtn) editProfileBtn.style.display = 'none';
                return;
            }
            
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario')
                .eq('id', user.id)
                .maybeSingle();

            if (userError || !fetchedUserData) {
                 showMessage('Error al cargar la información de tu cuenta.', 'error');
                 return;
            }
            userData = fetchedUserData;
        }

        userIdToLoad = userData.id;
        usernameToLoad = userData.nom_usuario;
        isOwnProfile = (user && user.id === userIdToLoad);

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
                // Se utiliza la nueva función para obtener el icono
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
        
        // CORRECCIÓN: Se añade id_proyectos a la consulta de proyectos
        const { data: projectsData, error: projectsError } = await supabase
            .from('proyectos')
            .select(`
                id_proyectos,
                titulo,
                privacidad,
                archivos(url)
            `)
            .eq('id', userIdToLoad)
            .eq('privacidad', false);

        if (projectsError) {
            console.error('Error al cargar los proyectos:', projectsError);
            showMessage('Error al cargar los proyectos de este usuario.', 'error');
            return;
        }

        const renderProjects = (projects) => {
            if (!projectsGrid) return;
            projectsGrid.innerHTML = '';
            if (projects.length === 0) {
                projectsGrid.innerHTML = '<p class="text-center">Este usuario aún no tiene proyectos públicos.</p>';
                return;
            }
            projects.forEach(project => {
                const imageUrl = project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image';
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        ${isOwnProfile ? `<div class="project-actions"><a href="edit-project.html?id=${project.id_proyectos}" class="edit-project-btn"><i class="fas fa-edit"></i></a></div>` : ''}
                    </div>
                `;
                projectsGrid.appendChild(projectCard);
            });
        };
        renderProjects(projectsData);
        
        if (editProfileBtn) {
             if (isOwnProfile) {
                editProfileBtn.style.display = 'block';
                editProfileBtn.addEventListener('click', () => {
                    window.location.href = 'edit-profile.html';
                });
            } else {
                editProfileBtn.style.display = 'none';
            }
        }
    } catch (error) {
        console.error('Error al cargar el perfil:', error);
        showMessage('Ocurrió un error inesperado al cargar el perfil.', 'error');
    }
});