// js/valid/regis-valid.js

// Caracteres prohibidos. ¡Los caracteres especiales se han escapado correctamente!
const PROHIBITED_CHARS_USERNAME = /['":;,<>/\(\)@\{\}\[\]`´¬\|°\\?¿¡=!+\*~^#\$%&¨]/;
const PROHIBITED_CHARS_EMAIL = /['":;,<>/\(\)\{\}\[\]`´¬\|°\\?¿¡=!+\*~^#\$%&¨]/;
const PROHIBITED_CHARS_PASSWORD = /['":;,<>/\(\)@\{\}\[\]`´¬\|°\\?¿¡=!*~^%¨]/;

// Validar nombre de usuario (username)
function validateUsername(username) {
    if (/\s/.test(username)) {
        return 'El nombre de usuario no puede contener espacios.';
    }
    if (PROHIBITED_CHARS_USERNAME.test(username)) {
        return 'El nombre de usuario contiene caracteres no permitidos.';
    }
    return null;
}

// Validar nombre completo (full name)
function validateFullName(name) {
    if (name.trim() !== name) {
        return 'El nombre completo no puede tener espacios al inicio o al final.';
    }
    if (name.includes('  ')) {
        return 'El nombre completo no puede tener más de un espacio entre palabras.';
    }
    if (!/^[a-zA-Z\s]+$/.test(name)) {
        return 'El nombre completo solo puede contener letras y espacios.';
    }
    return null;
}

// Validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Por favor, ingresa un email válido.';
    }
    if ((email.match(/@/g) || []).length > 1) {
        return 'El email no puede tener más de un "@".';
    }
    if (/^\d+$/.test(email.split('@')[0])) {
        return 'La parte del email antes del "@" no puede ser solo números.';
    }
    if (PROHIBITED_CHARS_EMAIL.test(email)) {
        return 'El email contiene caracteres no permitidos.';
    }
    return null;
}

// Validar contraseña
function validatePassword(password) {
    if (password.includes(' ')) {
        return 'La contraseña no puede contener espacios.';
    }
    if (PROHIBITED_CHARS_PASSWORD.test(password)) {
        return 'La contraseña contiene caracteres no permitidos.';
    }
    return null;
}

// Función principal de validación
export function validateRegistration(username, fullName, email, password, confirmPassword) {
    const usernameError = validateUsername(username);
    if (usernameError) return usernameError;

    const fullNameError = validateFullName(fullName);
    if (fullNameError) return fullNameError;

    const emailError = validateEmail(email);
    if (emailError) return emailError;

    if (password !== confirmPassword) {
        return 'Las contraseñas no coinciden.';
    }

    const passwordError = validatePassword(password);
    if (passwordError) return passwordError;

    return null;
}