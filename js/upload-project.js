// js/upload-project.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Asegúrate de que estas credenciales sean las correctas de tu proyecto
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const proyectUploadMessage = document.getElementById('proyect-upload-message');

function showMessage(message, type = 'success') {
    proyectUploadMessage.textContent = message;
    proyectUploadMessage.style.color = type === 'success' ? 'green' : (type === 'error' ? 'red' : 'black');
    proyectUploadMessage.style.display = 'block';
    setTimeout(() => {
        proyectUploadMessage.style.display = 'none';
    }, 5000);
}

document.addEventListener('DOMContentLoaded', async () => {

    // Redirigir si no hay un usuario autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    // Referencias a los elementos del DOM (obligatorios)
    const addProyectForm = document.getElementById('add-proyect-form');
    const titleInput = document.getElementById('proyect-name');
    const descriptionInput = document.getElementById('proyect-description');
    const categoryInput = document.getElementById('proyect-category');
    const proyectImageInput = document.getElementById('proyect-image');
    const fileNameDisplay = document.getElementById('file-name-display');
    const imagePreview = document.getElementById('image-preview');

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
        
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const category = categoryInput.value.trim();
        const imageFile = proyectImageInput.files[0];

        // Recopilar valores de campos opcionales
        const startDateInput = document.getElementById('proyect-start-date');
        const endDateInput = document.getElementById('proyect-end-date');
        const targetAudienceInput = document.getElementById('proyect-audience');
        const referenceLinksInput = document.getElementById('proyect-links');
        const privacyInput = document.getElementById('proyect-privacy');

        const startDate = startDateInput ? startDateInput.value : null;
        const endDate = endDateInput ? endDateInput.value : null;
        const targetAudience = targetAudienceInput ? targetAudienceInput.value.trim() : null;
        const referenceLinks = referenceLinksInput ? referenceLinksInput.value.trim() : null;
        const privacy = privacyInput ? privacyInput.checked : false;

        if (!imageFile) {
            showMessage('Por favor, selecciona una imagen para tu proyecto.', 'error');
            return;
        }

        showMessage('Subiendo proyecto...', 'black');
        let projectId = null;

        try {
            // Obtener el nombre de usuario
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('nom_usuario')
                .eq('id', user.id)
                .single();

            if (userError) {
                throw new Error('Error al obtener el nombre de usuario: ' + userError.message);
            }
            const nomUsuario = userData.nom_usuario;

            // 1. Insertar la información del proyecto y obtener el ID
            const { data: insertData, error: insertError } = await supabase
                .from('proyectos')
                .insert([
                    {
                        titulo: title,
                        descripcion: description,
                        categoria: category,
                        fecha_publi: new Date().toISOString(),
                        fecha_inicio: startDate,
                        fecha_finalizacion: endDate,
                        para_quien_se_hizo: targetAudience,
                        enlaces_referencia: referenceLinks,
                        privacidad: privacy,
                        nom_usuario: nomUsuario,
                        id: user.id
                    }
                ])
                .select('id_proyecto')
                .single();

            if (insertError) {
                throw insertError;
            }

            projectId = insertData.id_proyecto;
            
            // 2. Subir la imagen al bucket usando el ID del proyecto
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('proyectos_imagenes')
                .upload(`${projectId}/${imageFile.name}`, imageFile, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw uploadError;
            }
            
            // 3. Obtener la URL pública de la imagen
            const { data: publicUrlData } = supabase.storage
                .from('proyectos_imagenes')
                .getPublicUrl(uploadData.path);
            
            const imageUrl = publicUrlData.publicUrl;

            // 4. Insertar la URL de la imagen en la tabla 'archivos'
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
            showMessage('Proyecto subido exitosamente!', 'success');
            addProyectForm.reset();
            fileNameDisplay.textContent = 'Ningún archivo seleccionado';
            imagePreview.src = '#';
            imagePreview.style.display = 'none';

        } catch (err) {
            console.error('Ocurrió un error inesperado al subir el proyecto:', err);
            showMessage('Ocurrió un error inesperado al subir el proyecto. Por favor, inténtalo de nuevo.', 'error');
            
            // Limpieza: si falló la inserción o la carga, intentamos eliminar la imagen
            if (projectId) {
                const filePathInBucket = `${projectId}/${imageFile.name}`;
                const { error: removeError } = await supabase.storage.from('proyectos_imagenes').remove([filePathInBucket]);
                if (removeError) {
                    console.warn('Error al eliminar imagen huérfana:', removeError.message);
                }
            }
        }
    });
});