// frontend/src/assets/js/ratingModal.js
// Sistema de calificaciones con estrellas

let currentRatingValue = 0;
let currentServiceId = null;
let currentRatedUserId = null;
let currentRatedUserName = '';

// Abrir modal de calificación
async function openRatingModal(serviceId, ratedUserId, ratedUserName, userType) {
    currentServiceId = serviceId;
    currentRatedUserId = ratedUserId;
    currentRatedUserName = ratedUserName;
    currentRatingValue = 0;

    // Verificar si puede calificar
    const canRate = await checkCanRate(serviceId);
    if (!canRate) {
        showNotification('Ya has calificado este servicio', 'info');
        return;
    }

    const modalHTML = `
        <div class="modal fade" id="ratingModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">⭐ Calificar ${userType === 'worker' ? 'Trabajador' : 'Cliente'}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="text-center mb-4">
                            <h6 class="mb-3">${ratedUserName}</h6>
                            <p class="text-muted small">¿Cómo fue tu experiencia?</p>
                        </div>

                        <!-- Estrellas -->
                        <div class="text-center mb-4">
                            <div class="star-rating" id="starRating">
                                <i class="bi bi-star star" data-rating="1"></i>
                                <i class="bi bi-star star" data-rating="2"></i>
                                <i class="bi bi-star star" data-rating="3"></i>
                                <i class="bi bi-star star" data-rating="4"></i>
                                <i class="bi bi-star star" data-rating="5"></i>
                            </div>
                            <p class="text-muted small mt-2" id="ratingText">Selecciona una calificación</p>
                        </div>

                        <!-- Comentario -->
                        <div class="mb-3">
                            <label for="ratingComment" class="form-label">Comentario (opcional)</label>
                            <textarea class="form-control" id="ratingComment" rows="3" 
                                placeholder="Cuéntanos sobre tu experiencia..."></textarea>
                        </div>

                        <div id="ratingError" class="alert alert-danger d-none"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="submitRating()">
                            Enviar Calificación
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
    modal.show();

    // Event listeners para las estrellas
    initStarRating();

    document.getElementById('ratingModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Inicializar sistema de estrellas
function initStarRating() {
    const stars = document.querySelectorAll('.star');

    stars.forEach(star => {
        // Hover
        star.addEventListener('mouseenter', function () {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });

        // Click
        star.addEventListener('click', function () {
            currentRatingValue = parseInt(this.getAttribute('data-rating'));
            highlightStars(currentRatingValue);
            updateRatingText(currentRatingValue);
        });
    });

    // Reset al salir del contenedor
    document.getElementById('starRating').addEventListener('mouseleave', function () {
        highlightStars(currentRatingValue);
    });
}

// Resaltar estrellas
function highlightStars(rating) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.remove('bi-star');
            star.classList.add('bi-star-fill', 'text-warning');
        } else {
            star.classList.remove('bi-star-fill', 'text-warning');
            star.classList.add('bi-star');
        }
    });
}

// Actualizar texto de calificación
function updateRatingText(rating) {
    const texts = {
        1: '⭐ Muy malo',
        2: '⭐⭐ Malo',
        3: '⭐⭐⭐ Regular',
        4: '⭐⭐⭐⭐ Bueno',
        5: '⭐⭐⭐⭐⭐ Excelente'
    };
    document.getElementById('ratingText').textContent = texts[rating] || 'Selecciona una calificación';
}

// Verificar si puede calificar
async function checkCanRate(serviceId) {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/ratings/can-rate/${serviceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();
        return data.can_rate;

    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

// Enviar calificación
async function submitRating() {
    const errorDiv = document.getElementById('ratingError');
    errorDiv.classList.add('d-none');

    // Validar que seleccionó una calificación
    if (currentRatingValue === 0) {
        errorDiv.textContent = 'Por favor selecciona una calificación';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');
        const comment = document.getElementById('ratingComment').value.trim();

        const response = await fetch('http://localhost:3000/api/ratings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                service_id: currentServiceId,
                rating: currentRatingValue,
                comment: comment || null
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.message || 'Error al enviar calificación';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Éxito
        showNotification('✅ Calificación enviada correctamente', 'success');

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('ratingModal')).hide();

        // Recargar página después de 1 segundo
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = 'Error al enviar la calificación';
        errorDiv.classList.remove('d-none');
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

// Hacer funciones globales
window.openRatingModal = openRatingModal;
window.submitRating = submitRating;