const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Service = sequelize.define('Service', {
    client_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    worker_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    service_location_lat: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    service_location_lng: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    service_address: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'in_progress', 'completed', 'cancelled'),
        defaultValue: 'pending',
    },
    scheduled_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
}, {
    timestamps: true,
    tableName: 'services'
});

module.exports = Service;