const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const User = sequelize.define('users', {
    id: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    active: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
    },
    role: {
      type: DataTypes.INTEGER(1),
      defaultValue: 1,
    },
    email: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    username: {
      type: DataTypes.STRING(255),
      defaultValue: "",
    },
    password: {
      type: DataTypes.STRING(60),
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
  await User.sync({ force: false });
})();

module.exports = User;