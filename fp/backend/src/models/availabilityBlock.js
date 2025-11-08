const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AvailabilityBlock = sequelize.define('AvailabilityBlock', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    worker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        comment: 'Fecha específica bloqueada'
    },
    reason: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Motivo del bloqueo'
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'true = disponible especial, false = no disponible'
    }
}, {
    tableName: 'availability_blocks',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['worker_id', 'date']
        }
    ]
});

module.exports = AvailabilityBlock;