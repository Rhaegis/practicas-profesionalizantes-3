const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const VerificationCode = sequelize.define('VerificationCode', {
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
    code: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    generated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    verified_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    tableName: 'verification_codes',
    timestamps: false
});

module.exports = VerificationCode;