"use strict";

const fs = require("fs-extra");
const path = require("path");
const shell = require("shelljs");
const TimeSleep = require("./TimeSleep");

module.exports = async (e) => {
  let cache_dir = path.join(global.dir, `.cache`);
  try {
    if (!fs.existsSync(`${cache_dir}/server_name.txt`)) {
      await fs.ensureDir(cache_dir);
      shell.exec(
        `#!/usr/bin/env bash
      set -e
      hostname=$(hostname)
      printf "$hostname\n"> ${cache_dir}/server_name.txt`,
        { async: true, silent: true },
        function (data) {}
      );
      await TimeSleep(3);
    }
    let sv_ip = await fs
      .readFileSync(`${cache_dir}/server_name.txt`, "utf8")
      .trim();

    return sv_ip;
  } catch (error) {
    console.error(error);
    return;
  }
};
