// Cargar solicitudes disponibles
async function loadAvailableRequests() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Usar endpoint de solicitudes cercanas
        const response = await fetch('http://localhost:3000/api/services/nearby', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        // Si el trabajador no tiene zona configurada
        if (!response.ok && data.needsConfiguration) {
            const container = document.getElementById('availableRequestsContainer');
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-warning" role="alert">
                        <h5 class="alert-heading">
                            <i class="bi bi-geo-alt me-2"></i>
                            Configura tu zona de trabajo
                        </h5>
                        <p>Para ver solicitudes disponibles, primero debes configurar tu área de cobertura.</p>
                        <hr>
                        <a href="worker-work-zone.html" class="btn btn-primary">
                            <i class="bi bi-geo-alt-fill me-2"></i>
                            Configurar Ahora
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        if (!response.ok) {
            throw new Error('Error al cargar solicitudes');
        }

        console.log('📋 Solicitudes cercanas:', data);

        allRequests = data.services;
        displayRequests();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar solicitudes disponibles', 'error');
    }
}

// Mostrar solicitudes
function displayRequests() {
    const container = document.getElementById('availableRequestsContainer');
    if (!container) return;

    if (allRequests.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ddd;"></i>
                    <h5 class="mt-3 text-muted">No hay solicitudes disponibles</h5>
                    <p class="text-muted">Los clientes asignan trabajos específicamente a vos. Cuando recibas una nueva solicitud, aparecerá aquí.</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = allRequests.map(request => createRequestCard(request)).join('');
}

// Crear tarjeta de solicitud
function createRequestCard(request) {
    const timeAgo = getTimeAgo(request.createdAt);

    return `
        <div class="col-md-6 col-lg-4">
            <div class="card h-100 shadow-sm" style="transition: transform 0.2s;">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title mb-0 text-primary">${request.title}</h5>
                        <span class="badge bg-primary">${timeAgo}</span>
                    </div>
                    
                    ${request.distance !== undefined ? `
                        <div class="mb-2">
                            <span class="badge bg-success">
                                <i class="bi bi-geo-alt-fill me-1"></i>
                                A ${request.distance} km
                            </span>
                        </div>
                    ` : ''}
                    
                    <p class="card-text text-muted small mb-3">${request.description}</p>
                    
                    <div class="mb-3">
                        <small class="text-muted d-block mb-1">
                            <i class="bi bi-person me-1"></i>
                            <strong>Cliente:</strong> ${request.client?.full_name || 'No especificado'}
                        </small>
                        <small class="text-muted d-block mb-1">
                            <i class="bi bi-geo-alt me-1"></i>
                            <strong>Dirección:</strong> ${request.service_address || 'No especificada'}
                        </small>
                        ${request.scheduled_date ? `
                            <small class="text-muted d-block">
                                <i class="bi bi-calendar3 me-1"></i>
                                <strong>Fecha:</strong> ${formatDate(request.scheduled_date)}
                            </small>
                        ` : `
                            <small class="text-muted d-block">
                                <i class="bi bi-clock me-1"></i>
                                <strong>Urgencia:</strong> Lo antes posible
                            </small>
                        `}
                    </div>
                </div>
                <div class="card-footer bg-white border-top d-grid gap-2">
                    <button class="btn btn-success" onclick="acceptRequest(${request.id})">
                        <i class="bi bi-check-circle me-2"></i>
                        Aceptar Trabajo
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="rejectRequest(${request.id})">
                        <i class="bi bi-x-circle me-2"></i>
                        Rechazar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Calcular tiempo transcurrido
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `hace ${diffMins}m`;
    if (diffHours < 24) return `hace ${diffHours}h`;
    return `hace ${diffDays}d`;
}

// Aceptar solicitud
async function acceptRequest(requestId) {
    if (!confirm('¿Estás seguro de que quieres aceptar este trabajo?')) return;

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/services/${requestId}/accept`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al aceptar el trabajo');
        }

        showNotification('✅ Trabajo aceptado exitosamente', 'success');

        // Recargar lista después de 1 segundo
        setTimeout(() => {
            loadAvailableRequests();
        }, 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification(error.message || 'Error al aceptar el trabajo', 'error');
    }
}

// Rechazar solicitud (opcional - para futuras mejoras)
async function rejectRequest(requestId) {
    if (!confirm('¿Estás seguro de que quieres rechazar este trabajo?')) return;

    try {
        const token = localStorage.getItem('authToken');

        // Por ahora solo rechazamos cambiando el estado
        const response = await fetch(`http://localhost:3000/api/services/${requestId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'cancelled' })
        });

        if (!response.ok) {
            throw new Error('Error al rechazar');
        }

        showNotification('Trabajo rechazado', 'info');

        setTimeout(() => {
            loadAvailableRequests();
        }, 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al rechazar el trabajo', 'error');
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
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
window.acceptRequest = acceptRequest;
window.rejectRequest = rejectRequest;
window.loadAvailableRequests = loadAvailableRequests;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('available-worker-requests')) {
        loadAvailableRequests();
    }
});