"use strict";

const path = require("path");
const shell = require("shelljs");
const fs = require("fs");

const { Servers, Progress, Files, Backup } = require("../modules/db");
const { Sequelize, Op } = require("sequelize");
const { WriteLog, TimeSleep, VideoData } = require("../modules/utils");

module.exports = async (req, res) => {
  const { slug } = req.query;

  try {
    if (!slug) return res.json({ status: false, msg: "not_data_backup" });
    let data = {},
      sid;

    const proc = await Progress.findOne({
      where: { slug: slug, type: "download" },
    });

    if (!proc) return res.json({ status: false, msg: "not_process" });

    sid = proc?.sid;

    await TimeSleep(2);
    const c_bu = await Backup.count({
      where: {
        slug,
      },
    });

    if (!c_bu) {
      data.status = 0;
    } else if (c_bu > 1) {
      data.status = 4;
    } else {
      data.status = 2;
    }
    data.e_code = 0;

    await Files.update(data, {
      where: { slug: slug },
      silent: true,
    });

    await Progress.destroy({ where: { slug: slug, type: "download" } });

    await TimeSleep(2);

    const procc = await Progress.count({ where: { sid: sid } });

    if (!procc) {
      //update server to not work
      await Servers.update(
        { work: 0 },
        {
          where: { id: proc.sid },
          silent: true,
        }
      );

      shell.exec(
        `bash ${global.dir}/shell/run.sh`,
        { async: false, silent: false },
        function (data) {}
      );
    }

    return res.json({ status: true, msg: "update_files_done" });
  } catch (error) {
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
