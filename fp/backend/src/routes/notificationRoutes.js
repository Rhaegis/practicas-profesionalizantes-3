const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener notificaciones del usuario
router.get('/', authMiddleware, notificationController.getUserNotifications);

// Obtener contador de no leídas
router.get('/unread-count', authMiddleware, notificationController.getUnreadCount);

// Marcar notificación como leída
router.patch('/:id/read', authMiddleware, notificationController.markAsRead);

// Marcar todas como leídas
router.patch('/read-all', authMiddleware, notificationController.markAllAsRead);

module.exports = router;