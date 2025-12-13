const { Sequelize } = require("sequelize");
const { DATABASE_FILE } = require("./config");

// persistent SQLite DB file will be created next to this project
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: DATABASE_FILE,
  logging: false, // set true to debug SQL queries
});

module.exports = sequelize;
