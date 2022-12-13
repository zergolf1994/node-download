module.exports = (size) => {
  try {
    let ext = size.split(" ");
    let val = ext[0],
      unit = ext[1];

    let bytes = 0;
    if (unit == "B") {
      bytes = val;
    } else if (unit == "KB") {
      bytes = 1024 * val;
    } else if (unit == "MB") {
      bytes = 1024 * 1024 * val;
    } else if (unit == "GB") {
      bytes = 1024 * 1024 * 1024 * val;
    }

    return bytes;
  } catch (error) {
    return;
  }
};
