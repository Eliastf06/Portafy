// js/projects.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    const projectsGrid = document.getElementById('projects-grid');
    
    // Función para renderizar los proyectos en la página
    const renderProjects = (projects) => {
        projectsGrid.innerHTML = ''; // Limpiar el contenedor
        if (projects.length === 0) {
            projectsGrid.innerHTML = '<p>No hay proyectos públicos para mostrar.</p>';
            return;
        }

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
                            ${project.usuarios?.nom_usuario || 'Autor desconocido'}
                        </span>
                    </div>
                </div>
            `;
            projectsGrid.appendChild(projectCard);
            
            // Redirigir al perfil del usuario al hacer clic en la tarjeta
            projectCard.addEventListener('click', () => {
                if (project.usuarios?.nom_usuario) {
                    window.location.href = `profile.html?username=${project.usuarios.nom_usuario}`;
                }
            });
        });
    };

    // Función para cargar y mostrar todos los proyectos no privados
    const fetchAndRenderPublicProjects = async () => {
        projectsGrid.innerHTML = '<p>Cargando proyectos...</p>';
        try {
            const { data, error } = await supabase
                .from('proyectos')
                .select(`
                    titulo,
                    privacidad,
                    usuarios(nom_usuario),
                    archivos(url)
                `)
                .eq('privacidad', false);
            
            if (error) {
                console.error('Error al cargar los proyectos:', error);
                projectsGrid.innerHTML = `<p>Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
                return;
            }

            const publicProjects = data.filter(project => !project.privacidad);
            renderProjects(publicProjects);

        } catch (error) {
            console.error('Error al cargar los proyectos:', error);
            projectsGrid.innerHTML = '<p>Ocurrió un error inesperado. Por favor, inténtalo de nuevo.</p>';
        }
    };
    
    fetchAndRenderPublicProjects();
});