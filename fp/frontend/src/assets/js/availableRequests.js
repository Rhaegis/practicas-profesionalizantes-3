// frontend/src/assets/js/availableRequests.js
// Solicitudes disponibles para TRABAJADORES

// Cargar todas las solicitudes disponibles
async function loadAvailableRequests() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/services/my-jobs', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar solicitudes');
        }

        const data = await response.json();
        console.log('📋 Solicitudes disponibles:', data);

        // Filtrar solo las pendientes
        const pendingServices = data.services.filter(s => s.status === 'pending');
        displayAvailableRequests(pendingServices);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar solicitudes', 'error');
    }
}

// Mostrar solicitudes en el DOM
function displayAvailableRequests(services) {
    const container = document.getElementById('requestsContainer');

    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="fs-1 mb-3">📭</div>
                    <h5 class="mb-2">No hay solicitudes disponibles</h5>
                    <p class="text-muted">Las nuevas solicitudes aparecerán aquí</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = services.map(service => `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title text-primary mb-0">${service.title}</h5>
                        <small class="text-muted">${getTimeAgo(service.createdAt)}</small>
                    </div>
                    <p class="card-text">${service.description}</p>
                    
                    <div class="mb-3">
                        <div class="d-flex align-items-center gap-2 mb-2 text-muted small">
                            <span>📍</span>
                            <span>${service.service_address || 'Ubicación no especificada'}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 text-muted small">
                            <span>📅</span>
                            <span>${service.scheduled_date ? formatDate(service.scheduled_date) : 'Fecha flexible'}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-top">
                    <button class="btn btn-primary w-100" onclick="acceptRequest(${service.id})">
                        Ver Detalles y Aceptar
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Aceptar solicitud
async function acceptRequest(serviceId) {
    if (!confirm('¿Deseas aceptar esta solicitud?')) return;

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/services/${serviceId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });

        if (!response.ok) throw new Error('Error al aceptar');

        showNotification('✅ Solicitud aceptada correctamente', 'success');
        setTimeout(() => location.reload(), 1500);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al aceptar la solicitud', 'error');
    }
}

// Calcular tiempo transcurrido
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `hace ${diffDays}d`;
    if (diffHours > 0) return `hace ${diffHours}h`;
    return 'hace unos minutos';
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
window.acceptRequest = acceptRequest;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('available-worker-requests')) {
        loadAvailableRequests();
    }
});