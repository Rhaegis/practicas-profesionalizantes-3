const express = require('express');
const router = express.Router();
const workSettingsController = require('../controllers/workSettingsController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener configuración
router.get('/', authMiddleware, workSettingsController.getWorkSettings);

// Actualizar configuración completa
router.patch('/', authMiddleware, workSettingsController.updateWorkSettings);

// Toggle disponibilidad inmediata
router.patch('/toggle-availability', authMiddleware, workSettingsController.toggleImmediateAvailability);

// Toggle estado de cuenta (activa/pausada)
router.patch('/toggle-status', authMiddleware, workSettingsController.toggleAccountStatus);

module.exports = router;