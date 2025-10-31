// frontend/src/assets/js/verificationFlow.js
// Flujo completo del sistema de verificación con código único

// ========================================
// TRABAJADOR: Marcar trabajo como completado y generar código
// ========================================
async function markAsCompleted(serviceId) {
    if (!confirm('¿Deseas marcar este trabajo como completado?')) return;

    try {
        const token = localStorage.getItem('authToken');

        // 1. Primero cambiar estado a "in_progress" si no lo está
        const statusResponse = await fetch(`http://localhost:3000/api/services/${serviceId}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: 'in_progress' })
        });

        if (!statusResponse.ok && statusResponse.status !== 400) {
            throw new Error('Error al actualizar estado');
        }

        // 2. Generar código de verificación
        const codeResponse = await fetch('http://localhost:3000/api/verification/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ service_id: serviceId })
        });

        if (!codeResponse.ok) {
            throw new Error('Error al generar código');
        }

        const data = await codeResponse.json();

        showNotification('✅ Código generado. Ahora el cliente debe confirmar el trabajo.', 'success');

        // Mostrar modal para que el trabajador ingrese el código
        showWorkerCodeInputModal(serviceId);

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al completar el trabajo', 'error');
    }
}

// ========================================
// TRABAJADOR: Modal para ingresar código
// ========================================
function showWorkerCodeInputModal(serviceId) {
    // Crear modal
    const modalHTML = `
        <div class="modal fade" id="verifyCodeModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header bg-primary text-white">
                        <h5 class="modal-title">✅ Verificar Código</h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-4">
                        <div class="mb-4">
                            <i class="bi bi-shield-check display-1 text-primary"></i>
                        </div>
                        <h6 class="mb-3">El cliente debe confirmar que el trabajo fue completado</h6>
                        <p class="text-muted mb-4">Una vez confirmado, te dará un código de 6 dígitos</p>
                        
                        <div class="mb-3">
                            <label for="codeInput" class="form-label fw-bold">Ingresá el código:</label>
                            <input type="text" 
                                   class="form-control form-control-lg text-center fs-3 fw-bold" 
                                   id="codeInput" 
                                   maxlength="6" 
                                   placeholder="000000"
                                   style="letter-spacing: 0.5rem;">
                        </div>
                        
                        <div id="codeError" class="alert alert-danger d-none"></div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                        <button type="button" class="btn btn-primary" onclick="verifyCodeFromWorker(${serviceId})">
                            Verificar Código
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Insertar modal en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('verifyCodeModal'));
    modal.show();

    // Limpiar modal cuando se cierra
    document.getElementById('verifyCodeModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// ========================================
// TRABAJADOR: Verificar código ingresado
// ========================================
async function verifyCodeFromWorker(serviceId) {
    const codeInput = document.getElementById('codeInput');
    const code = codeInput.value.trim();
    const errorDiv = document.getElementById('codeError');

    // Validar que el código tenga 6 dígitos
    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
        errorDiv.textContent = 'El código debe tener 6 dígitos';
        errorDiv.classList.remove('d-none');
        return;
    }

    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch('http://localhost:3000/api/verification/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ service_id: serviceId, code })
        });

        const data = await response.json();

        if (!response.ok || !data.valid) {
            errorDiv.textContent = data.message || 'Código inválido';
            errorDiv.classList.remove('d-none');
            return;
        }

        // ¡Éxito!
        showNotification('✅ Trabajo completado exitosamente', 'success');

        // Cerrar modal
        bootstrap.Modal.getInstance(document.getElementById('verifyCodeModal')).hide();

        // Recargar página después de 1 segundo
        setTimeout(() => location.reload(), 1000);

    } catch (error) {
        console.error('❌ Error:', error);
        errorDiv.textContent = 'Error al verificar código';
        errorDiv.classList.remove('d-none');
    }
}

// ========================================
// CLIENTE: Recibir notificación de código generado
// ========================================
async function showClientConfirmationModal(serviceId) {
    // Crear modal
    const modalHTML = `
        <div class="modal fade" id="clientConfirmModal" tabindex="-1">
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">🔔 Confirmación de Trabajo</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body text-center p-4">
                        <h6 class="mb-4">¿El trabajo fue completado satisfactoriamente?</h6>
                    </div>
                    <div class="modal-footer justify-content-center">
                        <button type="button" class="btn btn-danger" onclick="openDispute(${serviceId})">
                            ❌ No, hay problemas
                        </button>
                        <button type="button" class="btn btn-success" onclick="showCodeToClient(${serviceId})">
                            ✅ Sí, está perfecto
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('clientConfirmModal'));
    modal.show();

    document.getElementById('clientConfirmModal').addEventListener('hidden.bs.modal', function () {
        this.remove();
    });
}

// ========================================
// CLIENTE: Mostrar código al cliente
// ========================================
async function showCodeToClient(serviceId) {
    try {
        const token = localStorage.getItem('authToken');

        const response = await fetch(`http://localhost:3000/api/verification/code/${serviceId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Error al obtener código');
        }

        const data = await response.json();

        // Cerrar modal anterior
        const prevModal = bootstrap.Modal.getInstance(document.getElementById('clientConfirmModal'));
        if (prevModal) prevModal.hide();

        // Mostrar código
        const codeModalHTML = `
            <div class="modal fade" id="showCodeModal" tabindex="-1">
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header bg-success text-white">
                            <h5 class="modal-title">✅ Código de Verificación</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body text-center p-5">
                            <p class="mb-4">Dale este código al trabajador:</p>
                            <div class="display-1 fw-bold text-primary mb-4" style="letter-spacing: 1rem;">
                                ${data.code}
                            </div>
                            <p class="text-muted small">El trabajador debe ingresar este código para cerrar el trabajo</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Entendido</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', codeModalHTML);
        const modal = new bootstrap.Modal(document.getElementById('showCodeModal'));
        modal.show();

        document.getElementById('showCodeModal').addEventListener('hidden.bs.modal', function () {
            this.remove();
        });

    } catch (error) {
        console.error('❌ Error:', error);
        showNotification('Error al obtener código', 'error');
    }
}

// ========================================
// CLIENTE: Abrir disputa (placeholder para siguiente fase)
// ========================================
function openDispute(serviceId) {
    showNotification('Sistema de disputas disponible próximamente', 'info');
    // TODO: Implementar en Fase 3
}

// ========================================
// UTILIDAD: Mostrar notificación
// ========================================
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
window.markAsCompleted = markAsCompleted;
window.verifyCodeFromWorker = verifyCodeFromWorker;
window.showClientConfirmationModal = showClientConfirmationModal;
window.showCodeToClient = showCodeToClient;
window.openDispute = openDispute;