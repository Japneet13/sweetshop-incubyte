const sequelize = require("../db");
const User = require("./user");
const Sweet = require("./sweet");

// initialize models
const models = {
  User: User(sequelize),
  Sweet: Sweet(sequelize),
};


module.exports = { sequelize, models };
