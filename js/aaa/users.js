// js/users.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { openModal, closeModal } from './modales.js';

// --- Credenciales de Supabase ---
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Funciones de Utilidad ---
const showMessage = (message, type = 'info') => {
    const messageContainer = document.getElementById('app-message');
    if (messageContainer) {
        messageContainer.textContent = message;
        messageContainer.className = `app-message ${type}`;
        messageContainer.style.display = 'block';
        setTimeout(() => {
            messageContainer.style.display = 'none';
        }, 3000);
    }
};

const storeUserInLocalStorage = async (user) => {
    if (user) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', user.email)
            .single();

        if (error) {
            console.error('Error al obtener perfil de usuario:', error);
            localStorage.setItem('user', JSON.stringify({ email: user.email, id: user.id, is_admin: false, nom_usuario: user.user_metadata?.nom_usuario }));
        } else {
            localStorage.setItem('user', JSON.stringify(data));
        }
    } else {
        localStorage.removeItem('user');
    }
    updateSideMenu();
};

const updateSideMenu = () => {
    const user = JSON.parse(localStorage.getItem('user'));
    const loginBtn = document.getElementById('login-open-btn');
    const uploadBtn = document.getElementById('upload-open-btn');
    const userMenuName = document.getElementById('user-menu-name');

    if (loginBtn) {
        loginBtn.style.display = user ? 'none' : 'block';
    }
    if (uploadBtn) {
        uploadBtn.style.display = user ? 'block' : 'none';
    }
    if (userMenuName) {
        userMenuName.textContent = user ? (user.nombre || user.nom_usuario) : 'Invitado';
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Manejar el inicio de sesión
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.loginEmail.value;
            const password = loginForm.loginPassword.value;

            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) {
                console.error('Error de inicio de sesión:', error);
                showMessage(`Error al iniciar sesión: ${error.message}`, 'error');
                return;
            }

            await storeUserInLocalStorage(data.user);
            closeModal(document.getElementById('loginModal'));
            showMessage('Sesión iniciada correctamente', 'success');
            window.location.href = 'index.html'; 
        });
    }

    // 2. Manejar el registro
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nom_usuario = registerForm.registerUsername.value;
            const nombre = registerForm.registerName?.value || nom_usuario;
            const email = registerForm.registerEmail.value;
            const password = registerForm.registerPassword.value;
            const tipo_usuario = registerForm.registerType?.value || 'usuario'; 

            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password,
            });

            if (authError) {
                console.error('Error de registro:', authError);
                showMessage(`Error al registrar usuario: ${authError.message}`, 'error');
                return;
            }
            
            const { data: profileData, error: profileError } = await supabase
                .from('usuarios')
                .insert({
                    nom_usuario,
                    nombre,
                    email,
                    tipo_usuario,
                    is_admin: tipo_usuario === 'admin',
                });

            if (profileError) {
                console.error('Error al insertar perfil de usuario:', profileError);
                showMessage(`Error al guardar datos de perfil: ${profileError.message}`, 'error');
                return;
            }
            
            showMessage('Registro exitoso. ¡Revisa tu correo para verificar tu cuenta!', 'success');
            closeModal(document.getElementById('registerModal'));
            registerForm.reset(); 
        });
    }

    // 3. Manejar el cierre de sesión
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const { error } = await supabase.auth.signOut();
            localStorage.removeItem('user');
            if (error) {
                console.error('Error al cerrar sesión:', error);
                showMessage('Error al cerrar sesión.', 'error');
            } else {
                showMessage('Sesión cerrada correctamente.', 'success');
                window.location.href = 'index.html';
            }
        });
    }

    // 4. Actualizar la interfaz de usuario al cargar la página y en cada cambio de estado
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN') {
            await storeUserInLocalStorage(session.user);
        } else if (event === 'SIGNED_OUT') {
            localStorage.removeItem('user');
        }
        updateSideMenu();
    });

    updateSideMenu();

    // 5. Lógica para mostrar/ocultar contraseña (mantenida del original)
    const passwordInputs = [
        { id: 'loginPassword', toggleId: 'login-password-toggle' },
        { id: 'registerPassword', toggleId: 'register-password-toggle' },
        { id: 'registerConfirmPassword', toggleId: 'confirm-password-toggle' }
    ];

    passwordInputs.forEach(item => {
        const input = document.getElementById(item.id);
        const toggle = document.getElementById(item.toggleId);
        if (input && toggle) {
            toggle.addEventListener('click', () => {
                const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
                input.setAttribute('type', type);
                toggle.classList.toggle('fa-eye-slash');
            });
        }
    });
});

export { supabase };