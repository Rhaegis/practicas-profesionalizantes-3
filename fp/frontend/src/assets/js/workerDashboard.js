// Dashboard principal del TRABAJADOR

// Cargar solicitudes pendientes
async function loadPendingRequests() {
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
        console.log('📋 Solicitudes recibidas:', data);

        displayPendingRequests(data.services);
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar solicitudes', 'error');
    }
}

// Mostrar solicitudes en el DOM - VERSIÓN BOOTSTRAP 5
function displayPendingRequests(services) {
    const container = document.querySelector('.jobs-grid');

    if (!container) return;

    // Filtrar solo solicitudes pendientes
    const pendingServices = services.filter(s => s.status === 'pending');

    if (pendingServices.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="fs-1 mb-3">📭</div>
                    <h5 class="mb-2">No hay solicitudes pendientes</h5>
                    <p class="text-muted">Las nuevas solicitudes aparecerán aquí</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = pendingServices.map(service => `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0">${service.title}</h5>
                        <span class="badge bg-warning text-dark">Pendiente</span>
                    </div>
                    
                    <p class="card-text text-muted">${service.description}</p>
                    
                    <hr>
                    
                    <div class="small">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span>👤</span>
                            <span><strong>Cliente:</strong> ${service.client?.full_name || 'N/A'}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <span>📍</span>
                            <span><strong>Dirección:</strong> ${service.service_address || 'No especificada'}</span>
                        </div>
                        <div class="d-flex align-items-center gap-2">
                            <span>📅</span>
                            <span><strong>Fecha:</strong> ${formatDate(service.createdAt)}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white border-top">
                    <div class="d-grid gap-2">
                        <button class="btn btn-success" onclick="acceptService(${service.id})">
                            ✓ Aceptar
                        </button>
                        <button class="btn btn-outline-danger" onclick="rejectService(${service.id})">
                            ✕ Rechazar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Aceptar solicitud
async function acceptService(serviceId) {
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

        if (!response.ok) {
            throw new Error('Error al aceptar la solicitud');
        }

        showNotification('✅ Solicitud aceptada correctamente', 'success');

        // Recargar solicitudes
        setTimeout(() => loadPendingRequests(), 1000);
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al aceptar la solicitud', 'error');
    }
}

// Rechazar solicitud
async function rejectService(serviceId) {
    if (!confirm('¿Deseas rechazar esta solicitud? Esta acción no se puede deshacer.')) return;

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/services/${serviceId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!response.ok) {
            throw new Error('Error al rechazar la solicitud');
        }

        showNotification('Solicitud rechazada', 'info');

        // Recargar solicitudes
        setTimeout(() => loadPendingRequests(), 1000);
    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al rechazar la solicitud', 'error');
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('es-AR', options);
}

// Mostrar notificación
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Hacer funciones globales
window.acceptService = acceptService;
window.rejectService = rejectService;

// Inicializar cuando carga la página
document.addEventListener('DOMContentLoaded', () => {
    // Verificar que estamos en el dashboard del trabajador
    if (window.location.pathname.includes('dashboard-worker')) {
        loadPendingRequests();
    }
});