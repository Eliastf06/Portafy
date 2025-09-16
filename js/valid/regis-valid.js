// js/valid/regis-valid.js

// Caracteres prohibidos.
const PROHIBITED_CHARS_USERNAME = /['":;,<>/\(\)@\{\}\[\]`´¬\|°\\?¿¡=!+\*~^#\$%&¨]/;
const PROHIBITED_CHARS_EMAIL = /['":;,<>/\(\)\{\}\[\]`´¬\|°\\?¿¡=!+\*~^#\$%&¨]/;
const PROHIBITED_CHARS_PASSWORD = /[´¨]/; // Se han eliminado los símbolos permitidos de aquí

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
    if (!/^[a-zA-Z]+(?:[ ][a-zA-Z]+)*$/.test(name)) {
        return 'El nombre completo solo puede contener letras y un solo espacio entre palabras. No puede tener espacios al inicio o al final.';
    }
    return null;
}

// Validar email
function validateEmail(email) {
    const emailRegex = /^[^\s@]+(?:[^\s@\d]+)@[^\s@]+\.[^\s@]+$/;
    if (PROHIBITED_CHARS_EMAIL.test(email)) {
        return 'El email contiene caracteres no permitidos.';
    }
    if ((email.match(/@/g) || []).length > 1) {
        return 'El email no puede tener más de un "@".';
    }
    return null;
}

// Validar contraseña
function validatePassword(password) {
    if (password.includes(' ')) {
        return 'La contraseña no puede contener espacios.';
    }
    // Expresión regular para validar la combinación de caracteres y longitud
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+-=\[\]\{\};:'"|<,>.?/]).{12,16}$/;

    if (!passwordRegex.test(password)) {
        return 'La contraseña debe tener entre 12 y 16 caracteres, e incluir al menos una mayúscula, una minúscula, un número y un símbolo.';
    }

    if (PROHIBITED_CHARS_PASSWORD.test(password)) {
        return 'La contraseña contiene caracteres no permitidos.';
    }
    return null;
}

// Función principal de validación
export function validateRegistration(username, fullName, email, password, confirmPassword) {
    const validations = [
        () => validateUsername(username),
        () => validateFullName(fullName),
        () => validateEmail(email),
        () => validatePassword(password),
    ];

    for (const validator of validations) {
        const error = validator();
        if (error) {
            return error;
        }
    }

    if (password !== confirmPassword) {
        return 'Las contraseñas no coinciden.';
    }

    return null;
}