// js/search.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('barra-busqueda');
    const sideSearchInput = document.getElementById('side-search-input');
    const projectsGrid = document.getElementById('projects-grid');
    const categorySelect = document.getElementById('category-select');

    if (!projectsGrid || !categorySelect) {
        console.error('Uno o más elementos del DOM no se encontraron.');
        return;
    }

    const renderProjects = (projects) => {
        projectsGrid.innerHTML = '';
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No se encontraron proyectos que coincidan con la búsqueda o el filtro.</p>';
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
    
    const fetchAndRenderCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('proyectos')
                .select('categoria')
                .eq('privacidad', false);
            
            if (error) throw error;
            
            const uniqueCategories = [...new Set(data.map(item => item.categoria))].filter(Boolean).sort();
            
            uniqueCategories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });

        } catch (error) {
            console.error('Error al cargar categorías:', error);
        }
    };

    const performSearch = async (query = '', category = '') => {
        projectsGrid.innerHTML = '<p>Buscando proyectos...</p>';

        try {
            let projectsQuery = supabase.from('proyectos')
                .select(`
                    id_proyectos,
                    titulo,
                    id_usuario:id,
                    archivos(url)
                `)
                .eq('privacidad', false);

            if (category) {
                projectsQuery = projectsQuery.eq('categoria', category);
            }

            const { data: projectsData, error: projectsError } = await projectsQuery;
            
            if (projectsError) throw projectsError;
            
            const allProjects = new Map();
            projectsData.forEach(project => {
                allProjects.set(project.id_proyectos, {
                    id: project.id_proyectos,
                    titulo: project.titulo,
                    id_usuario: project.id_usuario,
                    imageUrl: project.archivos[0]?.url || 'https://placehold.co/600x400/000000/white?text=No+Image'
                });
            });

            if (query) {
                const queryLower = query.toLowerCase();
                const filteredProjects = new Map();

                // Filtrar por título
                Array.from(allProjects.values()).filter(p => p.titulo.toLowerCase().includes(queryLower))
                    .forEach(p => filteredProjects.set(p.id, p));

                // Buscar usuarios por nombre y luego filtrar los proyectos por esos usuarios
                const { data: usersFound, error: userSearchError } = await supabase
                    .from('usuarios')
                    .select('id, nom_usuario')
                    .ilike('nom_usuario', `%${query}%`);
                
                if (userSearchError) throw userSearchError;

                const userIdsFound = new Set(usersFound.map(user => user.id));

                Array.from(allProjects.values()).filter(p => userIdsFound.has(p.id_usuario))
                    .forEach(p => filteredProjects.set(p.id, p));
                
                allProjects.clear();
                filteredProjects.forEach((value, key) => allProjects.set(key, value));
            }

            const allUserIds = new Set(Array.from(allProjects.values()).map(p => p.id_usuario));
            const uniqueAllUserIds = Array.from(allUserIds);

            const { data: allUsersData, error: allUsersError } = await supabase
                .from('usuarios')
                .select('id, nom_usuario')
                .in('id', uniqueAllUserIds);
            
            if (allUsersError) throw allUsersError;

            const finalUserNamesMap = new Map(allUsersData.map(user => [user.id, user.nom_usuario]));

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

    let searchTimeout;

    const handleSearchInput = (e) => {
        const query = e.target.value.trim();
        const selectedCategory = categorySelect.value;
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length > 2 || query.length === 0) {
                performSearch(query, selectedCategory);
            }
        }, 500); 
    };

    if (searchInput) {
        searchInput.addEventListener('input', handleSearchInput);
    }
    if (sideSearchInput) {
        sideSearchInput.addEventListener('input', handleSearchInput);
    }

    if (categorySelect) {
        categorySelect.addEventListener('change', () => {
            const query = searchInput.value.trim();
            const selectedCategory = categorySelect.value;
            performSearch(query, selectedCategory);
        });
    }

    fetchAndRenderCategories();
    performSearch();
});
