// js/signin.js

// Importa createClient directamente desde el CDN como un módulo
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Tus credenciales de Supabase
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

// Inicializa el cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const appMessageElement = document.getElementById('app-message');
    const forgotPasswordLink = document.getElementById('forgot-password');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    function showMessage(message, type = 'success') {
        appMessageElement.textContent = message;
        appMessageElement.style.color = type === 'success' ? 'green' : 'red';
        appMessageElement.style.display = 'block';
        setTimeout(() => {
            appMessageElement.style.display = 'none';
        }, 5000);
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            showMessage('Por favor, ingresa tu email y contraseña.', 'error');
            return;
        }

        showMessage('Iniciando sesión...', 'black');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.error('Error al iniciar sesión:', error);
                if (error.message.includes('Invalid login credentials')) {
                    showMessage('Credenciales incorrectas. Verifica tu email y contraseña.', 'error');
                } else {
                    showMessage(`Error al iniciar sesión: ${error.message}`, 'error');
                }
                return;
            }

            if (data.user) {
                showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
                console.log('Usuario logueado:', data.user);
                loginForm.reset();
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            }

        } catch (err) {
            console.error('Ocurrió un error inesperado al iniciar sesión:', err);
            showMessage('Ocurrió un error inesperado durante el inicio de sesión.', 'error');
        }
    });

    // CORRECCIÓN: el enlace ahora redirige a una página de recuperación
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'recover-password.html';
    });
    
    (async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                console.log("Usuario ya autenticado:", user);
                showMessage(`Bienvenido de nuevo! Ya estás conectado.`, 'success');
            }
        } catch (error) {
            console.error("Error al obtener el estado de autenticación:", error);
        }
    })();
});