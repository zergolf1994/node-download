"use strict";

const path = require("path");
const fs = require("fs");
const Files = require("../modules/Mysql/Files");
const Servers = require("../modules/Mysql/Servers");
const Progress = require("../modules/Mysql/Progress");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { sv_ip, slug } = req.query;
  try {
    if (!slug) return res.json({ status: false });

    let where = {},
      where_files = {},
      where_data = {},
      data = {},
      limit = 5;

    //find process
    where_data.type = "download";
    where_data.slug = slug;

    const FindData = await Progress.findOne({ where: where_data });

    if (!FindData)
      return res.json({ status: false, msg: `Progress not found` });
    //find file
    where_files.status = 1;
    where_files.slug = slug;

    const FindFiles = await Files.findOne({ where: where_files });
    if (!FindFiles) return res.json({ status: false, msg: `Files not found` });

    const FindServer = await Servers.findOne({ where: {id:FindData?.sid} });
    if (!FindServer) return res.json({ status: false, msg: `Server not found` });
    
    if(FindFiles?.type == "direct"){
      data.title = "default";
      data.ext = "mp4";
      data.speed = 10;
    }else{
      data.title = FindFiles?.title;
    }
    data.source = FindFiles?.source;
    data.type = FindFiles?.type;
    data.folder = FindServer?.folder;

    return res.json({ status: false, data: data });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
