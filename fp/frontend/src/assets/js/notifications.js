// Sistema de notificaciones en tiempo real

let notificationsData = [];
let unreadCount = 0;
let notificationInterval = null;

// Inicializar notificaciones
function initNotifications() {
    loadNotifications();

    // Actualizar cada 30 segundos
    notificationInterval = setInterval(() => {
        loadNotifications(true); // true = silencioso, sin mostrar loading
    }, 30000);
}

// Cargar notificaciones
async function loadNotifications(silent = false) {
    try {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch('http://localhost:3000/api/notifications?limit=10', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) return;

        const data = await response.json();
        notificationsData = data.notifications;
        unreadCount = data.unreadCount;

        // Actualizar UI
        updateNotificationBadge();
        if (!silent) {
            updateNotificationDropdown();
        }

    } catch (error) {
        console.error('Error al cargar notificaciones:', error);
    }
}

// Actualizar badge con contador
function updateNotificationBadge() {
    const badge = document.getElementById('notificationBadge');
    if (!badge) return;

    if (unreadCount > 0) {
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        badge.classList.remove('d-none');
    } else {
        badge.classList.add('d-none');
    }
}

// Actualizar dropdown de notificaciones
function updateNotificationDropdown() {
    const dropdown = document.getElementById('notificationsList');
    if (!dropdown) return;

    if (notificationsData.length === 0) {
        dropdown.innerHTML = `
            <div class="dropdown-item text-center text-muted py-4">
                <i class="bi bi-inbox fs-3 d-block mb-2"></i>
                No hay notificaciones
            </div>
        `;
        return;
    }

    dropdown.innerHTML = notificationsData.map(notification => createNotificationItem(notification)).join('');
}

// Crear item de notificación
function createNotificationItem(notification) {
    const timeAgo = getTimeAgo(notification.createdAt);
    const iconMap = {
        'new_service': 'bi-briefcase text-primary',
        'service_accepted': 'bi-check-circle text-success',
        'service_started': 'bi-play-circle text-info',
        'service_completed': 'bi-flag text-success',
        'code_generated': 'bi-key text-warning',
        'new_rating': 'bi-star-fill text-warning',
        'new_dispute': 'bi-exclamation-triangle text-danger',
        'dispute_response': 'bi-chat-dots text-info',
        'dispute_resolved': 'bi-check-circle text-success'
    };

    const icon = iconMap[notification.type] || 'bi-bell text-primary';

    return `
        <a href="#" 
           class="dropdown-item notification-item ${!notification.is_read ? 'unread' : ''}" 
           onclick="handleNotificationClick(event, ${notification.id}, '${notification.link}')"
           data-notification-id="${notification.id}">
            <div class="d-flex align-items-start gap-3 py-2">
                <div class="flex-shrink-0">
                    <i class="bi ${icon} fs-4"></i>
                </div>
                <div class="flex-grow-1">
                    <div class="d-flex justify-content-between align-items-start mb-1">
                        <strong class="notification-title">${notification.title}</strong>
                        ${!notification.is_read ? '<span class="badge bg-primary rounded-pill">Nuevo</span>' : ''}
                    </div>
                    <p class="notification-message mb-1 text-muted small">${notification.message}</p>
                    <small class="text-muted">${timeAgo}</small>
                </div>
            </div>
        </a>
        <div class="dropdown-divider"></div>
    `;
}

// Manejar click en notificación
async function handleNotificationClick(event, notificationId, link) {
    event.preventDefault();

    // Marcar como leída
    await markAsRead(notificationId);

    // Redirigir
    if (link && link !== 'null') {
        window.location.href = link;
    }
}

// Marcar notificación como leída
async function markAsRead(notificationId) {
    try {
        const token = localStorage.getItem('authToken');

        await fetch(`http://localhost:3000/api/notifications/${notificationId}/read`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Actualizar UI
        loadNotifications();

    } catch (error) {
        console.error('Error al marcar como leída:', error);
    }
}

// Marcar todas como leídas
async function markAllAsRead() {
    try {
        const token = localStorage.getItem('authToken');

        await fetch('http://localhost:3000/api/notifications/read-all', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        // Actualizar UI
        loadNotifications();

    } catch (error) {
        console.error('Error al marcar todas como leídas:', error);
    }
}

// Calcular tiempo transcurrido
function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return date.toLocaleDateString('es-AR');
}

// Limpiar interval al salir
window.addEventListener('beforeunload', () => {
    if (notificationInterval) {
        clearInterval(notificationInterval);
    }
});

// Hacer funciones globales
window.initNotifications = initNotifications;
window.handleNotificationClick = handleNotificationClick;
window.markAllAsRead = markAllAsRead;

// Auto-inicializar en páginas de dashboard
document.addEventListener('DOMContentLoaded', () => {
    const isDashboard = window.location.pathname.includes('dashboard') ||
        window.location.pathname.includes('worker') ||
        window.location.pathname.includes('client') ||
        window.location.pathname.includes('admin');

    if (isDashboard) {
        setTimeout(() => initNotifications(), 1000);
    }
});