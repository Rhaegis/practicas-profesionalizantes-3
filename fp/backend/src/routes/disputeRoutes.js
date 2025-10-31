const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear disputa
router.post('/', authMiddleware, disputeController.createDispute);

// Agregar descargo del trabajador
router.patch('/:dispute_id/response', authMiddleware, disputeController.addWorkerResponse);

// Obtener disputas del usuario
router.get('/my-disputes', authMiddleware, disputeController.getUserDisputes);

// Obtener disputa específica
router.get('/:dispute_id', authMiddleware, disputeController.getDisputeById);

module.exports = router;