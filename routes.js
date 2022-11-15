"use strict";
const express = require("express");
const router = express.Router();
const moment = require("moment");
const auth = require("./modules/Auth");

router.all("/", (req, res) =>
  res.status(200).json({ status: true, msg: "welcom to zembed.xyz" })
);

router.get("/run", require("./controllers/run"));
router.get("/dl/run", require("./controllers/dl.run"));
router.get("/download/backup", require("./controllers/dl.backup"));
router.get("/download/start", require("./controllers/dl.start"));
router.get("/download/data", require("./controllers/dl.data"));
router.get("/download/done", require("./controllers/dl.done"));
router.get("/download/error", require("./controllers/dl.error"));
router.get("/download/check", require("./controllers/dl.check"));

router.all("/rename", require("./controllers/rename"));
router.all("/remote", auth, require("./controllers/remote"));

//add token gdrive
router.get("/gdrive/token", require("./controllers/gdrive.token"));

//server
router.get("/server/create", require("./controllers/server.create"));
router.get("/server/update", require("./controllers/server.update"));
//gdrive info
router.get("/gdrive/info", require("./controllers/gdrive.info"));

router.all("*", function (req, res) {
  res.status(404).json({ status: false, msg: "page not found" });
});
module.exports = router;
