// frontend/src/assets/js/clientRequests.js

let allRequests = [];
let currentFilter = 'all';

// Cargar todas las solicitudes del cliente
async function loadClientRequests() {
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
        console.log('📋 Solicitudes del cliente:', data);

        allRequests = data.services;

        // Actualizar contadores
        updateCounters();

        // Mostrar solicitudes
        displayRequests(currentFilter);

        // Actualizar nombre del usuario
        updateUserName();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar solicitudes', 'error');
    }
}

// Actualizar contadores
function updateCounters() {
    const counts = {
        all: allRequests.length,
        pending: allRequests.filter(r => r.status === 'pending').length,
        accepted: allRequests.filter(r => r.status === 'accepted').length,
        in_progress: allRequests.filter(r => r.status === 'in_progress').length,
        completed: allRequests.filter(r => r.status === 'completed').length
    };

    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
    });
}

// Filtrar solicitudes
function filterRequests(filter) {
    currentFilter = filter;

    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');

    // Mostrar solicitudes filtradas
    displayRequests(filter);
}

// Mostrar solicitudes
function displayRequests(filter) {
    const container = document.getElementById('requestsContainer');
    if (!container) return;

    let filteredRequests = allRequests;

    if (filter !== 'all') {
        filteredRequests = allRequests.filter(r => r.status === filter);
    }

    if (filteredRequests.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="font-size: 1.125rem; color: #6b7280;">
                    📭 No hay solicitudes ${filter === 'all' ? '' : getStatusText(filter)}
                </p>
                ${filter === 'all' ? `
                    <button class="btn btn-primary" onclick="window.location.href='dashboard-client.html'" style="margin-top: 1rem;">
                        ➕ Crear primera solicitud
                    </button>
                ` : ''}
            </div>
        `;
        return;
    }

    container.innerHTML = filteredRequests.map(request => createRequestCard(request)).join('');
}

// Crear tarjeta de solicitud
function createRequestCard(request) {
    const statusInfo = getStatusInfo(request.status);
    const canCancel = request.status === 'pending';

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0">${request.title}</h5>
                        <span class="status-badge ${statusInfo.class}">
                            ${statusInfo.text}
                        </span>
                    </div>
                    
                    <p class="card-text text-muted small">${request.description}</p>
                    
                    <hr>
                    
                    <div class="small">
                        <p class="mb-2"><strong>Trabajador:</strong> ${request.worker?.full_name || 'No asignado'}</p>
                        <p class="mb-2"><strong>Oficio:</strong> ${request.worker?.trade || 'N/A'}</p>
                        <p class="mb-2"><strong>Dirección:</strong> ${request.service_address || 'No especificada'}</p>
                        <p class="mb-0"><strong>Fecha:</strong> ${formatDate(request.createdAt)}</p>
                    </div>
                </div>
                
                ${canCancel || request.status === 'completed' || request.status === 'in_progress' ? `
                    <div class="card-footer bg-white border-top">
                        <div class="d-grid gap-2">
                            ${canCancel ? `
                                <button class="btn btn-sm btn-outline-danger" onclick="cancelRequest(${request.id})">
                                    ✕ Cancelar solicitud
                                </button>
                            ` : ''}
                            ${request.status === 'in_progress' ? `
                                <button class="btn btn-sm btn-primary" onclick="viewVerificationCode(${request.id})">
                                    🔑 Ver Código de Verificación
                                </button>
                            ` : ''}
                            ${request.status === 'completed' ? (
                request.ratings && request.ratings.length > 0 ? `
                                    <div class="text-center py-2">
                                        <small class="text-muted d-block mb-1">Tu calificación:</small>
                                            <div class="d-flex justify-content-center gap-1">
                                                ${generateStars(request.ratings[0].rating)}
                                            </div>
                                        ${request.ratings[0].comment ? `
                                            <small class="text-muted fst-italic mt-2 d-block">"${request.ratings[0].comment}"</small>
                                        ` : ''}
                                    </div>
                                ` : `
                                    <button class="btn btn-sm btn-primary" onclick="openRatingModal(${request.id}, ${request.worker_id}, '${request.worker?.full_name?.replace(/'/g, "\\'")}', 'worker')">
                                        ⭐ Calificar trabajador
                                    </button>
                                      `
            ) : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Cancelar solicitud
async function cancelRequest(requestId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta solicitud?')) return;

    try {
        const token = localStorage.getItem('authToken');

        // Por ahora, el cliente no puede actualizar el estado directamente
        // Tendríamos que crear un endpoint específico o permitirlo en el middleware

        showNotification('Esta funcionalidad estará disponible próximamente', 'info');

        // TODO: Implementar endpoint para que el cliente pueda cancelar
        // const response = await fetch(`http://localhost:3000/api/services/${requestId}/cancel`, {
        //     method: 'PATCH',
        //     headers: {
        //         'Authorization': `Bearer ${token}`
        //     }
        // });

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cancelar la solicitud', 'error');
    }
}

// Calificar trabajador (placeholder para siguiente fase)
function rateWorker(requestId, workerId) {
    showNotification('Sistema de calificaciones disponible próximamente', 'info');
    // TODO: Implementar en la siguiente fase
}

// Mostrar código directamente
async function viewVerificationCode(requestId) {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/verification/code/${requestId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            showNotification('No hay código disponible todavía', 'info');
            return;
        }

        const data = await response.json();

        // Mostrar modal con el código
        const codeModalHTML = `
            <div class="modal fade" id="showCodeModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">✅ Código de Verificación</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center p-5">
                            <p class="mb-4">Dale este código al trabajador:</p>
                            <div class="display-1 fw-bold text-primary mb-4" style="letter-spacing: 1rem;">
                                ${data.code}
                            </div>
                            <p class="text-muted small">El trabajador debe ingresar este código para cerrar el trabajo</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', codeModalHTML);
        const modal = new bootstrap.Modal(document.getElementById('showCodeModal'));
        modal.show();

        document.getElementById('showCodeModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al obtener código', 'error');
    }
}

// Obtener información de estado
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Pendiente', class: 'status-pending' },
        'accepted': { text: 'Aceptada', class: 'status-accepted' },
        'in_progress': { text: 'En Progreso', class: 'status-in-progress' },
        'completed': { text: 'Completada', class: 'status-completed' },
        'cancelled': { text: 'Cancelada', class: 'status-cancelled' }
    };
    return statusMap[status] || { text: status, class: '' };
}

// Obtener texto de estado para filtros
function getStatusText(status) {
    const texts = {
        'pending': 'pendientes',
        'accepted': 'aceptadas',
        'in_progress': 'en progreso',
        'completed': 'completadas'
    };
    return texts[status] || '';
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

// Actualizar nombre de usuario
function updateUserName() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userNameEl = document.getElementById('userName');
    if (userNameEl && user.full_name) {
        userNameEl.textContent = `Hola, ${user.full_name}`;
    }
}

// Mostrar notificación
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

// Generar estrellas para mostrar calificación
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            // Estrella llena (amarilla)
            stars += '<i class="bi bi-star-fill" style="color: #ffc107; font-size: 1.2rem;"></i>';
        } else {
            // Estrella vacía (gris)
            stars += '<i class="bi bi-star" style="color: #ddd; font-size: 1.2rem;"></i>';
        }
    }
    return stars;
}

// Hacer funciones globales
window.filterRequests = filterRequests;
window.cancelRequest = cancelRequest;
window.rateWorker = rateWorker;
window.viewVerificationCode = viewVerificationCode;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('client-requests')) {
        loadClientRequests();
    }
});