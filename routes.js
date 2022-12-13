"use strict";
const express = require("express");
const router = express.Router();
const auth = require("./modules/Auth");

router.get("/run", require("./controllers/run"));
router.get("/dl/run", require("./controllers/dl.run"));

router.all("/rename", require("./controllers/rename"));

router.get("/start", require("./controllers/dl.start"));
router.get("/data", require("./controllers/dl.data"));
router.get("/status", require("./controllers/dlv2.status"));
router.get("/backup", require("./controllers/dl.backup"));
router.get("/done", require("./controllers/dl.done"));
router.get("/error", require("./controllers/dl.error"));

//router.get("/download/check", require("./controllers/dl.check"));

//router.all("/remote", auth, require("./controllers/remote"));


//server
router.get("/server/create", require("./controllers/server.create"));
//gdrive info
router.get("/gdrive/info", require("./controllers/gdrive.info"));
//add token gdrive
router.get("/gdrive/token", require("./controllers/gdrive.token"));

router.all("/active", (req, res) =>
  res.status(200).json({ status: true, msg: "site_active" })
);
router.all("*", function (req, res) {
  res.status(404).json({ status: false, msg: "not_found" });
});
module.exports = router;
