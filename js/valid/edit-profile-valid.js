// js/valid/edit-profile-valid.js

// Validar nombre de usuario
function validateUsername(username) {
    if (/\s/.test(username)) {
        return 'El nombre de usuario no puede contener espacios.';
    }
    const prohibitedChars = /['":;,<>/\(\)@\{\}\[\]`´¬\|°\\?¿¡!=+*~^#\$%&¨]/;
    if (prohibitedChars.test(username)) {
        return 'El nombre de usuario contiene caracteres no permitidos.';
    }
    return null;
}

// Validar nombre completo
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

// Validar biografía, dirección y experiencia
function validateTextWithSymbols(text, fieldName) {
    if (text.trim() !== text) {
        return `La ${fieldName} no puede tener espacios al inicio o al final.`;
    }
    if (text.includes('  ')) {
        return `La ${fieldName} no puede tener más de un espacio entre palabras.`;
    }
    const allowedChars = /^[a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+$/;
    if (!allowedChars.test(text)) {
        return `La ${fieldName} contiene caracteres no permitidos.`;
    }
    return null;
}

// Validar URL de red social
function validateSocialUrl(url) {
    if (url.includes(' ')) {
        return 'La URL no puede contener espacios.';
    }
    const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]+\.[^\s]{2,}|[a-zA-Z0-9]+\.[^\s]{2,})$/i;
    if (!urlRegex.test(url)) {
        return 'Por favor, ingresa una URL válida.';
    }
    return null;
}

// Validar número de teléfono
function validatePhoneNumber(phone) {
    if (/\s/.test(phone)) {
        return 'El teléfono no puede contener espacios.';
    }
    if (!/^\d+$/.test(phone)) {
        return 'El teléfono solo puede contener números.';
    }
    return null;
}

// Validar tipo de archivo de imagen
function validateProfilePicture(file) {
    if (!file) {
        return null;
    }
    const allowedExtensions = ['png', 'jpg', 'webp', 'jfif', 'jpeg', 'svg', 'tiff', 'bmp', 'heic', 'heif', 'gif', 'raw'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        return `Tipo de archivo no permitido. Solo se aceptan: ${allowedExtensions.join(', ')}.`;
    }
    
    return null;
}

// Función principal de validación para el formulario
export function validateProfile(username, fullName, biography, socialUrl, phone, address, experience, profilePicFile) {
    const validations = [
        { value: username, validator: validateUsername, name: 'username' },
        { value: fullName, validator: validateFullName, name: 'fullName' },
        { value: biography, validator: validateTextWithSymbols, name: 'biografía' },
        { value: socialUrl, validator: validateSocialUrl, name: 'socialUrl' },
        { value: phone, validator: validatePhoneNumber, name: 'phone' },
        { value: address, validator: validateTextWithSymbols, name: 'dirección' },
        { value: experience, validator: validateTextWithSymbols, name: 'experiencia' },
        { value: profilePicFile, validator: validateProfilePicture, name: 'profilePicFile' }
    ];

    for (const validation of validations) {
        if (validation.value) {
            const error = validation.validator(validation.value, validation.name);
            if (error) {
                return error;
            }
        }
    }

    return null;
}