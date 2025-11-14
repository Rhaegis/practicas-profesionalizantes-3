// Sistema de gestión de disputas para clientes

let allDisputes = [];
let currentFilter = 'all';

// Cargar todas las disputas del usuario
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
        console.log('📋 Disputas del usuario:', data);

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
        abierta: allDisputes.filter(d => d.status === 'abierta').length,
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

    if (filter === 'abierta') {
        filteredDisputes = allDisputes.filter(d => d.status === 'abierta');
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
                    <p class="text-muted">Las disputas aparecerán aquí cuando reportes problemas con trabajos</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredDisputes.map(dispute => createDisputeCard(dispute)).join('');
}

// Crear tarjeta de disputa
function createDisputeCard(dispute) {
    const statusInfo = getStatusInfo(dispute.status, 'client');
    const iReported = dispute.reported_by === 'client';
    const needsMyResponse = dispute.reported_by === 'worker' && !dispute.worker_response && dispute.status === 'abierta';

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
                                    Respuesta del trabajador:
                                </strong>
                                <p class="mb-0">${dispute.worker_response}</p>
                            </div>
                        ` : dispute.status === 'abierta' ? `
                            <div class="alert alert-warning mb-3">
                                <i class="bi bi-clock me-1"></i>
                                Esperando respuesta del trabajador...
                            </div>
                        ` : ''}
                    ` : `
                        <div class="mb-3">
                            <strong class="d-block mb-2 text-danger">
                                <i class="bi bi-person me-1"></i>
                                Reporte del trabajador (${dispute.reporter.full_name}):
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

                    <div class="d-flex gap-2 align-items-center text-muted small">
                        <i class="bi bi-person"></i>
                        <span>${iReported ? 'Trabajador' : 'Reportado por'}: ${iReported ? dispute.reportedUser.full_name : dispute.reporter.full_name}</span>
                    </div>
                </div>
                <div class="card-footer bg-white d-flex gap-2">
                    ${needsMyResponse ? `
                        <button class="btn btn-danger" onclick="openClientResponseModal(${dispute.id}, '${dispute.service.title}', '${dispute.reason.replace(/'/g, "\\'")}')">
                            <i class="bi bi-reply-fill me-1"></i>
                            Responder al Trabajador
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
        const statusInfo = getStatusInfo(dispute.status, 'client');
        const iReported = dispute.reported_by === 'client';

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
                                        ${iReported ? 'Tu reporte' : 'Reporte del trabajador'}
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
                                            ${iReported ? 'Respuesta del trabajador' : 'Tu respuesta'}
                                        </strong>
                                    </div>
                                    <div class="card-body">
                                        <p class="mb-0">${dispute.worker_response}</p>
                                    </div>
                                </div>
                            ` : dispute.status === 'abierta' ? `
                                <div class="alert alert-warning">
                                    <i class="bi bi-clock me-2"></i>
                                    ${iReported ? 'Esperando respuesta del trabajador...' : 'Debes responder a esta disputa'}
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

// Abrir modal de respuesta del cliente
function openClientResponseModal(disputeId, serviceTitle, workerReport) {
    const modalHTML = `
        <div class="modal fade" id="clientResponseModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-reply-fill me-2"></i>
                            Responder a la Disputa
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="alert alert-info">
                            <strong>Servicio:</strong> ${serviceTitle}
                        </div>

                        <div class="mb-3">
                            <label class="form-label"><strong>Reporte del trabajador:</strong></label>
                            <div class="alert alert-light">
                                ${workerReport}
                            </div>
                        </div>

                        <form id="clientResponseForm">
                            <div class="mb-3">
                                <label for="clientResponse" class="form-label">
                                    <strong>Tu respuesta</strong> <span class="text-danger">*</span>
                                </label>
                                <textarea 
                                    class="form-control" 
                                    id="clientResponse" 
                                    rows="6" 
                                    placeholder="Explica tu versión de los hechos..."
                                    required
                                ></textarea>
                                <div class="form-text">
                                    Sé claro y honesto. Esta información será revisada por el equipo de soporte.
                                </div>
                            </div>

                            <div id="clientResponseError" class="alert alert-danger d-none"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="submitClientResponse(${disputeId})">
                            <i class="bi bi-send me-1"></i>
                            Enviar Respuesta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('clientResponseModal'));
    modal.show();

    document.getElementById('clientResponseModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Enviar respuesta del cliente
async function submitClientResponse(disputeId) {
    const errorDiv = document.getElementById('clientResponseError');
    errorDiv.classList.add('d-none');

    const response = document.getElementById('clientResponse').value.trim();

    if (!response) {
        errorDiv.textContent = 'Debes escribir una respuesta';
        errorDiv.classList.remove('d-none');
        return;
    }

    if (response.length < 20) {
        errorDiv.textContent = 'Por favor, proporciona más detalles (mínimo 20 caracteres)';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const res = await fetch(`http://localhost:3000/api/disputes/${disputeId}/client-response`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                client_response: response,
                client_evidence_url: null
            })
        });

        const data = await res.json();

        if (!res.ok) {
            errorDiv.textContent = data.message || 'Error al enviar respuesta';
            errorDiv.classList.remove('d-none');
            return;
        }

        showNotification('✅ Respuesta enviada. La disputa está en revisión.', 'success');

        bootstrap.Modal.getInstance(document.getElementById('clientResponseModal')).hide();

        setTimeout(() => loadDisputes(), 1500);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = 'Error al enviar la respuesta';
        errorDiv.classList.remove('d-none');
    }
}

// Obtener información de estado
function getStatusInfo(status, role) {
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
            text: role === 'client' ? 'Resuelta a tu favor' : 'Resuelta a favor del cliente',
            class: role === 'client' ? 'bg-success' : 'bg-danger',
            icon: role === 'client' ? '✅' : '❌',
            headerClass: role === 'client' ? 'bg-success' : 'bg-danger',
            alertClass: role === 'client' ? 'alert-success' : 'alert-danger'
        },
        'resuelta_trabajador': {
            text: role === 'client' ? 'Resuelta a favor del trabajador' : 'Resuelta a tu favor',
            class: role === 'client' ? 'bg-danger' : 'bg-success',
            icon: role === 'client' ? '❌' : '✅',
            headerClass: role === 'client' ? 'bg-danger' : 'bg-success',
            alertClass: role === 'client' ? 'alert-danger' : 'alert-success'
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
        'abierta': 'abiertas',
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
window.openClientResponseModal = openClientResponseModal;
window.submitClientResponse = submitClientResponse;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('client-disputes')) {
        loadDisputes();
    }
});