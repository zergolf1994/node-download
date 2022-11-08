"use strict";

const path = require("path");
const Files = require("../modules/Mysql/Files");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const Backup = require("../modules/Mysql/Backup");

const { Sequelize, Op } = require("sequelize");
const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");

const shell = require("shelljs");

let inputPath, gid;

module.exports = async (req, res) => {
  const { slug } = req.query;
  try {
    if (!slug) return res.json({ status: false });

    let where = {},
      where_files = {},
      where_data = {},
      data = {},
      limit = 5,
      mainpath = `${global.dir}/public/${slug}/`,
      backup_gid;

    //find process
    where_data.type = "download";
    where_data.slug = slug;

    const FindData = await Progress.findOne({ where: where_data });

    if (!FindData)
      return res.json({ status: false, msg: `Progress not found` });

    // backup ID
    let tmp_upload = `${mainpath}/upload.txt`;
    let matchGid = /Uploaded ([\w\-]{28,}) at/i;
    const f_read = fs.readFileSync(tmp_upload, "utf8");

    if (!matchGid.test(f_read)) {
      return res.json({ status: false });
    }

    const match = f_read.match(matchGid);

    if (!match[1]) {
      return res.json({ status: false });
    } else {
      backup_gid = match[1];
      gid = backup_gid;
    }

    let data_out = await driveInfo();

    //Check 404
    let error404 = /Failed to get file/i;

    if (error404.test(data_out)) {
      return res.json({ status: false, data_out });
    }

    let gdata = await driveData(data_out);
    if (!gdata) {
      return res.json({ status: false });
    }

    // ffmpeg
    inputPath = `${mainpath}/${gdata?.Name}`;

    let ffmpeg_data = await getVideoData();
    // update file
    data.status = 2;
    data.e_code = 0;
    data.backup = backup_gid;
    //data.mimetype=`${ffmpeg_data?.streams[0].codec_type}`
    data.mimesize = `${ffmpeg_data?.streams[0].width}x${ffmpeg_data?.streams[0].height}`;
    data.filesize = ffmpeg_data?.format?.size || 0;
    data.duration = Math.floor(ffmpeg_data?.format?.duration) || 0;

    await timeSleep(2);
    //check has backup
    const bu = await Backup.findOne({
      attributes: ["id"],
      where: {
        slug: slug,
        quality: "default",
      },
    });

    let data_bu = {};
    data_bu.backup = backup_gid;
    data_bu.quality = "default";
    data_bu.slug = slug;
    data_bu.mimesize = data.mimesize;
    data_bu.filesize = data.filesize;

    //find file
    const file = await Files.findOne({
      raw: true,
      attributes: ["uid", "id", "slug"],
      where: {
        slug: slug,
      },
    });

    if (file?.id) {
      data_bu.uid = file?.uid;
      data_bu.fid = file?.id;
    }

    if (bu?.id) {
      await Backup.update(data_bu, {
        where: { id: bu?.id },
        silent: true,
      });
    } else {
      await Backup.create(data_bu);
    }


    await Files.update(data, {
      where: { id: FindData.fid },
      silent: true,
    });
    // update server

    await Servers.update(
      { work: 0 },
      {
        where: { id: FindData.sid },
        silent: true,
      }
    );
    // delete process
    await Progress.destroy({ where: { id: FindData.id } });

    return res.json({ status: true, data });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
async function driveInfo() {
  return new Promise(function (resolve, reject) {
    shell.exec(
      `gdrive info ${gid}`,
      { async: true, silent: true },
      function (code, stdout, stderr) {
        resolve(stdout);
      }
    );
  });
}

async function driveData(data) {
  let output = {};
  let html = data.split(/\r?\n/);
  await html.forEach((k, i) => {
    if (k.trim()) {
      let value = k.split(": ");
      let index = value[0];
      let item = value[1];
      output[index] = item;
    }
  });
  return new Promise(function (resolve, reject) {
    resolve(output);
  });
}
function getVideoData() {
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath).ffprobe((err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
}
