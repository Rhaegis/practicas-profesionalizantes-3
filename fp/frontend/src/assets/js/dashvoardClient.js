// frontend/src/assets/js/dashboardClient.js
// Dashboard principal del CLIENTE

// Cargar solicitudes recientes (últimas 5)
async function loadRecentRequests() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/services/my-requests', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar solicitudes');
        }

        const data = await response.json();
        console.log('📋 Solicitudes recientes:', data);

        // Mostrar solo las últimas 5
        const recentServices = data.services.slice(0, 5);
        displayRecentRequests(recentServices);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar solicitudes recientes', 'error');
    }
}

// Actualizar mensaje de bienvenida
const user = JSON.parse(localStorage.getItem('user') || '{}');
const welcomeEl = document.getElementById('welcomeMessage');
if (welcomeEl && user.full_name) {
    welcomeEl.textContent = `Bienvenido, ${user.full_name}`;
}

// Mostrar solicitudes recientes en el DOM
function displayRecentRequests(services) {
    const container = document.getElementById('recentRequestsContainer');

    if (!container) return;

    if (services.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="fs-1 mb-3">📭</div>
                    <h5 class="mb-2">No tienes solicitudes aún</h5>
                    <p class="text-muted mb-3">Crea tu primera solicitud para comenzar</p>
                    <button class="btn btn-primary new-request-btn">
                        ➕ Nueva solicitud
                    </button>
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
                        <h5 class="card-title mb-0">${service.title}</h5>
                        <span class="status-badge ${getStatusClass(service.status)}">
                            ${getStatusText(service.status)}
                        </span>
                    </div>
                    
                    <p class="card-text text-muted small">${service.description}</p>
                    
                    <hr>
                    
                    <div class="small">
                        <p class="mb-2">
                            <strong>Trabajador:</strong> 
                            ${service.worker?.full_name || 'No asignado'}
                        </p>
                        <p class="mb-2">
                            <strong>Estado:</strong> 
                            ${getStatusText(service.status)}
                        </p>
                        <p class="mb-0">
                            <strong>Fecha:</strong> 
                            ${formatDate(service.createdAt)}
                        </p>
                    </div>
                </div>
                <div class="card-footer bg-white border-top">
                    <a href="client-requests.html" class="btn btn-sm btn-outline-primary w-100">
                        Ver detalles
                    </a>
                </div>
            </div>
        </div>
    `).join('');
}

// Obtener clase de estado
function getStatusClass(status) {
    const statusMap = {
        'pending': 'status-pending',
        'accepted': 'status-accepted',
        'in_progress': 'status-in_progress',
        'completed': 'status-completed',
        'cancelled': 'status-cancelled'
    };
    return statusMap[status] || '';
}

// Obtener texto de estado
function getStatusText(status) {
    const statusMap = {
        'pending': 'Pendiente',
        'accepted': 'Aceptada',
        'in_progress': 'En Progreso',
        'completed': 'Completada',
        'cancelled': 'Cancelada'
    };
    return statusMap[status] || status;
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    };
    return date.toLocaleDateString('es-AR', options);
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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard-client')) {
        loadRecentRequests();

        // Agregar event listener al botón de nueva solicitud
        document.querySelector('.new-request-btn')?.addEventListener('click', () => {
            // El modal ya se maneja con serviceModal.js
            console.log('Botón de nueva solicitud clickeado');
        });
    }
});