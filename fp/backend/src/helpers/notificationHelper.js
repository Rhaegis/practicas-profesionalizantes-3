const Notification = require('../models/notification');

// Tipos de notificaciones
const NOTIFICATION_TYPES = {
    NEW_SERVICE: 'new_service',
    SERVICE_ACCEPTED: 'service_accepted',
    SERVICE_STARTED: 'service_started',
    SERVICE_COMPLETED: 'service_completed',
    CODE_GENERATED: 'code_generated',
    NEW_RATING: 'new_rating',
    NEW_DISPUTE: 'new_dispute',
    DISPUTE_RESPONSE: 'dispute_response',
    DISPUTE_RESOLVED: 'dispute_resolved'
};

// Crear notificación
async function createNotification(user_id, type, title, message, link = null, related_id = null) {
    try {
        await Notification.create({
            user_id,
            type,
            title,
            message,
            link,
            related_id
        });
        console.log(`📬 Notificación creada para usuario ${user_id}: ${title}`);
    } catch (error) {
        console.error('Error al crear notificación:', error);
    }
}

// Notificación: Nueva solicitud recibida (para trabajador)
async function notifyNewService(worker_id, service_id, client_name) {
    await createNotification(
        worker_id,
        NOTIFICATION_TYPES.NEW_SERVICE,
        '📋 Nueva solicitud de servicio',
        `${client_name} te ha enviado una nueva solicitud de trabajo`,
        'available-worker-requests.html',
        service_id
    );
}

// Notificación: Solicitud aceptada (para cliente)
async function notifyServiceAccepted(client_id, service_id, worker_name) {
    await createNotification(
        client_id,
        NOTIFICATION_TYPES.SERVICE_ACCEPTED,
        '✅ Solicitud aceptada',
        `${worker_name} ha aceptado tu solicitud`,
        'client-requests.html',
        service_id
    );
}

// Notificación: Trabajo iniciado (para cliente)
async function notifyServiceStarted(client_id, service_id, worker_name) {
    await createNotification(
        client_id,
        NOTIFICATION_TYPES.SERVICE_STARTED,
        '🚀 Trabajo iniciado',
        `${worker_name} ha iniciado el trabajo`,
        'client-requests.html',
        service_id
    );
}

// Notificación: Trabajo completado (para cliente)
async function notifyServiceCompleted(client_id, service_id) {
    await createNotification(
        client_id,
        NOTIFICATION_TYPES.SERVICE_COMPLETED,
        '✅ Trabajo completado',
        'El trabajador ha marcado el trabajo como completado. Por favor, verifica y confirma.',
        'client-requests.html',
        service_id
    );
}

// Notificación: Código generado (para cliente)
async function notifyCodeGenerated(client_id, service_id) {
    await createNotification(
        client_id,
        NOTIFICATION_TYPES.CODE_GENERATED,
        '🔑 Código de verificación disponible',
        'Tu código de verificación está listo. Entrégalo al trabajador para completar el servicio.',
        'client-requests.html',
        service_id
    );
}

// Notificación: Nueva calificación recibida
async function notifyNewRating(user_id, rater_name, rating) {
    await createNotification(
        user_id,
        NOTIFICATION_TYPES.NEW_RATING,
        '⭐ Nueva calificación recibida',
        `${rater_name} te ha calificado con ${rating} estrellas`,
        user_id ? 'worker-profile.html' : 'client-profile.html',
        null
    );
}

// Notificación: Nueva disputa (para trabajador)
async function notifyNewDispute(worker_id, dispute_id, client_name) {
    await createNotification(
        worker_id,
        NOTIFICATION_TYPES.NEW_DISPUTE,
        '⚠️ Nueva disputa reportada',
        `${client_name} ha reportado un problema con el trabajo`,
        'worker-disputes.html',
        dispute_id
    );
}

// Notificación: Respuesta en disputa (para cliente)
async function notifyDisputeResponse(client_id, dispute_id, worker_name) {
    await createNotification(
        client_id,
        NOTIFICATION_TYPES.DISPUTE_RESPONSE,
        '💬 Respuesta en disputa',
        `${worker_name} ha respondido a tu reporte`,
        'client-disputes.html',
        dispute_id
    );
}

// Notificación: Disputa resuelta (para ambos)
async function notifyDisputeResolved(user_id, dispute_id, resolution) {
    const resolutionText = {
        'resuelta_cliente': 'resuelta a tu favor',
        'resuelta_trabajador': 'resuelta a favor del trabajador',
        'rechazada': 'rechazada'
    };

    await createNotification(
        user_id,
        NOTIFICATION_TYPES.DISPUTE_RESOLVED,
        '⚖️ Disputa resuelta',
        `Tu disputa ha sido ${resolutionText[resolution]}`,
        user_id ? 'worker-disputes.html' : 'client-disputes.html',
        dispute_id
    );
}

module.exports = {
    NOTIFICATION_TYPES,
    createNotification,
    notifyNewService,
    notifyServiceAccepted,
    notifyServiceStarted,
    notifyServiceCompleted,
    notifyCodeGenerated,
    notifyNewRating,
    notifyNewDispute,
    notifyDisputeResponse,
    notifyDisputeResolved
};