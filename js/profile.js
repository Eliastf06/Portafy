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

    const urlParams = new URLSearchParams(window.location.search);
    const usernameFromUrl = urlParams.get('username');
    
    let userIdToLoad;
    let usernameToLoad;
    let isOwnProfile = false;

    // Obtener el usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();

    try {
        let userData;
        if (usernameFromUrl) {
            // Caso 1: Se está visualizando otro perfil
            const { data: fetchedUserData, error: userError } = await supabase
                .from('usuarios')
                .select('id, nombre, nom_usuario, tipo_usuario')
                .eq('nom_usuario', usernameFromUrl)
                .maybeSingle(); 

            if (userError || !fetchedUserData) {
                showMessage('Usuario no encontrado o error en la carga.', 'error');
                return;
            }
            userData = fetchedUserData;

        } else {
            // Caso 2: El usuario visita su propio perfil a través de un enlace estático
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

        // 1. Rellenar los campos del perfil con los datos correctos
        if (profilePhoto) profilePhoto.src = perfilData?.foto_perfil || 'multimedia/default-profile.png';
        if (profileName) profileName.textContent = userData?.nombre || 'Nombre no disponible';
        if (profileOccupation) profileOccupation.textContent = userData?.tipo_usuario || 'Sin ocupación';
        if (profileDescription) profileDescription.textContent = perfilData?.biografia || 'Sin biografía.';

        // 2. Rellenar los links de redes sociales
        if (profileSocials) {
            if (perfilData?.red_social || perfilData?.telefono || perfilData?.direccion) {
                profileSocials.innerHTML = `
                    ${perfilData.red_social ? `<p><i class="fas fa-link"></i> <a href="${perfilData.red_social}" target="_blank">${perfilData.red_social}</a></p>` : ''}
                    ${perfilData.telefono ? `<p><i class="fas fa-phone"></i> ${perfilData.telefono}</p>` : ''}
                    ${perfilData.direccion ? `<p><i class="fas fa-map-marker-alt"></i> ${perfilData.direccion}</p>` : ''}
                `;
            } else {
                profileSocials.innerHTML = '';
            }
        }

        // 3. Cargar y mostrar los proyectos del usuario
        const { data: projectsData, error: projectsError } = await supabase
            .from('proyectos')
            .select(`
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
                    </div>
                `;
                projectsGrid.appendChild(projectCard);
            });
        };
        renderProjects(projectsData);
        
        // 4. Manejar la visibilidad del botón de edición
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