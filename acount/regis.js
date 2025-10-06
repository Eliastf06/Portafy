// js/acount/regis.js

// Importa createClient directamente desde el CDN como un módulo
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateRegistration } from './../valid/regis-valid.js';

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

    // Función para mostrar mensajes de estado con Toastify
    const showToast = (message, isError = false) => {

        let background = '';
        if (isError === false) {
            background = 'linear-gradient(to right, #ffee00d8, #3e3a00d8)'; // Degradado para éxito
        } else {
            background = 'linear-gradient(to right, #e61d16d8, #5d0300d8)'; // Degradado para error
        }

        Toastify({
            text: message,
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: background,
        }).showToast();
    };

    // Función para verificar si el usuario o el email ya existen
    async function checkUserExists(username, email) {
        // Verificar si el username ya existe en la tabla 'usuarios'
        const { data: userExists, error: userError } = await supabase
            .from('usuarios')
            .select('nom_usuario')
            .eq('nom_usuario', username)
            .maybeSingle();

        if (userExists) {
            return 'El nombre de usuario ya está en uso. Por favor, elige otro.';
        }

        if (userError && userError.code !== 'PGRST116') { // Ignorar el error de "no rows found"
            throw userError;
        }

        // Verificar si el email ya existe en la tabla de usuarios
        const { data: emailExists, error: emailError } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email)
            .maybeSingle();

        if (emailExists) {
            return 'El email ya está en uso. Por favor, utiliza otro.';
        }

        if (emailError && emailError.code !== 'PGRST116') {
            throw emailError;
        }

        return null;
    }

    // Manejar el envío del formulario de registro
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = usernameInput.value.trim();
        const fullName = registerNameInput.value.trim();
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        const userType = registerTypeInput.value;

        // Validar los campos del formulario
        const validationError = validateRegistration(username, fullName, email, password, confirmPassword);
        if (validationError) {
            showToast(validationError, true);
            return;
        }

        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden.', true);
            return;
        }

        // Verificar si el usuario o el email ya existen en la base de datos
        const dbCheckError = await checkUserExists(username, email);
        if (dbCheckError) {
            showToast(dbCheckError, true);
            return;
        }

        try {
            // Deshabilitar el botón de registro para evitar envíos dobles
            const registerBtn = registerForm.querySelector('button[type="submit"]');
            registerBtn.disabled = true;
            registerBtn.textContent = 'Registrando...';

            // Intentar registrar el usuario en Supabase Auth
            const { data, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        nom_usuario: username,
                        nombre: fullName,
                        tipo_usuario: userType
                    }
                }
            });

            if (authError) {
                showToast(`Error al registrar: ${authError.message}`, true);
                registerBtn.disabled = false;
                registerBtn.textContent = 'Registrarse';
                return;
            }

            // Si el registro de Auth fue exitoso:
            showToast(`¡Registro exitoso! Por favor, revisa tu email (${email}) para confirmar tu cuenta.`, false);
            console.log('Usuario registrado y perfil enviado:', data.user);
            registerForm.reset();
            setTimeout(() => {
                showToast('Redirigiendo...', false);
            }, 3000);
            setTimeout(() => {
                window.location.href = 'signin.html';
            }, 7000);
            
        } catch (err) {
            console.error('Ocurrió un error inesperado al registrar:', err);
            showToast('Ocurrió un error inesperado durante el registro.', true);
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