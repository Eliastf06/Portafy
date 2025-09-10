// js/acount/update-password.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Caracteres prohibidos para la contraseña
const PROHIBITED_CHARS_PASSWORD = /['":;,<>/\(\)@\{\}\[\]`´¬\|°\\?¿¡=!*~^%¨]/;

document.addEventListener('DOMContentLoaded', async () => {
    const updatePasswordForm = document.getElementById('updatePasswordForm');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const appMessageElement = document.getElementById('app-message');

    // Ocultar el formulario al inicio
    updatePasswordForm.style.display = 'none';

    function showMessage(message, type = 'success') {
        appMessageElement.textContent = message;
        appMessageElement.style.color = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'black');
        appMessageElement.style.display = 'block';
        setTimeout(() => {
            appMessageElement.style.display = 'none';
        }, 5000);
    } 

    // Función para alternar la visibilidad de la contraseña
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

    // Validar si existe una sesión de recuperación al cargar la página
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        updatePasswordForm.style.display = 'block';
    } else {
        showMessage('No se encontró una sesión de recuperación. Redirigiendo...', 'error');
        setTimeout(() => window.location.href = 'signin.html', 3000);
        return;
    }

    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        // Validar que la contraseña no contenga espacios
        if (newPassword.includes(' ')) {
            showMessage('La contraseña no puede contener espacios.', 'error');
            return;
        }

        // Validar que la contraseña no contenga caracteres prohibidos
        if (PROHIBITED_CHARS_PASSWORD.test(newPassword)) {
            showMessage('La contraseña contiene caracteres no permitidos.', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('Las contraseñas no coinciden.', 'error');
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        showMessage('Actualizando contraseña...', 'black');
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });

            if (error) {
                console.error("Error al actualizar la contraseña:", error);
                showMessage(`Error al actualizar la contraseña: ${error.message}`, "error");
            } else {
                showMessage("Tu contraseña ha sido actualizada exitosamente.", "success");
                setTimeout(() => {
                    window.location.href = 'signin.html';
                }, 2000);
            }
        } catch (err) {
            console.error("Ocurrió un error inesperado:", err);
            showMessage("Ocurrió un error inesperado al actualizar la contraseña.", "error");
        }
    });
});