const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const UserSettings = sequelize.define("users-settings", {
  id: {
    type: DataTypes.INTEGER(11),
    primaryKey: true,
    autoIncrement: true,
  },
  uid: {
    type: DataTypes.INTEGER(11),
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
  await UserSettings.sync({ force: false });
})();

module.exports = UserSettings;
