"use strict";

const path = require("path");
const fs = require("fs");
const Files = require("../modules/Mysql/Files");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const { Sequelize, Op } = require("sequelize");
const shell = require("shelljs");
const { SettingValue } = require("../modules/Function");

module.exports = async (req, res) => {
  const { sv_ip } = req.query;
  try {
    if (!sv_ip) return res.json({ status: false });
    let { dl_status, dl_dl_by, dl_dl_sort, dl_auto_cancle, dl_focus_uid } =
      await SettingValue(true);

    // check status all
    if (dl_status != 1)
      return res.json({ status: false, msg: `status_inactive` });

    let where = {},
      where_files = {},
      data = {},
      limit = 5;

    where.sv_ip = sv_ip;
    where.work = 0;
    where.active = 1;
    where.type = "download";

    //find server
    const ServerEmpty = await Servers.findOne({ where });

    if (!ServerEmpty) {
      //check auto cancal
      if (dl_auto_cancle) {
        delete where.work;
        delete where.active;
        const sv = await Servers.findOne({
          where,
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
            //delete localfile
            shell.exec(
              `sudo rm -rf /home/public/${ovdl?.slug}/`,
              { async: false, silent: false },
              function (data) {}
            );

            //update files
            await Files.update(
              { e_code: 333 },
              {
                where: { id: ovdl.fid },
                silent: true,
              }
            );
            // delete process
            await Progress.destroy({ where: { id: ovdl?.id } });

            //check over download again
            let ca_ovdl = await Progress.findOne({
              where: {
                sid: sv?.id,
                type: "download",
                [Op.and]: Sequelize.literal(
                  `ABS(TIMESTAMPDIFF(SECOND , createdAt , NOW())) >= ${stg_auto_cancle}`
                ),
              },
              raw: true,
            });

            if (!ca_ovdl) {
              //set server not work
              await Servers.update(
                { work: 0 },
                {
                  where: { id: sv?.id },
                  silent: true,
                }
              );
            }
            //exit no update server
          }
          // exit no process
        }
        // exit no server
      }
      // exit no auto cancle
      return res.json({ status: false, msg: `Server not empty` });
    }

    //find files
    where_files.status = 0;
    where_files.e_code = 0;
    where_files.backup = "";
    where_files.type = { [Op.or]: ["gdrive", "direct"] };
    //where_files.backup = "";

    //new function focus_uid
    if (dl_focus_uid) {
      dl_focus_uid.uid = {
        [Op.or]: dl_focus_uid.split(","),
      };

      const count_files = await Files.count({
        where: where_files,
      });

      if (!count_files) {
        delete where_files.uid;
      }
    }
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

    const FilesEmpty = await Files.findAll({
      where: where_files,
      order: set_order,
      limit: limit,
    });

    if (!FilesEmpty[0])
      return res.json({ status: false, msg: `Files not empty` });

    const i = Math.floor(Math.random() * FilesEmpty.length);
    let file = FilesEmpty[i];

    if (!file?.slug)
      return res.json({ status: false, msg: `Files not empty 2` });
    //Create Process
    data.uid = file?.uid;
    data.sid = ServerEmpty?.id;
    data.fid = file?.id;
    data.type = "download";
    data.slug = file?.slug;
    data.quality = "default";

    const insert = await Progress.create(data);

    if (insert?.id) {
      //Update
      await Servers.update(
        { work: 1 },
        {
          where: { id: data.sid },
          silent: true,
        }
      );
      await Files.update(
        { status: 1, e_code: 1 },
        {
          where: { id: data.fid },
          silent: true,
        }
      );
      //shell run
      shell.exec(
        `bash /home/shell/download.sh ${data?.slug}`,
        { async: false, silent: false },
        function (data) {}
      );
      return res.json({
        status: true,
        msg: `Process Download created`,
        slug: data.slug,
      });
    } else {
      return res.json({ status: false, msg: `false insert` });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }
};
