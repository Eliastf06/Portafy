import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const contentGrid = document.getElementById('content-grid');
const sectionTitle = document.getElementById('section-title-1');
const sectionSubtitle = document.querySelector('.section-subtitle');

export const renderUsers = (users) => {
    contentGrid.innerHTML = '';
    if (users.length === 0) {
        contentGrid.innerHTML = '<p style="text-align: center;">No se encontraron usuarios.</p>';
        return;
    }

    const fragment = document.createDocumentFragment();
    users.forEach(user => {
        const userCard = document.createElement('div');
        userCard.className = 'user-card';
        userCard.innerHTML = `
            <img src="${user.foto_perfil || 'multimedia/default-profile.png'}" alt="Foto de perfil de ${user.nom_usuario}" class="user-profile-photo">
            <h3 class="user-name">${user.nombre}</h3>
            <span class="user-username">@${user.nom_usuario}</span>
            <span class="user-type">${user.tipo_usuario || 'Regular'}</span>
        `;
        userCard.addEventListener('click', () => {
            window.location.href = `profile.html?username=${user.nom_usuario}`;
        });
        fragment.appendChild(userCard);
    });
    contentGrid.appendChild(fragment);
};

export const fetchAndRenderUsers = async (query = '') => {
    document.body.classList.add('is-loading');
    sectionTitle.textContent = 'DESCUBRIR USUARIOS';
    sectionSubtitle.textContent = 'Explora y descubre la comunidad';
    
    contentGrid.innerHTML = '<p style="text-align: center;">Buscando usuarios...</p>';

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

        const { data: usersData, error } = await usersQuery;

        if (error) throw error;
        
        const formattedUsers = usersData.map(user => ({
            ...user,
            foto_perfil: user.datos_perfil ? user.datos_perfil[0]?.foto_perfil : null
        }));

        renderUsers(formattedUsers);

        setTimeout(() => {
            document.body.classList.remove('is-loading');
        }, 500); 

    } catch (error) {
        console.error('Error al cargar los usuarios:', error);
        contentGrid.innerHTML = `<p style="text-align: center;">Ocurrió un error al cargar los usuarios: ${error.message}</p>`;
        document.body.classList.remove('is-loading');
    }
};