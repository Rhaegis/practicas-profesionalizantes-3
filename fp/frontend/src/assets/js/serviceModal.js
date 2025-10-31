// frontend/src/assets/js/serviceModal.js
// VERSIÓN BOOTSTRAP 5

function openServiceModal() {
    const worker = JSON.parse(sessionStorage.getItem('selectedWorker'));

    if (!worker) {
        alert('Error: No se seleccionó ningún trabajador');
        return;
    }

    // Obtener ubicación actual del cliente
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const clientLat = position.coords.latitude;
            const clientLng = position.coords.longitude;

            showBootstrapModal(worker, clientLat, clientLng);
        });
    } else {
        showBootstrapModal(worker, null, null);
    }
}

function showBootstrapModal(worker, lat, lng) {
    // Llenar datos del trabajador en el modal
    document.getElementById('modal-worker-name').textContent = worker.name || 'N/A';
    document.getElementById('modal-worker-trade').textContent = worker.trade || 'N/A';
    document.getElementById('modal-worker-id').value = worker.id;

    // Guardar coordenadas
    document.getElementById('service-lat').value = lat || '';
    document.getElementById('service-lng').value = lng || '';

    // Abrir modal de Bootstrap
    const modalElement = document.getElementById('serviceModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Limpiar formulario al abrir
    document.getElementById('service-request-form').reset();
    document.getElementById('scheduled-date-group').style.display = 'none';

    // Event listener para tipo de servicio
    setupServiceTypeListener();

    // Event listener para submit (solo una vez)
    const form = document.getElementById('service-request-form');
    form.removeEventListener('submit', handleServiceSubmit);
    form.addEventListener('submit', handleServiceSubmit);
}

function setupServiceTypeListener() {
    const serviceTypeSelect = document.getElementById('service-type');
    const scheduledGroup = document.getElementById('scheduled-date-group');
    const scheduledInput = document.getElementById('scheduled-date');

    serviceTypeSelect.addEventListener('change', function () {
        if (this.value === 'scheduled') {
            scheduledGroup.style.display = 'block';
            scheduledInput.required = true;
        } else {
            scheduledGroup.style.display = 'none';
            scheduledInput.required = false;
        }
    });
}

async function handleServiceSubmit(e) {
    e.preventDefault();

    const submitButton = document.getElementById('submitServiceRequest');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Enviando...';

    const formData = {
        worker_id: parseInt(document.getElementById('modal-worker-id').value),
        title: document.getElementById('service-title').value.trim(),
        description: document.getElementById('service-description').value.trim(),
        service_location_lat: parseFloat(document.getElementById('service-lat').value) || null,
        service_location_lng: parseFloat(document.getElementById('service-lng').value) || null,
        service_address: document.getElementById('service-address').value.trim(),
        scheduled_date: document.getElementById('scheduled-date').value || null
    };

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/services', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            // Cerrar modal
            const modalElement = document.getElementById('serviceModal');
            const modal = bootstrap.Modal.getInstance(modalElement);
            modal.hide();

            // Limpiar sessionStorage
            sessionStorage.removeItem('selectedWorker');

            // Mostrar notificación de éxito
            showNotification('✅ Solicitud enviada correctamente. El trabajador será notificado.', 'success');

            // Recargar la página para actualizar la lista de solicitudes
            setTimeout(() => window.location.reload(), 1500);
        } else {
            throw new Error(data.message || 'Error al enviar la solicitud');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('❌ Error al enviar la solicitud: ' + error.message, 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
}

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

// Hacer funciones globales
window.openServiceModal = openServiceModal;