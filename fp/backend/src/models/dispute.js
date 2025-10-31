const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Dispute = sequelize.define('Dispute', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'services',
            key: 'id'
        }
    },
    reported_by: {
        type: DataTypes.ENUM('client', 'worker'),
        allowNull: false,
        comment: 'Quién reporta el problema'
    },
    reported_by_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que reporta',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reported_against_user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del usuario reportado',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    reason: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Motivo de la disputa'
    },
    evidence_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'URLs de fotos/evidencias (JSON array)'
    },
    worker_response: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Descargo del trabajador'
    },
    worker_evidence_url: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Evidencias del trabajador (JSON array)'
    },
    status: {
        type: DataTypes.ENUM('abierta', 'en_revision', 'resuelta_cliente', 'resuelta_trabajador', 'rechazada'),
        defaultValue: 'abierta'
    },
    admin_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas del administrador'
    },
    resolved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID del admin que resolvió',
        references: {
            model: 'users',
            key: 'id'
        }
    }
}, {
    tableName: 'disputes',
    timestamps: true
});

module.exports = Dispute;