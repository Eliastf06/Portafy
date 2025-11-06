//recover-password.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const recoverPasswordForm = document.getElementById('recoverPasswordForm');
    const emailInput = document.getElementById('email');
    const appMessageElement = document.getElementById('app-message');

    function showMessage(message, type = 'success') {
        appMessageElement.textContent = message;
        appMessageElement.style.color = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'black');
        appMessageElement.style.display = 'block';
        setTimeout(() => {
            appMessageElement.style.display = 'none';
        }, 5000);
    }

    recoverPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = emailInput.value.trim();
        if (!email) {
            showMessage('Por favor, ingresa tu email.', 'error');
            return;
        }

        showMessage('Enviando enlace de restablecimiento...', 'black');
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: 'https://portafy.vercel.app/update-password.html'
            });

            if (error) {
                console.error("Error al enviar el correo de restablecimiento:", error);
                showMessage(`Error al enviar el enlace: ${error.message}`, "error");
            } else {
                showMessage("Se ha enviado un enlace para restablecer tu contraseña a tu email. Revisa tu bandeja de entrada y la carpeta de spam.", "success");
            }

        } catch (err) {
            console.error("Ocurrió un error inesperado:", err);
            showMessage("Ocurrió un error inesperado al restablecer la contraseña.", "error");
        }
    });
});

