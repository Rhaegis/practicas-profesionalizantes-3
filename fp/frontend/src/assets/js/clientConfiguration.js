// frontend/src/assets/js/clientConfiguration.js
// Configuración del cliente

// Cargar datos del usuario
function loadUserConfiguration() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Actualizar sidebar
    document.getElementById('config-user-name').textContent = user.full_name || 'Usuario';
    document.getElementById('config-user-role').textContent = user.role === 'cliente' ? 'Cliente' : 'Trabajador';

    // Llenar formulario
    document.getElementById('name').value = user.full_name || '';
    document.getElementById('email').value = user.email || '';
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('client-configuration')) {
        loadUserConfiguration();
    }
});