// js/search.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('barra-busqueda');
    const sideSearchInput = document.getElementById('side-search-input');
    const projectsGrid = document.getElementById('projects-grid');

    const renderProjects = (projects) => {
        if (!projectsGrid) {
            console.error('Elemento del DOM con ID "projects-grid" no encontrado.');
            return;
        }

        projectsGrid.innerHTML = '';
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No se encontraron proyectos que coincidan con la búsqueda.</p>';
            return;
        }

        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            projectCard.innerHTML = `
                <img src="${project.imageUrl || 'https://placehold.co/600x400/000000/white?text=No+Image'}" alt="Imagen del proyecto">
                <div class="project-info">
                    <h4>${project.titulo}</h4>
                    <p class="project-author">Por: ${project.authorName}</p>
                </div>
            `;
            projectCard.addEventListener('click', () => {
                if (project.authorName) {
                    window.location.href = `profile.html?username=${project.authorName}`;
                }
            });
            projectsGrid.appendChild(projectCard);
        });
    };
    
    const performSearch = async (query) => {
        if (!projectsGrid) return;
        
        projectsGrid.innerHTML = '<p>Buscando proyectos...</p>';

        try {
            let combinedResults = [];
            const processedProjectIds = new Set();
            const userNamesMap = new Map();

            // Paso 1: Búsqueda de proyectos por título
            const { data: projectsByTitle, error: projectsError } = await supabase
                .from('proyectos')
                .select(`
                    id_proyectos:id,
                    titulo,
                    privacidad,
                    id_usuario:id,
                    archivos(url)
                `)
                .eq('privacidad', false)
                .ilike('titulo', `%${query}%`);
            
            if (projectsError) throw projectsError;
            
            // Recolectar IDs de usuario de los proyectos encontrados
            const userIds = projectsByTitle.map(p => p.id_usuario);
            const uniqueUserIds = [...new Set(userIds)];
            
            // Obtener nombres de usuario de los proyectos encontrados
            const { data: usersData, error: usersError } = await supabase
                .from('usuarios')
                .select('id, nom_usuario')
                .in('id', uniqueUserIds);

            if (usersError) throw usersError;
            usersData.forEach(user => userNamesMap.set(user.id, user.nom_usuario));

            // Agregar proyectos encontrados por título a la lista de resultados
            projectsByTitle.forEach(project => {
                if (!processedProjectIds.has(project.id_proyectos)) {
                    combinedResults.push({
                        titulo: project.titulo,
                        authorName: userNamesMap.get(project.id_usuario),
                        imageUrl: project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image'
                    });
                    processedProjectIds.add(project.id_proyectos);
                }
            });

            // Paso 2: Búsqueda de usuarios por nombre
            const { data: usersFound, error: userSearchError } = await supabase
                .from('usuarios')
                .select('id, nom_usuario')
                .ilike('nom_usuario', `%${query}%`);
            
            if (userSearchError) throw userSearchError;

            // Para cada usuario encontrado, buscar sus proyectos públicos
            for (const user of usersFound) {
                const { data: userProjects, error: projectsByAuthorError } = await supabase
                    .from('proyectos')
                    .select(`
                        id_proyectos:id,
                        titulo,
                        privacidad,
                        archivos(url)
                    `)
                    .eq('privacidad', false)
                    .eq('id', user.id);
                
                if (projectsByAuthorError) throw projectsByAuthorError;
                
                userProjects.forEach(project => {
                    if (!processedProjectIds.has(project.id_proyectos)) {
                        combinedResults.push({
                            titulo: project.titulo,
                            authorName: user.nom_usuario,
                            imageUrl: project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image'
                        });
                        processedProjectIds.add(project.id_proyectos);
                    }
                });
            }

            renderProjects(combinedResults);

        } catch (error) {
            console.error('Error al realizar la búsqueda:', error);
            projectsGrid.innerHTML = `<p>Ocurrió un error al buscar: ${error.message}</p>`;
        }
    };
    
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performSearch(query);
            } else if (query.length === 0) {
                window.location.reload();
            }
        });
    }

    if (sideSearchInput) {
        sideSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length > 2) {
                performSearch(query);
            } else if (query.length === 0) {
                window.location.reload();
            }
        });
    }

});