"use strict";
const SizeTobyte = require("./SizeTobyte");

module.exports = async (html) => {
  const data = {
    percent: 0,
    uploaded: false,
    data: false,
    err: false,
  };
  if (!html) return data;

  try {
    var regex = {
      downloading: /Downloading/gm,
      downloaded: /Downloaded/gm,
      failed: /Failed/gm,
    };

    if (html.match(regex.failed)) {
      data.err = true;
    } else if (html.match(regex.downloading)) {
      if (html.match(regex.downloaded)) {
        data.percent = 100;
        data.downloaded = true;
      } else {
        let code = html.replace(/\s\s+/g, " ");
        let regexp = /(.*?)Rate(.*?)\/s/g;
        let array = [...code.match(regexp)];
        data.data = array.at(-1).trim().split(",")[0];

        if (data.data) {
          let downloading = SizeTobyte(data.data.split("/")[0]);
          let fileSize = SizeTobyte(data.data.split("/")[1]);
          data.percent = ((downloading * 100) / fileSize ?? 0).toFixed(0);
        }
      }
    }

    return data;
  } catch (error) {
    console.error(error);
    return;
  }
};
