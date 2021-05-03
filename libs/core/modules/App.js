const appDir = `${process.cwd()}/app/`;

module.exports = (pathFile) => {
  let newPath = pathFile.substr(3);
  return require(`${appDir}${newPath}`)
};
