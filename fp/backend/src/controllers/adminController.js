const User = require('../models/user');
const Service = require('../models/service');
const Dispute = require('../models/dispute');
const Rating = require('../models/rating');
const { Op } = require('sequelize');
const { notifyDisputeResolved } = require('../helpers/notificationHelper');

// Dashboard: Obtener métricas globales
exports.getDashboardStats = async (req, res) => {
    try {
        // Contar usuarios por rol
        const totalUsers = await User.count();
        const totalClients = await User.count({ where: { role: 'cliente' } });
        const totalWorkers = await User.count({ where: { role: 'trabajador' } });

        // Contar servicios por estado
        const totalServices = await Service.count();
        const pendingServices = await Service.count({ where: { status: 'pending' } });
        const completedServices = await Service.count({ where: { status: 'completed' } });

        // Contar disputas por estado
        const totalDisputes = await Dispute.count();
        const openDisputes = await Dispute.count({ where: { status: 'abierta' } });
        const inReviewDisputes = await Dispute.count({ where: { status: 'en_revision' } });

        // Calificación promedio global
        const avgRating = await Rating.findOne({
            attributes: [
                [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average']
            ],
            raw: true
        });

        res.json({
            users: {
                total: totalUsers,
                clients: totalClients,
                workers: totalWorkers
            },
            services: {
                total: totalServices,
                pending: pendingServices,
                completed: completedServices
            },
            disputes: {
                total: totalDisputes,
                open: openDisputes,
                inReview: inReviewDisputes
            },
            rating: {
                average: parseFloat(avgRating.average || 0).toFixed(2)
            }
        });

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ message: "Error al obtener estadísticas" });
    }
};

// Obtener todas las disputas (para admin)
exports.getAllDisputes = async (req, res) => {
    try {
        const { status } = req.query;

        const where = {};
        if (status) {
            where.status = status;
        }

        const disputes = await Dispute.findAll({
            where,
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['id', 'title', 'description']
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'full_name', 'email', 'role']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'full_name', 'email', 'role']
                },
                {
                    model: User,
                    as: 'resolver',
                    attributes: ['id', 'full_name'],
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ disputes });

    } catch (error) {
        console.error("Error al obtener disputas:", error);
        res.status(500).json({ message: "Error al obtener disputas" });
    }
};

// Resolver disputa (admin)
exports.resolveDispute = async (req, res) => {
    try {
        const { dispute_id } = req.params;
        const { resolution, admin_notes } = req.body;
        const admin_id = req.user.id;

        // Validar resolución
        const validResolutions = ['resuelta_cliente', 'resuelta_trabajador', 'rechazada'];
        if (!validResolutions.includes(resolution)) {
            return res.status(400).json({ message: "Resolución inválida" });
        }

        const dispute = await Dispute.findByPk(dispute_id);

        if (!dispute) {
            return res.status(404).json({ message: "Disputa no encontrada" });
        }

        // Actualizar disputa
        dispute.status = resolution;
        dispute.admin_notes = admin_notes || null;
        dispute.resolved_by = admin_id;
        await dispute.save();

        // Notificar a ambas partes
        await notifyDisputeResolved(dispute.reported_by_user_id, dispute.id, resolution);
        await notifyDisputeResolved(dispute.reported_against_user_id, dispute.id, resolution);

        res.json({
            message: "Disputa resuelta exitosamente",
            dispute
        });

    } catch (error) {
        console.error("Error al resolver disputa:", error);
        res.status(500).json({ message: "Error al resolver disputa" });
    }
};

// Obtener todos los usuarios (para admin)
exports.getAllUsers = async (req, res) => {
    try {
        const { role, search } = req.query;

        const where = {};

        if (role) {
            where.role = role;
        }

        if (search) {
            where[Op.or] = [
                { full_name: { [Op.like]: `%${search}%` } },
                { email: { [Op.like]: `%${search}%` } }
            ];
        }

        const users = await User.findAll({
            where,
            attributes: ['id', 'full_name', 'email', 'role', 'trade', 'is_active', 'createdAt'],
            order: [['createdAt', 'DESC']]
        });

        res.json({ users });

    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json({ message: "Error al obtener usuarios" });
    }
};

// Obtener detalles de un usuario
exports.getUserDetails = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findByPk(user_id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Estadísticas adicionales
        let stats = {};

        if (user.role === 'trabajador') {
            // Servicios completados
            const completedServices = await Service.count({
                where: { worker_id: user_id, status: 'completed' }
            });

            // Calificación promedio
            const avgRating = await Rating.findOne({
                where: { rated_user_id: user_id },
                attributes: [
                    [require('sequelize').fn('AVG', require('sequelize').col('rating')), 'average']
                ],
                raw: true
            });

            stats = {
                completedServices,
                averageRating: parseFloat(avgRating.average || 0).toFixed(2)
            };
        } else if (user.role === 'cliente') {
            // Servicios solicitados
            const totalServices = await Service.count({
                where: { client_id: user_id }
            });

            stats = {
                totalServices
            };
        }

        res.json({ user, stats });

    } catch (error) {
        console.error("Error al obtener detalles de usuario:", error);
        res.status(500).json({ message: "Error al obtener detalles" });
    }
};

// Activar/Desactivar usuario
exports.toggleUserStatus = async (req, res) => {
    try {
        const { user_id } = req.params;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // No permitir desactivar admins
        if (user.role === 'admin') {
            return res.status(403).json({ message: "No se puede desactivar un administrador" });
        }

        user.is_active = !user.is_active;
        await user.save();

        res.json({
            message: `Usuario ${user.is_active ? 'activado' : 'desactivado'} exitosamente`,
            user: {
                id: user.id,
                full_name: user.full_name,
                is_active: user.is_active
            }
        });

    } catch (error) {
        console.error("Error al cambiar estado de usuario:", error);
        res.status(500).json({ message: "Error al cambiar estado de usuario" });
    }
};

module.exports = exports;