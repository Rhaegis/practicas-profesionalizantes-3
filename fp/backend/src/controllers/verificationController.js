const VerificationCode = require('../models/verificationCode');
const Service = require('../models/service');
const { notifyCodeGenerated, notifyServiceCompleted } = require('../helpers/notificationHelper');

// Generar código de verificación
exports.generateCode = async (req, res) => {
    try {
        const { service_id } = req.body;
        const user_id = req.user.id;

        // Verificar que el servicio existe
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el usuario es el trabajador del servicio
        if (service.worker_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Verificar que el servicio está en progreso
        if (service.status !== 'in_progress') {
            return res.status(400).json({ message: "El servicio debe estar en progreso" });
        }

        // Verificar que no existe un código activo
        const existingCode = await VerificationCode.findOne({
            where: { service_id, is_used: false }
        });

        if (existingCode) {
            return res.json({
                message: "Ya existe un código activo",
                code: existingCode.code
            });
        }

        // Generar código aleatorio de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Guardar código
        const verificationCode = await VerificationCode.create({
            service_id,
            code
        });

        // Notificar al cliente que el código está disponible
        await notifyCodeGenerated(service.client_id, service_id);

        // Notificar al cliente que el trabajo fue completado
        await notifyServiceCompleted(service.client_id, service_id);

        res.status(201).json({
            message: "Código de verificación generado",
            code: verificationCode.code
        });

    } catch (error) {
        console.error("Error al generar código:", error);
        res.status(500).json({ message: "Error al generar código de verificación" });
    }
};

// Verificar código ingresado por el trabajador
exports.verifyCode = async (req, res) => {
    try {
        const { service_id, code } = req.body;
        const user_id = req.user.id;

        // Verificar que el servicio existe
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el usuario es el trabajador del servicio
        if (service.worker_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Buscar el código
        const verificationCode = await VerificationCode.findOne({
            where: { service_id, code, is_used: false }
        });

        if (!verificationCode) {
            return res.status(400).json({
                message: "Código inválido o ya utilizado",
                valid: false
            });
        }

        // Marcar código como usado
        verificationCode.is_used = true;
        verificationCode.verified_at = new Date();
        await verificationCode.save();

        // Actualizar servicio a completado
        service.status = 'completed';
        await service.save();

        res.json({
            message: "Código verificado. Trabajo completado exitosamente",
            valid: true,
            service
        });

    } catch (error) {
        console.error("Error al verificar código:", error);
        res.status(500).json({ message: "Error al verificar código" });
    }
};

// Obtener código activo de un servicio (para que el cliente lo vea)
exports.getActiveCode = async (req, res) => {
    try {
        const { service_id } = req.params;
        const user_id = req.user.id;

        // Verificar que el servicio existe
        const service = await Service.findByPk(service_id);
        if (!service) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }

        // Verificar que el usuario es el cliente del servicio
        if (service.client_id !== user_id) {
            return res.status(403).json({ message: "No autorizado" });
        }

        // Buscar código activo
        const verificationCode = await VerificationCode.findOne({
            where: { service_id, is_used: false }
        });

        if (!verificationCode) {
            return res.status(404).json({ message: "No hay código activo" });
        }

        res.json({
            code: verificationCode.code,
            generated_at: verificationCode.generated_at
        });

    } catch (error) {
        console.error("Error al obtener código:", error);
        res.status(500).json({ message: "Error al obtener código" });
    }
};

module.exports = exports;