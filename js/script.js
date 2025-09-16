// js/script.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Asegúrate de usar las credenciales correctas de tu proyecto principal
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    // Referencias a los elementos del DOM
    const loginNavItem = document.getElementById('signin-nav-item'); // Nuevo ID
    const uploadNavItem = document.getElementById('upload-nav-item'); // Nuevo ID
    
    // Referencias a los elementos del menú lateral por su nuevo ID
    const profileSideMenu = document.getElementById('profile-side-menu'); 
    const loginSideMenu = document.getElementById('login-side-menu');
    const uploadSideMenu = document.getElementById('upload-side-menu-item');
    const logoutBtnItem = document.getElementById('logout-btn-item');

    const logoutBtn = document.getElementById('logout-btn'); // Botón de "Cerrar Sesión"
    const userMenuName = document.getElementById('user-menu-name'); // Nombre del usuario en el menú lateral
    const userProfilePhoto = document.getElementById('user-profile-photo'); // Foto de perfil del usuario

    async function updateUI() {
        const { data: { user } } = await supabase.auth.getUser();

        // Si hay un usuario logueado
        if (user) {
            // Ocultar el botón de "Iniciar Sesión" y mostrar "Subir" en la navegación principal
            if (loginNavItem) loginNavItem.style.display = 'none';
            if (uploadNavItem) uploadNavItem.style.display = 'list-item';

            // Mostrar opciones en el menú lateral
            if (loginSideMenu) loginSideMenu.style.display = 'none';
            if (profileSideMenu) profileSideMenu.style.display = 'list-item';
            if (uploadSideMenu) uploadSideMenu.style.display = 'list-item';
            if (logoutBtnItem) logoutBtnItem.style.display = 'list-item';
            
            // Obtener el nombre y la foto del usuario de la base de datos
            const { data, error } = await supabase
                .from('usuarios')
                .select(`
                    nombre,
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
                if (userProfilePhoto && data.datos_perfil && data.datos_perfil.length > 0) {
                    userProfilePhoto.src = data.datos_perfil[0].foto_perfil;
                } else {
                    userProfilePhoto.src = 'multimedia/default-profile.png';
                }
            }

        } else {
            // Si no hay un usuario logueado
            // Mostrar el botón de "Iniciar Sesión" y ocultar "Subir" en la navegación principal
            if (loginNavItem) loginNavItem.style.display = 'list-item';
            if (uploadNavItem) uploadNavItem.style.display = 'none';

            // Ocultar opciones del menú lateral
            if (profileSideMenu) profileSideMenu.style.display = 'none';
            if (uploadSideMenu) uploadSideMenu.style.display = 'none';
            if (logoutBtnItem) logoutBtnItem.style.display = 'none';
            
            // Restaurar nombre y foto de usuario por defecto
            userMenuName.textContent = 'NOMBRE APELLIDO';
            if (userProfilePhoto) userProfilePhoto.src = 'multimedia/default-profile.png';
        }
    }

    // Manejar el cierre de sesión
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Error al cerrar sesión:', error);
            } else {
                window.location.reload(); // Recargar la página para actualizar la UI
            }
        });
    }

    // Actualizar la UI al cargar la página
    updateUI();

    // También, escuchar cambios en el estado de autenticación
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
            updateUI();
        }
    });

});