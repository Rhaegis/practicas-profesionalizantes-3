const sequelize = require('../config/database');

// Importar todos los modelos
const User = require('./user');
const Service = require('./service');
const VerificationCode = require('./verificationCode');
const Rating = require('./rating');
const Dispute = require('./dispute');
const AvailabilityBlock = require('./availabilityBlock');
const Notification = require('./notification');

// ==========================================
// DEFINIR ASOCIACIONES (RELACIONES)
// ==========================================

// User <-> Service (Cliente)
User.hasMany(Service, {
    foreignKey: 'client_id',
    as: 'clientServices'
});
Service.belongsTo(User, {
    foreignKey: 'client_id',
    as: 'client'
});

// User <-> Service (Trabajador)
User.hasMany(Service, {
    foreignKey: 'worker_id',
    as: 'workerServices'
});
Service.belongsTo(User, {
    foreignKey: 'worker_id',
    as: 'worker'
});

// Service <-> VerificationCode
Service.hasMany(VerificationCode, {
    foreignKey: 'service_id',
    as: 'verificationCodes'
});
VerificationCode.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

// Service <-> Rating
Service.hasMany(Rating, {
    foreignKey: 'service_id',
    as: 'ratings'
});
Rating.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

// User <-> Rating (Rater - quien califica)
User.hasMany(Rating, {
    foreignKey: 'rater_id',
    as: 'ratingsGiven'
});
Rating.belongsTo(User, {
    foreignKey: 'rater_id',
    as: 'rater'
});

// User <-> Rating (Rated - quien es calificado)
User.hasMany(Rating, {
    foreignKey: 'rated_user_id',
    as: 'ratingsReceived'
});
Rating.belongsTo(User, {
    foreignKey: 'rated_user_id',
    as: 'ratedUser'
});

// Service <-> Dispute
Service.hasMany(Dispute, {
    foreignKey: 'service_id',
    as: 'disputes'
});
Dispute.belongsTo(Service, {
    foreignKey: 'service_id',
    as: 'service'
});

// User <-> Dispute (Reporter - quien reporta)
User.hasMany(Dispute, {
    foreignKey: 'reported_by_user_id',
    as: 'disputesReported'
});
Dispute.belongsTo(User, {
    foreignKey: 'reported_by_user_id',
    as: 'reporter'
});

// User <-> Dispute (Reported Against - contra quien se reporta)
User.hasMany(Dispute, {
    foreignKey: 'reported_against_user_id',
    as: 'disputesAgainst'
});
Dispute.belongsTo(User, {
    foreignKey: 'reported_against_user_id',
    as: 'reportedUser'
});

// User <-> Dispute (Resolved By - admin que resolvió)
User.hasMany(Dispute, {
    foreignKey: 'resolved_by',
    as: 'disputesResolved'
});
Dispute.belongsTo(User, {
    foreignKey: 'resolved_by',
    as: 'resolver'
});

// User <-> AvailabilityBlock
User.hasMany(AvailabilityBlock, {
    foreignKey: 'worker_id',
    as: 'availabilityBlocks'
});
AvailabilityBlock.belongsTo(User, {
    foreignKey: 'worker_id',
    as: 'worker'
});

// User <-> Notification
User.hasMany(Notification, {
    foreignKey: 'user_id',
    as: 'notifications'
});
Notification.belongsTo(User, {
    foreignKey: 'user_id',
    as: 'user'
});

module.exports = sequelize;