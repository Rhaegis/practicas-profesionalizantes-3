const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const SECRET_KEY = process.env.JWT_SECRET || "supersecretkey";

// ======================
// Registro de usuario
// ======================
exports.register = async (req, res) => {
    try {
        const { fullName, email, password, role, trade, registrationNumber, workArea } = req.body;

        // 1. Validar si el email ya existe
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "El email ya está registrado" });
        }

        // 2. Hashear contraseña
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Crear usuario
        const newUser = await User.create({
            full_name: fullName,
            email,
            password: hashedPassword,
            role,
            trade: role === 'trabajador' ? trade : null,
            registration_number: role === 'trabajador' ? registrationNumber : null,
            work_area: role === 'trabajador' ? workArea : null
        });

        // 4. Generar token
        const token = jwt.sign({ id: newUser.id, role: newUser.role }, SECRET_KEY, { expiresIn: '1d' });

        // 5. Eliminar contraseña del objeto antes de devolverlo
        const { password: _, ...userData } = newUser.toJSON();

        res.status(201).json({
            message: "Usuario registrado con éxito",
            user: userData,
            token
        });

    } catch (error) {
        console.error("❌ Error en registro:", error);
        res.status(500).json({ message: "Error en el registro", error });
    }
};

// ======================
// Login de usuario
// ======================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Buscar usuario
        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

        // 2. Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

        // 3. Generar token
        const token = jwt.sign({ id: user.id, role: user.role }, SECRET_KEY, { expiresIn: '1d' });

        // 4. Eliminar contraseña antes de responder
        const { password: _, ...userData } = user.toJSON();

        res.json({
            message: "Login exitoso",
            user: userData,
            token
        });

    } catch (error) {
        console.error("❌ Error en login:", error);
        res.status(500).json({ message: "Error en el login", error });
    }
};
