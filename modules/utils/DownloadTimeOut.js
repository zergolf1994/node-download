"use strict";

const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const TimeSleep = require("./TimeSleep");
const Settings = require("./Settings");
const GetIP = require("./GetIP");

const { Servers, Progress, Files } = require("../db");
const { Sequelize, Op } = require("sequelize");

module.exports = async (e) => {
  const sv_ip = await GetIP();
  let { dl_auto_cancle } = await Settings(true);

  try {
    console.log("timeout", dl_auto_cancle);
    const sv = await Servers.findOne({
      where: { sv_ip: sv_ip, type: "download" },
      raw: true,
      attributes: ["id"],
    });

    if (!sv?.id) {
      console.error("timeout", "no_server_data");
      return;
    }

    let ovdl = await Progress.findOne({
      where: {
        sid: sv?.id,
        type: "download",
        [Op.and]: Sequelize.literal(
          `ABS(TIMESTAMPDIFF(SECOND , updatedAt , NOW())) >= ${dl_auto_cancle}`
        ),
      },
      raw: true,
    });

    if (!ovdl) {
      console.log("timeout", "no_process_timeout");
      return;
    }

    shell.exec(
      `sudo rm -rf ${global.dir}/public/${ovdl?.slug}/`,
      { async: false, silent: false },
      function (data) {}
    );

    //update files
    await Files.update(
      { status: 0, e_code: 333 },
      {
        where: { id: ovdl.fid },
        silent: true,
      }
    );

    // delete process
    await Progress.destroy({ where: { id: ovdl?.id } });

    await TimeSleep(1);

    let ovdl_2 = await Progress.findOne({
      where: {
        sid: sv?.id,
        type: "download",
        [Op.and]: Sequelize.literal(
          `ABS(TIMESTAMPDIFF(SECOND , updatedAt , NOW())) >= ${dl_auto_cancle}`
        ),
      },
      raw: true,
    });

    // ถ้าไม่พบไฟล์ ให้อัพเดต เซิฟเวรอ์ ให้ พร้อมใช้งาน
    if (!ovdl_2) {
      await Servers.update(
        { work: 0 },
        {
          where: { id: sv?.id },
          silent: true,
        }
      );
    }

    await TimeSleep(2);

    shell.exec(
      `bash ${global.dir}/shell/run.sh`,
      { async: false, silent: false },
      function (data) {}
    );

    return true;
  } catch (error) {
    console.error(error);
    return;
  }
};
