
function validateProjectTitle(title) {
    const trimmedTitle = title.trim().replace(/\s+/g, ' '); // Elimina espacios extra
    const regex = /^[a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+(?:[ ][a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+)*$/;
    
    if (trimmedTitle.length === 0) {
        return 'El título no puede estar vacío.';
    }
    
    if (!regex.test(trimmedTitle)) {
        return 'El título solo puede contener letras, números y algunos símbolos, sin espacios al inicio o final, y con un solo espacio entre palabras.';
    }
    return null;
}

function validateProjectDescription(description) {
    const trimmedDescription = description.trim().replace(/\s+/g, ' '); 
    const regex = /^[a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+(?:[ ][a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+)*$/;
    
    if (trimmedDescription.length === 0) {
        return 'La descripción no puede estar vacía.';
    }
    
    if (!regex.test(trimmedDescription)) {
        return 'La descripción no puede tener espacios al inicio o al final, ni más de un espacio entre palabras, y solo puede contener letras, números, y los símbolos =, . : °.';
    }
    return null;
}

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

    for (const validator of validations) {
        const error = validator();
        if (error) {
            return error;
        }
    }

    return null;
}