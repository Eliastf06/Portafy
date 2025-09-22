// js/projects.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const contentGrid = document.getElementById('content-grid');
const sectionTitle = document.getElementById('section-title-1');
const sectionSubtitle = document.querySelector('.section-subtitle');

export const renderProjects = (projects) => {
    contentGrid.innerHTML = '';
    if (projects.length === 0) {
        contentGrid.innerHTML = '<p style="text-align: center;">No se encontraron proyectos que coincidan con la búsqueda o el filtro.</p>';
        return;
    }
    const createProjectCard = (project) => {
        return new Promise((resolve) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            // Verifica si project.archivos existe antes de acceder a .length
            const imageUrl = (project.archivos && project.archivos.length > 0) 
                ? project.archivos[0].url 
                : 'https://placehold.co/600x400/0a0a1a/white?text=No+Image';
            
            const imgElement = new Image();
            imgElement.src = imageUrl;
            imgElement.alt = project.titulo;

            imgElement.onload = () => {
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
                        </div>
                    </div>
                `;
                
                projectCard.addEventListener('click', () => {
                    if (project.authorName) {
                        window.location.href = `profile.html?username=${project.authorName}`;
                    }
                });
                
                resolve(projectCard);
            };

            imgElement.onerror = () => {
                console.error(`Error al cargar la imagen: ${imageUrl}`);
                projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="https://placehold.co/600x400/0a0a1a/white?text=No+Image" alt="Imagen no disponible">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        <div class="project-author">
                            <span class="author-name">
                                ${project.authorName || 'Autor desconocido'}
                            </span>
                        </div>
                    </div>
                `;

                projectCard.addEventListener('click', () => {
                    if (project.authorName) {
                        window.location.href = `profile.html?username=${project.authorName}`;
                    }
                });
                
                resolve(projectCard);
            };
        });
    };
    
    const cardPromises = projects.map(createProjectCard);
    const fragment = document.createDocumentFragment();

    Promise.all(cardPromises).then(resolvedCards => {
        resolvedCards.forEach(card => fragment.appendChild(card));
        contentGrid.appendChild(fragment);
    });
};

export const fetchAndRenderProjects = async (is_admin = false) => {
    document.body.classList.add('is-loading');
    sectionTitle.textContent = 'DESCUBRIR PROYECTOS';
    sectionSubtitle.textContent = 'Explora y descubre trabajos de la comunidad';
    
    contentGrid.innerHTML = '<p style="text-align: center;">Buscando proyectos...</p>';

    try {
        let projectsQuery = supabase
            .from('proyectos')
            .select(`
                *,
                archivos(url)
            `);
        
        if (!is_admin) {
            projectsQuery = projectsQuery.eq('privacidad', false);
        }

        const { data: projectsData, error: projectsError } = await projectsQuery;

        if (projectsError) throw projectsError;

        const userIds = projectsData.map(p => p.id);
        const uniqueUserIds = [...new Set(userIds)];
        
        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select(`
                id,
                nom_usuario
            `)
            .in('id', uniqueUserIds);
        
        if (usersError) throw usersError;

        const usersMap = new Map(usersData.map(user => [user.id, user.nom_usuario]));
        
        const finalProjects = projectsData.map(project => ({
            ...project,
            authorName: usersMap.get(project.id)
        }));
        
        renderProjects(finalProjects);

        setTimeout(() => {
            document.body.classList.remove('is-loading');
        }, 500); 
        
    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
    }
};