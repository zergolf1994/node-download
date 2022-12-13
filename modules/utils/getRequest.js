const http = require("http");
const request = require("request");

module.exports = async (url, txt = false) => {
  try {
    return new Promise(function (resolve, reject) {
      request(
        {
          url,
        },
        (err, resp, body) => {
          if (err) {
            resolve({ status: false, msg: "error" });
          }
          if (!err && resp.statusCode == 200) {
            if (txt == true) {
              resolve(resp.body);
            } else {
              const parsed = JSON.parse(resp.body);
              resolve(parsed);
            }
          } else {
            resolve({ status: false, msg: "error" });
          }
        }
      );
    });
  } catch (error) {
    console.log(error);
    return { status: false, msg: "error" };
  }
};
