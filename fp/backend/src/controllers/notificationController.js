const Notification = require('../models/notification');
const { Op } = require('sequelize');

// Obtener notificaciones del usuario
exports.getUserNotifications = async (req, res) => {
    try {
        const user_id = req.user.id;
        const { limit = 20, unread_only = false } = req.query;

        const where = { user_id };

        if (unread_only === 'true') {
            where.is_read = false;
        }

        const notifications = await Notification.findAll({
            where,
            order: [['createdAt', 'DESC']],
            limit: parseInt(limit)
        });

        // Contar no leídas
        const unreadCount = await Notification.count({
            where: { user_id, is_read: false }
        });

        res.json({
            notifications,
            unreadCount
        });

    } catch (error) {
        console.error("Error al obtener notificaciones:", error);
        res.status(500).json({ message: "Error al obtener notificaciones" });
    }
};

// Marcar notificación como leída
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const notification = await Notification.findOne({
            where: { id, user_id }
        });

        if (!notification) {
            return res.status(404).json({ message: "Notificación no encontrada" });
        }

        notification.is_read = true;
        await notification.save();

        res.json({
            message: "Notificación marcada como leída",
            notification
        });

    } catch (error) {
        console.error("Error al marcar notificación:", error);
        res.status(500).json({ message: "Error al marcar notificación" });
    }
};

// Marcar todas como leídas
exports.markAllAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;

        await Notification.update(
            { is_read: true },
            { where: { user_id, is_read: false } }
        );

        res.json({
            message: "Todas las notificaciones marcadas como leídas"
        });

    } catch (error) {
        console.error("Error al marcar todas como leídas:", error);
        res.status(500).json({ message: "Error al marcar notificaciones" });
    }
};

// Obtener contador de no leídas
exports.getUnreadCount = async (req, res) => {
    try {
        const user_id = req.user.id;

        const count = await Notification.count({
            where: { user_id, is_read: false }
        });

        res.json({ count });

    } catch (error) {
        console.error("Error al obtener contador:", error);
        res.status(500).json({ message: "Error al obtener contador" });
    }
};

module.exports = exports;