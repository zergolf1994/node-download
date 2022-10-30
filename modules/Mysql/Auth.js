const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AuthDB = sequelize.define('auth', {
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
    token: {
      type: DataTypes.STRING(60),
    },
    os_name: {
      type: DataTypes.STRING(255),
    },
    os_version: {
      type: DataTypes.STRING(255),
    },
    bs_name: {
      type: DataTypes.STRING(255),
    },
    bs_version: {
      type: DataTypes.STRING(255),
    },
    bs_major: {
      type: DataTypes.STRING(255),
    },
    client_ip: {
      type: DataTypes.STRING(255),
    },
    user_agent: {
        type: DataTypes.TEXT,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
  });
  
  (async () => {
    await AuthDB.sync({ force: false });
  })();
  
  module.exports = AuthDB;