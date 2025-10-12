
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { renderProjects } from './projects.js';
import { renderUsers } from './acount/users.js';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('barra-busqueda');
    const sideSearchInput = document.getElementById('side-search-input');
    const contentGrid = document.getElementById('content-grid');
    const categorySelect = document.getElementById('category-select');
    const adminFilterSelect = document.getElementById('admin-filter-select');
    const sectionTitle = document.getElementById('section-title-1');
    const sectionSubtitle = document.querySelector('.section-subtitle');


    if (!contentGrid || !categorySelect) {
        console.error('Uno o más elementos del DOM no se encontraron.');
        return;
    }

    const fetchAndRenderCategories = async (is_admin = false) => {
        try {
            let projectsQuery = supabase.from('proyectos').select('categoria');
            if (!is_admin) {
                projectsQuery = projectsQuery.eq('privacidad', false);
            }
            const { data, error } = await projectsQuery;
            
            if (error) throw error;
            
            const uniqueCategories = [...new Set(data.map(item => item.categoria))].filter(Boolean).sort();
            
            // Limpiar opciones antes de añadir nuevas
            categorySelect.innerHTML = '<option value="">Todas las categorías</option>';
            
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

    const performSearch = async (query = '') => {
        contentGrid.innerHTML = '<p style="text-align: center;">Buscando...</p>';
        const filterType = adminFilterSelect?.value || 'projects';
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: userData, error: userError } = user ? await supabase.from('usuarios').select('is_admin').eq('id', user.id).single() : { data: null, error: null };
            const is_admin = userData?.is_admin || false;
            
            if (filterType === 'users') {
                sectionTitle.textContent = 'DESCUBRIR USUARIOS';
                sectionSubtitle.textContent = 'Explora y descubre la comunidad';
                await performUserSearch(query);
            } else { // filterType === 'projects'
                sectionTitle.textContent = 'DESCUBRIR PROYECTOS';
                sectionSubtitle.textContent = 'Explora y descubre trabajos de la comunidad';
                const selectedCategory = categorySelect.value;
                await performProjectSearch(query, selectedCategory, is_admin);
            }

        } catch (error) {
            console.error('Error en la búsqueda:', error);
            contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error en la búsqueda: ${error.message}</p>`;
        }
    };
    
    const performProjectSearch = async (query, category, is_admin) => {
        try {
            let projectsQuery = supabase.from('proyectos')
                .select(`
                    id_proyectos,
                    titulo,
                    id_usuario:id,
                    privacidad,
                    archivos(url)
                `);
            
            if (!is_admin) {
                projectsQuery = projectsQuery.eq('privacidad', false);
            }

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
                    archivos: project.archivos,
                    privacidad: project.privacidad
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
                archivos: project.archivos,
                privacidad: project.privacidad
            }));
            
            renderProjects(finalProjects);

        } catch (error) {
            console.error('Error al realizar la búsqueda de proyectos:', error);
            contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error al buscar: ${error.message}</p>`;
        }
    };
    
    const performUserSearch = async (query) => {
        try {
            let usersQuery = supabase
                .from('usuarios')
                .select(`
                    id,
                    nom_usuario,
                    nombre,
                    tipo_usuario,
                    datos_perfil ( foto_perfil )
                `);
            
            if (query) {
                usersQuery = usersQuery.ilike('nom_usuario', `%${query}%`);
            }
            
            const { data: usersData, error: usersError } = await usersQuery;
            if (usersError) throw usersError;
            
            const formattedUsers = usersData.map(user => ({
                ...user,
                foto_perfil: user.datos_perfil ? user.datos_perfil[0]?.foto_perfil : null
            }));

            renderUsers(formattedUsers);

        } catch (error) {
            console.error('Error al realizar la búsqueda de usuarios:', error);
            contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error al buscar usuarios: ${error.message}</p>`;
        }
    };

    let searchTimeout;
    const handleSearchInput = (e) => {
        const query = e.target.value.trim();
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            if (query.length > 2 || query.length === 0) {
                performSearch(query);
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
            performSearch(query);
        });
    }

    fetchAndRenderCategories();
    
});