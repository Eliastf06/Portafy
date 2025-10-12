
const validateTitle = (title) => {
    const trimmedTitle = title.trim().replace(/\s+/g, ' '); // Elimina espacios extra
    const regex = /^[a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+(?:[ ][a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+)*$/;

    if (trimmedTitle.length === 0) {
        return "El título no puede estar vacío.";
    }

    if (!regex.test(trimmedTitle)) {
        return "El título solo puede contener letras, números y algunos símbolos, sin espacios al inicio o final, y con un solo espacio entre palabras.";
    }
    return null;
};

// Validar la descripción
const validateDescription = (description) => {
    const trimmedDescription = description.trim().replace(/\s+/g, ' '); // Elimina espacios extra
    const regex = /^[a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+(?:[ ][a-zA-Z0-9\s=,.-áéíóúÁÉÍÓÚ():°"]+)*$/;

    if (trimmedDescription.length === 0) {
        return "La descripción no puede estar vacía.";
    }
    if (!regex.test(trimmedDescription)) {
        return "La descripción solo puede contener letras, números y los símbolos =, . : °. No debe tener espacios al principio o final, ni más de un espacio entre palabras.";
    }
    return null;
};

// Validar la imagen del proyecto
const validateImage = (imageFile) => {
    if (!imageFile) {
        return null;
    }
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/jfif', 'image/svg+xml', 'image/tiff', 'image/bmp', 'image/heic', 'image/heif', 'image/gif', 'image/x-raw'];
    if (!allowedTypes.includes(imageFile.type)) {
        return "Tipo de archivo no válido. Solo se permiten .png, .jpg, .webp, .jfif, .jpeg, .svg, .tiff, .bmp, .heic/heif, .gif o .raw.";
    }
    return null;
};

// Validar fechas
const validateDate = (date, minDate, today, fieldName) => {
    if (!date) {
        return null;
    }
    const dateObj = new Date(date);
    dateObj.setHours(0, 0, 0, 0);

    if (dateObj < minDate || dateObj > today) {
        return `La fecha de ${fieldName} no puede ser anterior a 1980 ni posterior a la fecha actual.`;
    }
    return null;
};

const validateClient = (client) => {
    if (!client) {
        return null;
    }
    const trimmedClient = client.trim().replace(/\s+/g, ' '); 
    if (!/^[a-zA-Z]+(?:[ ][a-zA-Z]+)*$/.test(trimmedClient)) {
        return "Este campo solo puede contener letras, sin espacios al inicio o final, y con un solo espacio entre palabras.";
    }
    return null;
};

// Validar enlaces de referencia
const validateLinks = (links) => {
    if (!links) {
        return null;
    }
    const linksArray = links.split(',').map(link => link.trim()).filter(link => link); // Limpiar y filtrar
    const urlRegex = /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/[a-zA-Z0-9-.]+\.[^\s]{2,}|www\.[a-zA-Z0-9-.]+\.[^\s]{2,})$/;
    
    for (const link of linksArray) {
        if (!urlRegex.test(link)) {
            return `El enlace "${link}" no es una URL válida.`;
        }
    }
    return null;
};

export const validateEditProjectForm = (formData) => {
    const { title, description, imageFile, startDate, endDate, client, links } = formData;
    const errors = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const minDate = new Date('1980-01-01');

    const validations = [
        { field: 'title', validator: () => validateTitle(title) },
        { field: 'description', validator: () => validateDescription(description) },
        { field: 'image', validator: () => validateImage(imageFile) },
        { field: 'startDate', validator: () => validateDate(startDate, minDate, today, 'inicio') },
        { field: 'endDate', validator: () => validateDate(endDate, minDate, today, 'finalización') },
        { field: 'client', validator: () => validateClient(client) },
        { field: 'links', validator: () => validateLinks(links) },
    ];
    
    if (startDate && endDate) {
        const startOnlyDate = new Date(startDate);
        startOnlyDate.setHours(0, 0, 0, 0);
        const endOnlyDate = new Date(endDate);
        endOnlyDate.setHours(0, 0, 0, 0);
        if (endOnlyDate < startOnlyDate) {
            errors.endDate = "La fecha de finalización no puede ser anterior a la fecha de inicio.";
        }
    }

    for (const validation of validations) {
        const error = validation.validator();
        if (error) {
            errors[validation.field] = error;
        }
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
};