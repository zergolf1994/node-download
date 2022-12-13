"use strict";

const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const Genid = require("./Genid");

module.exports = async (err) => {
  let log_dir = path.join(global.dir, `.logs`),
    log_token = Genid(20);

  try {
    if (!err) return;

    await fs.ensureDir(log_dir);
    
    shell.exec(
      `echo ${err} > ${log_dir}/${log_token}.txt`,
      { async: false, silent: false },
      function (data) {}
    );
  } catch (error) {
    console.error(error);
    return;
  }
};
