const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Progress = sequelize.define('progress', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    uid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    sid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    fid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 0,
    },
    type: {
      type: DataTypes.STRING(10),
      defaultValue: "",
    },
    slug: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    quality: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    value: {
      type: DataTypes.INTEGER(3),
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
  await Progress.sync({ force: false });
})();

module.exports = Progress;