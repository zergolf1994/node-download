"use strict";

const request = require("request");
const queryString = require("query-string");
const GoogleAuthData = require("./GoogleAuthData");

module.exports = async (file) => {
  try {
    if (!file) return;
    const data = {};
    const url = `https://docs.google.com/get_video_info?docid=${file?.source}`;
    let token = await GoogleAuthData(file?.uid);
    if (!token) return;

    return new Promise(function (resolve, reject) {
      request(
        {
          url,
          proxy: "http://qjqkvcqd-rotate:72gpvbukvn4v@p.webshare.io:80",
          headers: {
            Authorization: `${token?.token_type} ${token?.access_token}`,
          },
        },
        function (error, response, body) {
          if (!error && response.statusCode == 200) {
            const parsed = queryString.parse(response.body);
            data.status = parsed.status;
            if (parsed.status == "ok") {
              data.title = parsed.title;

              if (parsed.fmt_stream_map) {
                const fmt_stream_map = parsed.fmt_stream_map.split(",");
                fmt_stream_map.forEach((k, i) => {
                  const [q, link] = k.split("|");
                  const size = q
                    .toString()
                    .replace(37, 1080)
                    .replace(22, 720)
                    .replace(59, 480)
                    .replace(18, 360);
                  if (size == 1080) {
                    data.file_1080 = link;
                  }
                  if (size == 720) {
                    data.file_720 = link;
                  }
                  if (size == 480) {
                    data.file_480 = link;
                  }
                  if (size == 360) {
                    data.file_360 = link;
                  }
                });
              }
              data.cookie = JSON.stringify(response.headers["set-cookie"]);
              data.date = new Date();
            } else {
              data.error_code = parsed.errorcode;
              data.error_text = parsed.reason;

              if (
                parsed?.errorcode == 150 &&
                parsed?.reason ==
                  "You don't have permission to access this video."
              ) {
                data.error_code = 151;
                data.error_text = parsed.reason;
                data.msg = "_google_private";
              }

              if (
                parsed?.errorcode == 100 &&
                parsed?.reason == "Video no longer exists."
              ) {
                data.error_code = 100;
                data.error_text = parsed.reason;
                data.msg = "_google_delete";
              }

              if (
                parsed?.errorcode == 150 &&
                parsed?.reason ==
                  "Unable to play this video at this time. The number of allowed playbacks has been exceeded. Please try again later."
              ) {
                data.error_code = 150;
                data.error_text = parsed.reason;
                data.msg = "_google_limit";
              }

              if (
                parsed?.errorcode == 150 &&
                parsed?.reason == "Video is unplayable."
              ) {
                data.error_code = 152;
                data.error_text = parsed.reason;
                data.msg = "_google_unplayable";
              }

              if (
                parsed?.errorcode == 150 &&
                parsed?.reason ==
                  "Video is too small to process for playback. Download to view."
              ) {
                data.error_code = 153;
                data.error_text = parsed.reason;
                data.msg = "_google_video_small";
              }

              if (
                parsed?.errorcode == 150 &&
                parsed?.reason == "Video is still processing. Try again later."
              ) {
                data.error_code = 155;
                data.error_text = parsed.reason;
                data.msg = "_google_still_process";
              }
              //console.log(parsed)
            }
            resolve(data);
          } else {
            data.status = false;
            resolve(data);
          }
        }
      );
    });
  } catch (error) {
    console.error(error);
    return;
  }
};
