const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Usuario que recibe la notificación',
        references: {
            model: 'users',
            key: 'id'
        }
    },
    type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: 'Tipo de notificación'
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        comment: 'Título de la notificación'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: 'Mensaje detallado'
    },
    link: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'URL a la que redirige'
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si fue leída'
    },
    related_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ID relacionado (servicio, disputa, etc)'
    }
}, {
    tableName: 'notifications',
    timestamps: true
});

module.exports = Notification;