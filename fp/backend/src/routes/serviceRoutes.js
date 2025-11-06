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

// Actualizar estado de una solicitud (solo trabajador)
router.patch('/:id/status', authMiddleware, serviceController.updateServiceStatus);

// Aceptar solicitud (trabajador)
router.patch('/:id/accept', authMiddleware, serviceController.acceptService);

// Obtener solicitudes cercanas (filtradas por zona del trabajador)
router.get('/nearby', authMiddleware, serviceController.getNearbyServices);

// Actualizar estado de servicio
router.patch('/:id/status', authMiddleware, serviceController.updateServiceStatus);

module.exports = router;