// Gestión de usuarios para administradores

let allUsers = [];

// Cargar usuarios
async function loadUsers() {
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

        // Obtener filtros
        const role = document.getElementById('roleFilter')?.value || '';
        const search = document.getElementById('searchInput')?.value.trim() || '';

        // Construir query params
        const params = new URLSearchParams();
        if (role) params.append('role', role);
        if (search) params.append('search', search);

        const response = await fetch(`http://localhost:3000/api/admin/users?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar usuarios');
        }

        const data = await response.json();
        console.log('👥 Usuarios cargados:', data);

        allUsers = data.users;

        // Mostrar usuarios
        displayUsers();

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar usuarios', 'error');
    }
}

// Mostrar usuarios en la tabla
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    const totalBadge = document.getElementById('totalUsers');

    if (!tbody) return;

    totalBadge.textContent = `${allUsers.length} usuario${allUsers.length !== 1 ? 's' : ''}`;

    if (allUsers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <i class="bi bi-inbox" style="font-size: 3rem; color: #ddd;"></i>
                    <p class="text-muted mt-3">No se encontraron usuarios</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = allUsers.map(user => createUserRow(user)).join('');
}

// Crear fila de usuario
function createUserRow(user) {
    const roleColors = {
        'cliente': 'primary',
        'trabajador': 'success',
        'admin': 'danger'
    };

    const roleIcons = {
        'cliente': '👤',
        'trabajador': '🔧',
        'admin': '🛡️'
    };

    return `
        <tr>
            <td><strong>#${user.id}</strong></td>
            <td>${user.full_name}</td>
            <td><small>${user.email}</small></td>
            <td>
                <span class="badge bg-${roleColors[user.role]}">
                    ${roleIcons[user.role]} ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                </span>
            </td>
            <td>${user.trade || '-'}</td>
            <td>
                <span class="badge ${user.is_active ? 'bg-success' : 'bg-secondary'}">
                    ${user.is_active ? '✅ Activo' : '⏸️ Pausado'}
                </span>
            </td>
            <td><small>${formatDate(user.createdAt)}</small></td>
            <td class="text-center">
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="viewUserDetails(${user.id})" title="Ver detalles">
                        <i class="bi bi-eye"></i>
                    </button>
                    ${user.role !== 'admin' ? `
                        <button class="btn btn-outline-${user.is_active ? 'warning' : 'success'}" 
                                onclick="toggleUserStatus(${user.id})"
                                title="${user.is_active ? 'Desactivar' : 'Activar'}">
                            <i class="bi bi-${user.is_active ? 'pause-circle' : 'play-circle'}"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

// Ver detalles del usuario
async function viewUserDetails(userId) {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar detalles');
        }

        const data = await response.json();
        console.log('👤 Detalles del usuario:', data);

        // Mostrar en modal
        displayUserDetailsModal(data.user, data.stats);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cargar detalles del usuario', 'error');
    }
}

// Mostrar modal con detalles
function displayUserDetailsModal(user, stats) {
    const content = document.getElementById('userDetailsContent');

    const roleColors = {
        'cliente': 'primary',
        'trabajador': 'success',
        'admin': 'danger'
    };

    content.innerHTML = `
        <div class="row">
            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-2">Información Personal</h6>
                <div class="list-group list-group-flush">
                    <div class="list-group-item d-flex justify-content-between">
                        <strong>Nombre:</strong>
                        <span>${user.full_name}</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between">
                        <strong>Email:</strong>
                        <span>${user.email}</span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between">
                        <strong>Rol:</strong>
                        <span class="badge bg-${roleColors[user.role]}">${user.role}</span>
                    </div>
                    ${user.trade ? `
                        <div class="list-group-item d-flex justify-content-between">
                            <strong>Oficio:</strong>
                            <span>${user.trade}</span>
                        </div>
                    ` : ''}
                    ${user.work_area ? `
                        <div class="list-group-item d-flex justify-content-between">
                            <strong>Zona:</strong>
                            <span>${user.work_area}</span>
                        </div>
                    ` : ''}
                    <div class="list-group-item d-flex justify-content-between">
                        <strong>Estado:</strong>
                        <span class="badge ${user.is_active ? 'bg-success' : 'bg-secondary'}">
                            ${user.is_active ? '✅ Activo' : '⏸️ Pausado'}
                        </span>
                    </div>
                    <div class="list-group-item d-flex justify-content-between">
                        <strong>Registro:</strong>
                        <span><small>${formatDate(user.createdAt)}</small></span>
                    </div>
                </div>
            </div>

            <div class="col-md-6 mb-3">
                <h6 class="text-muted mb-2">Estadísticas</h6>
                <div class="list-group list-group-flush">
                    ${stats.completedServices !== undefined ? `
                        <div class="list-group-item d-flex justify-content-between">
                            <strong>Trabajos completados:</strong>
                            <span class="badge bg-success">${stats.completedServices}</span>
                        </div>
                        <div class="list-group-item d-flex justify-content-between">
                            <strong>Calificación promedio:</strong>
                            <span class="badge bg-warning text-dark">${stats.averageRating} ⭐</span>
                        </div>
                    ` : ''}
                    ${stats.totalServices !== undefined ? `
                        <div class="list-group-item d-flex justify-content-between">
                            <strong>Servicios solicitados:</strong>
                            <span class="badge bg-primary">${stats.totalServices}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>

        ${user.work_radius ? `
            <div class="alert alert-info mt-3">
                <i class="bi bi-geo-alt-fill me-2"></i>
                <strong>Configuración de zona:</strong> Radio de ${user.work_radius} km
            </div>
        ` : ''}
    `;

    // Abrir modal
    const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
    modal.show();
}

// Activar/Desactivar usuario
async function toggleUserStatus(userId) {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    const action = user.is_active ? 'desactivar' : 'activar';
    if (!confirm(`¿Estás seguro de que deseas ${action} a ${user.full_name}?`)) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/admin/users/${userId}/toggle-status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cambiar estado');
        }

        const data = await response.json();
        showNotification(data.message, 'success');

        // Recargar usuarios
        setTimeout(() => loadUsers(), 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cambiar estado del usuario', 'error');
    }
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
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
window.loadUsers = loadUsers;
window.viewUserDetails = viewUserDetails;
window.toggleUserStatus = toggleUserStatus;

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin-users')) {
        loadUsers();

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keyup', (e) => {
                if (e.key === 'Enter') {
                    loadUsers();
                }
            });
        }
    }
});