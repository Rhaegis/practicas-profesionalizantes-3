const express = require('express');
const router = express.Router();
const verificationController = require('../controllers/verificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Generar código (trabajador marca trabajo como completado)
router.post('/generate', authMiddleware, verificationController.generateCode);

// Verificar código (trabajador ingresa código que le dio el cliente)
router.post('/verify', authMiddleware, verificationController.verifyCode);

// Obtener código activo (cliente ve el código para dárselo al trabajador)
router.get('/code/:service_id', authMiddleware, verificationController.getActiveCode);

module.exports = router;