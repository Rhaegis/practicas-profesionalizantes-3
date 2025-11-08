// ===== CONFIGURACIÓN =====
const API_BASE_URL = 'http://localhost:3000/api';

// ===== SERVICIOS DE API =====
const AuthService = {
    // Login de usuario
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await safeJson(response);
            if (!response.ok) throw new Error(data.message || 'Error en el login');

            // Guardar token en localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    // Registro de usuario
    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            const data = await safeJson(response);
            if (!response.ok) throw new Error(data.message || 'Error en el registro');

            // Guardar token en localStorage
            if (data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            return data;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    },

    // Verificar si el usuario está autenticado
    isAuthenticated() {
        return !!localStorage.getItem('authToken');
    },

    // Obtener datos del usuario
    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    // Obtener token
    getToken() {
        return localStorage.getItem('authToken');
    },

    // Headers con token para peticiones seguras
    getAuthHeaders() {
        const token = this.getToken();
        return {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
        };
    }
};

// ===== MANEJO DE FORMULARIOS =====
document.addEventListener('DOMContentLoaded', function () {
    initLoginForm();
    initRegisterForm();
    initRoleToggle();
});

// Inicializar formulario de login
function initLoginForm() {
    const loginForm = document.querySelector('.login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = document.getElementById('email-address').value;
            const password = document.getElementById('password').value;
            if (validateLoginForm(email, password)) {
                await handleLogin(email, password);
            }
        });
    }
}

// Inicializar formulario de registro
function initRegisterForm() {
    const registerForm = document.getElementById('registration-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const formData = getRegisterFormData();
            if (validateRegisterForm(formData)) {
                await handleRegister(formData);
            }
        });
    }
}

// Toggle de campos para trabajadores
function initRoleToggle() {
    const roleSelect = document.getElementById('role');
    const workerFields = document.getElementById('worker-fields');
    if (roleSelect && workerFields) {
        roleSelect.addEventListener('change', function () {
            if (this.value === 'trabajador') {
                workerFields.classList.remove('hidden');
                // Solo trade y work-area son obligatorios (registration-number es opcional)
                document.getElementById('trade').required = true;
                document.getElementById('work-area').required = true;
                document.getElementById('registration-number').required = false; // OPCIONAL
            } else {
                workerFields.classList.add('hidden');
                // Quitar required de todos los campos
                document.getElementById('trade').required = false;
                document.getElementById('work-area').required = false;
                document.getElementById('registration-number').required = false;
            }
        });
    }
}

// ===== VALIDACIONES =====
function validateLoginForm(email, password) {
    let isValid = true;
    clearErrors();

    if (!email) {
        showError('email-address', 'El correo electrónico es requerido');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email-address', 'Ingresa un correo electrónico válido');
        isValid = false;
    }

    if (!password) {
        showError('password', 'La contraseña es requerida');
        isValid = false;
    } else if (password.length < 6) {
        showError('password', 'La contraseña debe tener al menos 6 caracteres');
        isValid = false;
    }

    return isValid;
}

function validateRegisterForm(formData) {
    let isValid = true;
    clearErrors();

    if (!formData.fullName) { showError('full-name', 'El nombre completo es requerido'); isValid = false; }
    if (!formData.email) { showError('email', 'El correo electrónico es requerido'); isValid = false; }
    else if (!isValidEmail(formData.email)) { showError('email', 'Ingresa un correo electrónico válido'); isValid = false; }
    if (!formData.password) { showError('password', 'La contraseña es requerida'); isValid = false; }
    else if (formData.password.length < 6) { showError('password', 'La contraseña debe tener al menos 6 caracteres'); isValid = false; }
    if (!formData.role) { showError('role', 'Debes seleccionar un rol'); isValid = false; }

    if (formData.role === 'trabajador') {
        if (!formData.trade) { showError('trade', 'El oficio principal es requerido'); isValid = false; }
        if (!formData.workArea) { showError('work-area', 'La zona de trabajo es requerida'); isValid = false; }
    }

    return isValid;
}

// ===== MANEJADORES DE FORMULARIOS =====
async function handleLogin(email, password) {
    const button = document.querySelector('.login-button');
    const originalText = button.textContent;

    try {
        button.textContent = 'Iniciando sesión...';
        button.disabled = true;

        const result = await AuthService.login(email, password);
        showSuccess('¡Inicio de sesión exitoso!');

        setTimeout(() => redirectByRole(result.user), 1000);
    } catch (error) {
        showError('general', error.message);
        button.textContent = originalText;
        button.disabled = false;
    }
}

async function handleRegister(formData) {
    const button = document.querySelector('.register-button');
    const originalText = button.textContent;

    try {
        button.textContent = 'Creando cuenta...';
        button.disabled = true;

        const result = await AuthService.register(formData);
        showSuccess('¡Cuenta creada exitosamente!');

        setTimeout(() => redirectByRole(result.user), 1000);
    } catch (error) {
        showError('general', error.message);
        button.textContent = originalText;
        button.disabled = false;
    }
}

// ===== FUNCIONES UTILITARIAS =====
function redirectByRole(user) {
    if (user.role === 'cliente') {
        window.location.href = 'dashboard-client.html';
    } else if (user.role === 'trabajador') {
        window.location.href = 'dashboard-worker.html';
    } else if (user.role === 'admin') {
        window.location.href = 'dashboard-admin.html';
    }

}

function getRegisterFormData() {
    const role = document.getElementById('role').value;
    const formData = {
        fullName: document.getElementById('full-name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: role
    };
    if (role === 'trabajador') {
        formData.trade = document.getElementById('trade').value;
        formData.registrationNumber = document.getElementById('registration-number').value;
        formData.workArea = document.getElementById('work-area').value;
    }
    return formData;
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(fieldId, message) {
    if (fieldId === 'general') { showNotification(message, 'error'); return; }
    const field = document.getElementById(fieldId);
    const container = field.closest('.input-container');
    let errorElement = container.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        container.appendChild(errorElement);
    }
    field.classList.add('error');
    errorElement.textContent = message;
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(e => e.remove());
    document.querySelectorAll('.form-input.error, .form-select.error').forEach(f => f.classList.remove('error'));
}

function showSuccess(message) { showNotification(message, 'success'); }

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: var(--border-radius);
        color: white;
        font-weight: 500;
        z-index: 1000;
        max-width: 300px;
        box-shadow: var(--shadow-lg);
        animation: slideIn 0.3s ease;
    `;
    if (type === 'success') notification.style.backgroundColor = '#10b981';
    else if (type === 'error') notification.style.backgroundColor = '#ef4444';
    else notification.style.backgroundColor = 'var(--primary)';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Manejo seguro de JSON en fetch
async function safeJson(response) {
    try {
        return await response.json();
    } catch {
        return {};
    }
}

// ===== EXPORTAR PARA USO GLOBAL =====
window.AuthService = AuthService;
