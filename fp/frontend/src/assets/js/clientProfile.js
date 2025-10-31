// frontend/src/assets/js/clientProfile.js
// Perfil del CLIENTE con historial de trabajos

// Cargar datos del perfil y historial
async function loadClientProfile() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Obtener datos del usuario desde localStorage
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        fillProfileData(user);

        // Cargar historial de trabajos
        await loadWorkHistory();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar el perfil', 'error');
    }
}

// Llenar datos del perfil en el formulario
function fillProfileData(user) {
    document.getElementById('full-name').value = user.full_name || '';
    document.getElementById('email').value = user.email || '';

    // Estos datos podrían no existir en el usuario, así que los dejamos vacíos
    // El usuario puede completarlos y guardarlos
}

// Cargar historial de trabajos
async function loadWorkHistory() {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/services/my-requests', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar historial');
        }

        const data = await response.json();
        console.log('📋 Historial de trabajos:', data);

        displayWorkHistory(data.services);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar el historial', 'error');
    }
}

// Mostrar historial en el DOM
function displayWorkHistory(services) {
    const container = document.querySelector('.list-group');

    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="list-group-item text-center py-4">
                <p class="text-muted mb-0">No tienes trabajos en tu historial</p>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="list-group-item list-group-item-action">
            <div class="d-flex align-items-start gap-3">
                <div class="bg-${getStatusColor(service.status)} bg-opacity-10 rounded p-2">
                    <span class="fs-4">${getServiceIcon(service.status)}</span>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${service.title}</h6>
                    <small class="text-muted d-block mb-1">
                        ${service.description}
                    </small>
                    <small class="text-muted">
                        ${getStatusBadge(service.status)} • ${formatDate(service.createdAt)}
                    </small>
                </div>
                <button class="btn btn-sm btn-outline-primary" onclick="viewServiceDetails(${service.id})">
                    Ver detalles
                </button>
            </div>
        </div>
    `).join('');
}

// Obtener ícono según estado
function getServiceIcon(status) {
    const icons = {
        'pending': '⏳',
        'accepted': '✓',
        'in_progress': '🔧',
        'completed': '✅',
        'cancelled': '✕'
    };
    return icons[status] || '📋';
}

// Obtener color según estado
function getStatusColor(status) {
    const colors = {
        'pending': 'warning',
        'accepted': 'info',
        'in_progress': 'primary',
        'completed': 'success',
        'cancelled': 'danger'
    };
    return colors[status] || 'secondary';
}

// Obtener badge de estado
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="badge bg-warning text-dark">Pendiente</span>',
        'accepted': '<span class="badge bg-info">Aceptado</span>',
        'in_progress': '<span class="badge bg-primary">En Progreso</span>',
        'completed': '<span class="badge bg-success">Completado</span>',
        'cancelled': '<span class="badge bg-danger">Cancelado</span>'
    };
    return badges[status] || `<span class="badge bg-secondary">${status}</span>`;
}

// Ver detalles de un servicio
function viewServiceDetails(serviceId) {
    // Redirigir a la página de solicitudes con el ID
    window.location.href = `client-requests.html?id=${serviceId}`;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Guardar cambios del perfil
async function saveProfileChanges(e) {
    e.preventDefault();

    const fullName = document.getElementById('full-name').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();

    // Validaciones básicas
    if (!fullName || !email) {
        showNotification('Por favor completa los campos requeridos', 'error');
        return;
    }

    // TODO: Implementar endpoint de actualización de perfil en el backend
    // Por ahora solo mostramos un mensaje
    console.log('Datos a guardar:', { fullName, email, phone, address });

    showNotification('✅ Perfil actualizado correctamente', 'success');

    // Actualizar localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    user.full_name = fullName;
    user.email = email;
    localStorage.setItem('user', JSON.stringify(user));
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Hacer función global
window.viewServiceDetails = viewServiceDetails;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('client-profile')) {
        loadClientProfile();

        // Event listener para el formulario
        const form = document.querySelector('form');
        if (form) {
            form.addEventListener('submit', saveProfileChanges);
        }
    }
});