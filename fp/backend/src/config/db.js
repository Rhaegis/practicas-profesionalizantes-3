const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("trabajapp_db", "root", "22082022", {
    host: "localhost",
    dialect: "mysql",
    logging: false
});

module.exports = sequelize;
