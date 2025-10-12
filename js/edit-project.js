
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateEditProjectForm } from './valid/edit-project-valid.js';

const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const editProjectForm = document.getElementById('editProjectForm');
    const deleteProjectBtn = document.getElementById('delete-project-btn');
    const proyectImageInput = document.getElementById('proyect-image');
    const imagePreview = document.getElementById('image-preview');
    const fileNameDisplay = document.getElementById('file-name-display');
    const pageTitle = document.getElementById('page-title');

    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('id');

    if (!projectId) {
        window.location.href = 'profile.html';
        return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        window.location.href = 'signin.html';
        return;
    }

    let currentImagePath = null;
    let is_admin = false;

    const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    if (!userError && userData?.is_admin) {
        is_admin = true;
    }

    const showToast = (message, isError = false) => {
        let background = isError ? 'linear-gradient(to right, #e61d16d8, #5d0300d8)' : 'linear-gradient(to right, #ffee00d8, #3e3a00d8)';
        Toastify({
            text: message,
            duration: 4000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: background
        }).showToast();
    };

    const showValidationErrors = (errors) => {
        const existingErrors = document.querySelectorAll('.validation-error');
        existingErrors.forEach(el => el.remove());

        for (const key in errors) {
            const inputId = key === 'startDate' ? 'edit-project-start-date' :
                key === 'endDate' ? 'edit-project-end-date' :
                    `edit-project-${key}`;
            const inputElement = document.getElementById(inputId);

            if (inputElement) {
                const errorElement = document.createElement('p');
                errorElement.classList.add('validation-error');
                errorElement.textContent = `Error: ${errors[key]}`;
                errorElement.style.color = 'red';
                errorElement.style.marginTop = '5px';
                errorElement.style.fontSize = '0.9em';
                inputElement.parentNode.insertBefore(errorElement, inputElement.nextSibling);
            }
        }
    };

    async function loadProjectData() {
        try {
            // Primera consulta para obtener el proyecto
            let query = supabase
                .from('proyectos')
                .select(`*, archivos(url)`)
                .eq('id_proyectos', projectId)
                .single();

            if (!is_admin) {
                query = query.eq('id', user.id);
            }

            const { data: projectData, error: projectError } = await query;

            if (projectError || !projectData) {
                showToast('Proyecto no encontrado o no tienes permiso para editarlo.', true);
                editProjectForm.style.display = 'none';
                deleteProjectBtn.style.display = 'none';
                return;
            }

            // Segunda consulta para obtener el nombre del usuario si es un admin
            if (is_admin) {
                const { data: projectOwner, error: ownerError } = await supabase
                    .from('usuarios')
                    .select('nombre')
                    .eq('id', projectData.id)
                    .single();
                
                if (!ownerError && projectOwner?.nombre) {
                    pageTitle.textContent = `Editar Proyecto de ${projectOwner.nombre}`;
                } else {
                    pageTitle.textContent = 'Editar Proyecto (Admin)';
                }
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

            if (projectData.archivos && projectData.archivos.length > 0) {
                const imageUrl = projectData.archivos[0].url;
                imagePreview.src = imageUrl;
                imagePreview.style.display = 'block';
                const pathParts = imageUrl.split('/');
                const fileName = pathParts.pop();
                const folderName = pathParts.pop();
                currentImagePath = `${folderName}/${fileName}`;
            }

        } catch (error) {
            console.error('Error al cargar los datos del proyecto:', error);
            showToast(`Error al cargar el proyecto: ${error.message}`, true);
        }
    }

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
            imagePreview.src = '#';
            imagePreview.style.display = 'none';
        }
    });

    editProjectForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        document.querySelectorAll('.validation-error').forEach(el => el.remove());

        const formData = {
            title: document.getElementById('edit-project-title').value,
            description: document.getElementById('edit-project-description').value,
            imageFile: proyectImageInput.files[0],
            startDate: document.getElementById('edit-project-start-date').value,
            endDate: document.getElementById('edit-project-end-date').value,
            client: document.getElementById('edit-project-client').value,
            links: document.getElementById('edit-project-links').value,
            privacy: document.getElementById('edit-project-privacy').value === 'true',
            category: document.getElementById('proyect-category').value
        };

        const validationError = validateEditProjectForm(formData);

        if (validationError) {
            for (const key in validationError) {
                showToast(validationError[key], true);
            }
            return;
        }

        try {
            let newImageUrl = null;
            if (formData.imageFile) {
                if (currentImagePath) {
                    await supabase.storage.from('proyectos_imagenes').remove([currentImagePath]);
                }
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('proyectos_imagenes')
                    .upload(`${projectId}/${formData.imageFile.name}`, formData.imageFile);

                if (uploadError) throw uploadError;

                const { data: urlData } = supabase.storage
                    .from('proyectos_imagenes')
                    .getPublicUrl(uploadData.path);
                newImageUrl = urlData.publicUrl;

                await supabase.from('archivos')
                    .update({ url: newImageUrl })
                    .eq('id_proyecto', projectId);
            }

            const updateData = {
                titulo: formData.title,
                descripcion: formData.description,
                categoria: formData.category,
                fecha_inicio: formData.startDate || null,
                fecha_finalizacion: formData.endDate || null,
                para_quien_se_hizo: formData.client || null,
                enlaces_referencia: formData.links || null,
                privacidad: formData.privacy
            };

            let updateQuery = supabase
                .from('proyectos')
                .update(updateData)
                .eq('id_proyectos', projectId);

            if (!is_admin) {
                updateQuery = updateQuery.eq('id', user.id);
            }

            const { error: updateError } = await updateQuery;

            if (updateError) {
                throw updateError;
            }

            showToast('Proyecto actualizado exitosamente!', false);
            showToast('Redirigiendo...', false);
            setTimeout(() => {
                window.history.back();
            }, 3000);

        } catch (error) {
            console.error('Error al actualizar el proyecto:', error);
            showToast(`Error al actualizar: ${error.message}`, true);
        }
    });

    if (deleteProjectBtn) {
        deleteProjectBtn.addEventListener('click', async () => {
            if (!confirm('¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer.')) {
                return;
            }
            try {
                const { data: filesData, error: filesError } = await supabase
                    .from('archivos')
                    .select('url')
                    .eq('id_proyecto', projectId);

                if (filesError) throw filesError;

                if (filesData.length > 0) {
                    const pathsToDelete = filesData.map(file => {
                        const pathParts = file.url.split('/');
                        const fileName = pathParts.pop();
                        const folderName = pathParts.pop();
                        return `${folderName}/${fileName}`;
                    });
                    await supabase.storage.from('proyectos_imagenes').remove(pathsToDelete);
                }

                await supabase.from('archivos').delete().eq('id_proyecto', projectId);
                await supabase.from('proyectos').delete().eq('id_proyectos', projectId);

                showToast('Proyecto eliminado exitosamente!', false);
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);

            } catch (error) {
                console.error('Error al eliminar el proyecto:', error);
                showToast(`Error al eliminar: ${error.message}`, true);
            }
        });
    }

    loadProjectData();
});