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
  TimeSleep,
  AxiosDownloadStatus,
  GdriveUploadStatus,
  GdriveDownloadStatus,
} = require("../modules/utils");

module.exports = async (req, res) => {
  const { slug } = req.query;
  const sv_ip = await GetIP();

  try {
    if (!slug) return res.json({ status: false, msg: "not_slug_file" });
    const pc = await Progress.findOne({
      raw: true,
      where: {
        type: "download",
        slug: slug,
      },
    });

    if (!pc) return res.json({ status: false, msg: "not_process_data" });

    const file = await Files.findOne({
      raw: true,
      where: { slug: slug },
    });
    if (!file) return res.json({ status: false, msg: "not_file_data" });

    const sv = await Servers.findOne({
      raw: true,
      attributes: ["folder", "sv_ip"],
      where: { id: pc?.sid },
    });
    if (sv?.sv_ip != sv_ip)
      return res.json({ status: false, msg: "sv_ip_not_match" });

    let tmp_dl = `${global.dir}/public/${pc?.slug}/dl_${pc?.slug}.txt`;
    let tmp_up = `${global.dir}/public/${pc?.slug}/up_${pc?.slug}.txt`;

    let data = {};
    data.download = 0;
    data.upload = 0;
    // สถานะ ดาวน์โหลด
    if (fs.existsSync(tmp_dl)) {
      //file exists
      let data_dl = await fs.readFileSync(`${tmp_dl}`, "utf8");
      let GdriveDownStatus = await GdriveDownloadStatus(data_dl);
      if (GdriveDownStatus?.err) {
        // update server to inactive
        await Servers.update(
          { active: 0 },
          {
            where: { id: pc?.sid },
          }
        );
        return res.json({ status: false, error: GdriveDownStatus?.err });
      }
      data.download = parseFloat(GdriveDownStatus?.percent);
    }
    // สถานะ อัพโหลด
    if (fs.existsSync(tmp_up)) {
      //file exists
      let data_up = await fs.readFileSync(`${tmp_up}`, "utf8");
      let GdriveStatus = await GdriveUploadStatus(data_up);
      if (GdriveStatus?.err) {
        console.error(slug, GdriveStatus?.err);
        // update server to inactive
        await Servers.update(
          { active: 0 },
          {
            where: { id: pc?.sid },
          }
        );
        return res.json({ status: false, error: GdriveStatus?.err });
      }
      data.upload = parseFloat(GdriveStatus?.percent);
    }

    let value = parseFloat((data.download + data.upload) / 2);
    let status = true;
    if (pc?.value == 100 && value == 100) {
      console.error(slug, "Downloaded");
      status = false;
    } else {
      if (pc?.value != value && value > 0) {
        await Progress.update(
          { value: value },
          {
            where: { id: pc?.id },
          }
        );
      }
    }
    return res.json({ status: status, data, value });
  } catch (error) {
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
