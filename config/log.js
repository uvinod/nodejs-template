const configStorage = use('config/storage')

module.exports = {
  MAXSIZE: '100m', //100MB
  MAXFILES: '30d', //30 days
  DATE_PATTERN: 'YYYY-MM-DD',
  DIRNAME: configStorage.APPLOGS_PATH
};
