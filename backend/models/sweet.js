const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Sweet = sequelize.define(
    "Sweet",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: { type: DataTypes.STRING, allowNull: false, unique: true },
      category: { type: DataTypes.STRING, allowNull: false },
      price: { type: DataTypes.FLOAT, allowNull: false },
      quantity: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    },
    {
      tableName: "sweets",
      timestamps: true,
    }
  );

  return Sweet;
};
