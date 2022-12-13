const { GAuth } = require("../db");
const { Sequelize, Op } = require("sequelize");
const GoogleAuthRetoken = require("./GoogleAuthRetoken");

module.exports = async (uid = false) => {
  try {
    let where = {},
      row;

    where.active = 1;

    if (uid) {
      where.uid = uid;
    } else {
      where.uid = 0;
    }

    row = await GAuth.findOne({
      where,
      attributes: { exclude: ["updatedAt", "createdAt"] },
      order: [[Sequelize.literal("RAND()")]],
    });

    if (!row && uid) {
      where.uid = 0;
      row = await GAuth.findOne({
        where,
        attributes: { exclude: ["updatedAt", "createdAt"] },
        order: [[Sequelize.literal("RAND()")]],
      });
    }

    if (!row) return;
    const date_token = new Date(row?.retokenAt);
    const timenow = Math.floor(Date.now() / 1000);
    const timetoken = Math.floor(date_token.getTime() / 1000);

    let token = JSON.parse(row?.token);
    if (timenow - timetoken > 3500) {
      token = await GoogleAuthRetoken(
        row?.client_id,
        row?.client_secret,
        row?.refresh_token
      );

      let data = {};
      if (token?.error) {
        token = false;
        data.active = 0;
      } else {
        data.token = JSON.stringify(token);
        data.retokenAt = new Date();
      }

      await GAuth.update(data, {
        where: { id: row?.id },
      });
    }

    return token;
  } catch (error) {
    console.log(error);
    return;
  }
};
