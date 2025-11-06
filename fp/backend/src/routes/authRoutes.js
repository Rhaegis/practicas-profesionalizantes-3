const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.post('/register', authController.register);
router.post('/login', authController.login);

// TEMPORAL: Crear admin (eliminar en producción)
router.post('/create-admin', authController.createAdmin);

module.exports = router;
