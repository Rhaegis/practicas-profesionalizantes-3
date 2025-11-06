const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('User', {
  full_name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.ENUM('cliente', 'trabajador'),
    allowNull: false,
  },
  trade: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  registration_number: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  work_area: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  lat: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  lng: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  // ===== NUEVOS CAMPOS PARA ZONA DE TRABAJO =====
  work_radius: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    comment: 'Radio de cobertura en kilómetros'
  },
  work_location_lat: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: true,
    comment: 'Latitud del centro de operaciones'
  },
  work_location_lng: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: true,
    comment: 'Longitud del centro de operaciones'
  },
  work_schedule: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: 'Horarios de disponibilidad por día'
  },
  immediate_availability: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Disponible para trabajos inmediatos'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: 'Cuenta activa/pausada'
  }
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;