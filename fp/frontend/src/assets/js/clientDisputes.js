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
    const statusInfo = getStatusInfo(dispute.status);
    const isReporter = dispute.reported_by === 'client';

    return `
        <div class="col-12">
            <div class="card shadow-sm">
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
                        <span>Trabajador: ${dispute.reportedUser.full_name}</span>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDisputeDetails(${dispute.id})">
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
    // TODO: Implementar modal con detalles completos
}

// Obtener información de estado
function getStatusInfo(status) {
    const statusMap = {
        'abierta': {
            text: 'Abierta',
            class: 'bg-warning text-dark',
            icon: '⏳'
        },
        'en_revision': {
            text: 'En Revisión',
            class: 'bg-info',
            icon: '🔍'
        },
        'resuelta_cliente': {
            text: 'Resuelta a tu favor',
            class: 'bg-success',
            icon: '✅'
        },
        'resuelta_trabajador': {
            text: 'Resuelta a favor del trabajador',
            class: 'bg-secondary',
            icon: '⚖️'
        },
        'rechazada': {
            text: 'Rechazada',
            class: 'bg-danger',
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
window.viewDisputeDetails = viewDisputeDetails;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('client-disputes')) {
        loadDisputes();
    }
});