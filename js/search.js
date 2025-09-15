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
            const allProjects = new Map();

            // Buscar proyectos por título (solo proyectos públicos)
            const { data: projectsByTitle, error: projectsTitleError } = await supabase
                .from('proyectos')
                .select(`
                    id_proyectos,
                    titulo,
                    id_usuario:id,
                    archivos(url)
                `)
                .eq('privacidad', false)
                .ilike('titulo', `%${query}%`);
            
            if (projectsTitleError) throw projectsTitleError;
            
            projectsByTitle.forEach(project => {
                allProjects.set(project.id_proyectos, {
                    id: project.id_proyectos,
                    titulo: project.titulo,
                    id_usuario: project.id_usuario,
                    imageUrl: project.archivos[0]?.url || 'https://placehold.co/600x400/000000/white?text=No+Image'
                });
            });

            // Buscar usuarios por nombre de usuario
            const { data: usersFound, error: userSearchError } = await supabase
                .from('usuarios')
                .select('id, nom_usuario')
                .ilike('nom_usuario', `%${query}%`);
            
            if (userSearchError) throw userSearchError;
            
            const userIdsFound = usersFound.map(user => user.id);
            const userNamesMap = new Map(usersFound.map(user => [user.id, user.nom_usuario]));

            // Buscar proyectos públicos de los usuarios encontrados
            if (userIdsFound.length > 0) {
                const { data: projectsByAuthor, error: projectsAuthorError } = await supabase
                    .from('proyectos')
                    .select(`
                        id_proyectos,
                        titulo,
                        id_usuario:id,
                        archivos(url)
                    `)
                    .eq('privacidad', false)
                    .in('id', userIdsFound);

                if (projectsAuthorError) throw projectsAuthorError;

                projectsByAuthor.forEach(project => {
                    if (!allProjects.has(project.id_proyectos)) {
                        allProjects.set(project.id_proyectos, {
                            id: project.id_proyectos,
                            titulo: project.titulo,
                            id_usuario: project.id_usuario,
                            imageUrl: project.archivos[0]?.url || 'https://placehold.co/600x400/000000/white?text=No+Image'
                        });
                    }
                });
            }

            // Obtener una lista única de todos los IDs de usuario de los proyectos encontrados
            const allUserIds = new Set(Array.from(allProjects.values()).map(p => p.id_usuario));
            const uniqueAllUserIds = Array.from(allUserIds);

            // Obtener los nombres de usuario para todos los IDs
            const { data: allUsersData, error: allUsersError } = await supabase
                .from('usuarios')
                .select('id, nom_usuario')
                .in('id', uniqueAllUserIds);
            
            if (allUsersError) throw allUsersError;

            // Crear un mapa completo de IDs de usuario a nombres de usuario
            const finalUserNamesMap = new Map(allUsersData.map(user => [user.id, user.nom_usuario]));

            // Mapear los proyectos combinados para obtener los nombres de autor correctos
            const finalProjects = Array.from(allProjects.values()).map(project => ({
                titulo: project.titulo,
                authorName: finalUserNamesMap.get(project.id_usuario) || 'Desconocido',
                imageUrl: project.imageUrl
            }));
            
            renderProjects(finalProjects);

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