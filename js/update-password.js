// js/update-password.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const updatePasswordForm = document.getElementById('updatePasswordForm');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const appMessageElement = document.getElementById('app-message');

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

    updatePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newPassword = newPasswordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

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

    // Escuchar cambios en el estado de autenticación para asegurar que la sesión esté cargada
    supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            console.log('Sesión de recuperación o usuario autenticado.', session);
            // Mostrar el formulario si la sesión es válida
            if (session) {
                updatePasswordForm.style.display = 'block';
            }
        } else {
            console.log('No hay sesión de recuperación, redirigiendo...');
            // Si no hay sesión válida, redirigir al inicio de sesión
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 3000);
        }
    });
});