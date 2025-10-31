const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Rating = sequelize.define('Rating', {
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
    rater_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del usuario que califica',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rated_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'ID del usuario calificado',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    rater_type: {
        type: DataTypes.ENUM('client', 'worker'),
        allowNull: false,
        comment: 'Tipo del que califica'
    },
    rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: 1,
            max: 5
        }
    },
    comment: {
        type: DataTypes.TEXT,
        allowNull: true
    }
}, {
    tableName: 'ratings',
    timestamps: true
});

module.exports = Rating;