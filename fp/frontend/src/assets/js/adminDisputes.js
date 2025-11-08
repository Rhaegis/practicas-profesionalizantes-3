// Gestión de disputas para administradores

let allDisputes = [];
let currentFilter = 'all';
let currentDisputeId = null;

// Leer parámetros de URL
function getUrlFilter() {
    const urlParams = new URLSearchParams(window.location.search);
    const filter = urlParams.get('filter');

    if (filter && ['abierta', 'en_revision', 'resuelta'].includes(filter)) {
        return filter;
    }
    return 'all';
}

// Cargar todas las disputas
async function loadDisputes() {
    try {
        const token = localStorage.getItem('authToken');

        if (!token) {
            window.location.href = 'login.html';
            return;
        }

        // Verificar que es admin
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role !== 'admin') {
            alert('Acceso denegado. Solo administradores.');
            window.location.href = 'login.html';
            return;
        }

        // LEER FILTRO ANTES DE HACER EL FETCH
        currentFilter = getUrlFilter();

        const response = await fetch('http://localhost:3000/api/admin/disputes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar disputas');
        }

        const data = await response.json();
        console.log('⚖️ Disputas cargadas:', data);

        allDisputes = data.disputes;

        // Actualizar contadores
        updateCounters();

        // Mostrar disputas CON EL FILTRO YA APLICADO
        displayDisputes(currentFilter);

        // Actualizar botones activos
        document.querySelectorAll('[data-filter]').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${currentFilter}"]`)?.classList.add('active');

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
    const needsAction = dispute.status === 'abierta' || dispute.status === 'en_revision';

    return `
        <div class="col-12">
            <div class="card shadow-sm ${needsAction ? 'border-warning border-2' : ''}">
                ${needsAction ? `
                    <div class="card-header bg-warning text-dark">
                        <i class="bi bi-exclamation-triangle me-2"></i>
                        <strong>Requiere revisión</strong>
                    </div>
                ` : ''}
                <div class="card-body">
                    <div class="row">
                        <!-- Información General -->
                        <div class="col-md-6 mb-3">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">${dispute.service.title}</h5>
                                <span class="badge ${statusInfo.class} fs-6">
                                    ${statusInfo.icon} ${statusInfo.text}
                                </span>
                            </div>
                            <small class="text-muted d-block mb-3">
                                <i class="bi bi-calendar3 me-1"></i>
                                Reportada: ${formatDate(dispute.createdAt)}
                            </small>

                            <div class="mb-3">
                                <strong class="d-block mb-2 text-danger">
                                    <i class="bi bi-person me-1"></i>
                                    Reportado por: ${dispute.reporter.full_name} (${dispute.reporter.role})
                                </strong>
                                <p class="mb-0 text-muted small">${dispute.reason}</p>
                            </div>

                            <div class="mb-2">
                                <strong class="d-block mb-1">
                                    <i class="bi bi-person-x me-1"></i>
                                    Usuario reportado:
                                </strong>
                                <p class="mb-0 text-muted small">
                                    ${dispute.reportedUser.full_name} (${dispute.reportedUser.role})
                                </p>
                            </div>
                        </div>

                        <!-- Respuestas y Resolución -->
                        <div class="col-md-6">
                            ${dispute.worker_response ? `
                                <div class="alert alert-info mb-3">
                                    <strong class="d-block mb-2">
                                        <i class="bi bi-reply me-1"></i>
                                        Respuesta del trabajador:
                                    </strong>
                                    <p class="mb-0 small">${dispute.worker_response}</p>
                                </div>
                            ` : `
                                <div class="alert alert-secondary mb-3">
                                    <i class="bi bi-clock me-1"></i>
                                    <small>Esperando respuesta del trabajador...</small>
                                </div>
                            `}

                            ${dispute.admin_notes ? `
                                <div class="alert alert-success mb-3">
                                    <strong class="d-block mb-2">
                                        <i class="bi bi-shield-check me-1"></i>
                                        Resolución administrativa:
                                    </strong>
                                    <p class="mb-0 small">${dispute.admin_notes}</p>
                                </div>
                            ` : ''}

                            ${dispute.resolver ? `
                                <small class="text-muted d-block">
                                    Resuelto por: ${dispute.resolver.full_name}
                                </small>
                            ` : ''}
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    ${needsAction ? `
                        <button class="btn btn-primary" onclick="openResolveModal(${dispute.id})">
                            <i class="bi bi-gavel me-2"></i>
                            Resolver Disputa
                        </button>
                    ` : `
                        <button class="btn btn-outline-secondary" disabled>
                            <i class="bi bi-check-circle me-2"></i>
                            Disputa Resuelta
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// Abrir modal de resolución
function openResolveModal(disputeId) {
    currentDisputeId = disputeId;
    const dispute = allDisputes.find(d => d.id === disputeId);

    if (!dispute) return;

    // Llenar detalles en el modal
    const detailsHTML = `
        <div class="mb-4">
            <h6 class="text-muted mb-2">Servicio:</h6>
            <p class="fw-bold">${dispute.service.title}</p>
        </div>

        <div class="mb-4">
            <h6 class="text-danger mb-2">Reporte del ${dispute.reported_by}:</h6>
            <p class="bg-light p-3 rounded">${dispute.reason}</p>
        </div>

        ${dispute.worker_response ? `
            <div class="mb-4">
                <h6 class="text-info mb-2">Respuesta del trabajador:</h6>
                <p class="bg-light p-3 rounded">${dispute.worker_response}</p>
            </div>
        ` : `
            <div class="alert alert-warning mb-4">
                <i class="bi bi-exclamation-triangle me-2"></i>
                El trabajador aún no ha respondido a esta disputa.
            </div>
        `}
    `;

    document.getElementById('modalDisputeDetails').innerHTML = detailsHTML;

    // Limpiar formulario
    document.getElementById('resolveForm').reset();
    document.getElementById('resolveError').classList.add('d-none');

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('resolveModal'));
    modal.show();
}

// Enviar resolución
async function submitResolution() {
    const errorDiv = document.getElementById('resolveError');
    errorDiv.classList.add('d-none');

    const resolution = document.getElementById('resolution').value;
    const adminNotes = document.getElementById('adminNotes').value.trim();

    // Validar
    if (!resolution) {
        errorDiv.textContent = 'Debes seleccionar una resolución';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/admin/disputes/${currentDisputeId}/resolve`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                resolution,
                admin_notes: adminNotes || null
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Error al resolver disputa');
        }

        showNotification('✅ Disputa resuelta exitosamente', 'success');

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('resolveModal')).hide();

        // Recargar disputas
        setTimeout(() => loadDisputes(), 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('d-none');
    }
}

// Obtener información de estado
function getStatusInfo(status) {
    const statusMap = {
        'abierta': {
            text: 'Abierta',
            class: 'bg-danger',
            icon: '🔴'
        },
        'en_revision': {
            text: 'En Revisión',
            class: 'bg-warning text-dark',
            icon: '🔍'
        },
        'resuelta_cliente': {
            text: 'Resuelta a favor del Cliente',
            class: 'bg-success',
            icon: '✅'
        },
        'resuelta_trabajador': {
            text: 'Resuelta a favor del Trabajador',
            class: 'bg-info',
            icon: '✅'
        },
        'rechazada': {
            text: 'Rechazada',
            class: 'bg-secondary',
            icon: '❌'
        }
    };
    return statusMap[status] || { text: status, class: 'bg-secondary', icon: '❓' };
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
window.openResolveModal = openResolveModal;
window.submitResolution = submitResolution;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-disputes')) {
        loadDisputes();
    }
});