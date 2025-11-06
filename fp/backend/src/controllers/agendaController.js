const Service = require('../models/service');
const User = require('../models/user');
const AvailabilityBlock = require('../models/availabilityBlock');
const { Op } = require('sequelize');

// Obtener agenda del trabajador (trabajos programados)
exports.getWorkerAgenda = async (req, res) => {
    try {
        const worker_id = req.user.id;
        const { month, year } = req.query;

        // Construir fechas de inicio y fin del mes
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Obtener servicios del mes
        const services = await Service.findAll({
            where: {
                worker_id,
                scheduled_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            include: [
                {
                    model: User,
                    as: 'client',
                    attributes: ['id', 'full_name', 'email']
                }
            ],
            order: [['scheduled_date', 'ASC']]
        });

        // Obtener bloques de disponibilidad del mes
        const blocks = await AvailabilityBlock.findAll({
            where: {
                worker_id,
                date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            order: [['date', 'ASC']]
        });

        res.json({
            services,
            blocks,
            month: parseInt(month),
            year: parseInt(year)
        });

    } catch (error) {
        console.error("Error al obtener agenda:", error);
        res.status(500).json({ message: "Error al obtener agenda" });
    }
};

// Obtener configuración de horarios semanales
exports.getWeeklySchedule = async (req, res) => {
    try {
        const worker_id = req.user.id;

        const worker = await User.findByPk(worker_id, {
            attributes: ['id', 'full_name', 'work_schedule']
        });

        if (!worker) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        res.json({
            schedule: worker.work_schedule || getDefaultSchedule()
        });

    } catch (error) {
        console.error("Error al obtener horarios:", error);
        res.status(500).json({ message: "Error al obtener horarios" });
    }
};

// Actualizar configuración de horarios semanales
exports.updateWeeklySchedule = async (req, res) => {
    try {
        const worker_id = req.user.id;
        const { schedule } = req.body;

        // Validar formato del schedule
        if (!validateSchedule(schedule)) {
            return res.status(400).json({ message: "Formato de horario inválido" });
        }

        const worker = await User.findByPk(worker_id);

        if (!worker) {
            return res.status(404).json({ message: "Trabajador no encontrado" });
        }

        worker.work_schedule = schedule;
        await worker.save();

        res.json({
            message: "Horarios actualizados exitosamente",
            schedule: worker.work_schedule
        });

    } catch (error) {
        console.error("Error al actualizar horarios:", error);
        res.status(500).json({ message: "Error al actualizar horarios" });
    }
};

// Bloquear/desbloquear fecha específica
exports.toggleDateBlock = async (req, res) => {
    try {
        const worker_id = req.user.id;
        const { date, reason } = req.body;

        if (!date) {
            return res.status(400).json({ message: "Fecha requerida" });
        }

        // Verificar si ya existe un bloqueo para esa fecha
        const existingBlock = await AvailabilityBlock.findOne({
            where: { worker_id, date }
        });

        if (existingBlock) {
            // Si existe, eliminarlo (desbloquear)
            await existingBlock.destroy();
            return res.json({
                message: "Fecha desbloqueada",
                blocked: false,
                date
            });
        } else {
            // Si no existe, crearlo (bloquear)
            const block = await AvailabilityBlock.create({
                worker_id,
                date,
                reason: reason || 'No disponible',
                is_available: false
            });
            return res.json({
                message: "Fecha bloqueada",
                blocked: true,
                date,
                block
            });
        }

    } catch (error) {
        console.error("Error al bloquear/desbloquear fecha:", error);
        res.status(500).json({ message: "Error al gestionar disponibilidad" });
    }
};

// Obtener estadísticas de agenda
exports.getAgendaStats = async (req, res) => {
    try {
        const worker_id = req.user.id;
        const { month, year } = req.query;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Contar servicios por estado
        const stats = await Service.count({
            where: {
                worker_id,
                scheduled_date: {
                    [Op.between]: [startDate, endDate]
                }
            },
            group: ['status']
        });

        res.json({ stats });

    } catch (error) {
        console.error("Error al obtener estadísticas:", error);
        res.status(500).json({ message: "Error al obtener estadísticas" });
    }
};

// Horario por defecto (9am - 6pm, lunes a viernes)
function getDefaultSchedule() {
    return {
        monday: { enabled: true, start: '09:00', end: '18:00' },
        tuesday: { enabled: true, start: '09:00', end: '18:00' },
        wednesday: { enabled: true, start: '09:00', end: '18:00' },
        thursday: { enabled: true, start: '09:00', end: '18:00' },
        friday: { enabled: true, start: '09:00', end: '18:00' },
        saturday: { enabled: false, start: '09:00', end: '14:00' },
        sunday: { enabled: false, start: '09:00', end: '14:00' }
    };
}

// Validar formato de horario
function validateSchedule(schedule) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
        if (!schedule[day]) return false;
        if (typeof schedule[day].enabled !== 'boolean') return false;
        if (!schedule[day].start || !schedule[day].end) return false;
    }

    return true;
}

module.exports = exports;