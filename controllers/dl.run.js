"use strict";

const path = require("path");
const shell = require("shelljs");

module.exports = async (req, res) => {
  const { slug } = req.query;

  try {
    shell.exec(
      `sudo dos2unix ${global.dir}/shell/run.sh`,
      { async: false, silent: false },
      function (data) {}
    );

    shell.exec(
      `sudo dos2unix ${global.dir}/shell/download.sh`,
      { async: false, silent: false },
      function (data) {}
    );
    if (!slug) return res.json({ status: false, msg: "not_slug_file" });

    shell.exec(
      `sudo bash ${global.dir}/shell/download.sh ${slug}`,
      { async: false, silent: false },
      function (data) {}
    );

    return res.json({ status: true });
  } catch (error) {
    return res.json({ status: false, msg: error.name, t:"dl_run" });
  }
};
