// js/projects.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// La principal función de carga
const fetchAndRenderPublicProjects = async () => {
    const projectsGrid = document.getElementById('projects-grid');
    
    // Función para renderizar los proyectos en la página
    const renderProjects = (projects) => {
        projectsGrid.innerHTML = ''; 
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No hay proyectos públicos para mostrar.</p>';
            return;
        }

        const fragment = document.createDocumentFragment();
        projects.forEach(project => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';
            
            const imageUrl = project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image';
            
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
            fragment.appendChild(projectCard);

            projectCard.addEventListener('click', () => {
                if (project.authorName) {
                    window.location.href = `profile.html?username=${project.authorName}`;
                }
            });
        });

        projectsGrid.appendChild(fragment);
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

        // Renderiza las tarjetas sin esperar a que las imágenes carguen.
        // Esto permite que el CSS aplique las dimensiones correctas de inmediato.
        renderProjects(publicProjects);

        // Pre-carga las imágenes en segundo plano. Esto no bloquea el renderizado.
        const imagePromises = publicProjects.map(project => {
            return new Promise((resolve) => {
                const img = new Image();
                img.src = project.archivos.length > 0 ? project.archivos[0].url : 'https://placehold.co/600x400/000000/white?text=No+Image';
                img.onload = () => resolve();
                img.onerror = () => resolve(); 
            });
        });

        // Espera a que todas las imágenes se precarguen.
        await Promise.all(imagePromises);

        // Quita la clase de carga solo después de que el DOM esté renderizado y las imágenes precargadas.
        document.body.classList.remove('is-loading');

    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
        projectsGrid.innerHTML = `<p>Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
    }
};

// Modificamos el evento DOMContentLoaded para ejecutar la carga
document.addEventListener('DOMContentLoaded', fetchAndRenderPublicProjects);
