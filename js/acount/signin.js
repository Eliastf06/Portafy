import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showMessage(message, type = 'success') {
    const appMessageElement = document.getElementById('app-message');
    appMessageElement.textContent = message;
    appMessageElement.style.color = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'black');
    appMessageElement.style.display = 'block';
    setTimeout(() => {
        appMessageElement.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', async () => {

    // **[MODIFICACIÓN CLAVE]** Verificar autenticación al cargar la página
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            console.log("Usuario ya autenticado. Redirigiendo a discover.html");
            // Muestra un mensaje breve de redirección antes de salir
            showMessage(`Bienvenido de nuevo! Redirigiendo...`, 'success');
            setTimeout(() => {
                window.location.href = 'discover.html';
            }, 500); // Pequeño retraso para que el usuario perciba el cambio
            return; // Detiene la ejecución del resto del script
        }
    } catch (error) {
        console.error("Error al obtener el estado de autenticación:", error);
        // Si hay un error al verificar, permite que el usuario intente loguearse
    }

    const loginForm = document.getElementById('loginForm');
    const forgotPasswordLink = document.getElementById('forgot-password');

    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

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
                    window.location.href = 'discover.html';
                }, 2000);
            }

        } catch (err) {
            console.error('Ocurrió un error inesperado al iniciar sesión:', err);
            showMessage('Ocurrió un error inesperado durante el inicio de sesión.', 'error');
        }
    });

    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = 'recover-password.html';
    });
    
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const targetId = toggle.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            const icon = toggle.querySelector('i');

            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    });
});