// Cargar estadísticas
async function loadAdminStats() {
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

        const response = await fetch('http://localhost:3000/api/admin/stats', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar estadísticas');
        }

        const data = await response.json();
        console.log('📊 Estadísticas del sistema:', data);

        // Actualizar UI
        displayStats(data);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar estadísticas', 'error');
    }
}

// Mostrar estadísticas en el dashboard
function displayStats(data) {
    // Usuarios
    document.getElementById('stat-total-users').textContent = data.users.total;
    document.getElementById('stat-clients').textContent = data.users.clients;
    document.getElementById('stat-workers').textContent = data.users.workers;

    // Servicios
    document.getElementById('stat-total-services').textContent = data.services.total;
    document.getElementById('stat-pending').textContent = data.services.pending;
    document.getElementById('stat-completed').textContent = data.services.completed;

    // Disputas
    document.getElementById('stat-total-disputes').textContent = data.disputes.total;
    document.getElementById('stat-open-disputes').textContent = data.disputes.open;
    document.getElementById('stat-review-disputes').textContent = data.disputes.inReview;

    // Calificación
    document.getElementById('stat-avg-rating').textContent = data.rating.average + ' ⭐';

    // Badges adicionales
    document.getElementById('badge-pending-disputes').textContent = data.disputes.open + data.disputes.inReview;
    document.getElementById('badge-active-users').textContent = data.users.total;
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

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard-admin')) {
        loadAdminStats();
    }
});