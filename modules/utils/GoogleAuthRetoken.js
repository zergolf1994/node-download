"use strict";

const request = require("request");

module.exports = async (client_id, client_secret, refresh_token) => {
  try {
    const data_reload = {
      client_id,
      client_secret,
      refresh_token,
      grant_type: "refresh_token",
    };

    const body = "";
    const url = "https://www.googleapis.com/oauth2/v4/token";
    return new Promise(function (resolve, reject) {
      request.post(url, { form: data_reload }, function (err, response, body) {
        const parsed = JSON.parse(response.body);
        delete parsed.expires_in;
        resolve(parsed);
      });
    });
  } catch (error) {
    console.error(error);
    return;
  }
};
