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
} = require("../modules/utils");

module.exports = async (req, res) => {
  const sv_ip = await GetIP();
  const { slug } = req.query;

  try {
  } catch (error) {
    await WriteLog(error);
    return res.json({ status: false, msg: `error` });
  }
};
