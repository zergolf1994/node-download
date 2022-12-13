"use strict";

const path = require("path");
const fs = require("fs");

const { Servers } = require("../modules/db");
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  const { sv_ip, sv_name } = req.query;
  try {
    if (!sv_ip) return res.json({ status: false });

    let where = {},
      data = {};
    where.sv_ip = sv_ip;
    where.type = "download";

    //find server
    const ServerExists = await Servers.findOne({ where });

    if (!ServerExists) {
      data.sv_ip = sv_ip;
      data.sv_name = sv_name || sv_ip;
      data.type = "download";

      const insert = await Servers.create(data);

      if (insert?.id) {
        return res.json({ status: true, msg: `${sv_ip} created` });
      } else {
        return res.json({ status: false, msg: `false insert` });
      }
    } else {
      return res.json({ status: false, msg: `${sv_ip} already exists` });
    }
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};
