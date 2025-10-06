// js/projects.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const contentGrid = document.getElementById('content-grid');
const sectionTitle = document.getElementById('section-title-1');
const sectionSubtitle = document.querySelector('.section-subtitle');

// Elementos de paginación
const loadMoreBtn = document.getElementById('load-more-btn');
const projectCountInfo = document.getElementById('project-count-info');

// Estado de paginación global
const PAGE_SIZE = 30;
let currentPage = 0;
let totalLoadedProjects = 0;
let allProjectsLoaded = false;
// Guardamos los IDs de proyectos no seguidos disponibles para la paginación aleatoria (se calcula una vez)
let nonFollowedProjectsIds = [];
let initialLoadDone = false;
let isFetching = false;

// Función auxiliar para mezclar un array (algoritmo Fisher-Yates)
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


// MODIFICACIÓN 1: Ahora acepta 'is_admin'
export const renderProjects = (projects, is_admin = false, append = false) => {
    if (!append) {
        contentGrid.innerHTML = '';
    }
    if (projects.length === 0 && totalLoadedProjects === 0) {
        contentGrid.innerHTML = '<p style="text-align: center;">No se encontraron proyectos que coincidan con la búsqueda o el filtro.</p>';
        return;
    }
    
    // Si no hay proyectos nuevos para mostrar y ya se cargaron algunos, no hacemos nada más.
    if (projects.length === 0 && totalLoadedProjects > 0) return;

    const createProjectCard = (project) => {
        return new Promise((resolve) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const imageUrl = (project.archivos && project.archivos.length > 0) 
                ? project.archivos[0].url 
                : 'https://placehold.co/600x400/0a0a1a/white?text=No+Image';
            
            const imgElement = new Image();
            imgElement.src = imageUrl;
            imgElement.alt = project.titulo;

            // Lógica para mostrar el candado solo si es admin Y el proyecto es privado
            const privateLockIcon = (is_admin && project.privacidad) 
                ? '<i class="fas fa-lock private-icon" title="Proyecto Privado"></i>' 
                : '';
            
            const renderCard = () => {
                 projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        <div class="project-author">
                            <span class="author-name">
                                ${project.authorName || 'Autor desconocido'}
                            </span>
                            ${project.isFollowed ? '<i class="fas fa-check-circle followed-icon" title="Usuario Seguido"></i>' : ''}
                            ${privateLockIcon} </div>
                    </div>
                `;
                
                projectCard.addEventListener('click', () => {
                    if (project.authorName) {
                        window.location.href = `profile.html?username=${project.authorName}`;
                    }
                });
                
                resolve(projectCard);
            };

            // Intentar cargar la imagen, si falla, renderizar con la imagen por defecto
            imgElement.onload = renderCard;
            imgElement.onerror = renderCard; // Llama a renderCard incluso si falla
        });
    };
    
    const cardPromises = projects.map(createProjectCard);
    const fragment = document.createDocumentFragment();

    Promise.all(cardPromises).then(resolvedCards => {
        resolvedCards.forEach(card => fragment.appendChild(card));
        contentGrid.appendChild(fragment);
    });
};


// Función principal de carga de proyectos
export const fetchAndRenderProjects = async (is_admin = false, reset = false) => {
    if (isFetching) return;
    isFetching = true;
    
    if (reset) {
        currentPage = 0;
        totalLoadedProjects = 0;
        allProjectsLoaded = false;
        nonFollowedProjectsIds = [];
        initialLoadDone = false;
        if (contentGrid) contentGrid.innerHTML = '';
    }

    if (totalLoadedProjects === 0) {
        document.body.classList.add('is-loading');
        if (contentGrid) contentGrid.innerHTML = '<p style="text-align: center;">Buscando proyectos...</p>';
    }

    sectionTitle.textContent = 'DESCUBRIR PROYECTOS';
    sectionSubtitle.textContent = 'Explora y descubre trabajos de la comunidad';
    if (loadMoreBtn) loadMoreBtn.style.display = 'none';

    try {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        let followedUserIds = [];
        if (currentUserId) {
            // 1. Obtener IDs de usuarios seguidos
            const { data: followedData, error: followedError } = await supabase
                .from('seguidores')
                .select('id_usuario') 
                .eq('id_seguidor', currentUserId);

            if (followedError) throw followedError;
            followedUserIds = followedData.map(f => f.id_usuario);
        }
        
        let fetchedProjects = [];
        let projectsNeeded = PAGE_SIZE; 
        let followedProjectsCount = 0; 

        // --- Estrategia de Carga de Proyectos ---
        
        // 1. Proyectos de Usuarios Seguidos (Prioridad - Solo se buscan en la primera página)
        if (followedUserIds.length > 0 && currentPage === 0) {
            let followedProjectsQuery = supabase
                .from('proyectos')
                .select(`
                    *,
                    archivos(url) 
                `)
                .in('id', followedUserIds) 
                .order('id_proyectos', { ascending: false }) 
                .limit(PAGE_SIZE); 

            // Nota: Aquí no filtramos por privacidad si es admin
            if (!is_admin) {
                followedProjectsQuery = followedProjectsQuery.eq('privacidad', false);
            }

            const { data: followedProjectsData, error: followedProjectsError } = await followedProjectsQuery;
            if (followedProjectsError) throw followedProjectsError;

            followedProjectsCount = followedProjectsData.length;
            
            fetchedProjects.push(...followedProjectsData.map(p => ({ 
                ...p, 
                isFollowed: true,
                authorId: p.id
            })));
            
            projectsNeeded = PAGE_SIZE - fetchedProjects.length; 
        }
        
        // 2. Proyectos Aleatorios (Relleno o Paginación Regular)
        
        // Carga Inicial de IDs de Proyectos No Seguidos (solo una vez)
        if (!initialLoadDone) {
            let nonFollowedQuery = supabase
                .from('proyectos')
                .select('id_proyectos, id'); 

            if (followedUserIds.length > 0) {
                nonFollowedQuery = nonFollowedQuery.not('id', 'in', `(${followedUserIds.join(',')})`);
            }
            // Nota: Aquí no filtramos por privacidad si es admin
            if (!is_admin) {
                nonFollowedQuery = nonFollowedQuery.eq('privacidad', false);
            }
            
            const { data: nonFollowedData, error: nonFollowedError } = await nonFollowedQuery;
            if (nonFollowedError) throw nonFollowedError;
            
            nonFollowedProjectsIds = nonFollowedData.map(p => ({ 
                id_proyectos: p.id_proyectos, 
                authorId: p.id 
            }));
            shuffleArray(nonFollowedProjectsIds); 
            initialLoadDone = true;
        }
        
        // Lógica de paginación aleatoria para proyectos no seguidos
        let offsetInNonFollowed = 0;
        if (currentPage === 0) {
            offsetInNonFollowed = 0; 
        } else {
            offsetInNonFollowed = (currentPage * PAGE_SIZE) - followedProjectsCount;
        }

        const startIdx = offsetInNonFollowed;
        const endIdx = startIdx + projectsNeeded;
        
        const randomIdsSliceInfo = nonFollowedProjectsIds.slice(startIdx, endIdx);
        const randomProjectIds = randomIdsSliceInfo.map(i => i.id_proyectos);


        if (randomProjectIds.length > 0) {
            let randomProjectsQuery = supabase
                .from('proyectos')
                .select(`
                    *,
                    archivos(url)
                `)
                .in('id_proyectos', randomProjectIds); 

            const { data: randomProjectsData, error: randomProjectsError } = await randomProjectsQuery;
            if (randomProjectsError) throw randomProjectsError;
            
            shuffleArray(randomProjectsData); 
            
            fetchedProjects.push(...randomProjectsData.map(p => ({ 
                ...p, 
                isFollowed: false,
                authorId: p.id 
            })));
        }
        
        // --- Fin de Estrategia de Carga ---

        // 3. UNIÓN MANUAL: Obtener los nombres de usuario
        let finalProjects = [];
        const authorIds = fetchedProjects.map(p => p.authorId);
        const uniqueAuthorIds = [...new Set(authorIds.filter(id => id))];

        if (uniqueAuthorIds.length > 0) {
            const { data: usersData, error: usersError } = await supabase
                .from('usuarios')
                .select(`id, nom_usuario`)
                .in('id', uniqueAuthorIds);
            
            if (usersError) throw usersError;

            const usersMap = new Map(usersData.map(user => [user.id, user.nom_usuario]));

            finalProjects = fetchedProjects.map(project => ({
                ...project,
                authorName: usersMap.get(project.authorId)
            }));
        } else {
            finalProjects = fetchedProjects;
        }

        // 4. Combinamos y renderizamos (ordenando los seguidos al principio si es la primera página)
        finalProjects = finalProjects.sort((a, b) => {
            if (currentPage === 0) {
                if (a.isFollowed && !b.isFollowed) return -1;
                if (!a.isFollowed && b.isFollowed) return 1;
            }
            return 0;
        });
        
        // MODIFICACIÓN 2: Se pasa 'is_admin' a renderProjects
        renderProjects(finalProjects, is_admin, currentPage > 0); 
        
        // Actualizar estado de paginación
        const loadedOnThisPage = finalProjects.length;
        totalLoadedProjects += loadedOnThisPage;
        currentPage++;

        if (randomIdsSliceInfo.length < projectsNeeded) {
             allProjectsLoaded = true;
        }

        // Actualizar UI del contador y botón
        if (projectCountInfo) {
            if (totalLoadedProjects > 0) {
                projectCountInfo.textContent = `Mostrando ${totalLoadedProjects} proyectos.`;
            } else {
                 projectCountInfo.textContent = 'No hay proyectos disponibles.';
            }
        }

        if (loadMoreBtn) {
            if (allProjectsLoaded) {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = 'No hay más proyectos';
                loadMoreBtn.disabled = true;
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = 'Ver más proyectos';
                loadMoreBtn.disabled = false;
            }
        }
        
        document.body.classList.remove('is-loading');

    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        if (contentGrid) contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (projectCountInfo) projectCountInfo.textContent = '';
    } finally {
        isFetching = false;
    }
};


// Inicialización del botón "Ver Más"
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        fetchAndRenderProjects(false, false); 
    });
}