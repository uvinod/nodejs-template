var path = require('path');
var fs = require('fs');
const awaitTo = require('await-to-js').default;
const rootDir = process.cwd();
const fileInRoot = fs.readdirSync(rootDir);
const env = require('dotenv').config().parsed;

Object.defineProperty(global, '__ISDEV__', {
  get: function(){
    let mode = env['NODE_ENV'] || "development"
    if(mode == "production") return false
    return true
  }
})
Object.defineProperty(global, '__ROOTDIR__', {
  get: function(){
    return rootDir
  }
})
Object.defineProperty(global, '__stack', {
  get: function () {
    let orig = Error.prepareStackTrace;
    Error.prepareStackTrace = function (_, stack) {
      return stack;
    };
    let err = new Error;
    Error.captureStackTrace(err, arguments.callee);
    let stack = err.stack;
    Error.prepareStackTrace = orig;
    return stack;
  }
});

Object.defineProperty(global, 'use', {
  get: function () {
    //return require(pathFile)
    return (pathFile) => {
      const absoluteDir = path.dirname(__stack[1].getFileName());
      let error = null;
      // Try with default require in node_modules
      try {        
        // try with relative path
        if (pathFile.substring(0, 1) == ".") {
          return require(`${absoluteDir}/${pathFile}`)
        }
        // try with expansion modules
        const file = `${__dirname}/modules/${pathFile.split("/")[0]}.js`;
        if (fs.existsSync(file)) {
          let moduleExtend = require(file);
          return moduleExtend(pathFile)
        }
        // try with root directory
        if (fileInRoot.includes(pathFile.split("/")[0])) {
          return require(`${rootDir}/${pathFile}`)
        }        
        // try with node_modules
        return require(pathFile)
      } catch (e) {
        throw e
      }
    }
  }
});

Object.defineProperty(global, 'to', {
  get: function () {
    return (promise) => awaitTo(promise)
  }
});
