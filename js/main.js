// js/main.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    // Referencias a los elementos del DOM
    const profileLink = document.getElementById('profile-link');
    const carouselTrack = document.getElementById('carousel-track');

    const updateUI = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Usuario logeado: mostrar "Ver mi Portafolios"
            const { data: userData, error } = await supabase
                .from('usuarios')
                .select('nom_usuario')
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error('Error al obtener el nombre de usuario:', error);
                profileLink.href = 'profile.html';
            } else {
                profileLink.href = `profile.html?username=${userData.nom_usuario}`;
            }
        } else {
            // Usuario no logeado: mostrar "Iniciar Sesión"
            profileLink.href = 'signin.html';
        }
    };

    const fetchAndRenderCarouselProjects = async () => {
        try {
            // Obtener los proyectos públicos.
            const { data: projectsData, error: projectsError } = await supabase
                .from('proyectos')
                .select(`
                    id,
                    titulo,
                    archivos(url)
                `)
                .eq('privacidad', false);

            if (projectsError) throw projectsError;

            // Extraer los IDs de usuario únicos de la columna 'id' de proyectos.
            const userIds = projectsData.map(p => p.id);
            const uniqueUserIds = [...new Set(userIds)];
            
            // Obtener los nombres de usuario de la tabla 'usuarios' usando esos IDs.
            const { data: usersData, error: usersError } = await supabase
                .from('usuarios')
                .select(`
                    id,
                    nom_usuario
                `)
                .in('id', uniqueUserIds);
            
            if (usersError) throw usersError;

            // Mapear los nombres de usuario a los proyectos.
            const usersMap = new Map(usersData.map(user => [user.id, user.nom_usuario]));
            
            const finalProjects = projectsData.map(project => ({
                ...project,
                authorName: usersMap.get(project.id)
            }));
            
            // Barajar y seleccionar proyectos para el carrusel.
            const shuffledProjects = finalProjects.sort(() => 0.5 - Math.random());
            const selectedProjects = shuffledProjects.slice(0, 10);

            if (selectedProjects.length === 0) {
                carouselTrack.innerHTML = '<p style="text-align: center; width: 100%;">No hay proyectos para mostrar en el carrusel.</p>';
                return;
            }

            const infiniteProjects = [...selectedProjects, ...selectedProjects];
            const fragment = document.createDocumentFragment();

            infiniteProjects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.className = 'project-card';
                
                const imageUrl = (project.archivos && project.archivos.length > 0)
                    ? project.archivos[0].url
                    : 'https://placehold.co/600x400/0a0a1a/white?text=No+Image';
                
                const authorName = project.authorName || 'Autor desconocido';

                projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        <div class="project-author">
                            <span class="author-name">
                                ${authorName}
                            </span>
                        </div>
                    </div>
                `;

                projectCard.addEventListener('click', () => {
                    window.location.href = `profile.html?username=${authorName}`;
                });
                
                fragment.appendChild(projectCard);
            });

            carouselTrack.innerHTML = '';
            carouselTrack.appendChild(fragment);

        } catch (error) {
            console.error('Error al cargar los proyectos para el carrusel:', error);
            carouselTrack.innerHTML = `<p style="text-align: center; width: 100%;">Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        }
    };

    updateUI();
    fetchAndRenderCarouselProjects();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            updateUI();
        }
    });
});