// config.js
require("dotenv").config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || "JapneetKaur@22BCS10390",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  DATABASE_FILE: process.env.DATABASE_FILE || "../database.sqlite",
};
