"use strict";

const path = require("path");
const shell = require("shelljs");
const fs = require("fs");

const { Servers, Progress, Files, Backup } = require("../modules/db");
const { Sequelize, Op } = require("sequelize");
const { WriteLog, TimeSleep, VideoData } = require("../modules/utils");

module.exports = async (req, res) => {
  const { slug, quality } = req.query;

  try {
    if (!slug || !quality)
      return res.json({ status: false, msg: "not_data_backup" });
    // Get backup gid
    let tmp = `${global.dir}/public/${slug}/up_${slug}.txt`;
    let matchGid = /Uploaded ([\w\-]{28,}) at/i;
    const Read = fs.readFileSync(tmp, "utf8");

    if (!matchGid.test(Read)) {
      return res.json({ status: false, msg: "not_match" });
    }
    const match = Read.match(matchGid);
    let gid = match[1];

    if (!gid) return res.json({ status: false, msg: "not_gid" });
    //find file
    const files = await Files.findOne({
      raw: true,
      attributes: ["uid", "id", "slug", "duration"],
      where: {
        slug: slug,
      },
    });

    //get data video
    let vdo_data = await VideoData(
      `${global.dir}/public/${slug}/${slug}.mp4`
    );

    await TimeSleep(1);

    //check has backup
    const bu = await Backup.findOne({
      attributes: ["id"],
      where: {
        slug: slug,
        quality: quality,
      },
    });

    let data = {};
    data.backup = gid;
    data.quality = quality;
    data.slug = slug;
    data.mimesize = `${vdo_data?.streams[0].width}x${vdo_data?.streams[0].height}`;
    data.filesize = vdo_data?.format?.size || 0;
    if (files?.id) {
      data.uid = files?.uid;
      data.fid = files?.id;
    }

    if (!files?.duration) {
      let data_update = {};
      data_update.duration = Math.floor(vdo_data?.format?.duration) || 0;
      await Backup.update(data_update, {
        where: { id: files?.id },
      });
    }

    let dbtype = "create",
      update,
      create;

    if (bu?.id) {
      //update
      update = await Backup.update(data, {
        where: { id: bu?.id },
      });
      dbtype = "update";
    } else {
      create = await Backup.create(data);
    }
    
    if (dbtype == "create") {
      if (create?.id) {
        return res.json({ status: true, msg: "create_backup_done" });
      } else {
        return res.json({ status: true, msg: "db_error" });
      }
    } else {
      return res.json({ status: true, msg: "update_backup_done" });
    }
  } catch (error) {
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
