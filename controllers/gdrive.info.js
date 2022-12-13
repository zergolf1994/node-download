"use strict";

const shell = require("shelljs");
const request = require("request");
const queryString = require("query-string");

module.exports = async (req, res) => {
  const { gid } = req.query;
  try {
    if (!gid) return res.json({ status: false });

    let data_out = await driveInfo();

    //Check 404
    let error404 = /Failed to get file/i;
    let verifi = /Enter verification code/i;

    if (error404.test(data_out)) {
      const { errorcode } = await driveInfoRequset(gid);

      return res.json({ status: false, data_out, errorcode });
    } else if (verifi.test(data_out)) {
      return res.json({ status: false, msg: "_please_update_token" });
    } else if (data_out != "") {
      let data = await driveData(data_out);
      if (data) {
        data.ext = data?.Mime.split("/")[1];
        return res.json({ status: true, data });
      } else {
        return res.json({ status: false });
      }
    }
    return res.json({ status: false, msg: "_please_update_token" });
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }

  async function driveInfoRequset(gid) {
    const url = `https://docs.google.com/get_video_info?docid=${gid}`;
    return new Promise(function (resolve, reject) {
      request(url, function (error, response, body) {
        const parsed = queryString.parse(response.body);
        resolve(parsed);
      });
    });
  }
  async function driveInfo(req, res) {
    try {
      return new Promise(function (resolve, reject) {
        shell.exec(
          `printf "test" | gdrive info ${gid}`,
          { async: true, silent: true },
          function (code, stdout, stderr) {
            resolve(stdout);
          }
        );
      });
    } catch (error) {
      //console.log(error)
      return res.json({ status: false, msg: error.name });
    }
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
