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
            where: {
                role: 'trabajador',
                work_location_lat: { [Op.not]: null },
                work_location_lng: { [Op.not]: null },
                is_active: true
            },
            attributes: [
                'id',
                'full_name',
                'email',
                'trade',
                'work_area',
                'work_location_lat',
                'work_location_lng',
                'work_radius'
            ]
        });

        const cercanos = trabajadores.filter((t) => {
            const distancia = calcularDistancia(
                parseFloat(lat),
                parseFloat(lng),
                parseFloat(t.work_location_lat),
                parseFloat(t.work_location_lng)
            );
            return distancia <= (radio || 15);
        });

        const trabajadoresFormateados = cercanos.map(t => ({
            id: t.id,
            full_name: t.full_name,
            email: t.email,
            trade: t.trade,
            work_area: t.work_area,
            lat: t.work_location_lat,
            lng: t.work_location_lng
        }));

        res.json({
            count: trabajadoresFormateados.length,
            trabajadores: trabajadoresFormateados
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error al obtener trabajadores cercanos" });
    }
};