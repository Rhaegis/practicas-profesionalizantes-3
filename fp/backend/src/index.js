const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./models/index');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// 🔗 Definir asociaciones entre modelos
require('./models/associations');

// Rutas
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
console.log('✅ Rutas de auth cargadas: /api/auth');

const workerRoutes = require('./routes/workerRoutes');
app.use('/api/workers', workerRoutes);
console.log('✅ Rutas de workers cargadas: /api/workers');

const serviceRoutes = require('./routes/serviceRoutes');
app.use('/api/services', serviceRoutes);
console.log('✅ Rutas de services cargadas: /api/services');

const verificationRoutes = require('./routes/verificationRoutes');
app.use('/api/verification', verificationRoutes);
console.log('✅ Rutas de verification cargadas: /api/verification');

const ratingRoutes = require('./routes/ratingRoutes');
app.use('/api/ratings', ratingRoutes);
console.log('✅ Rutas de ratings cargadas: /api/ratings');

const disputeRoutes = require('./routes/disputeRoutes');
app.use('/api/disputes', disputeRoutes);
console.log('✅ Rutas de disputes cargadas: /api/disputes');

const workSettingsRoutes = require('./routes/workSettingsRoutes');
app.use('/api/work-settings', workSettingsRoutes);
console.log('✅ Rutas de work-settings cargadas: /api/work-settings');

const agendaRoutes = require('./routes/agendaRoutes');
app.use('/api/agenda', agendaRoutes);
console.log('✅ Rutas de agenda cargadas: /api/agenda');

const adminRoutes = require('./routes/adminRoutes');
app.use('/api/admin', adminRoutes);
console.log('✅ Rutas de admin cargadas: /api/admin');

const notificationRoutes = require('./routes/notificationRoutes');
app.use('/api/notifications', notificationRoutes);
console.log('✅ Rutas de notifications cargadas: /api/notifications');

// Sincronizar BD
sequelize.sync()
    .then(() => console.log("✅ Base de datos sincronizada"))
    .catch(err => console.error("❌ Error al sincronizar DB:", err));

// Servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});