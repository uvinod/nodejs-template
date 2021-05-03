class BaseMiddleware {
  constructor(request, response, next) {
    this.request = request;
    this.response = response;
    this.next = next
  }
  
  static export() {
    return (...params) => new (this)(...params)
  }
}

module.exports = BaseMiddleware;
