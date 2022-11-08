"use strict";

const path = require("path");
const fs = require("fs");
const Files = require("../modules/Mysql/Files");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const { Sequelize, Op } = require("sequelize");
const shell = require("shelljs");
const { SettingValue, getSourceGdrive } = require("../modules/Function");

module.exports = async (req, res) => {
  const { slug } = req.query;
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
      attributes: ["folder"],
      where: { id: pc?.sid },
    });

    let data = {};
    if (file?.type == "gdrive") {
      data.status = true;
      data.title = "default";
      data.type = "gdrive";
      data.source = file?.source;
    } else if (file?.type == "direct") {
      data.status = true;
      data.title = "default";
      data.type = "direct";
      data.ext = "mp4";
      data.speed = 30;
      data.source = file?.source;
    } else {
      data.status = false;
    }

    return res.json({ ...data, ...sv });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name, t:"dl_data" });
  }
};
