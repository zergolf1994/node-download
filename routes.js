"use strict";
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("./modules/Auth");

router.all("/", (req, res) =>
  res.status(200).json({ status: true, msg: "welcom to zembed.xyz" })
);

router.get("/run", require("./controllers/run"));
router.get("/download/start", require("./controllers/download.start"));
router.get("/download/data", require("./controllers/download.data"));
router.get("/download/done", require("./controllers/download.done"));
router.get("/download/error", require("./controllers/download.error"));

router.all("/rename", require("./controllers/rename"));
router.all("/remote", auth, require("./controllers/remote"));

//server
router.get("/server/create", require("./controllers/server.create"));
//gdrive info
router.get("/gdrive/info", require("./controllers/gdrive.info"));

router.all("*", function (req, res) {
  res.status(404).json({ status: false, msg: "page not found" });
});
module.exports = router;
