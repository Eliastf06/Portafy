import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const contentGrid = document.getElementById('content-grid');
const sectionTitle = document.getElementById('section-title-1');
const sectionSubtitle = document.querySelector('.section-subtitle');

const loadMoreBtn = document.getElementById('load-more-btn');
const projectCountInfo = document.getElementById('project-count-info');
const adminFilterSelect = document.getElementById('admin-filter-select');
const categoryFilterContainer = document.getElementById('category-filter-container');


const PAGE_SIZE = 30;
let currentPage = 0;
let totalLoadedProjects = 0;
let allProjectsLoaded = false;
let nonFollowedProjectsIds = [];
let initialLoadDone = false;
let isFetching = false;
let currentView = 'projects'; // 'projects' o 'users'


// Función auxiliar para mezclar un array 
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};


// acepta 'is_admin'
export const renderProjects = (projects, is_admin = false, append = false) => {
    if (!append) {
        contentGrid.innerHTML = '';
    }
    if (projects.length === 0 && totalLoadedProjects === 0) {
        contentGrid.innerHTML = '<p style="text-align: center; color: var(--text-color-light); padding: 20px; background: var(--bg-color-elevated); border-radius: var(--border-radius-base); box-shadow: var(--shadow-subtle);">No se encontraron proyectos que coincidan con la búsqueda o el filtro.</p>';
        return;
    }
    
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

            // mostrar el candado solo si es admin Y el proyecto es privado
            const privateLockIcon = (is_admin && project.privacidad) 
                ? '<i class="fas fa-lock private-icon" title="Proyecto Privado"></i>' 
                : '';
            
            const renderCard = () => {
                 projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}" loading="lazy">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        <div class="project-author">
                            <span class="author-name">
                                ${project.authorName || 'Autor desconocido'}
                            </span>
                            ${project.isFollowed ? '<i class="fas fa-check-circle followed-icon" title="Usuario Seguido"></i>' : ''}
                            ${privateLockIcon} 
                        </div>
                    </div>
                `;
                
                projectCard.addEventListener('click', () => {
                    // Microtransición al salir
                    projectCard.style.opacity = 0;
                    projectCard.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        if (project.authorName) {
                            window.location.href = `profile.html?username=${project.authorName}`;
                        }
                    }, 150);
                });
                
                resolve(projectCard);
            };

            imgElement.onload = renderCard;
            imgElement.onerror = renderCard; 
            // Esto asegura que la tarjeta se renderice incluso si la imagen falla.
            if (!imgElement.complete) { 
                imgElement.src = imageUrl; // Re-trigger load if necessary (caching can be tricky)
            } else {
                 renderCard();
            }
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
    if (isFetching || currentView === 'users') return; // No cargar si la vista es 'users'
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
    if (projectCountInfo) projectCountInfo.style.display = 'none';


    try {
        const { data: { user } } = await supabase.auth.getUser();
        const currentUserId = user?.id;
        
        let followedUserIds = [];
        let followedProjectsCount = 0; 
        
        // La lógica de paginación debe ser consistente, el usuario puede estar logueado o no
        if (currentUserId) {
            const { data: followedData, error: followedError } = await supabase
                .from('seguidores')
                .select('id_usuario') 
                .eq('id_seguidor', currentUserId);

            if (followedError) throw followedError;
            followedUserIds = followedData.map(f => f.id_usuario);
        }
        
        let fetchedProjects = [];
        let projectsNeeded = PAGE_SIZE; 
        

        // Cargar proyectos seguidos solo en la primera página si hay proyectos seguidos y el usuario está logeado
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

            // aca no filtramos por privacidad si es admin
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
        
        // Carga Inicial de IDs de Proyectos No Seguidos (solo una vez)
        if (!initialLoadDone) {
            let nonFollowedQuery = supabase
                .from('proyectos')
                .select('id_proyectos, id'); 

            if (followedUserIds.length > 0) {
                nonFollowedQuery = nonFollowedQuery.not('id', 'in', `(${followedUserIds.join(',')})`);
            }
            // aca filtramos por privacidad si es admin
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
        let offsetInNonFollowed;
        if (currentPage === 0) {
            // Si es la primera página, el offset es 0 para los no seguidos.
            offsetInNonFollowed = 0; 
        } else {
            // Para las siguientes páginas, calculamos cuántos proyectos no seguidos ya hemos cargado
            // (pags_anteriores * PAGE_SIZE) - proyectos_seguidos_en_pag_0
            offsetInNonFollowed = ((currentPage) * PAGE_SIZE) - followedProjectsCount;
        }
        
        // Aseguramos que el offset no sea negativo
        offsetInNonFollowed = Math.max(0, offsetInNonFollowed);

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
            
            // Mantenemos la mezcla, pero la hacemos después de la consulta
            shuffleArray(randomProjectsData); 
            
            fetchedProjects.push(...randomProjectsData.map(p => ({ 
                ...p, 
                isFollowed: false,
                authorId: p.id 
            })));
        }

        // Obtener los nombres de usuario
        let finalProjects = [];
        const authorIds = fetchedProjects.map(p => p.authorId).filter(id => id); // Filtrar IDs nulos/indefinidos
        const uniqueAuthorIds = [...new Set(authorIds)];

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

        // Ordenar: seguidos primero (solo en la página 0)
        finalProjects = finalProjects.sort((a, b) => {
            if (currentPage === 0) {
                if (a.isFollowed && !b.isFollowed) return -1;
                if (!a.isFollowed && b.isFollowed) return 1;
            }
            return 0;
        });
        
        renderProjects(finalProjects, is_admin, currentPage > 0); 
        
        // Actualizar estado de paginación
        const loadedOnThisPage = finalProjects.length;
        totalLoadedProjects += loadedOnThisPage;
        currentPage++;

        // La carga ha terminado si ya no hay más IDs de proyectos no seguidos disponibles
        if (randomIdsSliceInfo.length < projectsNeeded || endIdx >= nonFollowedProjectsIds.length) {
             allProjectsLoaded = true;
        }

        // Actualizar UI del contador y botón (Solo si la vista es 'projects')
        if (projectCountInfo) {
            projectCountInfo.style.display = 'inline';
            if (totalLoadedProjects > 0) {
                projectCountInfo.textContent = `Mostrando ${totalLoadedProjects} proyectos.`;
            } else {
                 projectCountInfo.textContent = 'No hay proyectos disponibles.';
            }
        }

        if (loadMoreBtn) {
            if (allProjectsLoaded || totalLoadedProjects === 0) {
                loadMoreBtn.style.display = 'none'; // Ocultar si todo está cargado o si no hay proyectos
            } else {
                loadMoreBtn.style.display = 'block';
                loadMoreBtn.textContent = 'Ver más proyectos';
                loadMoreBtn.disabled = false;
            }
        }
        
        document.body.classList.remove('is-loading');

    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        if (contentGrid) contentGrid.innerHTML = `<p style="text-align: center; color: var(--color-error-text); padding: 20px; background: var(--color-error-bg-subtle); border-radius: var(--border-radius-base); box-shadow: var(--shadow-error);">Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
        if (loadMoreBtn) loadMoreBtn.style.display = 'none';
        if (projectCountInfo) projectCountInfo.style.display = 'none';
    } finally {
        isFetching = false;
    }
};

