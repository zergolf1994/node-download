"use strict";

const path = require("path");
const shell = require("shelljs");
const fs = require("fs");

const Backup = require("../modules/Mysql/Backup");
const Files = require("../modules/Mysql/Files");
const Progress = require("../modules/Mysql/Progress");
const Servers = require("../modules/Mysql/Servers");
const { timeSleep } = require("../modules/Function");

let fileInput;

module.exports = async (req, res) => {
  const { slug } = req.query;

  try {
    if (!slug) return res.json({ status: false, msg: "not_data_backup" });

    let data = {};

    const proc = await Progress.findOne({
      where: { slug: slug, type: "download" },
    });

    await timeSleep();
    //total backup
    //check has backup
    const c_bu = await Backup.count({
      where: {
        slug,
      },
    });

    if (c_bu > 1) {
      data.status = 4;
    } else {
      data.status = 2;
    }
    data.e_code = 0;

    await Files.update(data, {
      where: { slug:slug },
      silent: true,
    });

    // delete process
    await Progress.destroy({ where: { slug: slug, type: "download" } });

    await timeSleep();
    //check
    const procc = await Progress.count({ where: { sid: proc?.sid } });

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
    console.log(error);
    return res.json({ status: false, msg: error.name , t:"dl_done" });
  }
};
