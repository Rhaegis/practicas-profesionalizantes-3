const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware para verificar que es admin
const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: "Acceso denegado. Solo administradores." });
    }
    next();
};

// Dashboard: estadísticas globales
router.get('/stats', authMiddleware, isAdmin, adminController.getDashboardStats);

// Disputas
router.get('/disputes', authMiddleware, isAdmin, adminController.getAllDisputes);
router.patch('/disputes/:dispute_id/resolve', authMiddleware, isAdmin, adminController.resolveDispute);

// Usuarios
router.get('/users', authMiddleware, isAdmin, adminController.getAllUsers);
router.get('/users/:user_id', authMiddleware, isAdmin, adminController.getUserDetails);
router.patch('/users/:user_id/toggle-status', authMiddleware, isAdmin, adminController.toggleUserStatus);

module.exports = router;