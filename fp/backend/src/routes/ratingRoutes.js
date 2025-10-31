const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');

// Crear calificación (cliente o trabajador califican después de completar un servicio)
router.post('/', authMiddleware, ratingController.createRating);

// Obtener todas las calificaciones de un usuario
router.get('/user/:user_id', ratingController.getUserRatings);

// Obtener promedio de calificación de un usuario
router.get('/user/:user_id/average', ratingController.getUserAverageRating);

// Verificar si un usuario puede calificar un servicio
router.get('/can-rate/:service_id', authMiddleware, ratingController.canRateService);

module.exports = router;