const Service = require('../models/service');
const User = require('../models/user');
const Rating = require('../models/rating');
const Dispute = require('../models/dispute');
const { notifyNewService, notifyServiceAccepted, notifyServiceStarted } = require('../helpers/notificationHelper');

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

        // Obtener nombre del cliente para la notificación
        const client = await User.findByPk(client_id);

        // Crear notificación para el trabajador
        await notifyNewService(worker_id, service.id, client.full_name);

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
                },
                {
                    model: Dispute,
                    as: 'disputes',
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
                },
                {
                    model: Dispute,
                    as: 'disputes',
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

// Actualizar el estado de una solicitud (solo trabajador)
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

        // Actualizar estado
        service.status = status;
        await service.save();

        // Notificar si el trabajo fue iniciado
        if (status === 'in_progress') {
            const worker = await User.findByPk(user_id);
            await notifyServiceStarted(service.client_id, service.id, worker.full_name);
        }

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

        // Obtener nombre del trabajador para la notificación
        const worker = await User.findByPk(worker_id);

        // Crear notificación para el cliente
        await notifyServiceAccepted(service.client_id, service.id, worker.full_name);

        res.json({
            message: "Solicitud aceptada exitosamente",
            service
        });

    } catch (error) {
        console.error("Error al aceptar solicitud:", error);
        res.status(500).json({ message: "Error al aceptar la solicitud" });
    }
};

// Cancelar servicio (cliente o trabajador)
exports.cancelService = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;

        const service = await Service.findByPk(id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el usuario es parte del servicio (cliente o trabajador)
        if (service.client_id !== user_id && service.worker_id !== user_id) {
            return res.status(403).json({ message: "No estás autorizado para cancelar este servicio" });
        }

        // Solo se puede cancelar si está en pending o accepted
        if (service.status !== 'pending' && service.status !== 'accepted') {
            return res.status(400).json({
                message: "Solo se pueden cancelar servicios pendientes o aceptados"
            });
        }

        // Cambiar estado a cancelled
        service.status = 'cancelled';
        await service.save();

        res.json({
            message: "Servicio cancelado exitosamente",
            service
        });

    } catch (error) {
        console.error("Error al cancelar servicio:", error);
        res.status(500).json({ message: "Error al cancelar el servicio" });
    }
};

// Calcular distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distancia en km
    return distance;
}

// Obtener solicitudes cercanas (dentro del radio del trabajador)
exports.getNearbyServices = async (req, res) => {
    try {
        const worker_id = req.user.id;

        // Obtener datos del trabajador
        const worker = await User.findByPk(worker_id);
        if (!worker) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        // Verificar que tenga ubicación configurada
        if (!worker.work_location_lat || !worker.work_location_lng) {
            return res.status(400).json({
                message: "Debes configurar tu zona de trabajo primero",
                needsConfiguration: true
            });
        }

        // Obtener todas las solicitudes pendientes
        const services = await Service.findAll({
            where: {
                status: 'pending',
                worker_id: worker_id // Solo solicitudes asignadas a este trabajador
            },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'full_name', 'email']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        // Filtrar por distancia y agregar campo de distancia
        const servicesWithDistance = services
            .map(service => {
                // Si el servicio no tiene ubicación, no se puede calcular distancia
                if (!service.service_location_lat || !service.service_location_lng) {
                    return null;
                }

                const distance = calculateDistance(
                    worker.work_location_lat,
                    worker.work_location_lng,
                    service.service_location_lat,
                    service.service_location_lng
                );

                return {
                    ...service.toJSON(),
                    distance: Math.round(distance * 10) / 10 // Redondear a 1 decimal
                };
            })
            .filter(service => service !== null) // Eliminar servicios sin ubicación
            .filter(service => service.distance <= worker.work_radius) // Solo dentro del radio
            .sort((a, b) => a.distance - b.distance); // Ordenar por cercanía

        res.json({
            services: servicesWithDistance,
            workerRadius: worker.work_radius,
            workerLocation: {
                lat: worker.work_location_lat,
                lng: worker.work_location_lng
            }
        });

    } catch (error) {
        console.error("Error al obtener solicitudes cercanas:", error);
        res.status(500).json({ message: "Error al obtener solicitudes cercanas" });
    }
};

module.exports = exports;