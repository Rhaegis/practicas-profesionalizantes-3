// Agenda del TRABAJADOR con eventos programados

// Cargar próximos trabajos y eventos
async function loadWorkerAgenda() {
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
            throw new Error('Error al cargar agenda');
        }

        const data = await response.json();
        console.log('📅 Agenda del trabajador:', data);

        // Filtrar trabajos aceptados y en progreso (son los activos)
        const activeJobs = data.services.filter(s =>
            s.status === 'accepted' || s.status === 'in_progress'
        );

        displayUpcomingEvents(activeJobs);
        markCalendarDays(activeJobs);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar la agenda', 'error');
    }
}

// Mostrar próximos eventos
function displayUpcomingEvents(jobs) {
    const container = document.querySelector('.list-group');

    if (!container) return;

    if (jobs.length === 0) {
        container.innerHTML = `
            <div class="list-group-item text-center py-4">
                <div class="fs-1 mb-2">📭</div>
                <p class="text-muted mb-0">No tienes trabajos programados</p>
            </div>
        `;
        return;
    }

    // Ordenar por fecha (los más próximos primero)
    const sortedJobs = jobs.sort((a, b) => {
        const dateA = a.scheduled_date ? new Date(a.scheduled_date) : new Date(a.createdAt);
        const dateB = b.scheduled_date ? new Date(b.scheduled_date) : new Date(b.createdAt);
        return dateA - dateB;
    });

    container.innerHTML = sortedJobs.map(job => `
        <div class="list-group-item px-0 py-3">
            <div class="d-flex align-items-start gap-3">
                <div class="bg-${job.status === 'in_progress' ? 'primary' : 'info'} bg-opacity-10 rounded p-2">
                    <i class="bi bi-${job.status === 'in_progress' ? 'tools' : 'calendar-event'} fs-4 text-${job.status === 'in_progress' ? 'primary' : 'info'}"></i>
                </div>
                <div class="flex-grow-1">
                    <h6 class="mb-1">${job.title}</h6>
                    <p class="text-muted small mb-1">
                        <i class="bi bi-person me-1"></i>
                        Cliente: ${job.client?.full_name || 'N/A'}
                    </p>
                    <p class="text-muted small mb-1">
                        <i class="bi bi-geo-alt me-1"></i>
                        ${job.service_address || 'Dirección no especificada'}
                    </p>
                    <p class="text-muted small mb-0">
                        <i class="bi bi-clock me-1"></i>
                        ${job.scheduled_date ? formatDateTime(job.scheduled_date) : 'Fecha flexible'}
                    </p>
                </div>
                <div class="d-flex flex-column gap-1">
                    <span class="badge bg-${job.status === 'in_progress' ? 'primary' : 'info'}">
                        ${job.status === 'in_progress' ? 'En Progreso' : 'Aceptado'}
                    </span>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewJobDetails(${job.id})">
                        Ver detalles
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Marcar días en el calendario con eventos
function markCalendarDays(jobs) {
    // Esta función marca visualmente los días que tienen trabajos programados
    // Por ahora es decorativa, pero podrías implementar un calendario interactivo

    jobs.forEach(job => {
        if (job.scheduled_date) {
            const date = new Date(job.scheduled_date);
            const day = date.getDate();

            // Buscar el día en el calendario y marcarlo
            const calendarDays = document.querySelectorAll('.calendar-grid > div');
            calendarDays.forEach(dayElement => {
                if (dayElement.textContent.trim() === String(day)) {
                    // Agregar un indicador visual
                    if (!dayElement.querySelector('.badge')) {
                        const badge = document.createElement('span');
                        badge.className = 'position-absolute bottom-0 start-50 translate-middle-x badge bg-primary rounded-pill';
                        badge.style.fontSize = '0.5rem';
                        badge.textContent = '●';
                        dayElement.style.position = 'relative';
                        dayElement.appendChild(badge);
                    }
                }
            });
        }
    });
}

// Ver detalles de un trabajo
function viewJobDetails(jobId) {
    window.location.href = `worker-jobs.html?id=${jobId}`;
}

// Formatear fecha y hora
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
window.viewJobDetails = viewJobDetails;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('worker-agenda')) {
        loadWorkerAgenda();
    }
});