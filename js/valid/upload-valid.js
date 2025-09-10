// js/valid/upload-valid.js

// Validar título del proyecto
function validateProjectTitle(title) {
    // La expresión regular ahora maneja los espacios
    const regex = /^[a-zA-Z0-9]+(?:[ ][a-zA-Z0-9]+)*$/;
    if (!regex.test(title)) {
        return 'El título solo puede contener letras y números, sin espacios al inicio o final, y con un solo espacio entre palabras.';
    }
    return null;
}

// Validar descripción del proyecto
function validateProjectDescription(description) {
    // La expresión regular ahora maneja los espacios
    const regex = /^[a-zA-Z0-9\s=,.:°]+(?:[ ][a-zA-Z0-9\s=,.:°]+)*$/;
    if (!regex.test(description)) {
        return 'La descripción no puede tener espacios al inicio o al final, ni más de un espacio entre palabras, y solo puede contener letras, números, y los símbolos =, . : °.';
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

/** Valida el formulario de subida de proyecto.
@param {string} title - El título del proyecto.
@param {string} description - La descripción del proyecto.
@param {File} imageFile - El archivo de imagen.
@returns {string|null} Un mensaje de error si la validación falla, o `null` si es exitosa.*/

export function validateProjectUpload(title, description, imageFile) {
    // Un arreglo de validaciones que se ejecutarán en orden
    const validations = [
        () => validateProjectTitle(title),
        () => validateProjectDescription(description),
        () => validateImageFile(imageFile)
    ];

    // Iterar sobre las validaciones y retornar el primer error encontrado
    for (const validator of validations) {
        const error = validator();
        if (error) {
            return error;
        }
    }

    return null;
}
