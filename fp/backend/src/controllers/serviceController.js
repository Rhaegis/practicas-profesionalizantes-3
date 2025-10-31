const Service = require('../models/service');
const User = require('../models/user');
const Rating = require('../models/rating');

// Crear una nueva solicitud de servicio
exports.createService = async (req, res) => {
    try {
        const { worker_id, title, description, service_location_lat, service_location_lng, service_address, scheduled_date } = req.body;
        const client_id = req.user.id;

        // Verificar que el trabajador existe
        const worker = await User.findOne({ where: { id: worker_id, role: 'trabajador' } });
        if (!worker) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        // Crear la solicitud
        const service = await Service.create({
            client_id,
            worker_id,
            title,
            description,
            service_location_lat,
            service_location_lng,
            service_address,
            scheduled_date,
            status: 'pending'
        });

        res.status(201).json({
            message: "Solicitud de servicio creada exitosamente",
            service
        });
    } catch (error) {
        console.error("Error al crear solicitud:", error);
        res.status(500).json({ message: "Error al crear la solicitud de servicio" });
    }
};

// Obtener todas las solicitudes de un cliente
exports.getClientServices = async (req, res) => {
    try {
        const client_id = req.user.id;

        const services = await Service.findAll({
            where: { client_id },
            include: [
                {
                    model: User,
                    as: 'worker',
                    attributes: ['id', 'full_name', 'email', 'trade', 'work_area']
                },
                {
                    model: Rating,
                    as: 'ratings',
                    where: { rater_id: client_id },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ services });
    } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        res.status(500).json({ message: "Error al obtener las solicitudes" });
    }
};

// Obtener todas las solicitudes recibidas por un trabajador
exports.getWorkerServices = async (req, res) => {
    try {
        const worker_id = req.user.id;

        const services = await Service.findAll({
            where: { worker_id },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'full_name', 'email']
                },
                {
                    model: Rating,
                    as: 'ratings',
                    where: { rater_id: worker_id },
                    required: false
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ services });
    } catch (error) {
        console.error("Error al obtener solicitudes:", error);
        res.status(500).json({ message: "Error al obtener las solicitudes" });
    }
};

// Obtener TODOS los servicios (para solicitudes disponibles)
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.findAll({
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'full_name', 'email']
                },
                {
                    model: User,
                    as: 'worker',
                    attributes: ['id', 'full_name', 'email', 'trade']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ services });
    } catch (error) {
        console.error("Error al obtener todos los servicios:", error);
        res.status(500).json({ message: "Error al obtener los servicios" });
    }
};

// Actualizar el estado de una solicitud
exports.updateServiceStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user_id = req.user.id;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        // Verificar que el usuario es el trabajador asignado
        if (service.worker_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        service.status = status;
        await service.save();

        res.json({
            message: "Estado actualizado exitosamente",
            service
        });
    } catch (error) {
        console.error("Error al actualizar estado:", error);
        res.status(500).json({ message: "Error al actualizar el estado" });
    }
};

// Aceptar una solicitud (trabajador acepta el trabajo)
exports.acceptService = async (req, res) => {
    try {
        const { id } = req.params;
        const worker_id = req.user.id;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: "Solicitud no encontrada" });
        }

        // Verificar que el usuario es el trabajador asignado
        if (service.worker_id !== worker_id) {
            return res.status(403).json({ message: "No estás autorizado para aceptar esta solicitud" });
        }

        // Verificar que está en estado pending
        if (service.status !== 'pending') {
            return res.status(400).json({ message: "Esta solicitud ya no está disponible" });
        }

        // Cambiar estado a accepted
        service.status = 'accepted';
        await service.save();

        res.json({
            message: "Solicitud aceptada exitosamente",
            service
        });
    } catch (error) {
        console.error("Error al aceptar solicitud:", error);
        res.status(500).json({ message: "Error al aceptar la solicitud" });
    }
};

module.exports = exports;