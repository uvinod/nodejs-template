const Env = use('Env');

module.exports = {
  SECRET_KEY_SELLER: Env.get("SECRET_KEY_ADMIN", "4wsjLSopTjD6WQEztTYIZgCFou8wpLJn"),
  JWT_EXPIRE_SELLER: 86400, //24h
  JWT_REFRESH_TIME: 86400 //24h
};
