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
}, {
  timestamps: true,
  tableName: 'users'
});

module.exports = User;
