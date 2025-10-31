// Modal para que el trabajador responda a disputas

let currentDisputeId = null;

// Abrir modal de respuesta
function openResponseModal(disputeId, serviceTitle, clientReason) {
    currentDisputeId = disputeId;

    const modalHTML = `
        <div class="modal fade" id="responseModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-reply-fill me-2"></i>
                            Responder a Disputa
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-4">
                            <h6 class="text-muted mb-2">Trabajo:</h6>
                            <p class="fw-bold">${serviceTitle}</p>
                        </div>

                        <div class="alert alert-danger mb-4">
                            <strong class="d-block mb-2">
                                <i class="bi bi-exclamation-circle me-1"></i>
                                Reporte del cliente:
                            </strong>
                            <p class="mb-0">${clientReason}</p>
                        </div>

                        <form id="responseForm">
                            <!-- Respuesta -->
                            <div class="mb-3">
                                <label for="workerResponse" class="form-label">
                                    <strong>Tu respuesta / Descargo</strong>
                                    <span class="text-danger">*</span>
                                </label>
                                <textarea 
                                    class="form-control" 
                                    id="workerResponse" 
                                    rows="5" 
                                    placeholder="Explica tu versión de los hechos. Sé honesto y detallado..."
                                    required
                                ></textarea>
                                <div class="form-text">Esta información será revisada por nuestro equipo de soporte.</div>
                            </div>

                            <!-- Evidencias (Futuro: subir fotos) -->
                            <div class="mb-3">
                                <label class="form-label">
                                    <i class="bi bi-camera me-1"></i>
                                    Evidencias (Opcional)
                                </label>
                                <div class="alert alert-info mb-2">
                                    <small>
                                        <i class="bi bi-info-circle me-1"></i>
                                        Por ahora, puedes describir tu versión. En una próxima versión podrás subir fotos como evidencia.
                                    </small>
                                </div>
                            </div>

                            <div id="responseError" class="alert alert-danger d-none"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" onclick="submitResponse()">
                            <i class="bi bi-send me-2"></i>
                            Enviar Respuesta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('responseModal'));
    modal.show();

    document.getElementById('responseModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Enviar respuesta
async function submitResponse() {
    const errorDiv = document.getElementById('responseError');
    errorDiv.classList.add('d-none');

    const response = document.getElementById('workerResponse').value.trim();

    // Validar
    if (!response) {
        errorDiv.textContent = 'Debes escribir una respuesta';
        errorDiv.classList.remove('d-none');
        return;
    }

    if (response.length < 20) {
        errorDiv.textContent = 'Por favor, explica tu versión con más detalle (mínimo 20 caracteres)';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const apiResponse = await fetch(`http://localhost:3000/api/disputes/${currentDisputeId}/response`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                worker_response: response,
                worker_evidence_url: null // Por ahora sin fotos
            })
        });

        const data = await apiResponse.json();

        if (!apiResponse.ok) {
            errorDiv.textContent = data.message || 'Error al enviar la respuesta';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Éxito
        showNotification('✅ Respuesta enviada. La disputa está ahora en revisión.', 'success');

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('responseModal')).hide();

        // Recargar página después de 2 segundos
        setTimeout(() => location.reload(), 2000);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = 'Error al enviar la respuesta';
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
window.openResponseModal = openResponseModal;
window.submitResponse = submitResponse;