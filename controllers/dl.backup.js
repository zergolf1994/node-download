"use strict";

const request = require("request-promise");
const path = require("path");
const shell = require("shelljs");
const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

const Backup = require("../modules/Mysql/Backup");
const Files = require("../modules/Mysql/Files");
const { timeSleep } = require("../modules/Function");

let fileInput;

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
      attributes: ["uid", "id", "slug"],
      where: {
        slug: slug,
      },
    });

    const g = await getRequest(`http://127.0.0.1:8888/gdrive/info?gid=${gid}`);

    if (!g?.status) {
      return res.json({
        status: false,
        msg: "gdrive not data",
      });
    }

    //get data video
    fileInput = `${global.dir}/public/${slug}/${g?.data?.Name}`;
    let vdo_data = await getVideoData();

    await timeSleep();
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

    let dbtype = "create",
      update,
      create;
    if (bu?.id) {
      //update
      update = await Backup.update(data, {
        where: { id: bu?.id },
        silent: true,
      });
      dbtype = "update";
    } else {
      create = await Backup.create(data);
    }

    if (quality == "default") {
      let data_files = {};
      data_files.mimesize = `${vdo_data?.streams[0].width}x${vdo_data?.streams[0].height}`;
      data_files.filesize = vdo_data?.format?.size || 0;
      data_files.duration = Math.floor(vdo_data?.format?.duration) || 0;
      await Files.update(data_files, {
        where: { slug: slug },
        silent: true,
      });
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
    console.log(error);
    return res.json({ status: false, msg: error.name, t:"dl_backup" });
  }
};

function getVideoData() {
  return new Promise((resolve, reject) => {
    ffmpeg(fileInput).ffprobe((err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}

async function getRequest(host) {
  let result = await request(host);
  return new Promise(function (resolve, reject) {
    resolve(JSON.parse(result));
  });
}
