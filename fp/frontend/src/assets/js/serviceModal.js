// frontend/src/assets/js/serviceModal.js
// VERSIÓN BOOTSTRAP 5 - Mejorada con detección de ubicación visual

function openServiceModal() {
    const worker = JSON.parse(sessionStorage.getItem('selectedWorker'));

    if (!worker) {
        alert('Error: No se seleccionó ningún trabajador');
        return;
    }

    // Llenar datos del trabajador en el modal
    document.getElementById('modal-worker-name').textContent = worker.name || 'N/A';
    document.getElementById('modal-worker-trade').textContent = worker.trade || 'N/A';
    document.getElementById('modal-worker-id').value = worker.id;

    // Abrir modal
    const modalElement = document.getElementById('serviceModal');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();

    // Limpiar formulario
    document.getElementById('service-request-form').reset();
    document.getElementById('scheduled-date-group').style.display = 'none';

    // Mostrar mensaje de "Detectando ubicación..."
    showLocationStatus('detecting');

    // Detectar ubicación del cliente
    detectClientLocation();

    // Event listeners
    setupServiceTypeListener();

    // Event listener para submit (solo una vez)
    const form = document.getElementById('service-request-form');
    form.removeEventListener('submit', handleServiceSubmit);
    form.addEventListener('submit', handleServiceSubmit);
}

// Detectar ubicación GPS del cliente
function detectClientLocation() {
    if (!navigator.geolocation) {
        showLocationStatus('error', 'Tu navegador no soporta geolocalización');
        return;
    }

    navigator.geolocation.getCurrentPosition(
        // Éxito
        (position) => {
            const clientLat = position.coords.latitude;
            const clientLng = position.coords.longitude;

            // Guardar coordenadas
            document.getElementById('service-lat').value = clientLat;
            document.getElementById('service-lng').value = clientLng;

            // Mostrar mensaje de éxito
            showLocationStatus('success', null, clientLat, clientLng);

            // Opcional: Obtener dirección aproximada usando Geocoding
            getAddressFromCoordinates(clientLat, clientLng);
        },
        // Error
        (error) => {
            let errorMessage = 'No se pudo detectar tu ubicación';

            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Debes permitir el acceso a tu ubicación para continuar';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'La información de ubicación no está disponible';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Se agotó el tiempo para detectar tu ubicación';
                    break;
            }

            showLocationStatus('error', errorMessage);
        },
        // Opciones
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// Obtener dirección aproximada desde coordenadas (opcional)
async function getAddressFromCoordinates(lat, lng) {
    try {
        const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyCiOOPI_cGsEPBcaWFVfdkD2vBriraeDdQ`
        );

        const data = await response.json();

        if (data.status === 'OK' && data.results[0]) {
            const address = data.results[0].formatted_address;
            updateLocationStatus(address);
        }
    } catch (error) {
        console.error('Error al obtener dirección:', error);
        // No hacer nada, la ubicación ya fue guardada
    }
}

// Mostrar estado de detección de ubicación
function showLocationStatus(status, message = null, lat = null, lng = null) {
    // Buscar o crear div de status
    let statusDiv = document.getElementById('location-status');

    if (!statusDiv) {
        statusDiv = document.createElement('div');
        statusDiv.id = 'location-status';
        statusDiv.className = 'alert mb-3';

        // Insertar antes del primer campo del formulario
        const firstInput = document.getElementById('service-title').parentElement;
        firstInput.parentNode.insertBefore(statusDiv, firstInput);
    }

    if (status === 'detecting') {
        statusDiv.className = 'alert alert-info mb-3';
        statusDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <div class="spinner-border spinner-border-sm me-2" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
                <div>
                    <strong>📍 Detectando tu ubicación...</strong>
                </div>
            </div>
        `;
    } else if (status === 'success') {
        statusDiv.className = 'alert alert-success mb-3';
        statusDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-check-circle-fill text-success me-2"></i>
                <div>
                    <strong>✅ Ubicación detectada</strong>
                    <small class="d-block text-muted" id="detected-address">Obteniendo dirección...</small>
                </div>
            </div>
        `;
    } else if (status === 'error') {
        statusDiv.className = 'alert alert-danger mb-3';
        statusDiv.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                <div>
                    <strong>⚠️ ${message}</strong>
                    <small class="d-block">Por favor, ingresa manualmente tu dirección</small>
                </div>
            </div>
        `;
    }
}

// Actualizar con dirección completa
function updateLocationStatus(address) {
    const addressElement = document.getElementById('detected-address');
    if (addressElement) {
        addressElement.textContent = address;
    }
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

    // Validar que se tenga ubicación
    const lat = document.getElementById('service-lat').value;
    const lng = document.getElementById('service-lng').value;

    if (!lat || !lng) {
        showNotification('⚠️ No se pudo detectar tu ubicación. Por favor, recarga la página y permite el acceso a tu ubicación.', 'error');
        submitButton.disabled = false;
        submitButton.textContent = originalText;
        return;
    }

    const formData = {
        worker_id: parseInt(document.getElementById('modal-worker-id').value),
        title: document.getElementById('service-title').value.trim(),
        description: document.getElementById('service-description').value.trim(),
        service_location_lat: parseFloat(lat),
        service_location_lng: parseFloat(lng),
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