// js/acount/edit-profile.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { validateProfile } from './../valid/edit-profile-valid.js';

// Asegúrate de que estas credenciales sean las correctas de tu proyecto
const SUPABASE_URL = 'https://fikdyystxmsmwioyyegt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpa2R5eXN0eG1zbXdpb3l5ZWd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY3NjgxODksImV4cCI6MjA3MjM0NDE4OX0.QAfKSJfUbwT5NhGRiNHoA83JzW7BXT9u15d5oaeAlro';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {
    const editProfileForm = document.getElementById('editProfileForm');
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
    
    // Función para mostrar mensajes de toast
    const showToast = (message, type = 'success') => {

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
            gravity: "top",
            position: "right",
            backgroundColor: background,
            stopOnFocus: true, // Prevents dismissing of toast on hover
        }).showToast();
    };
    
    // Función para verificar si un nombre de usuario ya existe (excluyendo al usuario actual)
    async function checkUsernameExists(username, currentUserId) {
        const { data, error } = await supabase
            .from('usuarios')
            .select('nom_usuario')
            .eq('nom_usuario', username)
            .neq('id', currentUserId) // Excluir el usuario actual
            .maybeSingle();

        if (error && error.code !== 'PGRST116') { // Ignorar el error de "no rows found"
            throw error;
        }

        return data ? true : false;
    }
    
    // Función para verificar si un email ya existe (excluyendo al usuario actual)
    async function checkEmailExists(email, currentUserId) {
        const { data, error } = await supabase.from('usuarios')
            .select('email')
            .eq('email', email)
            .neq('id', currentUserId)
            .maybeSingle();

        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        
        return data ? true : false;
    }

    const loadProfileData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                showToast('Debes iniciar sesión para editar tu perfil.', 'error');
                window.location.href = 'signin.html';
                return;
            }

            // Cargar datos de la tabla 'usuarios'
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('nombre, nom_usuario, tipo_usuario, email')
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
            showToast('Ocurrió un error al cargar tu perfil.', 'error');
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
                showToast(validationError, 'error');
                return;
            }

            showToast('Guardando cambios...', 'black');
            
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) {
                    showToast('Error: No estás autenticado.', 'error');
                    return;
                }
                
                // --- Validaciones de unicidad de username y email ---
                // Obtener el email actual del usuario para la validación
                const { data: userData, error: userError } = await supabase
                    .from('usuarios')
                    .select('email')
                    .eq('id', user.id)
                    .maybeSingle();

                if (userError) throw userError;
                
                const email = userData?.email;

                // Verificar si el username ya existe para otro usuario
                const usernameExists = await checkUsernameExists(username, user.id);
                if (usernameExists) {
                    showToast('El nombre de usuario ya está en uso por otro usuario.', 'error');
                    return;
                }
                
                // Verificar si el email ya existe para otro usuario (si se permitiera editar el email en el formulario)
                // Nota: El formulario actual no permite editar el email, pero se incluye la lógica por si se añade en el futuro.
                if (email) {
                    const emailExists = await checkEmailExists(email, user.id);
                    if (emailExists) {
                         showToast('El correo electrónico ya está en uso por otro usuario.', 'error');
                         return;
                    }
                }
                // --- Fin de validaciones de unicidad ---

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

                showToast('Perfil actualizado exitosamente.', 'success');
                // Redirigir a la página anterior después de 3 segundos
                setTimeout(() => {
                    showToast('Redirigiendo...', 'info');
                    window.history.back();
                }, 3000);

            } catch (error) {
                console.error('Error al actualizar el perfil:', error);
                showToast('Ocurrió un error al guardar los cambios. Inténtalo de nuevo.', 'error');
            }
        });
    }

    loadProfileData();
});