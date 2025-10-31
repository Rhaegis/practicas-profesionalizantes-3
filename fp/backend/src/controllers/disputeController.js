const Dispute = require('../models/dispute');
const Service = require('../models/service');
const User = require('../models/user');

// Crear una disputa (cliente reporta problema)
exports.createDispute = async (req, res) => {
    try {
        const { service_id, reason, evidence_url } = req.body;
        const user_id = req.user.id;

        // Verificar que el servicio existe
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el usuario es parte del servicio
        if (service.client_id !== user_id && service.worker_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Determinar quién reporta y contra quién
        let reported_by, reported_against_user_id;

        if (service.client_id === user_id) {
            reported_by = 'client';
            reported_against_user_id = service.worker_id;
        } else {
            reported_by = 'worker';
            reported_against_user_id = service.client_id;
        }

        // Verificar que no exista ya una disputa abierta para este servicio
        const existingDispute = await Dispute.findOne({
            where: {
                service_id,
                status: ['abierta', 'en_revision']
            }
        });

        if (existingDispute) {
            return res.status(400).json({ message: "Ya existe una disputa abierta para este servicio" });
        }

        // Crear la disputa
        const dispute = await Dispute.create({
            service_id,
            reported_by,
            reported_by_user_id: user_id,
            reported_against_user_id,
            reason,
            evidence_url: evidence_url ? JSON.stringify(evidence_url) : null,
            status: 'abierta'
        });

        res.status(201).json({
            message: "Disputa creada exitosamente",
            dispute
        });

    } catch (error) {
        console.error("Error al crear disputa:", error);
        res.status(500).json({ message: "Error al crear la disputa" });
    }
};

// Trabajador agrega descargo
exports.addWorkerResponse = async (req, res) => {
    try {
        const { dispute_id } = req.params;
        const { worker_response, worker_evidence_url } = req.body;
        const user_id = req.user.id;

        const dispute = await Dispute.findByPk(dispute_id, {
            include: [{ model: Service, as: 'service' }]
        });

        if (!dispute) {
            return res.status(404).json({ message: "Disputa no encontrada" });
        }

        // Verificar que el usuario es el trabajador del servicio
        if (dispute.service.worker_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Actualizar descargo
        dispute.worker_response = worker_response;
        dispute.worker_evidence_url = worker_evidence_url ? JSON.stringify(worker_evidence_url) : null;
        dispute.status = 'en_revision';
        await dispute.save();

        res.json({
            message: "Descargo agregado exitosamente",
            dispute
        });

    } catch (error) {
        console.error("Error al agregar descargo:", error);
        res.status(500).json({ message: "Error al agregar descargo" });
    }
};

// Obtener disputas del usuario (como reportador o reportado)
exports.getUserDisputes = async (req, res) => {
    try {
        const user_id = req.user.id;

        const disputes = await Dispute.findAll({
            where: {
                [require('sequelize').Op.or]: [
                    { reported_by_user_id: user_id },
                    { reported_against_user_id: user_id }
                ]
            },
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['id', 'title', 'description']
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'full_name']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'full_name']
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

// Obtener una disputa específica
exports.getDisputeById = async (req, res) => {
    try {
        const { dispute_id } = req.params;
        const user_id = req.user.id;

        const dispute = await Dispute.findByPk(dispute_id, {
            include: [
                {
                    model: Service,
                    as: 'service',
                    attributes: ['id', 'title', 'description', 'client_id', 'worker_id']
                },
                {
                    model: User,
                    as: 'reporter',
                    attributes: ['id', 'full_name', 'email']
                },
                {
                    model: User,
                    as: 'reportedUser',
                    attributes: ['id', 'full_name', 'email']
                }
            ]
        });

        if (!dispute) {
            return res.status(404).json({ message: "Disputa no encontrada" });
        }

        // Verificar que el usuario es parte de la disputa
        if (dispute.reported_by_user_id !== user_id &&
            dispute.reported_against_user_id !== user_id &&
            req.user.role !== 'admin') {
            return res.status(403).json({ message: "No autorizado" });
        }

        res.json({ dispute });

    } catch (error) {
        console.error("Error al obtener disputa:", error);
        res.status(500).json({ message: "Error al obtener la disputa" });
    }
};

module.exports = exports;