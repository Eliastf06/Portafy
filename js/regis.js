// js/regis.js

// Importa createClient directamente desde el CDN como un módulo
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateRegistration } from './regis-valid.js';

// Credenciales de Supabase
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

// Inicializa el cliente Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const appMessageElement = document.getElementById('app-message');

    // Inputs del formulario
    const usernameInput = document.getElementById('username');
    const registerNameInput = document.getElementById('register-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const registerTypeInput = document.getElementById('register-type');

    function showMessage(message, type = 'success') {
        appMessageElement.textContent = message;
        appMessageElement.style.color = type === 'success' ? 'green' : 'red';
        appMessageElement.style.display = 'block';
        setTimeout(() => {
            appMessageElement.style.display = 'none';
        }, 5000);
    }

    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Elimina el .trim() de la validación inicial
        const username = usernameInput.value;
        const registerName = registerNameInput.value;
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();
        const userType = registerTypeInput.value.trim();

        // VALIDACIÓN DE CAMPOS con la nueva función
        const validationError = validateRegistration(username, registerName, email, password, confirmPassword);
        if (validationError) {
            showMessage(validationError, 'error');
            return;
        }
        
        // Si no hay un tipo de usuario seleccionado
        if (!userType) {
            showMessage('Por favor, selecciona tu tipo de proyecto.', 'error');
            return;
        }

        showMessage('Registrando usuario...', 'black');

        try {
            // Registrar el usuario y pasar todos los datos adicionales
            const { data, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nom_usuario: username,
                        nombre: registerName,
                        tipo_usuario: userType,
                        is_admin: false,
                    }
                }
            });

            if (authError) {
                console.error('Error al registrar en Supabase Auth:', authError);
                showMessage(`Error al registrar: ${authError.message}`, 'error');
                return;
            }

            // Si el registro de Auth fue exitoso:
            showMessage(`¡Registro exitoso! Por favor, revisa tu email (${email}) para confirmar tu cuenta.`, 'success');
            console.log('Usuario registrado y perfil enviado:', data.user);
            registerForm.reset();
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 7000);
            
        } catch (err) {
            console.error('Ocurrió un error inesperado al registrar:', err);
            showMessage('Ocurrió un error inesperado durante el registro.', 'error');
        }
    });

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

});