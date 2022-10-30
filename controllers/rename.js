"use strict";
const fs = require("fs");
const request = require("request-promise");

module.exports = async (req, res) => {
  const { gid, slug } = req.query;

  try {
    if (!gid || !slug) return res.json({ status: false });

    
    const g = await getRequest(`http://127.0.0.1:8888/gdrive/info?gid=${gid}`);

    if (!g?.status) return res.json({ status: false });

    
    let old_file = `/home/public/${slug}/${g?.data?.Name}`,
      new_file = `/home/public/${slug}/${slug}.${g?.data?.ext}`;


    fs.rename(old_file, new_file, () => {
      console.log("\nFile Renamed!\n");
    });

    return res.json({ status: true });
  } catch (error) {
    return res.json({ status: false, msg: error.name });
  }
};

async function getRequest(host) {
  let result = await request(host);
  return new Promise(function (resolve, reject) {
    resolve(JSON.parse(result));
  });
}