// Manejo del cambio de vista (Proyectos/Usuarios)
if (adminFilterSelect) {
    adminFilterSelect.addEventListener('change', (e) => {
        currentView = e.target.value;
        if (currentView === 'projects') {
            // Mostrar elementos de proyectos y cargar
            if (categoryFilterContainer) categoryFilterContainer.style.display = 'block';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            if (projectCountInfo) projectCountInfo.style.display = 'none';
            fetchAndRenderProjects(false, true); // Reset y carga de proyectos
        } else if (currentView === 'users') {
            // Ocultar elementos de proyectos y limpiar la cuadrícula
            if (categoryFilterContainer) categoryFilterContainer.style.display = 'none';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            if (projectCountInfo) projectCountInfo.style.display = 'none';
            contentGrid.innerHTML = '<p style="text-align: center;">Cargando usuarios...</p>';
            // Aquí iría la llamada a fetchAndRenderUsers si existiera en users.js
            // Por ahora solo limpiar la vista de paginación
            if (contentGrid) contentGrid.innerHTML = '<p style="text-align: center; color: var(--text-color-light); padding: 20px; background: var(--bg-color-elevated); border-radius: var(--border-radius-base); box-shadow: var(--shadow-subtle);">La funcionalidad de "Usuarios" se gestiona en otro archivo (users.js) y no usa paginación aquí.</p>';
            document.body.classList.remove('is-loading');

        }
    });
}


//  botón "Ver Más"
if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
        fetchAndRenderProjects(false, false); 
    });
}