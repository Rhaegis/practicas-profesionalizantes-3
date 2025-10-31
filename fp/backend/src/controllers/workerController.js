const User = require('../models/user');
const { Op } = require('sequelize');

// Calcular distancia (fórmula de Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

exports.getNearbyWorkers = async (req, res) => {
    try {
        const { lat, lng, radio } = req.query;

        if (!lat || !lng) {
            return res.status(400).json({ message: "Faltan coordenadas." });
        }

        const trabajadores = await User.findAll({
            where: { role: 'trabajador', lat: { [Op.not]: null }, lng: { [Op.not]: null } },
        });

        const cercanos = trabajadores.filter((t) => {
            const distancia = calcularDistancia(lat, lng, t.lat, t.lng);
            return distancia <= (radio || 10); // 10 km por defecto
        });

        res.json({ count: cercanos.length, trabajadores: cercanos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener trabajadores cercanos" });
    }
};
