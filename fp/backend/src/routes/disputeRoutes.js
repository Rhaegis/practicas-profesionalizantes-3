const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear disputa
router.post('/', authMiddleware, disputeController.createDispute);

// Agregar descargo del trabajador
router.patch('/:dispute_id/response', authMiddleware, disputeController.addWorkerResponse);

// Cliente agrega descargo
router.post('/:dispute_id/client-response', authMiddleware, disputeController.addClientResponse);

// Obtener disputas del usuario
router.get('/my-disputes', authMiddleware, disputeController.getUserDisputes);

// Obtener disputa específica
router.get('/:dispute_id', authMiddleware, disputeController.getDisputeById);

module.exports = router;