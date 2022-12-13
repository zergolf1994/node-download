const { DataTypes } = require("sequelize");
const sequelize = require("./index");

const GAuth = sequelize.define(
  "gauth",
  {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
    },
    uid: {
      type: DataTypes.INTEGER(11),
    },
    email: {
      type: DataTypes.STRING(255),
    },
    client_id: {
      type: DataTypes.TEXT,
    },
    client_secret: {
      type: DataTypes.TEXT,
    },
    refresh_token: {
      type: DataTypes.TEXT,
    },
    token: {
      type: DataTypes.TEXT,
    },
    retokenAt: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  },
  {
    indexes: [
      {
        unique: false,
        fields: ["uid"],
      },
    ],
  }
);

(async () => {
  await GAuth.sync({ force: false });
})();

module.exports = GAuth;
