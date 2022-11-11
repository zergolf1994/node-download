"use strict";

const request = require("request-promise");
const http = require("http");
const path = require("path");
const fs = require("fs");
const Files = require("../modules/Mysql/Files");
const FilesVideo = require("../modules/Mysql/FilesVideo");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const { Sequelize, Op } = require("sequelize");
const shell = require("shelljs");
const { SettingValue, timeSleep } = require("../modules/Function");

module.exports = async (req, res) => {
  const { sv_ip, slug } = req.query;
  let no_uid = [],
    no_sid = [];
  try {
    if (!sv_ip) return res.json({ status: false, msg: "no_query_sv_ip" });
    let {
      dl_status,
      dl_dl_by,
      dl_dl_sort,
      dl_auto_cancle,
      dl_focus_uid,
      dl_v2_uid,
    } = await SettingValue(true);

    const count = await Servers.count({
      raw: true,
      attributes: ["uid"],
      where: {
        type: { [Op.or]: ["download", "dlv2"] },
      },
    });
    /*if (servers.length) {
      servers.forEach((el, index) => {
        let { uid } = el;
        if (!no_uid.includes(uid) && uid != 0) {
          no_uid.push(uid);
        }
      });
    }*/
    if (dl_v2_uid) {
      no_uid = dl_v2_uid.split(",");
    }

    // เช็คเซิฟว่าง
    const server = await Servers.findOne({
      raw: true,
      where: {
        sv_ip: sv_ip,
        type: "download",
        active: 1,
        work: 0,
      },
    });

    if (!server) {
      //เช็ค process file
      if (dl_auto_cancle) {
        const sv = await Servers.findOne({
          where: { sv_ip: sv_ip, type: "download" },
          raw: true,
          attributes: ["id"],
        });
        if (sv?.id) {
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
          if (ovdl) {
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

            await Servers.update(
              { work: 0 },
              {
                where: { id: sv?.id },
                silent: true,
              }
            );
            await timeSleep();

            shell.exec(
              `bash ${global.dir}/shell/run.sh`,
              { async: false, silent: false },
              function (data) {}
            );
          }
        }
      }

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
          where: { id: { [Op.notIn]: no_sid }, work: { [Op.ne]: 0 } },
        }
      );

      return res.json({ status: false, msg: "server_is_busy" });
    }
    // check status all
    if (dl_status != 1)
      return res.json({ status: false, msg: `status_inactive` });

    if (!server?.folder)
      return res.json({ status: false, msg: "not_conf_folder" });

    let file_where = {};

    if (server?.uid) {
      file_where.uid = server?.uid;
    } else if (!server?.uid && no_uid.length > 0) {
      file_where.uid = { [Op.notIn]: no_uid };
    }

    file_where.status = 0;
    file_where.active = 1;
    file_where.e_code = 0;
    file_where.type = { [Op.or]: ["gdrive", "direct"] };

    let file_limit = count;

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

    await timeSleep(1);
    let files;

    files = await Files.findAll({
      where: file_where,
      order: set_order,
      limit: file_limit,
    });

    if (!files.length && server?.uid) {
      if (no_uid.length > 0) {
        file_where.uid = { [Op.notIn]: no_uid };
      } else {
        delete file_where.uid;
      }

      files = await Files.findAll({
        where: file_where,
        order: set_order,
        limit: file_limit,
      });
    }

    if (!files.length) {
      await Files.update(
        { status: 0, e_code: 0 },
        {
          where: {
            status: { [Op.or]: [0, 1] },
            e_code: { [Op.or]: [0, 1, 2, 333] },
          },
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
        // update file with error code
        let e_code = g?.data?.e_code || 333;
        await Files.update(
          { e_code: e_code },
          {
            where: { slug: file?.slug },
            silent: true,
          }
        );

        // run start again
        shell.exec(
          `sudo bash ${global.dir}/shell/run.sh ${file?.slug}`,
          { async: false, silent: false },
          function (data) {}
        );

        return res.json({
          status: false,
          msg: "gdrive not data",
        });
      }

      if (g?.data?.Mime != "video/mp4") {
        await Files.update(
          { e_code: 333 },
          {
            where: { slug: file?.slug },
            silent: true,
          }
        );

        shell.exec(
          `sudo bash ${global.dir}/shell/run.sh ${file?.slug}`,
          { async: false, silent: false },
          function (data) {}
        );

        return res.json({ status: false, msg: "file_not_mp4" });
      }
      // เช็ค ไฟล์ต้นฉบับ ว่าสามารถโหลดได้
    }

    process_data.uid = file?.uid;
    process_data.sid = server?.id;
    process_data.fid = file?.id;
    process_data.type = "download";
    process_data.slug = file?.slug;
    process_data.quality = "default";

    const create = await Progress.create(process_data);

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
    await timeSleep(2);

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
    console.log(error);
    return res.json({ status: false, msg: error.name, t: "dl_start" });
  }
};

async function getRequest(host) {
  let result = await request(host);
  return new Promise(function (resolve, reject) {
    resolve(JSON.parse(result));
  });
}

async function httpCodeMp4(host) {
  return new Promise(function (resolve, reject) {
    http.get(host, function (response) {
      resolve(response.statusCode);
    });
  });
}
