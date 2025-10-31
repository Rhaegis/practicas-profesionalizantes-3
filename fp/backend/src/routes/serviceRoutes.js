const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const authMiddleware = require('../middleware/authMiddleware'); // Necesitamos autenticación

// Crear nueva solicitud (solo clientes)
router.post('/', authMiddleware, serviceController.createService);

// Ver solicitudes del cliente
router.get('/my-requests', authMiddleware, serviceController.getClientServices);

// Ver solicitudes recibidas por el trabajador
router.get('/my-jobs', authMiddleware, serviceController.getWorkerServices);

// Actualizar estado de una solicitud (solo trabajador)
router.patch('/:id/status', authMiddleware, serviceController.updateServiceStatus);

module.exports = router;