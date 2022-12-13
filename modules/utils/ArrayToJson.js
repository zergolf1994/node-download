module.exports = (array) => {
    try {
      let data = {};
      
      for (var key in array) {
        let name = array[key].name;
        let value = array[key].value;
        data[name] = value;
      }
  
      return data;
    } catch (error) {
      return;
    }
  };
  