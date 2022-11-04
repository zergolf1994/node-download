"use strict";

const path = require("path");
const Files = require("../modules/Mysql/Files");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { slug, e_code, sv_ip } = req.query;
  try {
    if (!slug) return res.json({ status: false });

    let fupdate = {};
    //find process
    fupdate.e_code = e_code == 100 ? 100 : e_code == 150 ? 150 : 333;

    await Files.update(fupdate, {
      where: { slug: slug },
      silent: true,
    });

    await Servers.update(
      { work: 0 },
      {
        where: { sv_ip: sv_ip },
        silent: true,
      }
    );
    // delete process
    await Progress.destroy({ where: { slug: slug } });

    return res.json({ status: true });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
