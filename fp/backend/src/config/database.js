const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('trabajapp_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;