"use strict";
const fs = require("fs");
const path = require("path");

module.exports = async (req, res) => {
  const { slug } = req.query;

  try {
    if (!slug) return res.json({ status: false, msg: "not_slug" });
    // DL
    let tmp = `${global.dir}/public/${slug}/dl_${slug}.txt`;
    if (!fs.existsSync(tmp))
      return res.json({ status: false, msg: "not_file_exists" });
    const html = fs.readFileSync(tmp, "utf8");

    let data = await checkStatusFile(html);

    return res.json(data);
  } catch (err) {
    return res.json({ status: false, msg: error.name });
  }
  async function checkStatusFile(html) {
    let data = { status: false, msg: "not_html" };

    if (!html) return data;

    var regex = {
      err500: /500 Internal Server Error/gm,
      err403: /403 Forbidden/gm,
      failed: /Failed/gm,
      quotaOver: /downloadQuotaExceeded/gm,
    };

    if (html.match(regex.err500)) {
      data.msg = "e_500";
    } else if (html.match(regex.err403)) {
      data.msg = "e_403";
    } else if (html.match(regex.quotaOver)) {
      data.msg = "quota_over";
    } else if (html.match(regex.failed)) {
      data.msg = "failed";
    }
    
    return { status: true };
  }
};
