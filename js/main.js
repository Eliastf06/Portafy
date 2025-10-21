import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    const profileLink = document.getElementById('profile-link');
    const heroCtaButton = document.getElementById('hero-cta-button'); // Nuevo
    const carouselTrack = document.getElementById('carousel-track');

    const updateUI = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
            // Lógica para USUARIO LOGEADO
            let profileUrl = 'profile.html';

            // Obtener nombre de usuario para el enlace del perfil
            const { data: userData, error } = await supabase
                .from('usuarios')
                .select('nom_usuario')
                .eq('id', user.id)
                .single();
            
            if (error) {
                console.error('Error al obtener el nombre de usuario:', error);
            } else {
                profileUrl = `profile.html?username=${userData.nom_usuario}`;
            }

            profileLink.textContent = 'Ver mi Portafolios';
            profileLink.href = profileUrl;

            if (heroCtaButton) {
                heroCtaButton.textContent = 'Ver mi Portafolios';
                heroCtaButton.href = profileUrl;
            }

        } else {
            // Lógica para USUARIO NO LOGEADO

            profileLink.textContent = 'Crear portafolios';
            profileLink.href = 'signin.html';

            if (heroCtaButton) {
                heroCtaButton.textContent = '¡Empieza a crear tu portafolios!';
                heroCtaButton.href = 'regis.html';
            }
        }
    };

    const fetchAndRenderCarouselProjects = async () => {
        try {
            // **MODIFICACIÓN**: Obtener solo proyectos públicos donde position sea 1 o 2.
            const { data: projectsData, error: projectsError } = await supabase
                .from('proyectos')
                .select(`
                    id,
                    titulo,
                    position, 
                    archivos(url)
                `)
                .eq('privacidad', false) // Solo proyectos NO privados
                .lte('position', 2)     // Solo proyectos con posición <= 2 (1 o 2)
                .order('position', { ascending: true }); // Opcional: ordenar por posición para visualización

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

            // Mapear los nombres de usuario a los proyectos.
            const usersMap = new Map(usersData.map(user => [user.id, user.nom_usuario]));
            
            // Duplicar los datos para el efecto de carrusel continuo
            const combinedProjects = [...projectsData, ...projectsData];

            const fragment = document.createDocumentFragment();

            combinedProjects.forEach(project => {
                const projectCard = document.createElement('div');
                projectCard.classList.add('project-card');

                const imageUrl = project.archivos.length > 0 ? project.archivos[0].url : 'multimedia/default-project.jpg';
                const authorName = usersMap.get(project.id) || 'Autor desconocido';

                projectCard.innerHTML = `
                    <div class="project-image-placeholder">
                        <img src="${imageUrl}" alt="${project.titulo}">
                    </div>
                    <div class="project-content">
                        <h3 class="project-title">${project.titulo}</h3>
                        <div class="project-author">
                            <span class="author-name">
                                ${authorName}
                            </span>
                        </div>
                    </div>
                `;

                projectCard.addEventListener('click', () => {
                    window.location.href = `profile.html?username=${authorName}`;
                });
                
                fragment.appendChild(projectCard);
            });

            carouselTrack.innerHTML = '';
            carouselTrack.appendChild(fragment);

        } catch (error) {
            console.error('Error al cargar los proyectos para el carrusel:', error);
            carouselTrack.innerHTML = `<p style="text-align: center; width: 100%;">Ocurrió un error al cargar los proyectos: ${error.message}</p>`;
        }
    };

    updateUI();
    fetchAndRenderCarouselProjects();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            updateUI();
        }
    });
});