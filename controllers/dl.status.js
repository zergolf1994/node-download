"use strict";

const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");

const { Servers, Progress, Files } = require("../modules/db");
const { Sequelize, Op } = require("sequelize");
const {
  Settings,
  GetIP,
  WriteLog,
  DownloadTimeOut,
  TimeSleep,
  GoogleDriveSource,
  ResetServerWork,
} = require("../modules/utils");

module.exports = async (req, res) => {
  const sv_ip = await GetIP();
  let not_uid = [];
  let type_sv = "download";
  let { dl_status, dl_dl_sort, dl_dl_by, dl_auto_cancle, dl_v2_uid } =
    await Settings(true);

  try {
    if (!sv_ip) return res.json({ status: false, msg: "no_sv_ip" });

    if (dl_v2_uid) {
      not_uid = dl_v2_uid.split(",");
    }
    // เช็คเซิฟว่าง
    const server = await Servers.findOne({
      raw: true,
      where: {
        sv_ip: sv_ip,
        type: type_sv,
        active: 1,
        work: 0,
      },
    });
    if (!server) {
      return res.json({ status: false, msg: "server_is_busy" });
    }

    // check status all
    if (dl_status != 1)
      return res.json({ status: false, msg: `status_inactive` });

    if (!server?.folder)
      return res.json({ status: false, msg: "not_conf_folder" });
      
    let file_where = {};

    if (!server?.uid && in_uid.length > 0) {
      file_where.uid = { [Op.or]: in_uid };
    } else if (server?.uid) {
      file_where.uid = server?.uid;
    } else {
      return res.json({ status: false, msg: "not_uid_v2" });
    }

  } catch (error) {
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
