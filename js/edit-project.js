// js/edit-project.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const editProjectForm = document.getElementById('editProjectForm');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    const proyectImageInput = document.getElementById('proyect-image');
    const imagePreview = document.getElementById('image-preview');
    const fileNameDisplay = document.getElementById('file-name-display');

    // Obtener el ID del proyecto de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');
    
    // Si no hay ID, redirigir al perfil
    if (!projectId) {
        window.location.href = 'profile.html';
        return;
    }
    
    // Redirigir si el usuario no está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    let currentImagePath = null;

    // Función para mostrar mensajes de estado
    const showMessage = (message, isError = false) => {
        const messageContainer = document.createElement('div');
        messageContainer.textContent = message;
        messageContainer.style.color = isError ? 'red' : 'green';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.marginTop = '10px';
        editProjectForm.parentNode.insertBefore(messageContainer, editProjectForm.nextSibling);
        setTimeout(() => messageContainer.remove(), 5000);
    };

    // Cargar los datos del proyecto
    async function loadProjectData() {
        try {
            const { data: projectData, error: projectError } = await supabase
                .from('proyectos')
                .select(`
                    *,
                    archivos(url)
                `)
                .eq('id_proyectos', projectId)
                .eq('id', user.id) // Se añade un filtro por el ID del usuario para mayor seguridad
                .single();
            
            if (projectError || !projectData) {
                throw new Error('Proyecto no encontrado o no tienes permiso para verlo.');
            }

            // Verificar si el usuario es el dueño del proyecto
            if (projectData.id !== user.id) {
                showMessage('No tienes permiso para editar este proyecto.', true);
                editProjectForm.style.display = 'none';
                deleteProjectBtn.style.display = 'none';
                return;
            }

            // Rellenar el formulario con los datos existentes
            document.getElementById('edit-project-id').value = projectData.id_proyectos;
            document.getElementById('edit-project-title').value = projectData.titulo;
            document.getElementById('edit-project-description').value = projectData.descripcion;
            document.getElementById('proyect-category').value = projectData.categoria;
            document.getElementById('edit-project-start-date').value = projectData.fecha_inicio;
            document.getElementById('edit-project-end-date').value = projectData.fecha_finalizacion;
            document.getElementById('edit-project-client').value = projectData.para_quien_se_hizo;
            document.getElementById('edit-project-links').value = projectData.enlaces_referencia;
            document.getElementById('edit-project-privacy').value = projectData.privacidad.toString();

            // Mostrar la imagen actual
            if (projectData.archivos && projectData.archivos.length > 0) {
                const imageUrl = projectData.archivos[0].url;
                imagePreview.src = imageUrl;
                imagePreview.style.display = 'block';
                // Obtener el path de la imagen para su futura eliminación si se cambia
                const pathParts = imageUrl.split('/');
                const fileName = pathParts.pop();
                const folderName = pathParts.pop();
                currentImagePath = `${folderName}/${fileName}`;
            }

        } catch (error) {
            console.error('Error al cargar los datos del proyecto:', error);
            showMessage(`Error al cargar los datos: ${error.message}`, true);
        }
    }

    await loadProjectData();

    // Manejar la previsualización de la nueva imagen
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

    // Manejar el envío del formulario para actualizar
    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        showMessage('Guardando cambios...');
        
        const title = document.getElementById('edit-project-title').value.trim();
        const description = document.getElementById('edit-project-description').value.trim();
        const category = document.getElementById('proyect-category').value;
        const startDate = document.getElementById('edit-project-start-date').value || null;
        const endDate = document.getElementById('edit-project-end-date').value || null;
        const client = document.getElementById('edit-project-client').value.trim() || null;
        const links = document.getElementById('edit-project-links').value.trim() || null;
        const privacy = document.getElementById('edit-project-privacy').value === 'true';

        let newImageUrl = null;
        const imageFile = proyectImageInput.files[0];

        try {
            // Si el usuario subió una nueva imagen
            if (imageFile) {
                // Subir la nueva imagen, sobreescribiendo si ya existe
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('proyectos_imagenes')
                    .upload(`${projectId}/${imageFile.name}`, imageFile, {
                        cacheControl: '3600',
                        upsert: true // CORRECCIÓN: Se cambió a true para sobrescribir
                    });
                
                if (uploadError) throw uploadError;
                
                // Obtener la URL pública de la nueva imagen
                const { data: publicUrlData } = supabase.storage
                    .from('proyectos_imagenes')
                    .getPublicUrl(uploadData.path);
                newImageUrl = publicUrlData.publicUrl;

                // Actualizar la URL en la tabla 'archivos'
                const { error: updateFileError } = await supabase
                    .from('archivos')
                    .update({ url: newImageUrl })
                    .eq('id_proyecto', projectId);
                
                if (updateFileError) throw updateFileError;
            }

            // Actualizar la información del proyecto
            const { error: updateProjectError } = await supabase
                .from('proyectos')
                .update({
                    titulo: title,
                    descripcion: description,
                    categoria: category,
                    fecha_inicio: startDate,
                    fecha_finalizacion: endDate,
                    para_quien_se_hizo: client,
                    enlaces_referencia: links,
                    privacidad: privacy
                })
                .eq('id_proyectos', projectId);

            if (updateProjectError) throw updateProjectError;
            
            showMessage('Proyecto actualizado exitosamente!');

        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            showMessage(`Error al actualizar: ${error.message}`, true);
        }
    });

    // Manejar la eliminación del proyecto
    deleteProjectBtn.addEventListener('click', async () => {
        if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción es irreversible.')) {
            return;
        }

        try {
            // Eliminar los archivos primero
            const { data: filesData, error: filesError } = await supabase
                .from('archivos')
                .select('url')
                .eq('id_proyecto', projectId);

            if (filesError) throw filesError;

            // Eliminar las imágenes del storage
            if (filesData.length > 0) {
                const pathsToDelete = filesData.map(file => {
                    const pathParts = file.url.split('/');
                    const fileName = pathParts.pop();
                    const folderName = pathParts.pop();
                    return `${folderName}/${fileName}`;
                });
                await supabase.storage.from('proyectos_imagenes').remove(pathsToDelete);
            }

            // Eliminar los registros de la tabla 'archivos'
            await supabase.from('archivos').delete().eq('id_proyecto', projectId);
            
            // Finalmente, eliminar el proyecto de la tabla 'proyectos'
            await supabase.from('proyectos').delete().eq('id_proyectos', projectId);
            
            showMessage('Proyecto eliminado exitosamente!', false);
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);

        } catch (error) {
            console.error('Error al eliminar el proyecto:', error);
            showMessage(`Error al eliminar: ${error.message}`, true);
        }
    });
});