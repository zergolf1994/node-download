"use strict";

const shell = require("shelljs");

module.exports = async (req, res) => {
    
  const { token } = req.query;

  try {
    if (!token) return res.json({ status: false });

    let data_out = await driveInfo();
    let error404 = /Failed to get file/i;

    if (error404.test(data_out)) {
      return res.json({ status: false, msg: "error" });
    } else {
      return res.json({ status: true, msg: "update token" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ status: false, msg: error.name });
  }

  async function driveInfo(req, res) {
    //console.log("driveInfo")
    return new Promise(function (resolve, reject) {
      shell.exec(
        `printf "${token}" | gdrive info ${gid}`,
        { async: true, silent: true },
        function (code, stdout, stderr) {
          //console.log(stdout)
          resolve(stdout);
        }
      );
    });
  }
};
