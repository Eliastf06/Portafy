// js/projects.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const fetchAndRenderPublicProjects = async () => {
    // Añadimos la clase de carga al inicio del script
    document.body.classList.add('is-loading');

    const projectsGrid = document.getElementById('projects-grid');
    
    const createProjectCard = (project) => {
        return new Promise((resolve) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const imageUrl = project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/0a0a1a/white?text=No+Image';
            
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

    try {
        const { data: projectsData, error: projectsError } = await supabase
            .from('proyectos')
            .select(`
                *,
                archivos(
                    url
                )
            `);

        if (projectsError) {
            throw projectsError;
        }

        const userIds = projectsData.map(p => p.id);
        const uniqueUserIds = [...new Set(userIds)];

        const { data: usersData, error: usersError } = await supabase
            .from('usuarios')
            .select(`
                id,
                nom_usuario
            `)
            .in('id', uniqueUserIds);
        
        if (usersError) {
            throw usersError;
        }

        const usersMap = new Map(usersData.map(user => [user.id, user.nom_usuario]));
        
        const finalProjects = projectsData.map(project => ({
            ...project,
            authorName: usersMap.get(project.id)
        }));
        
        const publicProjects = finalProjects.filter(project => !project.privacidad);

        const cardPromises = publicProjects.map(createProjectCard);
        const resolvedCards = await Promise.all(cardPromises);
        
        projectsGrid.innerHTML = '';
        const fragment = document.createDocumentFragment();
        resolvedCards.forEach(card => fragment.appendChild(card));
        projectsGrid.appendChild(fragment);

        setTimeout(() => {
            document.body.classList.remove('is-loading');
        }, 500); 
        
    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        projectsGrid.innerHTML = `<p>Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
    }
};

document.addEventListener('DOMContentLoaded', fetchAndRenderPublicProjects);
