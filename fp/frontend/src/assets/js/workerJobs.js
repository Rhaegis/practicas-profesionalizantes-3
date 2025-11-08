let allJobs = [];

// Cargar todos los trabajos del trabajador
async function loadWorkerJobs() {
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
            throw new Error('Error al cargar trabajos');
        }

        const data = await response.json();
        console.log('📋 Trabajos del trabajador:', data);

        allJobs = data.services;

        // Actualizar contadores
        updateCounters();

        // Mostrar trabajos en cada tab
        setTimeout(() => {
            displayJobsByStatus('accepted');
            displayJobsByStatus('in_progress');
            displayJobsByStatus('completed');
        }, 100);

        // Actualizar nombre del usuario
        updateUserName();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar trabajos', 'error');
    }
}

// Actualizar contadores
function updateCounters() {
    const counts = {
        accepted: allJobs.filter(j => j.status === 'accepted').length,
        in_progress: allJobs.filter(j => j.status === 'in_progress').length,
        completed: allJobs.filter(j => j.status === 'completed').length
    };

    Object.keys(counts).forEach(key => {
        const el = document.getElementById(`count-${key}`);
        if (el) el.textContent = counts[key];
    });
}

// Mostrar trabajos según estado
function displayJobsByStatus(status) {
    const container = document.getElementById(`jobs-${status}-container`);

    if (!container) {
        console.error(`❌ No se encontró el contenedor: jobs-${status}-container`);
        return;
    }

    const filteredJobs = allJobs.filter(j => j.status === status);

    if (filteredJobs.length === 0) {
        container.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <p class="text-muted">📭 No hay trabajos ${getStatusText(status)}</p>
                </div>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredJobs.map(job => createJobCard(job)).join('');
}

// Crear tarjeta de trabajo
function createJobCard(job) {
    const statusInfo = getStatusInfo(job.status);
    const hasDispute = job.disputes && job.disputes.length > 0;

    return `
        <div class="col">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title mb-0">${job.title}</h5>
                        <span class="badge bg-${statusInfo.color}">${statusInfo.text}</span>
                    </div>
                    
                    <p class="card-text text-muted small">${job.description}</p>
                    
                    <hr>
                    
                    <div class="small">
                        <p class="mb-2"><strong>Cliente:</strong> ${job.client?.full_name || 'N/A'}</p>
                        <p class="mb-2"><strong>Dirección:</strong> ${job.service_address || 'No especificada'}</p>
                        <p class="mb-0"><strong>Fecha:</strong> ${formatDate(job.createdAt)}</p>
                    </div>
                </div>
                
                ${job.status === 'accepted' || job.status === 'in_progress' || job.status === 'completed' ? `
                    <div class="card-footer bg-white border-top">
                        <div class="d-grid gap-2">
                            ${job.status === 'accepted' ? `
                                <button class="btn btn-primary" onclick="markJobInProgress(${job.id})">
                                    ▶️ Iniciar Trabajo
                                </button>
                            ` : ''}
                            ${job.status === 'in_progress' ? `
                                <button class="btn btn-success" onclick="markAsCompleted(${job.id})">
                                    ✅ Marcar como Completado
                                </button>
                            ` : ''}
                            ${job.status === 'completed' ? (
                job.ratings && job.ratings.length > 0 ? `
                                    <div class="text-center py-2">
                                        <small class="text-muted d-block mb-1">Tu calificación:</small>
                                        <div class="d-flex justify-content-center gap-1">
                                            ${generateStars(job.ratings[0].rating)}
                                        </div>
                                        ${job.ratings[0].comment ? `
                                            <small class="text-muted fst-italic mt-2 d-block">"${job.ratings[0].comment}"</small>
                                        ` : ''}
                                    </div>
                                ` : `
                                    <button class="btn btn-primary" onclick="openRatingModal(${job.id}, ${job.client_id}, '${job.client?.full_name?.replace(/'/g, "\\'")}', 'client')">
                                        ⭐ Calificar cliente
                                    </button>
                                `
            ) : ''}
                            ${job.status === 'completed' ? (
                hasDispute ? `
                                    <div class="alert alert-info mb-0">
                                        <i class="bi bi-info-circle me-2"></i>
                                        <small><strong>Disputa existente:</strong> ${getDisputeStatusText(job.disputes[0].status)}</small>
                                    </div>
                                ` : `
                                    <button class="btn btn-sm btn-warning" onclick="openDisputeModal(${job.id})">
                                        ⚠️ Reportar problema
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

// Marcar trabajo como "en progreso"
async function markJobInProgress(jobId) {
    if (!confirm('¿Iniciar este trabajo?')) return;

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/services/${jobId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'in_progress' })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar estado');
        }

        showNotification('✅ Trabajo iniciado', 'success');
        setTimeout(() => loadWorkerJobs(), 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al iniciar el trabajo', 'error');
    }
}

// Obtener información de estado
function getStatusInfo(status) {
    const statusMap = {
        'pending': { text: 'Pendiente', color: 'warning' },
        'accepted': { text: 'Aceptado', color: 'info' },
        'in_progress': { text: 'En Progreso', color: 'primary' },
        'completed': { text: 'Completado', color: 'success' },
        'cancelled': { text: 'Cancelado', color: 'danger' }
    };
    return statusMap[status] || { text: status, color: 'secondary' };
}

// Obtener texto de estado para mensajes
function getStatusText(status) {
    const texts = {
        'pending': 'pendientes',
        'accepted': 'aceptados',
        'in_progress': 'en progreso',
        'completed': 'completados'
    };
    return texts[status] || '';
}

// Obtener texto de estado de disputa
function getDisputeStatusText(status) {
    const statusMap = {
        'abierta': 'Abierta',
        'en_revision': 'En revisión',
        'resuelta_cliente': 'Resuelta a favor del cliente',
        'resuelta_trabajador': 'Resuelta a favor del trabajador',
        'rechazada': 'Rechazada'
    };
    return statusMap[status] || status;
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
    notification.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
}

// Generar estrellas para mostrar calificación
function generateStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="bi bi-star-fill" style="color: #ffc107; font-size: 1.2rem;"></i>';
        } else {
            stars += '<i class="bi bi-star" style="color: #ddd; font-size: 1.2rem;"></i>';
        }
    }
    return stars;
}

// Hacer funciones globales
window.markJobInProgress = markJobInProgress;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('worker-jobs')) {
        loadWorkerJobs();
    }
});