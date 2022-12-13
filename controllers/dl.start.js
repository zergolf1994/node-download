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
  getRequest,
} = require("../modules/utils");

module.exports = async (req, res) => {
  const sv_ip = await GetIP();
  let no_uid = [],
    no_sid = [],
    reCount = 0;

  let type_sv = "download";
  let { dl_status, dl_dl_sort, dl_dl_by, dl_auto_cancle, dl_v2_uid } =
    await Settings(true);

  try {
    if (!sv_ip) return res.json({ status: false, msg: "no_sv_ip" });

    if (dl_v2_uid) {
      no_uid = dl_v2_uid.split(",");
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
      // เซิฟเวอร์ไม่ว่าง
      if (dl_auto_cancle > 0) {
        //เช็คว่ามีไฟล์โหลดเกินเวลาไหม
        await DownloadTimeOut();
      }
      await ResetServerWork();
      return res.json({ status: false, msg: "server_is_busy" });
    }

    // check status all
    if (dl_status != 1)
      return res.json({ status: false, msg: `status_inactive` });

    if (!server?.folder)
      return res.json({ status: false, msg: "not_conf_folder" });

    let file_where = {};

    if (!server?.uid && no_uid.length > 0) {
      file_where.uid = { [Op.notIn]: no_uid };
    } else if (server?.uid) {
      file_where.uid = server?.uid;
    } else {
      return res.json({ status: false, msg: "not_uid_v2" });
    }
    file_where.status = 0;
    file_where.active = 1;
    file_where.e_code = 0;
    file_where.type = { [Op.or]: ["gdrive", "direct"] };

    let file_limit = await Servers.count({
      where: {
        type: { [Op.or]: ["download", "dlv2"] },
      },
    });
    let set_order = [[Sequelize.literal("RAND()")]];
    if (dl_dl_sort && dl_dl_by) {
      let order_sort = dl_dl_sort == "asc" ? "ASC" : "DESC";
      let order_by = "createdAt";
      switch (dl_dl_by) {
        case "size":
          order_by = "filesize";
          break;
        case "view":
          order_by = "views";
          break;
        case "update":
          order_by = "viewedAt";
          break;
        case "viewat":
          order_by = "updatedAt";
          break;
      }

      set_order = [[order_by, order_sort]];
    }

    //await TimeSleep();

    let files = await Files.findAll({
      raw: true,
      attributes: ["type", "source", "slug", "uid", "id"],
      where: file_where,
      order: set_order,
      limit: file_limit,
    });

    if (!files.length) {
      // reset error 333
      await Files.update(
        { status: 0, e_code: 0 },
        {
          where: { status: [0, 1], e_code: [1, 2, 333] },
          silent: true,
        }
      );
      return res.json({ status: false, msg: `files_not_empty`, e: 1 });
    }

    const number = Math.floor(Math.random() * files.length);
    let file = files[number];

    if (!file?.slug)
      return res.json({ status: false, msg: `files_not_empty`, e: 2 });

    let process_data = {};

    process_data.quality = "default";
    if (file?.type == "gdrive") {
      let gid = file?.source;

      const g = await getRequest(
        `http://127.0.0.1:8888/gdrive/info?gid=${gid}`
      );

      if (!g?.status) {
        if (g?.errorcode) {
          console.log("errorcode", g?.errorcode);

          let e_code = g?.errorcode || 333;

          await Files.update(
            { e_code: e_code },
            {
              where: { slug: file?.slug },
              silent: true,
            }
          );
          return res.json({
            status: false,
            msg: "gdrive_not_data",
            slug: file?.slug,
          });
        }

        if (g?.data?.Mime != "video/mp4") {
          await Files.update(
            { e_code: 104 },
            {
              where: { slug: file?.slug },
              silent: true,
            }
          );

          return res.json({
            status: false,
            msg: "file_not_mp4",
            slug: file?.slug,
          });
        }
      }
    } else if (file?.type == "direct") {
    } else {
      return res.json({
        status: false,
        msg: `not_type_support`,
      });
    }

    process_data.uid = file?.uid;
    process_data.sid = server?.id;
    process_data.fid = file?.id;
    process_data.type = "download";
    process_data.slug = file?.slug;

    const create = await Progress.create(process_data);
    await TimeSleep(1);
    if (!create?.id) return res.json({ status: false, msg: `db_false` });

    await Servers.update(
      { work: 1 },
      {
        where: { id: process_data.sid },
        silent: true,
      }
    );
    await Files.update(
      { status: 1, e_code: 1 },
      {
        where: { id: process_data.fid },
        silent: true,
      }
    );

    await TimeSleep(1);
    shell.exec(
      `sudo bash ${global.dir}/shell/download.sh ${file?.slug}`,
      { async: false, silent: false },
      function (data) {}
    );

    return res.json({
      status: true,
      msg: "start_download",
      slug: file?.slug,
    });
  } catch (error) {
    //await WriteLog(error);
    console.log(error);
    return res.json({ status: false, msg: `error` });
  }
};
