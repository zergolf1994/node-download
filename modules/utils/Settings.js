const { Settings } = require("../db");
const ArrayToJson = require("./ArrayToJson");

module.exports = async (e) => {
  try {
    const result = await Settings.findAll({
      raw: true,
      attributes: { exclude: ["id", "createdAt", "updatedAt"] },
    });
    if(e){
      return await ArrayToJson(result)
    }else{
      return result;
    }
  } catch (error) {
    console.log(error)
    return;
  }
};
