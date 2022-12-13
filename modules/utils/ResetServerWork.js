const { Progress, Servers } = require("../db");
const { Sequelize, Op } = require("sequelize");

module.exports = async (e) => {
  let no_sid = [];
  try {
    //get process
    let pc = await Progress.findAll({
      raw: true,
      where: { type: ["dlv2", "download"] },
      attributes: ["sid", "type"],
    });
    pc.forEach((el) => {
      if (!no_sid.includes(el?.sid)) {
        no_sid.push(el?.sid);
      }
    });
    let sv = await Servers.update(
      { work: 0 },
      {
        where: {
          id: { [Op.notIn]: no_sid },
          work: { [Op.ne]: 0 },
          type: { [Op.or]: ["dlv2", "download"] },
        },
      }
    );
    return true;
  } catch (error) {
    console.log(error);
    return;
  }
};
