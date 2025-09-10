// js/acount/edit-profile.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateProfile } from './../valid/edit-profile-valid.js';

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
    const nombreUserInput = document.getElementById('nombre-user');
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
            profileMessage.className = `profile-message ${type}`;
            profileMessage.style.display = 'block';
            setTimeout(() => {
                profileMessage.style.display = 'none';
            }, 5000);
        }
    };

    const loadProfileData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showMessage('Debes iniciar sesión para editar tu perfil.', 'error');
                window.location.href = 'signin.html';
                return;
            }

            // Cargar datos de la tabla 'usuarios'
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('nombre, nom_usuario, tipo_usuario')
                .eq('id', user.id)
                .maybeSingle();

            if (userError) throw userError;

            // Cargar datos de la tabla 'datos_perfil'
            const { data: perfilData, error: perfilError } = await supabase
                .from('datos_perfil')
                .select('*')
                .eq('id', user.id)
                .maybeSingle();

            if (perfilError && perfilError.code !== 'PGRST116') throw perfilError;

            // Rellenar los campos del formulario
            if (userData) {
                if (nombrePerfilInput) nombrePerfilInput.value = userData.nombre || '';
                if (nombreUserInput) nombreUserInput.value = userData.nom_usuario || '';
                if (userTypeInput) userTypeInput.value = userData.tipo_usuario || '';
            }
            if (perfilData) {
                if (biografiaPerfilInput) biografiaPerfilInput.value = perfilData.biografia || '';
                if (redSocialInput) redSocialInput.value = perfilData.red_social || '';
                if (telefonoInput) telefonoInput.value = perfilData.telefono || '';
                if (direccionInput) direccionInput.value = perfilData.direccion || '';
                if (experienciaInput) experienciaInput.value = perfilData.experiencia || '';
                if (privacidadPerfilInput) privacidadPerfilInput.value = perfilData.privacidad ? 'true' : 'false';
                
                // Cargar la foto de perfil actual si existe
                if (perfilData.foto_perfil && fotoPerfilPreview) {
                    fotoPerfilPreview.src = perfilData.foto_perfil;
                    fotoPerfilPreview.style.display = 'block';
                }
            }
        } catch (error) {
            console.error('Error al cargar datos del perfil:', error);
            showMessage('Ocurrió un error al cargar tu perfil.', 'error');
        }
    };

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

    if (editProfileForm) {
        editProfileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = nombreUserInput.value;
            const fullName = nombrePerfilInput.value;
            const biography = biografiaPerfilInput.value;
            const socialUrl = redSocialInput.value;
            const phone = telefonoInput.value;
            const address = direccionInput.value;
            const experience = experienciaInput.value;
            const fotoPerfilFile = fotoPerfilInput.files[0];
            
            // VALIDACIÓN DE CAMPOS con la nueva función
            const validationError = validateProfile(username, fullName, biography, socialUrl, phone, address, experience, fotoPerfilFile);
            if (validationError) {
                showMessage(validationError, 'error');
                return;
            }

            showMessage('Guardando cambios...', 'black');
            
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    showMessage('Error: No estás autenticado.', 'error');
                    return;
                }

                let fotoPerfilUrl = null;

                if (fotoPerfilFile) {
                    const fileExtension = fotoPerfilFile.name.split('.').pop();
                    const filePath = `${user.id}.${fileExtension}`;
                    
                    const { error: uploadError } = await supabase.storage
                        .from('perfiles')
                        .upload(filePath, fotoPerfilFile, { upsert: true });

                    if (uploadError) {
                        throw uploadError;
                    }
                    
                    const { data: publicUrlData } = supabase.storage
                        .from('perfiles')
                        .getPublicUrl(filePath);
                    
                    fotoPerfilUrl = publicUrlData.publicUrl;
                }
                
                const perfilDataToSave = {
                    biografia: biografiaPerfilInput ? biografiaPerfilInput.value.trim() : null,
                    red_social: redSocialInput ? redSocialInput.value.trim() : null,
                    telefono: telefonoInput ? telefonoInput.value.trim() : null,
                    direccion: direccionInput ? direccionInput.value.trim() : null,
                    experiencia: experienciaInput ? experienciaInput.value.trim() : null,
                    privacidad: privacidadPerfilInput ? privacidadPerfilInput.value === 'true' : false
                };
                
                if (fotoPerfilUrl) {
                    perfilDataToSave.foto_perfil = fotoPerfilUrl;
                }

                // Lógica de upsert (actualizar o insertar) con un enfoque más directo
                const { data: existingProfile, error: selectError } = await supabase
                    .from('datos_perfil')
                    .select('id')
                    .eq('id', user.id);

                if (selectError) throw selectError;

                if (existingProfile && existingProfile.length > 0) {
                    // Si el perfil ya existe, actualizamos
                    const { error: updateError } = await supabase
                        .from('datos_perfil')
                        .update(perfilDataToSave)
                        .eq('id', user.id);
                    if (updateError) throw updateError;
                } else {
                    // Si no existe, insertamos una nueva fila
                    const { error: insertError } = await supabase
                        .from('datos_perfil')
                        .insert([{ ...perfilDataToSave, id: user.id }]);
                    if (insertError) throw insertError;
                }

                // Actualizar el nombre y tipo de usuario en la tabla de usuarios
                const userUpdateData = {
                    nombre: nombrePerfilInput ? nombrePerfilInput.value.trim() : null,
                    nom_usuario: nombreUserInput ? nombreUserInput.value.trim() : null, 
                    tipo_usuario: userTypeInput ? userTypeInput.value.trim() : null
                };

                const { error: userUpdateError } = await supabase
                    .from('usuarios')
                    .update(userUpdateData)
                    .eq('id', user.id);
                
                if (userUpdateError) {
                    throw userUpdateError;
                }

                showMessage('Perfil actualizado exitosamente.', 'success');

            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                showMessage('Ocurrió un error al guardar los cambios. Inténtalo de nuevo.', 'error');
            }
        });
    }

    loadProfileData();
});