// js/update-password.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
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

    // CORRECCIÓN: Manejar la sesión desde la URL
    const { data: { session }, error: sessionError } = await supabase.auth.getSessionFromUrl();

    if (sessionError) {
        console.error("Error al obtener la sesión de la URL:", sessionError);
        showMessage("No se pudo obtener la sesión de recuperación. Por favor, intenta de nuevo.", "error");
        setTimeout(() => window.location.href = 'signin.html', 3000);
        return;
    }

    if (!session) {
        showMessage("No se encontró ninguna sesión de recuperación. Redirigiendo...", "error");
        setTimeout(() => window.location.href = 'signin.html', 3000);
        return;
    }

    // Si la sesión es válida, se muestra el formulario
    updatePasswordForm.style.display = 'block';

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
});
