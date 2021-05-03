const env = use('dotenv').config().parsed;

module.exports = (pathFile) => ({
  get: function (name, defaultValue = null) {
    return env[name] || defaultValue
  },
  
  all: function() {
    return env
  }
});
