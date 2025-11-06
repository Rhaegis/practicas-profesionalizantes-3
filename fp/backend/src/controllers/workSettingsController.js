const User = require('../models/user');

// Obtener configuración de zona de trabajo
exports.getWorkSettings = async (req, res) => {
    try {
        const user_id = req.user.id;

        const user = await User.findByPk(user_id, {
            attributes: [
                'id',
                'full_name',
                'work_radius',
                'work_location_lat',
                'work_location_lng',
                'work_schedule',
                'immediate_availability',
                'is_active',
                'work_area'
            ]
        });

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ settings: user });

    } catch (error) {
        console.error("Error al obtener configuración:", error);
        res.status(500).json({ message: "Error al obtener configuración" });
    }
};

// Actualizar configuración de zona de trabajo
exports.updateWorkSettings = async (req, res) => {
    try {
        const user_id = req.user.id;
        const {
            work_radius,
            work_location_lat,
            work_location_lng,
            work_schedule,
            immediate_availability,
            is_active
        } = req.body;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Verificar que es un trabajador
        if (user.role !== 'trabajador') {
            return res.status(403).json({ message: "Solo los trabajadores pueden configurar zona de trabajo" });
        }

        // Actualizar campos
        if (work_radius !== undefined) user.work_radius = work_radius;
        if (work_location_lat !== undefined) user.work_location_lat = work_location_lat;
        if (work_location_lng !== undefined) user.work_location_lng = work_location_lng;
        if (work_schedule !== undefined) user.work_schedule = work_schedule;
        if (immediate_availability !== undefined) user.immediate_availability = immediate_availability;
        if (is_active !== undefined) user.is_active = is_active;

        await user.save();

        res.json({
            message: "Configuración actualizada exitosamente",
            settings: {
                work_radius: user.work_radius,
                work_location_lat: user.work_location_lat,
                work_location_lng: user.work_location_lng,
                work_schedule: user.work_schedule,
                immediate_availability: user.immediate_availability,
                is_active: user.is_active
            }
        });

    } catch (error) {
        console.error("Error al actualizar configuración:", error);
        res.status(500).json({ message: "Error al actualizar configuración" });
    }
};

// Activar/Desactivar disponibilidad inmediata
exports.toggleImmediateAvailability = async (req, res) => {
    try {
        const user_id = req.user.id;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Toggle
        user.immediate_availability = !user.immediate_availability;
        await user.save();

        res.json({
            message: `Disponibilidad inmediata ${user.immediate_availability ? 'activada' : 'desactivada'}`,
            immediate_availability: user.immediate_availability
        });

    } catch (error) {
        console.error("Error al cambiar disponibilidad:", error);
        res.status(500).json({ message: "Error al cambiar disponibilidad" });
    }
};

// Activar/Desactivar cuenta
exports.toggleAccountStatus = async (req, res) => {
    try {
        const user_id = req.user.id;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Toggle
        user.is_active = !user.is_active;
        await user.save();

        res.json({
            message: `Cuenta ${user.is_active ? 'activada' : 'pausada'}`,
            is_active: user.is_active
        });

    } catch (error) {
        console.error("Error al cambiar estado de cuenta:", error);
        res.status(500).json({ message: "Error al cambiar estado de cuenta" });
    }
};

module.exports = exports;