// Update with your config settings.
const env = require('dotenv').config().parsed;
const {MYSQL_HOST, MYSQL_USER, MYSQL_PASS, MYSQL_DB} = env;

module.exports = {

  development: {
    client: 'mysql',
    connection: {
      host:     MYSQL_HOST,
      user:     MYSQL_USER,
      password: MYSQL_PASS,
      database: MYSQL_DB
    },
    pool: {
      min: 5,
      max: 30,
      propagateCreateError: true
    },
    migrations: {
      directory: 'databases/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: 'databases/seeds',
    }
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 5,
      max: 30,
      propagateCreateError: true
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql',
    connection: {
      host:     MYSQL_HOST,
      user:     MYSQL_USER,
      password: MYSQL_PASS,
      database: MYSQL_DB
    },
    pool: {
      min: 5,
      max: 30,
      propagateCreateError: true
    },
    migrations: {
      directory: 'databases/migrations',
      tableName: 'migrations'
    },
    seeds: {
      directory: 'databases/seeds',
    }
  }
};
