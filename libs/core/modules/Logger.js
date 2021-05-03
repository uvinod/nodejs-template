const winston = require('winston');
const { combine, timestamp, printf, splat } = winston.format;
require('winston-daily-rotate-file');
const configStorage = use('config/storage')
const logConfig = use("config/log");

module.exports = () => {
  const myFormat = printf(info => {
      // you can get splat attribue here as info[Symbol.for("splat")]
      // if you custom splat please rem splat() into createLogger()
      return `${info.timestamp} ${info.level}: ${JSON.stringify(info.message,null)}`;
  });
  return (folderName, options = {}) => {
    let path = logConfig.DIRNAME
    if(folderName) path += `${folderName}/`

    let transportOptions ={
      dirname: path,
      datePattern: logConfig.DATE_PATTERN,
      zippedArchive: false,
      maxSize: logConfig.MAXSIZE,
      maxFiles: logConfig.MAXFILES
    }

    const logger = winston.createLogger({
      level: 'info',
      //format: winston.format.json(),
      format: combine(
        timestamp(),
        splat(),
        //prettyPrint(),
        myFormat
      ),
      transports: [
        new (winston.transports.DailyRotateFile)({ filename: `%DATE%-error-${configStorage.NAME_SERVER}.log`, level: 'error', ...transportOptions }),
        new (winston.transports.DailyRotateFile)({ filename: `%DATE%-info-${configStorage.NAME_SERVER}.log`, level: 'info', ...transportOptions }),
      ],
      ...options
    });

    return logger
  }
}
