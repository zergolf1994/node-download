"use strict";

module.exports = async (html) => {
  const data = {
    percent: 0,
    downloaded: false,
    filesize: 0,
    err: false,
  };
  if (!html) return data;

  try {
    var regex = {
      percent: /[0-9]{1,}%/gm,
      fileSize: /File size: [0-9]{1,}/gm,
      Downloaded: /Downloaded (.*?)/gm,
      err500: /500 Internal Server Error/gm,
      err403: /403 Forbidden/gm,
      downloading: /Starting download/gm,
    };

    if (!html.match(regex.downloading)) {
      if (html.match(regex.err500)) {
        //เช็คว่า err
        data.err = html.match(regex.err500);
      } else if (html.match(regex.err403)) {
        //เช็คว่า err
        data.err = html.match(regex.err403);
      }
    } else {
      if (html.match(regex.Downloaded)) {
        //เช็คว่าโหลดเสร็จแล้ว
        data.downloaded = true;
        data.percent = 100;
      } else if (html.match(regex.downloading)) {
        // Get percent
        let code = html.split(/\r?\n/);
        let percent = [];
        await code.forEach((k, i) => {
          if (k.match(regex.percent)) {
            var nameitem = k.match(regex.percent);
            //console.log(nameitem)
            if (nameitem) {
              if (
                !percent.includes(parseInt(nameitem[0].replace("%", "").trim()))
              ) {
                percent.push(parseInt(nameitem[0].replace("%", "").trim()));
              }
            }
          }
        });
        data.percent = percent.at(-1);
      }

      //file size
      if (html.match(regex.fileSize)) {
        //เช็ค size
        let size = html.match(regex.fileSize);
        if (size) {
          data.filesize = parseInt(size[0].replace("File size:", "").trim());
        }
      }
    }
    return data;
  } catch (error) {
    console.error(error);
    return;
  }
};
