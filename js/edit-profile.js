// js/edit-profile.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Asegúrate de que estas credenciales sean las correctas de tu proyecto
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const editProfileForm = document.getElementById('editProfileForm');
    const profileMessage = document.getElementById('profile-message');
    const fotoPerfilPreview = document.getElementById('foto-perfil-preview');

    const fotoPerfilInput = document.getElementById('foto-perfil-input');
    const nombrePerfilInput = document.getElementById('nombre-perfil');
    const biografiaPerfilInput = document.getElementById('biografia-perfil');
    const redSocialInput = document.getElementById('red-social-perfil');
    const telefonoInput = document.getElementById('telefono-perfil');
    const direccionInput = document.getElementById('direccion-perfil');
    const experienciaInput = document.getElementById('experiencia-perfil');
    const userTypeInput = document.getElementById('user-type');
    const privacidadPerfilInput = document.getElementById('privacidad-perfil');

    const showMessage = (message, type = 'success') => {
        if (profileMessage) {
            profileMessage.textContent = message;
            profileMessage.className = `profile-message-${type}`;
            profileMessage.style.display = 'block';
            setTimeout(() => {
                profileMessage.style.display = 'none';
            }, 5000);
        }
    };

    // 1. Cargar los datos del perfil actual del usuario
    const loadProfileData = async () => {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            showMessage('Debes iniciar sesión para editar tu perfil.', 'error');
            // Redirige al usuario a la página de inicio de sesión
            window.location.href = 'signin.html'; 
            return;
        }

        // Cargar datos de la tabla 'usuarios'
        const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('nombre, nom_usuario, tipo_usuario')
            .eq('id', user.id)
            .maybeSingle();

        if (userError || !userData) {
            console.error('Error al cargar datos de usuario:', userError);
            showMessage('Error al cargar la información del usuario.', 'error');
            return;
        }

        // Cargar datos de la tabla 'datos_perfil'
        const { data: perfilData, error: perfilError } = await supabase
            .from('datos_perfil')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

        if (perfilError) {
            console.error('Error al cargar datos de perfil:', perfilError);
            showMessage('Error al cargar la información del perfil.', 'error');
            return;
        }

        // Rellenar los campos del formulario con los datos existentes
        nombrePerfilInput.value = userData?.nombre || '';
        biografiaPerfilInput.value = perfilData?.biografia || '';
        redSocialInput.value = perfilData?.red_social || '';
        telefonoInput.value = perfilData?.telefono || '';
        direccionInput.value = perfilData?.direccion || '';
        experienciaInput.value = perfilData?.experiencia || '';
        userTypeInput.value = userData?.tipo_usuario || '';
        
        if (perfilData?.privacidad !== undefined) {
            privacidadPerfilInput.value = perfilData.privacidad.toString();
        }

        const fotoPerfilUrl = perfilData?.foto_perfil;
        if (fotoPerfilUrl && fotoPerfilPreview) {
            fotoPerfilPreview.src = fotoPerfilUrl;
            fotoPerfilPreview.style.display = 'block';
        }
    };

    // Event listener para la selección de la foto de perfil
    if (fotoPerfilInput && fotoPerfilPreview) {
        fotoPerfilInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    fotoPerfilPreview.src = e.target.result;
                    fotoPerfilPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // 2. Manejar el envío del formulario
    editProfileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        showMessage('Guardando cambios...', 'black');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            showMessage('Error: No estás autenticado.', 'error');
            return;
        }

        const fotoPerfilFile = fotoPerfilInput.files[0];
        let fotoPerfilUrl = null;

        try {
            if (fotoPerfilFile) {
                const fileExtension = fotoPerfilFile.name.split('.').pop();
                const filePath = `${user.id}.${fileExtension}`;
                const { error: uploadError } = await supabase.storage
                    .from('perfiles')
                    .upload(filePath, fotoPerfilFile, { upsert: true });

                if (uploadError) throw uploadError;

                const { data: publicUrlData } = supabase.storage.from('perfiles').getPublicUrl(filePath);
                fotoPerfilUrl = publicUrlData.publicUrl;
            }

            const updateData = {
                id: user.id,
                biografia: biografiaPerfilInput.value.trim(),
                red_social: redSocialInput.value.trim(),
                telefono: telefonoInput.value.trim(),
                direccion: direccionInput.value.trim(),
                experiencia: experienciaInput.value.trim(),
                privacidad: privacidadPerfilInput.value === 'true',
            };

            if (fotoPerfilUrl) {
                updateData.foto_perfil = fotoPerfilUrl;
            }

            // Primero intentar actualizar, si no existe, insertar
            const { error: perfilUpdateError } = await supabase
                .from('datos_perfil')
                .update(updateData)
                .eq('id', user.id);

            if (perfilUpdateError) {
                // Si el error indica que no se encontró la fila, intenta insertar
                if (perfilUpdateError.code === 'PGRST102') {
                    const { error: insertError } = await supabase
                        .from('datos_perfil')
                        .insert([updateData]);
                    if (insertError) throw insertError;
                } else {
                    throw perfilUpdateError;
                }
            }

            // Actualizar el nombre y tipo de usuario en la tabla de usuarios
            const { error: userUpdateError } = await supabase
                .from('usuarios')
                .update({ 
                    nombre: nombrePerfilInput.value.trim(),
                    tipo_usuario: userTypeInput.value.trim()
                })
                .eq('id', user.id);
            
            if (userUpdateError) throw userUpdateError;

            showMessage('Perfil actualizado exitosamente.', 'success');
        } catch (error) {
            console.error('Error al actualizar el perfil:', error);
            showMessage('Ocurrió un error al guardar los cambios. Inténtalo de nuevo.', 'error');
        }
    });

    loadProfileData();
});