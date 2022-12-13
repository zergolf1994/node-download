const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const FilesVideo = sequelize.define('files_video', {
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
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
    },
    sv_id: {
      type: DataTypes.INTEGER(1),
      defaultValue: 0,
    },
    quality: {
      type: DataTypes.STRING(20),
      defaultValue: "",
    },
    token: {
      type: DataTypes.STRING(50),
      defaultValue: "",
    },
    backub: {
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
});
  
(async () => {
  await FilesVideo.sync({ force: false });
})();

module.exports = FilesVideo;