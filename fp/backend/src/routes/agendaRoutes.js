const express = require('express');
const router = express.Router();
const agendaController = require('../controllers/agendaController');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener agenda del mes (trabajos programados)
router.get('/month', authMiddleware, agendaController.getWorkerAgenda);

// Obtener horarios semanales
router.get('/schedule', authMiddleware, agendaController.getWeeklySchedule);

// Actualizar horarios semanales
router.patch('/schedule', authMiddleware, agendaController.updateWeeklySchedule);

// Bloquear/desbloquear fecha específica
router.post('/toggle-block', authMiddleware, agendaController.toggleDateBlock);

// Obtener estadísticas
router.get('/stats', authMiddleware, agendaController.getAgendaStats);

module.exports = router;