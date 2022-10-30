const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Files = sequelize.define('files', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING(30),
      defaultValue: "",
    },
    fid: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
    },
    status: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    e_code: {
      type: DataTypes.INTEGER(3),
      defaultValue: 0,
    },
    title: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    source: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    slug: {
      type: DataTypes.STRING(20),
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    backup: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    views: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    quality: {
      type: DataTypes.STRING(100),
      defaultValue: "",
    },
    mimetype: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    mimesize: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    filesize: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    duration: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    viewedAt: {
      type: DataTypes.DATE,
    },
    createdAt: {
      type: DataTypes.DATE,
    },
    updatedAt: {
      type: DataTypes.DATE,
    },
});
  
(async () => {
  await Files.sync({ force: false });
})();

module.exports = Files;