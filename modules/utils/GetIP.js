"use strict";

const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const TimeSleep = require("./TimeSleep");

module.exports = async (e) => {
  let cache_dir = path.join(global.dir, `.cache`);
  try {
    if (!fs.existsSync(`${cache_dir}/server_ip.txt`)) {
      await fs.ensureDir(cache_dir);
      shell.exec(
        `#!/usr/bin/env bash
      set -e
      localip=$(hostname -I | awk '{print $1}')
      printf "$localip\n"> ${cache_dir}/server_ip.txt`,
        { async: true, silent: true },
        function (data) {}
      );
      await TimeSleep(3);
    }
    let sv_ip = await fs
      .readFileSync(`${cache_dir}/server_ip.txt`, "utf8")
      .trim();

    return sv_ip;
  } catch (error) {
    console.error(error);
    return;
  }
};
