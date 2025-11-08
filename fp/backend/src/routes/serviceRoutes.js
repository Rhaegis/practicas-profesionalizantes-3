const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear nueva solicitud (solo clientes)
router.post('/', authMiddleware, serviceController.createService);

// Ver solicitudes del cliente
router.get('/my-requests', authMiddleware, serviceController.getClientServices);

// Ver solicitudes recibidas por el trabajador
router.get('/my-jobs', authMiddleware, serviceController.getWorkerServices);

// Obtener TODOS los servicios (para solicitudes disponibles)
router.get('/all', authMiddleware, serviceController.getAllServices);

// Obtener solicitudes cercanas (filtradas por zona del trabajador)
router.get('/nearby', authMiddleware, serviceController.getNearbyServices);

// Aceptar solicitud (trabajador)
router.patch('/:id/accept', authMiddleware, serviceController.acceptService);

// Actualizar estado de servicio (trabajador)
router.patch('/:id/status', authMiddleware, serviceController.updateServiceStatus);

// Cancelar servicio (cliente o trabajador)
router.patch('/:id/cancel', authMiddleware, serviceController.cancelService);

module.exports = router;