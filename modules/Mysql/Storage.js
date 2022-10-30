const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Storage = sequelize.define('storage', {
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
    disk_percent: {
      type: DataTypes.INTEGER(3),
      defaultValue: 0,
    },
    disk_used: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    disk_total: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
});
  
(async () => {
  await Storage.sync({ force: false });
})();

module.exports = Storage;