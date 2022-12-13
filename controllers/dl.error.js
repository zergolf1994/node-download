"use strict";

const path = require("path");
const shell = require("shelljs");
const fs = require("fs");

const { Servers, Progress, Files, Backup } = require("../modules/db");
const { Sequelize, Op } = require("sequelize");
const { WriteLog, TimeSleep, GetIP } = require("../modules/utils");

module.exports = async (req, res) => {
  const sv_ip = await GetIP();
  const { slug, e_code } = req.query;

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
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
