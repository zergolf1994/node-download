const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const Settings = sequelize.define("settings", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(255),
    defaultValue: "",
  },
  value: {
    type: DataTypes.TEXT("long"),
    defaultValue: "",
  },
  createdAt: {
    type: DataTypes.DATE,
  },
  updatedAt: {
    type: DataTypes.DATE,
  },
});

(async () => {
  await Settings.sync({ force: false });
})();

module.exports = Settings;
