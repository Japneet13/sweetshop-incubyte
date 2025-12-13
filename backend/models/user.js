const { DataTypes } = require("sequelize");
const bcrypt = require("bcryptjs");

module.exports = (sequelize) => {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  // Instance helper to validate password
  User.prototype.validatePassword = function (plainPassword) {
    return bcrypt.compareSync(plainPassword, this.passwordHash);
  };

  // Static helper to create user with hashed password
  User.createWithPassword = async function (username, plainPassword, isAdmin = false) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(plainPassword, salt);
    return this.create({ username, passwordHash: hash, isAdmin });
  };

  return User;
};
