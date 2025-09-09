// js/edit-project-valid.js

/**
 * Valida un formulario de edición de proyecto.
 * @param {object} formData - Los datos del formulario a validar.
 * @returns {object} Un objeto con la propiedad `isValid` (booleano) y `errors` (objeto con mensajes de error).
 */
export const validateEditProjectForm = (formData) => {
    const {
        title,
        description,
        imageFile,
        startDate,
        endDate,
        client,
        links
    } = formData;

    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para una comparación precisa
    const minDate = new Date('1980-01-01');

    // Validación del título
    const trimmedTitle = title.trim();
    if (!/^[a-zA-Z0-9]+(?:[ ][a-zA-Z0-9]+)*$/.test(trimmedTitle)) {
        errors.title = "El título solo puede contener letras y números, sin espacios al inicio o final, y con un solo espacio entre palabras.";
    }

    // Validación de la descripción
    const trimmedDescription = description.trim();
    if (trimmedDescription.length > 0 && !/^[a-zA-Z0-9=,.:°"]+(?:[ ][a-zA-Z0-9=,.:°"]+)*$/.test(trimmedDescription)) {
        errors.description = "La descripción solo puede contener letras, números y los símbolos =, . : ° . No debe tener espacios al principio o final, ni más de un espacio entre palabras.";
    } else if (trimmedDescription.length === 0) {
        errors.description = "La descripción no puede estar vacía.";
    }


    // Validación de la imagen del proyecto
    if (imageFile) {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jfif', 'image/svg+xml', 'image/tiff', 'image/bmp', 'image/heic', 'image/heif', 'image/gif', 'image/x-raw'];
        if (!allowedTypes.includes(imageFile.type)) {
            errors.image = "Tipo de archivo no válido. Solo se permiten .png, .jpg, .webp, .jfif, .jpeg, .svg, .tiff, .bmp, .heic/heif, .gif o .raw.";
        }
    }

    // Validación de la fecha de inicio
    if (startDate) {
        const start = new Date(startDate);
        // Quitar la hora para la comparación
        const startOnlyDate = new Date(startDate);
        startOnlyDate.setHours(0, 0, 0, 0);

        if (startOnlyDate < minDate || startOnlyDate > today) {
            errors.startDate = "La fecha de inicio no puede ser anterior a 1980 ni posterior a la fecha actual.";
        }
    }

    // Validación de la fecha de finalización
    if (endDate) {
        const end = new Date(endDate);
        // Quitar la hora para la comparación
        const endOnlyDate = new Date(endDate);
        endOnlyDate.setHours(0, 0, 0, 0);
        
        if (endOnlyDate < minDate || endOnlyDate > today) {
            errors.endDate = "La fecha de finalización no puede ser anterior a 1980 ni posterior a la fecha actual.";
        }
        if (startDate) {
            const startOnlyDate = new Date(startDate);
            startOnlyDate.setHours(0, 0, 0, 0);
            if (endOnlyDate < startOnlyDate) {
                errors.endDate = "La fecha de finalización no puede ser anterior a la fecha de inicio.";
            }
        }
    }

    // Validación de 'para quien se realizo'
    const trimmedClient = client.trim();
    if (client && !/^[a-zA-Z]+(?:[ ][a-zA-Z]+)*$/.test(trimmedClient)) {
        errors.client = "Este campo solo puede contener letras, sin espacios al inicio o final, y con un solo espacio entre palabras.";
    }

    // Validación de los enlaces de referencia
    if (links) {
        const linksArray = links.split(',').map(link => link.trim()).filter(link => link);
        const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9]\.[^\s]{2,}|[a-zA-Z0-9]\.[^\s]{2,})$/;
        const dangerousDomains = ['malware.com', 'phishing.net', 'virus.org']; // Ejemplo, debería ser una lista más completa si es necesario

        for (const link of linksArray) {
            if (link.includes(' ')) {
                errors.links = "Los enlaces no deben contener espacios.";
                break;
            }
            if (!urlRegex.test(link)) {
                errors.links = "URL inválida. Asegúrate de usar un formato de URL correcto.";
                break;
            }
            const isDangerous = dangerousDomains.some(domain => link.includes(domain));
            if (isDangerous) {
                errors.links = "URL detectada como peligrosa o no segura.";
                break;
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};