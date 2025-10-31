const User = require('./user');
const Service = require('./service');
const VerificationCode = require('./verificationCode');
const Rating = require('./rating');

// Asociaciones User ↔ Service (Cliente)
User.hasMany(Service, { foreignKey: 'client_id', as: 'clientServices' });
Service.belongsTo(User, { foreignKey: 'client_id', as: 'client' });

// Asociaciones User ↔ Service (Trabajador)
User.hasMany(Service, { foreignKey: 'worker_id', as: 'workerServices' });
Service.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

// Asociación Service ↔ VerificationCode
Service.hasOne(VerificationCode, { foreignKey: 'service_id', as: 'verificationCode' });
VerificationCode.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Asociaciones Rating ↔ Service
Service.hasMany(Rating, { foreignKey: 'service_id', as: 'ratings' });
Rating.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Asociaciones Rating ↔ User (El que califica)
User.hasMany(Rating, { foreignKey: 'rater_id', as: 'ratingsGiven' });
Rating.belongsTo(User, { foreignKey: 'rater_id', as: 'rater' });

// Asociaciones Rating ↔ User (El calificado)
User.hasMany(Rating, { foreignKey: 'rated_id', as: 'ratingsReceived' });
Rating.belongsTo(User, { foreignKey: 'rated_id', as: 'rated' });

module.exports = { User, Service, VerificationCode, Rating };