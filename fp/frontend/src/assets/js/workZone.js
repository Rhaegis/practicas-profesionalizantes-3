let map;
let marker;
let circle;
let currentRadius = 10; // km por defecto
let currentCenter = { lat: -38.0055, lng: -57.5426 }; // Mar del Plata por defecto

// Inicializar mapa (llamada por Google Maps API)
window.initMap = function () {
    // Cargar configuración actual del trabajador
    loadCurrentSettings();
};

// Cargar configuración actual
async function loadCurrentSettings() {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/work-settings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al cargar configuración');
        }

        const data = await response.json();
        console.log('⚙️ Configuración actual:', data);

        // Si tiene ubicación guardada, usarla
        if (data.settings.work_location_lat && data.settings.work_location_lng) {
            currentCenter = {
                lat: parseFloat(data.settings.work_location_lat),
                lng: parseFloat(data.settings.work_location_lng)
            };
        }

        // Radio guardado
        if (data.settings.work_radius) {
            currentRadius = data.settings.work_radius;
            document.getElementById('radiusSlider').value = currentRadius;
            document.getElementById('radiusValue').textContent = `${currentRadius} km`;
        }

        // Disponibilidad inmediata
        document.getElementById('immediateAvailability').checked = data.settings.immediate_availability;

        // Inicializar mapa con configuración cargada
        initializeMap();

    } catch (error) {
        console.error('❌ Error:', error);
        // Si falla, usar valores por defecto
        initializeMap();
    }
}

// Inicializar el mapa de Google
function initializeMap() {
    // Crear mapa centrado en la ubicación del trabajador
    map = new google.maps.Map(document.getElementById('map'), {
        center: currentCenter,
        zoom: 12,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Crear marcador arrastrable
    marker = new google.maps.Marker({
        position: currentCenter,
        map: map,
        draggable: true,
        title: 'Mi ubicación central',
        animation: google.maps.Animation.DROP
    });

    // Crear círculo de cobertura
    circle = new google.maps.Circle({
        map: map,
        center: currentCenter,
        radius: currentRadius * 1000, // Convertir km a metros
        fillColor: '#4285F4',
        fillOpacity: 0.15,
        strokeColor: '#4285F4',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        editable: false
    });

    // Listener cuando se arrastra el marcador
    marker.addListener('drag', function (event) {
        const newPos = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        circle.setCenter(newPos);
    });

    marker.addListener('dragend', function (event) {
        currentCenter = {
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
        };
        console.log('📍 Nueva ubicación:', currentCenter);
    });

    // Listener para el slider de radio
    const radiusSlider = document.getElementById('radiusSlider');
    radiusSlider.addEventListener('input', function () {
        currentRadius = parseInt(this.value);
        document.getElementById('radiusValue').textContent = `${currentRadius} km`;
        circle.setRadius(currentRadius * 1000);
    });

    // Botón guardar
    document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

    // Botón reset
    document.getElementById('resetBtn').addEventListener('click', resetSettings);

    // Toggle disponibilidad inmediata
    document.getElementById('immediateAvailability').addEventListener('change', toggleImmediateAvailability);

    // Botón pausar cuenta
    document.getElementById('pauseAccountBtn').addEventListener('click', pauseAccount);
}

// Guardar configuración
async function saveSettings() {
    const btn = document.getElementById('saveSettingsBtn');
    const originalText = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/work-settings', {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                work_radius: currentRadius,
                work_location_lat: currentCenter.lat,
                work_location_lng: currentCenter.lng
            })
        });

        if (!response.ok) {
            throw new Error('Error al guardar');
        }

        showNotification('✅ Configuración guardada exitosamente', 'success');

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al guardar la configuración', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalText;
    }
}

// Restablecer a configuración guardada
function resetSettings() {
    if (confirm('¿Deseas restablecer a la configuración guardada?')) {
        location.reload();
    }
}

// Toggle disponibilidad inmediata
async function toggleImmediateAvailability() {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/work-settings/toggle-availability', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showNotification(data.message, 'success');

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cambiar disponibilidad', 'error');
        // Revertir checkbox
        document.getElementById('immediateAvailability').checked = !document.getElementById('immediateAvailability').checked;
    }
}

// Pausar/Reactivar cuenta
async function pauseAccount() {
    const btn = document.getElementById('pauseAccountBtn');
    const isPaused = btn.textContent.includes('Reactivar');

    if (!confirm(isPaused ? '¿Deseas reactivar tu cuenta?' : '¿Deseas pausar tu cuenta? No recibirás nuevas solicitudes.')) {
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/work-settings/toggle-status', {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message);
        }

        showNotification(data.message, 'success');

        // Cambiar texto del botón
        if (data.is_active) {
            btn.innerHTML = '<i class="bi bi-pause-circle me-2"></i>Pausar mi cuenta';
            btn.classList.remove('btn-success');
            btn.classList.add('btn-outline-secondary');
        } else {
            btn.innerHTML = '<i class="bi bi-play-circle me-2"></i>Reactivar mi cuenta';
            btn.classList.remove('btn-outline-secondary');
            btn.classList.add('btn-success');
        }

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al cambiar estado de cuenta', 'error');
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