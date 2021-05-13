const Env = use('Env');

module.exports = {
  SECRET_KEY: Env.get("SECRET_KEY", "4wsjLSopTjD6WQEztTYIZgCFou8wpLJn"),
  JWT_EXPIRE: 86400, //24h
  JWT_REFRESH_TIME: 86400 //24h
};
