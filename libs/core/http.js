let express = require('express');
let bodyParser = require('body-parser');
let app = express();
const config = use('config/http');
const Router = use('Route');
const http = require('http')
const server = http.createServer(app)

class Http {

  static getServer() {
    return server
  }

  static listen(port, host) {
    this.host = host;
    this.port = port;
    return this
  }

  static use(middleware) {
    app.use(middleware)
  }

  static addHookBeforeStart(func) {
    if (!this.hooksBeforeStart) this.hooksBeforeStart = [];
    this.hooksBeforeStart.push(func)
  }

  static async start() {
    this.hooksBeforeStart.map(hook => {
      hook({app})
    });
    /* app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(Router.build()) */

    server.listen(this.port, this.host, () => {
      console.log(`server stated: ${this.host}:${this.port}`);
      if (typeof callback == "function") {
        return server
      }
    })
  }
}

Http.host = config.HOST;
Http.port = config.PORT;
module.exports = Http;
