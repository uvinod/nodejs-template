const dbConfig = use('config/database');
const fs = require('fs');
const rootDir = process.cwd();
const KnexQueryBuilder = require('knex/lib/query/builder');

const options = {
  client: 'mysql',
  connection: {
    host: dbConfig.MYSQL_HOST,
    user: dbConfig.MYSQL_USER,
    password: dbConfig.MYSQL_PASS,
    database: dbConfig.MYSQL_DB,
    multipleStatements: true
  },
  pool: {
    min: Number(dbConfig.MYSQL_POOL_MIN_SIZE),
    max: Number(dbConfig.MYSQL_POOL_MAX_SIZE),
    createTimeoutMillis: 3000,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 30000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 100,
    propagateCreateError: true
  },
  acquireConnectionTimeout: 10000
};

class Connection {
  constructor() {
    console.log("new mysql connection")
  }

  get connection() {
    if (this._connection && !this._connection.connecting) {
      this.connect()
    }
    return this._connection
  }

  set connection(connection) {
    this._connection = connection;
    this._connection.connecting = true
  }

  async connect() {
    try {
      const knex = require('knex')(options);
      var files = fs.readdirSync(`${rootDir}/app/Models/QueryBuilder/`);
      for (let file of files) {
        if (file === "Base.js") continue;
        let instance = require(`${rootDir}/app/Models/QueryBuilder/${file}`)
        instance.init(KnexQueryBuilder)
      }
      knex.queryBuilder = function queryBuilder() {
        return new KnexQueryBuilder(knex.client);
      }

      this.connection = knex;
      return this.connection || {}
    } catch (e) {
      console.error('Connection Error:', e)
    }
  }
}

module.exports = Connection;
