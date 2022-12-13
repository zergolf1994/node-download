const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Backup = sequelize.define('backup', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    fid: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    slug: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    quality: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    backup: {
      type: DataTypes.STRING(255),
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
    {
      unique: false,
      fields: ["fid"],
    },
    {
      unique: false,
      fields: ["slug"],
    },
    {
      unique: false,
      fields: ["quality"],
    },
    {
      unique: false,
      fields: ["filesize"],
    },
  ],
});
  
(async () => {
  await Backup.sync({ force: false });
})();

module.exports = Backup;