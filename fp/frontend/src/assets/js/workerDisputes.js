// Sistema de gestión de disputas para trabajadores

let allDisputes = [];
let currentFilter = 'all';

// Cargar todas las disputas del trabajador
async function loadDisputes() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        const response = await fetch('http://localhost:3000/api/disputes/my-disputes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar disputas');
        }

        const data = await response.json();
        console.log('📋 Disputas del trabajador:', data);

        allDisputes = data.disputes;

        // Actualizar contadores
        updateCounters();

        // Mostrar disputas
        displayDisputes(currentFilter);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar disputas', 'error');
    }
}

// Actualizar contadores
function updateCounters() {
    const counts = {
        all: allDisputes.length,
        pendiente_respuesta: allDisputes.filter(d =>
            d.reported_by === 'client' && !d.worker_response && d.status === 'abierta'
        ).length,
        en_revision: allDisputes.filter(d => d.status === 'en_revision').length,
        resuelta: allDisputes.filter(d =>
            d.status === 'resuelta_cliente' ||
            d.status === 'resuelta_trabajador' ||
            d.status === 'rechazada'
        ).length
    };

    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
    });
}

// Filtrar disputas
function filterDisputes(filter) {
    currentFilter = filter;

    // Actualizar botones activos
    document.querySelectorAll('[data-filter]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`)?.classList.add('active');

    // Mostrar disputas filtradas
    displayDisputes(filter);
}

// Mostrar disputas
function displayDisputes(filter) {
    const container = document.getElementById('disputesContainer');
    if (!container) return;

    let filteredDisputes = allDisputes;

    if (filter === 'pendiente_respuesta') {
        filteredDisputes = allDisputes.filter(d =>
            d.reported_by === 'client' && !d.worker_response && d.status === 'abierta'
        );
    } else if (filter === 'en_revision') {
        filteredDisputes = allDisputes.filter(d => d.status === 'en_revision');
    } else if (filter === 'resuelta') {
        filteredDisputes = allDisputes.filter(d =>
            d.status === 'resuelta_cliente' ||
            d.status === 'resuelta_trabajador' ||
            d.status === 'rechazada'
        );
    }

    if (filteredDisputes.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 4rem; color: #ddd;"></i>
                    <h5 class="mt-3 text-muted">No hay disputas ${getFilterText(filter)}</h5>
                    <p class="text-muted">Las disputas aparecerán aquí cuando haya problemas reportados</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredDisputes.map(dispute => createDisputeCard(dispute)).join('');
}

// Crear tarjeta de disputa
function createDisputeCard(dispute) {
    const statusInfo = getStatusInfo(dispute.status);
    const iReported = dispute.reported_by === 'worker'; // Yo (trabajador) reporté
    const needsMyResponse = dispute.reported_by === 'client' && !dispute.worker_response && dispute.status === 'abierta';

    return `
        <div class="col-12">
            <div class="card shadow-sm ${needsMyResponse ? 'border-danger border-2' : ''}">
                ${needsMyResponse ? `
                    <div class="card-header bg-danger text-white">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Requiere tu respuesta</strong>
                    </div>
                ` : ''}
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">${dispute.service.title}</h5>
                            <small class="text-muted">
                                <i class="bi bi-calendar3 me-1"></i>
                                Reportada: ${formatDate(dispute.createdAt)}
                            </small>
                        </div>
                        <span class="badge ${statusInfo.class} fs-6">
                            ${statusInfo.icon} ${statusInfo.text}
                        </span>
                    </div>

                    ${iReported ? `
                        <div class="mb-3">
                            <strong class="d-block mb-2">
                                <i class="bi bi-exclamation-circle text-danger me-1"></i>
                                Tu reporte:
                            </strong>
                            <p class="mb-0 text-muted">${dispute.reason}</p>
                        </div>

                        ${dispute.worker_response ? `
                            <div class="alert alert-info mb-3">
                                <strong class="d-block mb-2">
                                    <i class="bi bi-reply me-1"></i>
                                    Respuesta del cliente:
                                </strong>
                                <p class="mb-0">${dispute.worker_response}</p>
                            </div>
                        ` : dispute.status === 'abierta' ? `
                            <div class="alert alert-warning mb-3">
                                <i class="bi bi-clock me-1"></i>
                                Esperando respuesta del cliente...
                            </div>
                        ` : ''}
                    ` : `
                        <div class="mb-3">
                            <strong class="d-block mb-2 text-danger">
                                <i class="bi bi-person me-1"></i>
                                Reporte del cliente (${dispute.reporter.full_name}):
                            </strong>
                            <p class="mb-0 text-muted">${dispute.reason}</p>
                        </div>

                        ${dispute.worker_response ? `
                            <div class="alert alert-info mb-3">
                                <strong class="d-block mb-2">
                                    <i class="bi bi-reply me-1"></i>
                                    Tu respuesta:
                                </strong>
                                <p class="mb-0">${dispute.worker_response}</p>
                            </div>
                        ` : ''}
                    `}

                    ${dispute.admin_notes ? `
                        <div class="alert alert-success mb-3">
                            <strong class="d-block mb-2">
                                <i class="bi bi-shield-check me-1"></i>
                                Resolución del administrador:
                            </strong>
                            <p class="mb-0">${dispute.admin_notes}</p>
                        </div>
                    ` : ''}
                </div>
                <div class="card-footer bg-white d-flex gap-2">
                    ${needsMyResponse ? `
                        <button class="btn btn-danger" onclick="openResponseModal(${dispute.id}, '${dispute.service.title}', '${dispute.reason.replace(/'/g, "\\'")}')">
                            <i class="bi bi-reply-fill me-1"></i>
                            Responder al Cliente
                        </button>
                    ` : ''}
                    <button class="btn btn-outline-primary" onclick="viewDisputeDetails(${dispute.id})">
                        <i class="bi bi-eye me-1"></i>
                        Ver Detalles
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Ver detalles de disputa
async function viewDisputeDetails(disputeId) {
    showNotification('Vista detallada disponible próximamente', 'info');
}

// Ver detalles de disputa
async function viewDisputeDetails(disputeId) {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/disputes/${disputeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar detalles');
        }

        const data = await response.json();
        const dispute = data.dispute;
        const statusInfo = getStatusInfo(dispute.status, 'worker');
        const iReported = dispute.reported_by === 'worker';

        const modalHTML = `
            <div class="modal fade" id="disputeDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
                    <div class="modal-content">
                        <div class="modal-header ${statusInfo.headerClass}">
                            <h5 class="modal-title text-white">
                                ${statusInfo.icon} Detalles de la Disputa
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Estado -->
                            <div class="alert ${statusInfo.alertClass} d-flex align-items-center mb-4">
                                <div class="fs-3 me-3">${statusInfo.icon}</div>
                                <div>
                                    <strong>Estado:</strong> ${statusInfo.text}<br>
                                    <small>Reportada el ${formatDate(dispute.createdAt)}</small>
                                </div>
                            </div>

                            <!-- Servicio -->
                            <div class="card mb-3">
                                <div class="card-header bg-light">
                                    <strong><i class="bi bi-briefcase me-2"></i>Servicio</strong>
                                </div>
                                <div class="card-body">
                                    <h6 class="mb-2">${dispute.service.title}</h6>
                                    <p class="mb-0 text-muted">${dispute.service.description || 'Sin descripción'}</p>
                                </div>
                            </div>

                            <!-- Reporte inicial -->
                            <div class="card mb-3">
                                <div class="card-header ${iReported ? 'bg-warning' : 'bg-danger text-white'}">
                                    <strong>
                                        <i class="bi bi-exclamation-circle me-2"></i>
                                        ${iReported ? 'Tu reporte' : 'Reporte del cliente'}
                                    </strong>
                                </div>
                                <div class="card-body">
                                    <p class="mb-2"><strong>Reportado por:</strong> ${dispute.reporter.full_name}</p>
                                    <p class="mb-0">${dispute.reason}</p>
                                </div>
                            </div>

                            <!-- Respuesta -->
                            ${dispute.worker_response ? `
                                <div class="card mb-3">
                                    <div class="card-header bg-info text-white">
                                        <strong>
                                            <i class="bi bi-reply me-2"></i>
                                            ${iReported ? 'Respuesta del cliente' : 'Tu respuesta'}
                                        </strong>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-0">${dispute.worker_response}</p>
                                    </div>
                                </div>
                            ` : dispute.status === 'abierta' ? `
                                <div class="alert alert-warning">
                                    <i class="bi bi-clock me-2"></i>
                                    ${iReported ? 'Esperando respuesta del cliente...' : 'Debes responder a esta disputa'}
                                </div>
                            ` : ''}

                            <!-- Resolución del admin -->
                            ${dispute.admin_notes ? `
                                <div class="card mb-3">
                                    <div class="card-header bg-success text-white">
                                        <strong>
                                            <i class="bi bi-shield-check me-2"></i>
                                            Resolución del administrador
                                        </strong>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-2"><strong>Resuelto el:</strong> ${dispute.resolved_at ? formatDate(dispute.resolved_at) : 'N/A'}</p>
                                        <p class="mb-0">${dispute.admin_notes}</p>
                                    </div>
                                </div>
                            ` : ''}

                            <!-- Participantes -->
                            <div class="card">
                                <div class="card-header bg-light">
                                    <strong><i class="bi bi-people me-2"></i>Participantes</strong>
                                </div>
                                <div class="card-body">
                                    <p class="mb-2">
                                        <i class="bi bi-person-circle me-2"></i>
                                        <strong>Cliente:</strong> ${dispute.service.client_id === dispute.reporter.id ? dispute.reporter.full_name : dispute.reportedUser.full_name}
                                    </p>
                                    <p class="mb-0">
                                        <i class="bi bi-tools me-2"></i>
                                        <strong>Trabajador:</strong> ${dispute.service.worker_id === dispute.reporter.id ? dispute.reporter.full_name : dispute.reportedUser.full_name}
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        const modal = new bootstrap.Modal(document.getElementById('disputeDetailsModal'));
        modal.show();

        document.getElementById('disputeDetailsModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar detalles de la disputa', 'error');
    }
}

