const fs = require('fs')
const path = require('path')
class Image {
  static base64ToBuffer(source) {
    let base64Data = source.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64')
  }
  static base64ToFile({ source, pathFile, filename }) {

    try {
      if (!fs.existsSync(pathFile)) {
        fs.mkdirSync(pathFile, { recursive: true });
      }
      let base64Data = source.replace(/^data:image\/\w+;base64,/, '');
      fs.writeFile(path.join(pathFile,filename), base64Data, 'base64', function (err) {
        if (err) throw new Error(err)
      });
    }
    catch (e) {
      throw new Error(e)
    }
    return `${filename}`
  }
}

module.exports = Image