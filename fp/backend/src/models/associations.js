const User = require('./user');
const Service = require('./service');
const VerificationCode = require('./verificationCode');
const Rating = require('./rating');
const Dispute = require('./dispute');

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

// Asociaciones Dispute ↔ Service
Service.hasMany(Dispute, { foreignKey: 'service_id', as: 'disputes' });
Dispute.belongsTo(Service, { foreignKey: 'service_id', as: 'service' });

// Asociaciones Dispute ↔ User (Reportador)
User.hasMany(Dispute, { foreignKey: 'reported_by_user_id', as: 'disputesReported' });
Dispute.belongsTo(User, { foreignKey: 'reported_by_user_id', as: 'reporter' });

// Asociaciones Dispute ↔ User (Reportado)
User.hasMany(Dispute, { foreignKey: 'reported_against_user_id', as: 'disputesReceived' });
Dispute.belongsTo(User, { foreignKey: 'reported_against_user_id', as: 'reportedUser' });

// Asociaciones Dispute ↔ User (Admin que resolvió)
User.hasMany(Dispute, { foreignKey: 'resolved_by', as: 'disputesResolved' });
Dispute.belongsTo(User, { foreignKey: 'resolved_by', as: 'resolver' });

module.exports = { User, Service, VerificationCode, Rating, Dispute };

module.exports = { User, Service, VerificationCode, Rating };