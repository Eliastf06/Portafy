// js/valid/upload-valid.js

// Validar título del proyecto
function validateProjectTitle(title) {
    if (title.trim() !== title) {
        return 'El título no puede tener espacios al inicio o al final.';
    }
    if (title.includes('  ')) {
        return 'El título no puede tener más de un espacio entre palabras.';
    }
    if (!/^[a-zA-Z0-9\s]+$/.test(title)) {
        return 'El título solo puede contener letras y números.';
    }
    return null;
}

// Validar descripción del proyecto
function validateProjectDescription(description) {
    if (description.trim() !== description) {
        return 'La descripción no puede tener espacios al inicio o al final.';
    }
    if (description.includes('  ')) {
        return 'La descripción no puede tener más de un espacio entre palabras.';
    }
    if (!/^[a-zA-Z0-9\s=,.:°]+$/.test(description)) {
        return 'La descripción contiene caracteres no permitidos.';
    }
    return null;
}

// Validar tipo de archivo de imagen
function validateImageFile(file) {
    if (!file) {
        return 'Por favor, selecciona una imagen para tu proyecto.';
    }
    const allowedExtensions = ['png', 'jpg', 'webp', 'jfif', 'jpeg', 'svg', 'tiff', 'bmp', 'heic', 'heif', 'gif', 'raw'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        return `Tipo de archivo no permitido. Solo se aceptan: ${allowedExtensions.join(', ')}.`;
    }
    
    return null;
}

// Función principal de validación para el formulario de subir proyecto
export function validateProjectUpload(title, description, imageFile) {
    const titleError = validateProjectTitle(title);
    if (titleError) return titleError;

    const descriptionError = validateProjectDescription(description);
    if (descriptionError) return descriptionError;
    
    const fileError = validateImageFile(imageFile);
    if (fileError) return fileError;
    
    return null;
}