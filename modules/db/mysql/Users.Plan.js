const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const UserPlan = sequelize.define('users-plan', {
    uid: {
      type: DataTypes.INTEGER(11),
      primaryKey: true,
      autoIncrement: true,
    },
    pid: {
      type: DataTypes.INTEGER(11),
      defaultValue: 1,
    },
    used: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    percent: {
      type: DataTypes.BIGINT(255),
      defaultValue: 0,
    },
    expiredAt: {
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
  await UserPlan.sync({ force: false });
})();

module.exports = UserPlan;