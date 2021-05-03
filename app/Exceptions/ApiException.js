const Exception = use("Exception");
class ApiException extends Exception {

  constructor(code, message, data, extendCode) {
    data = {
      ...data,
      errorCode: extendCode
    }
    super(code, message, data);
  }

}

module.exports = ApiException;
