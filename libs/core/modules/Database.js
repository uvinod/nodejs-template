const MysqlDatabase = new (require("../Databases/MysqlDriver/Connection"))();

module.exports = (pathFile) => {
  try {
    if (pathFile === "Database") {
      return MysqlDatabase
    }
    
    let path = "Databases/MysqlDriver/";
    
    return require(`../${pathFile.replace("Database/", path)}`)
  } catch (e) {
    console.log(e)
  }
};
