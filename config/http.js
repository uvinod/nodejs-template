const Env = use('Env');

module.exports = {
  HOST: Env.get("HOST", "127.0.0.1"),
  PORT: Env.get("PORT", "3000")
};
