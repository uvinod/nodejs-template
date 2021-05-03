const Env = use('Env');

module.exports = {
  APPLOGS_PATH: Env.get("APPLOGS_PATH", "/mys3bucket/DATA/AppLogs/"),  
  STORE_PATH: Env.get("STORE_PATH", "/mys3bucket/DATA/Store/"),  
  NAME_SERVER: Env.get("NAME_SERVER", ""),  
};