
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { fetchAndRenderProjects } from './projects.js';
import { fetchAndRenderUsers } from './acount/users.js';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    const loginNavItem = document.getElementById('signin-nav-item');
    const uploadNavItem = document.getElementById('upload-nav-item');
    
    // Referencias a los elementos del menú lateral por su nuevo ID
    const profileSideMenu = document.getElementById('profile-side-menu'); 
    const loginSideMenu = document.getElementById('login-side-menu');
    const uploadSideMenu = document.getElementById('upload-side-menu-item');
    const logoutBtnItem = document.getElementById('logout-btn-item');

    const logoutBtn = document.getElementById('logout-btn');
    const userMenuName = document.getElementById('user-menu-name');
    const userProfilePhoto = document.getElementById('user-profile-photo');
   
    const adminFilterContainer = document.getElementById('admin-filter-container');
    const adminFilterSelect = document.getElementById('admin-filter-select');
    const categorySelectContainer = document.querySelector('.filter-container');

    async function updateUI() {
        const { data: { user } } = await supabase.auth.getUser();
        let is_admin = false;

        // Si hay un usuario logueado
        if (user) {
            if (loginNavItem) loginNavItem.style.display = 'none';
            if (uploadNavItem) uploadNavItem.style.display = 'list-item';

            if (loginSideMenu) loginSideMenu.style.display = 'none';
            if (profileSideMenu) profileSideMenu.style.display = 'list-item';
            if (uploadSideMenu) uploadSideMenu.style.display = 'list-item';
            if (logoutBtnItem) logoutBtnItem.style.display = 'list-item';
            
            const { data, error } = await supabase
                .from('usuarios')
                .select(`
                    nombre,
                    is_admin,
                    datos_perfil ( foto_perfil )
                `)
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error al obtener los datos del usuario:', error.message);
                userMenuName.textContent = 'Usuario';
                if (userProfilePhoto) userProfilePhoto.src = 'multimedia/default-profile.png';
            } else {
                userMenuName.textContent = data.nombre || user.email;
                is_admin = data.is_admin;
                if (userProfilePhoto && data.datos_perfil && data.datos_perfil.length > 0) {
                    userProfilePhoto.src = data.datos_perfil[0].foto_perfil;
                } else {
                    userProfilePhoto.src = 'multimedia/default-profile.png';
                }
            }
        } else {
            if (loginNavItem) loginNavItem.style.display = 'list-item';
            if (uploadNavItem) uploadNavItem.style.display = 'none';

            // Ocultar opciones del menú lateral
            if (profileSideMenu) profileSideMenu.style.display = 'none';
            if (uploadSideMenu) uploadSideMenu.style.display = 'none';
            if (logoutBtnItem) logoutBtnItem.style.display = 'none';
            
            userMenuName.textContent = 'NOMBRE APELLIDO';
            if (userProfilePhoto) userProfilePhoto.src = 'multimedia/default-profile.png';
        }

        // Mostrar u ocultar el filtro de administrador
        if (adminFilterContainer) {
            adminFilterContainer.style.display = is_admin ? 'flex' : 'none';
        }
        
        // Cargar el contenido inicial
        if (document.location.pathname.includes('discover.html') || document.location.pathname === '/') {
            if (adminFilterSelect) {
                const filterType = adminFilterSelect.value;
                if (filterType === 'users') {
                    await fetchAndRenderUsers();
                    if (categorySelectContainer) categorySelectContainer.style.display = 'none';
                } else {
                    await fetchAndRenderProjects(is_admin, true); 
                    if (categorySelectContainer) categorySelectContainer.style.display = 'flex';
                }
            } else {
                await fetchAndRenderProjects(is_admin, true);
            }
        }
    }
    
    if (adminFilterSelect) {
        adminFilterSelect.addEventListener('change', async () => {
            const { data: { user } } = await supabase.auth.getUser();
            const { data: userData, error: userError } = user ? await supabase.from('usuarios').select('is_admin').eq('id', user.id).single() : { data: null, error: null };
            const is_admin = userData?.is_admin || false;
            
            const selectedValue = adminFilterSelect.value;
            if (selectedValue === 'users') {
                await fetchAndRenderUsers();
                if (categorySelectContainer) categorySelectContainer.style.display = 'none';
            } else {
                //Reinicia la paginación al cambiar el filtro
                await fetchAndRenderProjects(is_admin, true); 
                if (categorySelectContainer) categorySelectContainer.style.display = 'flex';
            }
        });
    }

    // Manejar el cierre de sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
            } else {
                window.location.reload();
            }
        });
    }

    updateUI();

    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            updateUI();
        }
    });

});