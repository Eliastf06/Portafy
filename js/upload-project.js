// js/upload-project.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateProjectUpload } from './valid/upload-valid.js';

// Asegúrate de que estas credenciales sean las correctas de tu proyecto
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function showToast(message, type = 'success') {

    let background = '';
        if (type === 'success') {
            background = 'linear-gradient(to right, #ffee00d8, #3e3a00d8)'; // Degradado para éxito
        } else {
            background = 'linear-gradient(to right, #e61d16d8, #5d0300d8)'; // Degradado para error
        }


    Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: 'top', 
        position: 'right', 
        backgroundColor: background,
    }).showToast();
}

document.addEventListener('DOMContentLoaded', async () => {

    // Redirigir si no hay un usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    // Referencias a los elementos del DOM
    const addProyectForm = document.getElementById('add-proyect-form');
    const titleInput = document.getElementById('proyect-name');
    const descriptionInput = document.getElementById('proyect-description');
    const categoryInput = document.getElementById('proyect-category');
    const proyectImageInput = document.getElementById('proyect-image');
    const fileNameDisplay = document.getElementById('file-name-display');
    const imagePreview = document.getElementById('image-preview');
    
    // Referencias a los campos opcionales
    const startDateInput = document.getElementById('proyect-start-date');
    const endDateInput = document.getElementById('proyect-end-date');
    const clientInput = document.getElementById('proyect-client');
    const linksInput = document.getElementById('proyect-links');
    const privacyInput = document.getElementById('proyect-privacy');

    // Manejar la previsualización de la imagen
    proyectImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameDisplay.textContent = file.name;
            const reader = new FileReader();
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            imagePreview.style.display = 'none';
        }
    });

    // Manejar el envío del formulario
    addProyectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Limpiar y obtener los valores de los campos
        const title = titleInput.value.trim().replace(/\s+/g, ' ');
        const description = descriptionInput.value.trim().replace(/\s+/g, ' ');
        const category = categoryInput ? categoryInput.value.trim() : null;
        const imageFile = proyectImageInput.files[0];
        const startDate = startDateInput ? startDateInput.value : null;
        const endDate = endDateInput ? endDateInput.value : null;
        const client = clientInput ? clientInput.value.trim().replace(/\s+/g, ' ') : null;
        const links = linksInput ? linksInput.value.trim().replace(/\s+/g, ' ') : null;
        const privacy = privacyInput ? (privacyInput.value === 'true') : false;

        // Validar el formulario
        const validationError = validateProjectUpload(title, description, imageFile);
        if (validationError) {
            showToast(validationError, 'error');
            return;
        }

        addProyectForm.querySelector('button[type="submit"]').disabled = true;

        try {
            // Generar una ruta única para la imagen
            const filePath = `${user.id}/${Date.now()}-${imageFile.name}`;

            // Subir la imagen a Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('proyectos_imagenes')
                .upload(filePath, imageFile, {
                    upsert: false // No sobrescribir si el archivo ya existe
                });

            if (uploadError) {
                throw uploadError;
            }

            // Obtener la URL pública de la imagen
            const { data: publicUrlData } = supabase
                .storage
                .from('proyectos_imagenes')
                .getPublicUrl(filePath);

            const imageUrl = publicUrlData.publicUrl;

            // Insertar los datos del proyecto en la tabla 'proyectos'
            const { data: proyectosInsertData, error: proyectosInsertError } = await supabase
                .from('proyectos')
                .insert([{
                    id: user.id,
                    titulo: title,
                    descripcion: description,
                    categoria: category,
                    fecha_inicio: startDate,
                    fecha_finalizacion: endDate,
                    para_quien_se_hizo: client,
                    enlaces_referencia: links,
                    privacidad: privacy
                }])
                .select();

            if (proyectosInsertError) {
                throw proyectosInsertError;
            }

            const projectId = proyectosInsertData[0].id_proyectos;

            // Insertar la URL de la imagen en la tabla 'archivos'
            const { error: archivosInsertError } = await supabase
                .from('archivos')
                .insert([
                    {
                        url: imageUrl,
                        id_proyecto: projectId
                    }
                ]);

            if (archivosInsertError) {
                throw archivosInsertError;
            }
            
            // Si todo fue bien
            showToast('Proyecto subido exitosamente!', 'success');
            addProyectForm.reset();
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
            addProyectForm.querySelector('button[type="submit"]').disabled = false;

        } catch (err) {
            console.error('Ocurrió un error inesperado al subir el proyecto:', err);
            showToast('Ocurrió un error inesperado al subir el proyecto. Por favor, inténtalo de nuevo.', 'error');
            addProyectForm.querySelector('button[type="submit"]').disabled = false;

            // si falló la inserción o la carga, intentamos eliminar la imagen
            if (filePath) {
                const { error: removeError } = await supabase.storage.from('proyectos_imagenes').remove([filePath]);
                if (removeError) {
                    console.warn('Error al eliminar imagen huérfana:', removeError.message);
                }
            }
        }
    });
});