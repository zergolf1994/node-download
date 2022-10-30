const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Server = sequelize.define('server', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.STRING(10),
      defaultValue: "",
    },
    uid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    work: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    sv_name: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    sv_ip: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    email: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    folder: {
      type: DataTypes.STRING(255),
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
  await Server.sync({ force: false });
})();

module.exports = Server;