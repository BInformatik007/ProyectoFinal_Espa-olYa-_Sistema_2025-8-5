import { supabase } from './supabaseClient.js';

// ------------------ Cargar datos del perfil ------------------
document.addEventListener("DOMContentLoaded", async () => {
    const userNameElement = document.querySelector('.profile__user-name');
    const userImage = document.querySelector('.profile__profile-img');

    const {
        data: { session },
        error: sessionError
    } = await supabase.auth.getSession();

    if (sessionError || !session || !session.user) {
        console.error('No hay sesión activa o hubo un error al obtenerla');
        return;
    }

    const userId = session.user.id;

    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('first_name, last_name, profile_picture')
        .eq('id', userId)
        .single();

    if (userError || !userData) {
        console.error('Error al obtener datos del usuario:', userError);
        return;
    }

    const fullName = `${userData.first_name} ${userData.last_name}`;
    userNameElement.textContent = fullName;
    userImage.src = userData.profile_picture || "../media/img/avatar_img/default-avatar-img.png";
});

// ------------------ Activar input de imagen ------------------
document.addEventListener("DOMContentLoaded", () => {
    const triggerBtn = document.getElementById('trigger-file-upload');
    const fileInput = document.getElementById('new-profile-pic');

    triggerBtn.addEventListener('click', () => {
        fileInput.click();
    });
});

// ------------------ Subir nueva imagen de perfil ------------------
document.getElementById('save-profile').addEventListener('click', async () => {
    const newImage = document.getElementById('new-profile-pic').files[0];

    if (!newImage) return;

    const {
        data: { user },
        error: sessionError
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
        alert('No se encontró la sesión activa.');
        return;
    }

    const userId = user.id;
    const fileExt = newImage.name.split('.').pop();
    const fileName = `${userId}.${fileExt}`;
    const filePath = fileName;

    const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, newImage, {
            cacheControl: '3600',
            upsert: true
        });

    if (uploadError) {
        alert('Error al subir la imagen: ' + uploadError.message);
        return;
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
        .from('users')
        .update({ profile_picture: publicUrl })
        .eq('id', userId);

    if (updateError) {
        alert('Error al guardar la imagen en el perfil: ' + updateError.message);
        return;
    }

    document.querySelector('.profile__profile-img').src = publicUrl;
    document.getElementById('edit-profile-modal').classList.add('hidden');
});

// ------------------ Pestañas ------------------
document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".profile__tab-button");
    const tabContents = document.querySelectorAll(".profile__tab-content");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabContents.forEach(tab => tab.classList.remove("active"));

            button.classList.add("active");
            document.getElementById(button.getAttribute("data-tab")).classList.add("active");
        });
    });
});

// ------------------ Barras de Progreso ------------------
document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        const numericValue = parseInt(width, 10) || 0;

        if (progressTexts[index]) {
            progressTexts[index].textContent = `${numericValue}% completado`;
        }
    });
});

// ------------------ Línea de Tiempo ------------------
document.addEventListener("DOMContentLoaded", () => {
    const progressBars = document.querySelectorAll('.profile__main-progress-bar');
    const progressCircles = document.querySelectorAll('.profile__progress-circle');
    const lineFills = document.querySelectorAll('.profile__progress-line-fill');
    const progressTexts = document.querySelectorAll('.profile__main-progress-text');

    progressBars.forEach((bar, index) => {
        const width = bar.style.width;
        const numericValue = parseInt(width, 10) || 0;

        if (progressTexts[index]) {
            progressTexts[index].textContent = `${numericValue}% completado`;
        }

        if (index === 0 && progressCircles[0]) {
            progressCircles[0].classList.add('active');
        }

        if (lineFills[index]) {
            lineFills[index].style.height = `${numericValue}%`;
        }

        if (numericValue === 100 && progressCircles[index + 1]) {
            progressCircles[index + 1].classList.add('active');
        }
    });
});

// ------------------ Layouts ------------------
document.getElementById('profile__edit-profile').addEventListener('click', () => {
    document.getElementById('edit-profile-modal').classList.remove('hidden');
});

document.getElementById('close-edit-profile').addEventListener('click', () => {
    document.getElementById('edit-profile-modal').classList.add('hidden');
});

document.getElementById('profile__config-btn').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.remove('hidden');
});

document.getElementById('close-settings').addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('hidden');
});
