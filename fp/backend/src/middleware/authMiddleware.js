// backend/src/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

// Usar la MISMA clave secreta que en authController.js
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

const authMiddleware = (req, res, next) => {
    try {
        // Obtener el token del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Formato esperado: "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token no proporcionado' });
        }

        // Verificar el token usando la MISMA SECRET_KEY
        const decoded = jwt.verify(token, SECRET_KEY);

        // Agregar los datos del usuario al objeto request
        req.user = decoded;

        // Continuar con la siguiente función
        next();
    } catch (error) {
        console.error('❌ Error en authMiddleware:', error.message);
        return res.status(401).json({ message: 'Token inválido o expirado' });
    }
};

module.exports = authMiddleware;