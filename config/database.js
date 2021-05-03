const Env = use('Env');

module.exports = {
  ENABLE_MYSQL: Env.get("MYSQL", "0"),
  MYSQL_HOST: Env.get("MYSQL_HOST", ""),
  MYSQL_PORT: Env.get("MYSQL_PORT", ""),
  MYSQL_USER: Env.get("MYSQL_USER", ""),
  MYSQL_PASS: Env.get("MYSQL_PASS", ""),
  MYSQL_DB: Env.get("MYSQL_DB", ""),
  MYSQL_POOL_MIN_SIZE: Env.get("MYSQL_POOL_MIN_SIZE", 5),
  MYSQL_POOL_MAX_SIZE: Env.get("MYSQL_POOL_MAX_SIZE", 30)
};
