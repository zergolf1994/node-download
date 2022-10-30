"use strict";

const shell = require("shelljs");

module.exports = async (req, res) => {
  const { gid } = req.query;
  try {
    if (!gid) return res.json({ status: false });

    let data_out = await driveInfo();

    //Check 404
    let error404 = /Failed to get file/i;

    if (error404.test(data_out)) {
      return res.json({ status: false, data_out });
    }

    let data = await driveData(data_out);
    if(data){
        data.ext = data?.Mime.split("/")[1];
        return res.json({ status: true, data });
    }else{
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