// Obtener información de estado
function getStatusInfo(status, role = 'worker') {
    const statusMap = {
        'abierta': {
            text: 'Abierta',
            class: 'bg-warning text-dark',
            icon: '⏳',
            headerClass: 'bg-warning',
            alertClass: 'alert-warning'
        },
        'en_revision': {
            text: 'En Revisión',
            class: 'bg-info',
            icon: '🔍',
            headerClass: 'bg-info',
            alertClass: 'alert-info'
        },
        'resuelta_cliente': {
            text: 'Resuelta a favor del cliente',
            class: 'bg-danger',
            icon: '❌',
            headerClass: 'bg-danger',
            alertClass: 'alert-danger'
        },
        'resuelta_trabajador': {
            text: 'Resuelta a tu favor',
            class: 'bg-success',
            icon: '✅',
            headerClass: 'bg-success',
            alertClass: 'alert-success'
        },
        'rechazada': {
            text: 'Rechazada',
            class: 'bg-secondary',
            icon: '⚖️',
            headerClass: 'bg-secondary',
            alertClass: 'alert-secondary'
        }
    };
    return statusMap[status] || { text: status, class: 'bg-secondary', icon: '❓', headerClass: 'bg-secondary', alertClass: 'alert-secondary' };
}

// Obtener texto de filtro
function getFilterText(filter) {
    const texts = {
        'all': '',
        'pendiente_respuesta': 'pendientes de respuesta',
        'en_revision': 'en revisión',
        'resuelta': 'resueltas'
    };
    return texts[filter] || '';
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
window.filterDisputes = filterDisputes;
window.viewDisputeDetails = viewDisputeDetails;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('worker-disputes')) {
        loadDisputes();
    }
});