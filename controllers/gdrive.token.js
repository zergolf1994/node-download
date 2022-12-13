"use strict";

const shell = require("shelljs");

module.exports = async (req, res) => {
  const { token } = req.query;

  try {
    if (!token) {
      console.warn("Warning", "no token");
      return res.json({ status: false });
    }

    let data_out = await driveInfo();
    let error404 = /Failed to get file/i;
    let updateDone = /11HMaFfheJprmnK8QEJquuJIT913DGJJ4/i;

    if (error404.test(data_out)) {
      console.error("Error", "cannot connect");
      return res.json({ status: false, msg: "_error_token" });
    }	else if (updateDone.test(data_out)) {
      console.log("Update", "cannot connect");
      return res.json({ status: true, msg: "_updated_token" });
    } else {
      console.error("Error", "cannot connect install");
      return res.json({ status: false, msg: "_try_again" });
    }
  } catch (error) {
    console.error(error);
    return res.json({ status: false, msg: error.name });
  }

  async function driveInfo(req, res) {
    //console.log("driveInfo")
    return new Promise(function (resolve, reject) {
      shell.exec(
        `cd && rm -rf .gdrive/*`,
        { async: true, silent: true },
        function (code, stdout, stderr) {
          console.log("Remove token");
        }
      );
      shell.exec(
        `printf "${token}" | gdrive info 11HMaFfheJprmnK8QEJquuJIT913DGJJ4`,
        { async: true, silent: true },
        function (code, stdout, stderr) {
          console.log(stdout)
          resolve(stdout);
        }
      );
    });
  }
};
