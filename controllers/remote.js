"use strict";
const fs = require("fs");
const Files = require("../modules/Mysql/Files");
const { GenerateID, SourceAllow , ExistsLinks } = require("../modules/Function");
const shell = require("shelljs");

module.exports = async (req, res) => {
  const { link } = req.body;
  const { id } = req.user;
  let gid;

  try {
    if (!link) return res.json({ status: false });

    let allow = await SourceAllow(link);

    if (allow?.type != "gdrive") return res.json({ status: false });

    //find file
    const LinksExists = await ExistsLinks(id, allow?.type, allow?.source);

    if (LinksExists?.status) return res.json({ status: false });

    gid = allow?.gid;

    if (!gid) return res.json({ status: false });

    let data_out = await driveInfo();

    //Check 404
    let error404 = /Failed to get file/i;

    if (error404.test(data_out)) {
      return res.json({ status: false, data_out });
    }

    let data = await driveData(data_out);
    if (data) {
      let out = {};

      out.uid = id;
      out.title = data?.Name;
      out.mimetype = data?.Mime;
      out.type = allow?.type;
      out.slug = GenerateID(15);
      out.source = allow?.source;

      const insert = await Files.create(out);

      return res.json({ status: true, out });
    } else {
      return res.json({ status: false });
    }
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
  async function driveInfo(req, res) {
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
};
