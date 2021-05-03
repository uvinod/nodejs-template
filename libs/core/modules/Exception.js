const ExceptionHandlerInstance = use("App/Exceptions/Handler");

class Exception {
  static handle(error, request, response) {
    this.request = request;
    this.response = response;
    if(typeof error== "string"){
      error = {
        code: 500,
        message: error
      }
    }
    error.code = error.code || 500;
    error.message = error.message || "";
    error.data = error.data || error.stack || {};
    let ExceptionHandler = new ExceptionHandlerInstance();
    ExceptionHandler.handle(error, {request, response})
    //response.error(status, message, data)
  }

  constructor(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data
  }
}

module.exports = (pathFile) => {
  return Exception
};
