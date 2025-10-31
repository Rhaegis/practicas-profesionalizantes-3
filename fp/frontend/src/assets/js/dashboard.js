// ===== VERIFICAR SI ES PÁGINA PÚBLICA =====
function isPublicPage() {
    const publicPages = ['login.html', 'register.html', 'index.html', ''];
    const currentPage = window.location.pathname.split('/').pop();
    return publicPages.includes(currentPage);
}

// ===== DASHBOARD PRINCIPAL =====
function initDashboard() {
    // Verificar autenticación
    if (!AuthService.isAuthenticated() && !isPublicPage()) {
        window.location.href = 'login.html';
        return;
    }

    const user = AuthService.getCurrentUser();
    if (user) updateUserInfo(user);

    // Inicializar secciones
    initNavigation();
    initRequestButtons();
    initClientProfile();
    initSettings();
    initPostJob();
    initTechSupport();
    initWorkerDashboard();
    initWorkerAgenda();
}

// ===== DASHBOARD TRABAJADOR =====
function initWorkerDashboard() {
    const completeJobButtons = document.querySelectorAll('.complete-job-button');
    completeJobButtons.forEach(button => {
        button.addEventListener('click', function () {
            const jobId = this.getAttribute('data-job-id');
            if (confirm('¿Estás seguro de que deseas marcar este trabajo como completado?')) {
                completeJob(jobId);
            }
        });
    });
}

// ===== CLIENTE: PERFIL =====
function initClientProfile() {
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;

    profileForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateProfileForm()) {
            saveProfile();
        }
    });
}

function validateProfileForm() {
    let isValid = true;
    clearFormErrors();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!fullName) { showFormError('full-name', 'El nombre completo es requerido'); isValid = false; }
    if (!email) { showFormError('email', 'El correo electrónico es requerido'); isValid = false; }
    else if (!isValidEmail(email)) { showFormError('email', 'Ingresa un correo electrónico válido'); isValid = false; }
    if (!phone) { showFormError('phone', 'El teléfono es requerido'); isValid = false; }
    if (!address) { showFormError('address', 'La dirección es requerida'); isValid = false; }

    return isValid;
}

function saveProfile() {
    const formData = {
        fullName: document.getElementById('full-name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim()
    };

    console.log('Datos de perfil guardados:', formData);
    showNotification('Perfil actualizado correctamente', 'success');
}

// ===== AJUSTES =====
function initSettings() {
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return;

    settingsForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateSettingsForm()) {
            saveSettings();
        }
    });
}

function validateSettingsForm() {
    let isValid = true;
    clearFormErrors();

    const email = document.getElementById('settings-email').value.trim();
    const password = document.getElementById('settings-password').value.trim();
    const confirmPassword = document.getElementById('settings-confirm-password').value.trim();

    if (!email) { showFormError('settings-email', 'El correo electrónico es requerido'); isValid = false; }
    else if (!isValidEmail(email)) { showFormError('settings-email', 'Correo inválido'); isValid = false; }
    if (password && password.length < 6) { showFormError('settings-password', 'La contraseña debe tener al menos 6 caracteres'); isValid = false; }
    if (password !== confirmPassword) { showFormError('settings-confirm-password', 'Las contraseñas no coinciden'); isValid = false; }

    return isValid;
}

function saveSettings() {
    const settingsData = {
        email: document.getElementById('settings-email').value.trim(),
        password: document.getElementById('settings-password').value.trim()
    };
    console.log('Datos de configuración guardados:', settingsData);
    showNotification('Configuración actualizada correctamente', 'success');
}

// ===== PUBLICAR TRABAJO =====
function initPostJob() {
    const jobForm = document.getElementById('job-form');
    if (!jobForm) return;

    jobForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateJobForm()) {
            submitJob();
        }
    });
}

function validateJobForm() {
    let isValid = true;
    clearFormErrors();

    const jobTitle = document.getElementById('job-title').value.trim();
    const jobDescription = document.getElementById('job-description').value.trim();
    const jobLocation = document.getElementById('job-location').value.trim();

    if (!jobTitle) { showFormError('job-title', 'El título es requerido'); isValid = false; }
    if (!jobDescription) { showFormError('job-description', 'La descripción es requerida'); isValid = false; }
    if (!jobLocation) { showFormError('job-location', 'La ubicación es requerida'); isValid = false; }

    return isValid;
}

function submitJob() {
    const jobData = {
        title: document.getElementById('job-title').value.trim(),
        description: document.getElementById('job-description').value.trim(),
        location: document.getElementById('job-location').value.trim()
    };
    console.log('Trabajo publicado:', jobData);
    showNotification('Trabajo publicado correctamente', 'success');
    document.getElementById('job-form').reset();
}

// ===== SOPORTE TÉCNICO =====
function initTechSupport() {
    const supportForm = document.getElementById('support-form');
    if (!supportForm) return;

    supportForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (validateSupportForm()) {
            submitSupportRequest();
        }
    });
}

function validateSupportForm() {
    let isValid = true;
    clearFormErrors();

    const subject = document.getElementById('support-subject').value.trim();
    const description = document.getElementById('support-description').value.trim();

    if (!subject) { showFormError('support-subject', 'El asunto es requerido'); isValid = false; }
    if (!description) { showFormError('support-description', 'La descripción es requerida'); isValid = false; }

    return isValid;
}

function submitSupportRequest() {
    const supportData = {
        subject: document.getElementById('support-subject').value.trim(),
        description: document.getElementById('support-description').value.trim()
    };
    console.log('Solicitud de soporte enviada:', supportData);
    showNotification('Solicitud de soporte enviada correctamente', 'success');
    document.getElementById('support-form').reset();
}

// ===== AGENDA TRABAJADOR =====
function initWorkerAgenda() {
    const calendarDays = document.querySelectorAll('.calendar-day');
    calendarDays.forEach(day => {
        day.addEventListener('click', function () {
            showNotification(`Has seleccionado el día ${this.textContent}`, 'info');
        });
    });
}

// ===== NAVEGACIÓN ===== 
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function () {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

function initRequestButtons() {
    const requestButtons = document.querySelectorAll('.new-request-btn');
    requestButtons.forEach(button => {
        button.addEventListener('click', function () {
            showNotification('Próximamente: formulario de solicitud', 'info');
        });
    });
}

function initLogoutButtons() {
    const logoutButtons = document.querySelectorAll('.logout-btn, #logoutBtn');
    logoutButtons.forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                AuthService.logout();
            }
        });
    });
}

function updateUserInfo(user) {
    const userNameElements = document.querySelectorAll('.user-name, .header-info p');
    userNameElements.forEach(element => {
        if (element.textContent.includes('Bienvenido')) {
            element.textContent = `Bienvenido, ${user.full_name || user.fullName}`;
        }
    });
}

function completeJob(jobId) {
    console.log(`Completando trabajo ${jobId}`);
    showNotification('Trabajo marcado como completado', 'success');
}

// ===== UTILIDADES =====
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showFormError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const container = field.closest('.form-group');
    let errorElement = container.querySelector('.error-message');

    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        container.appendChild(errorElement);
    }

    field.classList.add('error');
    errorElement.textContent = message;
}

function clearFormErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    document.querySelectorAll('.form-input.error').forEach(f => f.classList.remove('error'));
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    if (type === 'success') notification.style.backgroundColor = '#10b981';
    else if (type === 'error') notification.style.backgroundColor = '#ef4444';
    else notification.style.backgroundColor = '#3b82f6';

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
    initLogoutButtons();
});