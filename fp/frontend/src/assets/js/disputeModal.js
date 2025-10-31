// Sistema de disputas

let currentDisputeServiceId = null;

// Abrir modal de disputa
function openDisputeModal(serviceId) {
    currentDisputeServiceId = serviceId;

    // Cerrar modal de confirmación si está abierto
    const confirmationModal = bootstrap.Modal.getInstance(document.getElementById('clientConfirmationModal'));
    if (confirmationModal) {
        confirmationModal.hide();
    }

    const modalHTML = `
        <div class="modal fade" id="disputeModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-danger text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-exclamation-triangle me-2"></i>
                            Reportar Problema con el Trabajo
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="alert alert-warning">
                            <i class="bi bi-info-circle me-2"></i>
                            <strong>Importante:</strong> Esta acción creará una disputa que será revisada por nuestro equipo de soporte.
                        </div>

                        <form id="disputeForm">
                            <!-- Motivo -->
                            <div class="mb-3">
                                <label for="disputeReason" class="form-label">
                                    <strong>¿Qué problema hubo con el trabajo?</strong>
                                    <span class="text-danger">*</span>
                                </label>
                                <textarea 
                                    class="form-control" 
                                    id="disputeReason" 
                                    rows="4" 
                                    placeholder="Describe detalladamente el problema con el trabajo realizado..."
                                    required
                                ></textarea>
                                <div class="form-text">Sé específico: ¿qué fue lo que no funcionó o no quedó bien?</div>
                            </div>

                            <!-- Categoría del problema (opcional) -->
                            <div class="mb-3">
                                <label for="disputeCategory" class="form-label">Tipo de problema</label>
                                <select class="form-select" id="disputeCategory">
                                    <option value="">Selecciona una categoría (opcional)</option>
                                    <option value="incompleto">Trabajo incompleto</option>
                                    <option value="defectuoso">Trabajo defectuoso o mal hecho</option>
                                    <option value="danios">Causó daños adicionales</option>
                                    <option value="no_llego">El trabajador no llegó</option>
                                    <option value="tardanza">Tardanza excesiva</option>
                                    <option value="otro">Otro</option>
                                </select>
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
                                        Por ahora, puedes describir el problema. En una próxima versión podrás subir fotos.
                                    </small>
                                </div>
                            </div>

                            <div id="disputeError" class="alert alert-danger d-none"></div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            Cancelar
                        </button>
                        <button type="button" class="btn btn-danger" onclick="submitDispute()">
                            <i class="bi bi-exclamation-circle me-2"></i>
                            Reportar Problema
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('disputeModal'));
    modal.show();

    document.getElementById('disputeModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// Enviar disputa
async function submitDispute() {
    const errorDiv = document.getElementById('disputeError');
    errorDiv.classList.add('d-none');

    const reason = document.getElementById('disputeReason').value.trim();
    const category = document.getElementById('disputeCategory').value;

    // Validar
    if (!reason) {
        errorDiv.textContent = 'Debes describir el problema';
        errorDiv.classList.remove('d-none');
        return;
    }

    if (reason.length < 20) {
        errorDiv.textContent = 'Por favor, describe el problema con más detalle (mínimo 20 caracteres)';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        // Construir descripción completa
        let fullReason = reason;
        if (category) {
            const categoryNames = {
                'incompleto': 'Trabajo incompleto',
                'defectuoso': 'Trabajo defectuoso',
                'danios': 'Causó daños',
                'no_llego': 'No llegó',
                'tardanza': 'Tardanza excesiva',
                'otro': 'Otro'
            };
            fullReason = `[${categoryNames[category]}] ${reason}`;
        }

        const response = await fetch('http://localhost:3000/api/disputes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                service_id: currentDisputeServiceId,
                reason: fullReason,
                evidence_url: null // Por ahora sin fotos
            })
        });

        const data = await response.json();

        if (!response.ok) {
            errorDiv.textContent = data.message || 'Error al crear la disputa';
            errorDiv.classList.remove('d-none');
            return;
        }

        // Éxito
        showNotification('✅ Disputa reportada correctamente. Nuestro equipo la revisará pronto.', 'success');

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('disputeModal')).hide();

        // Recargar página después de 2 segundos
        setTimeout(() => location.reload(), 2000);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = 'Error al reportar la disputa';
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
window.openDisputeModal = openDisputeModal;
window.submitDispute = submitDispute;