"use strict";

const path = require("path");
const fs = require("fs");
const Servers = require("../modules/Mysql/Servers");

module.exports = async (req, res) => {
  const { sv_ip, app_api } = req.query;
  try {
    if (!sv_ip) return res.json({ status: false });

    let where = {},
      data = {};
    where.active = {[Op.ne]:2};
    where.sv_ip = sv_ip;
    where.type = "download";

    //find server
    const server = await Servers.findOne({ where });

    if (server) {
      if (server?.work) return res.json({ status: false, msg: `not_ready` });

      await Servers.update(
        { active: 2 },
        {
          where: { sv_ip: sv_ip },
          silent: true,
        }
      );

      shell.exec(
        `sudo cd && rm -rf update.sh wget -q http://${app_api}/install/download/update.sh && chmod +x update.sh && sudo bash update.sh`,
        { async: false, silent: false },
        function (data) {}
      );

      return res.json({ status: false, msg: `updating` });
    } else {
      return res.json({ status: false, msg: `not_ready` });
    }
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
