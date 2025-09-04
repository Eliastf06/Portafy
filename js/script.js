// js/script.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Asegúrate de usar las credenciales correctas de tu proyecto principal
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    // Referencias a los elementos del DOM
    const loginNav = document.querySelector('a[href="signin.html"]'); // Enlace de "Iniciar Sesión"
    const uploadNav = document.querySelector('a[href="upload-project.html"]'); // Enlace de "Subir"
    const profileSideMenu = document.querySelector('a[href="profile.html"]'); // Enlace del menú lateral "Perfil"
    const loginSideMenu = document.querySelector('a[href="signin.html"]'); // Enlace del menú lateral "Iniciar"
    const uploadSideMenu = document.getElementById('side-menu-upload-btn'); // Enlace del menú lateral "Subir proyecto"
    const logoutBtn = document.getElementById('logout-btn'); // Botón de "Cerrar Sesión"
    const userMenuName = document.getElementById('user-menu-name'); // Nombre del usuario en el menú lateral

    async function updateUI() {
        const { data: { user } } = await supabase.auth.getUser();

        // Si hay un usuario logueado
        if (user) {
            // Ocultar el botón de "Iniciar Sesión"
            if (loginNav) loginNav.style.display = 'none';
            if (loginSideMenu) loginSideMenu.style.display = 'none';

            // Mostrar el botón de "Subir" en la barra de navegación
            if (uploadNav) uploadNav.style.display = 'flex';

            // Mostrar opciones en el menú lateral
            if (profileSideMenu) profileSideMenu.parentElement.style.display = 'list-item';
            if (uploadSideMenu) uploadSideMenu.parentElement.style.display = 'list-item';
            
            // Mostrar botón de cerrar sesión
            if (logoutBtn) logoutBtn.parentElement.style.display = 'list-item';
            
            // Obtener el nombre del usuario de la base de datos
            const { data, error } = await supabase
                .from('usuarios')
                .select('nombre')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Error al obtener el nombre del usuario:', error.message);
                userMenuName.textContent = 'Usuario';
            } else {
                userMenuName.textContent = data.nombre || user.email;
            }

        } else {
            // Si no hay un usuario logueado
            // Mostrar el botón de "Iniciar Sesión"
            if (loginNav) loginNav.style.display = 'flex';

            // Ocultar el botón de "Subir" en la barra de navegación
            if (uploadNav) uploadNav.style.display = 'none';

            // Ocultar opciones del menú lateral
            if (profileSideMenu) profileSideMenu.parentElement.style.display = 'none';
            if (uploadSideMenu) uploadSideMenu.parentElement.style.display = 'none';

            // Ocultar botón de cerrar sesión
            if (logoutBtn) logoutBtn.parentElement.style.display = 'none';
            
            // Restaurar nombre de usuario por defecto
            userMenuName.textContent = 'NOMBRE APELLIDO';
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