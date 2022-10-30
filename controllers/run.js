"use strict";

const path = require("path");
const shell = require('shelljs');

module.exports = async (req, res) => {
  
  try {
    shell.exec(`bash /home/shell/run.sh`, {async: false, silent: false}, function(data){});
    return res.json({ status: true });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
