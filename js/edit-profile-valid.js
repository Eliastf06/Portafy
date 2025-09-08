// js/edit-profile-valid.js

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
    const allowedChars = /^[a-zA-Z0-9\s",.:°]+$/;
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
        // No hay error si no se selecciona una nueva foto de perfil, ya que es opcional
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
    // Si los campos están vacíos, la validación se omite y se considera válido
    if (username) {
        const usernameError = validateUsername(username);
        if (usernameError) return usernameError;
    }
    
    if (fullName) {
        const fullNameError = validateFullName(fullName);
        if (fullNameError) return fullNameError;
    }

    if (biography) {
        const biographyError = validateTextWithSymbols(biography, 'biografía');
        if (biographyError) return biographyError;
    }

    if (socialUrl) {
        const socialUrlError = validateSocialUrl(socialUrl);
        if (socialUrlError) return socialUrlError;
    }

    if (phone) {
        const phoneError = validatePhoneNumber(phone);
        if (phoneError) return phoneError;
    }

    if (address) {
        const addressError = validateTextWithSymbols(address, 'dirección');
        if (addressError) return addressError;
    }
    
    if (experience) {
        const experienceError = validateTextWithSymbols(experience, 'experiencia');
        if (experienceError) return experienceError;
    }

    if (profilePicFile) {
        const profilePicError = validateProfilePicture(profilePicFile);
        if (profilePicError) return profilePicError;
    }

    return null;
}