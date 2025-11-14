const Rating = require('../models/rating');
const Service = require('../models/service');
const User = require('../models/user');
const { Op } = require('sequelize');
const sequelize = require('../config/database');
const { notifyNewRating } = require('../helpers/notificationHelper');

// Crear calificación
exports.createRating = async (req, res) => {
    try {
        const { service_id, rating, comment } = req.body;
        const user_id = req.user.id;

        // Validar que el rating esté entre 1 y 5
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ message: "La calificación debe ser entre 1 y 5" });
        }

        // Verificar que el servicio existe
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el servicio está completado
        if (service.status !== 'completed') {
            return res.status(400).json({ message: "Solo puedes calificar servicios completados" });
        }

        // Determinar quién califica y a quién
        let rater_type, rated_id;

        if (service.client_id === user_id) {
            // El cliente califica al trabajador
            rater_type = 'client';
            rated_id = service.worker_id;
        } else if (service.worker_id === user_id) {
            // El trabajador califica al cliente
            rater_type = 'worker';
            rated_id = service.client_id;
        } else {
            return res.status(403).json({ message: "No estás autorizado a calificar este servicio" });
        }

        // Verificar que no haya calificado ya
        const existingRating = await Rating.findOne({
            where: { service_id, rater_id: user_id }
        });

        if (existingRating) {
            return res.status(400).json({ message: "Ya has calificado este servicio" });
        }

        // Crear la calificación
        const newRating = await Rating.create({
            service_id,
            rater_id: user_id,
            rated_id,
            rater_type,
            rating,
            comment: comment || null
        });

        // Obtener nombre del calificador
        const rater = await User.findByPk(user_id);

        // Notificar al calificado
        await notifyNewRating(rated_id, rater.full_name, rating);

        res.status(201).json({
            message: "Calificación creada exitosamente",
            rating: newRating
        });

    } catch (error) {
        console.error("Error al crear calificación:", error);
        res.status(500).json({ message: "Error al crear calificación" });
    }
};

// Obtener calificaciones de un usuario
exports.getUserRatings = async (req, res) => {
    try {
        const { user_id } = req.params;

        const ratings = await Rating.findAll({
            where: { rated_id: user_id },
            include: [
                {
                    model: User,
                    as: 'rater',
                    attributes: ['id', 'full_name']
                },
                {
                    model: Service,
                    as: 'service',
                    attributes: ['id', 'title']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ ratings });

    } catch (error) {
        console.error("Error al obtener calificaciones:", error);
        res.status(500).json({ message: "Error al obtener calificaciones" });
    }
};

// Obtener promedio de calificación de un usuario
exports.getUserAverageRating = async (req, res) => {
    try {
        const { user_id } = req.params;

        const result = await Rating.findAll({
            where: { rated_id: user_id },
            attributes: [
                [sequelize.fn('AVG', sequelize.col('rating')), 'average'],
                [sequelize.fn('COUNT', sequelize.col('id')), 'count']
            ],
            raw: true
        });

        const average = parseFloat(result[0].average) || 0;
        const count = parseInt(result[0].count) || 0;

        res.json({
            user_id: parseInt(user_id),
            average: Math.round(average * 10) / 10, // Redondear a 1 decimal
            count
        });

    } catch (error) {
        console.error("Error al obtener promedio:", error);
        res.status(500).json({ message: "Error al obtener promedio de calificación" });
    }
};

// Verificar si un usuario puede calificar un servicio
exports.canRateService = async (req, res) => {
    try {
        const { service_id } = req.params;
        const user_id = req.user.id;

        // Verificar que el servicio existe y está completado
        const service = await Service.findByPk(service_id);
        if (!service || service.status !== 'completed') {
            return res.json({ can_rate: false, reason: 'service_not_completed' });
        }

        // Verificar que el usuario es parte del servicio
        if (service.client_id !== user_id && service.worker_id !== user_id) {
            return res.json({ can_rate: false, reason: 'not_authorized' });
        }

        // Verificar que no haya calificado ya
        const existingRating = await Rating.findOne({
            where: { service_id, rater_id: user_id }
        });

        if (existingRating) {
            return res.json({ can_rate: false, reason: 'already_rated' });
        }

        res.json({ can_rate: true });

    } catch (error) {
        console.error("Error al verificar si puede calificar:", error);
        res.status(500).json({ message: "Error al verificar permisos" });
    }
};

module.exports = exports;