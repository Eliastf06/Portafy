document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const params = new URLSearchParams(window.location.search);
    const username = params.get('username');

    let profileData;

    if (username) {
        // Cargar el perfil de otro usuario
        try {
            const response = await fetch(`http://localhost:3000/usuarios/${username}`);
            if (response.ok) {
                profileData = await response.json();
            } else {
                alert('No se encontró el perfil del usuario.');
                window.location.href = 'index.html';
                return;
            }
        } catch (error) {
            console.error('Error al obtener el perfil:', error);
            alert('Ocurrió un error al cargar el perfil.');
            window.location.href = 'index.html';
            return;
        }
    } else if (user) {
        // Cargar el perfil del usuario logueado
        profileData = user;
    } else {
        alert('Debes iniciar sesión para ver esta página.');
        window.location.href = 'index.html';
        return;
    }

    // Actualizar la vista del perfil
    document.getElementById('profile-name').textContent = profileData.nombre || 'Nombre Apellido';
    document.getElementById('profile-occupation').textContent = profileData.tipo_usuario || 'Ocupación';
    document.getElementById('profile-description').textContent = profileData.biografia || 'Sin biografía.';
    
    // Cargar la foto de perfil si existe
    if (profileData.foto_perfil) {
        document.getElementById('profile-photo').src = profileData.foto_perfil;
    }

    // Mostrar el link de red social si existe
    const socialsDiv = document.getElementById('profile-socials');
    if (profileData.red_social) {
        socialsDiv.innerHTML = `<a href="${profileData.red_social}" target="_blank" class="social-link"><i class="fab fa-github"></i> Red Social</a>`;
    }

    // Lógica para cargar los proyectos del usuario
    try {
        const projectsResponse = await fetch(`http://localhost:3000/proyectos?nom_usuario=${profileData.nom_usuario}`);
        if (projectsResponse.ok) {
            const proyectos = await projectsResponse.json();
            const projectsGrid = document.getElementById('user-projects-grid');
            projectsGrid.innerHTML = ''; // Limpiar proyectos de muestra
            if (proyectos.length > 0) {
                proyectos.forEach(proyecto => {
                    const projectCard = document.createElement('div');
                    projectCard.className = 'project-card';
                    projectCard.innerHTML = `
                        <div class="project-image-placeholder">
                            <img src="http://localhost:3000${proyecto.archivos && proyecto.archivos.length > 0 ? proyecto.archivos[0].url : '/multimedia/placeholder.jpg'}" alt="Imagen de Proyecto">
                        </div>
                        <h3 class="project-name">${proyecto.titulo}</h3>
                    `;
                    projectsGrid.appendChild(projectCard);
                });
            } else {
                projectsGrid.innerHTML = '<p>No hay proyectos para mostrar.</p>';
            }
        }
    } catch (error) {
        console.error('Error al cargar los proyectos:', error);
    }
});