const Exception = use("Exception");

class ThirdPartyException extends Exception {

  constructor(message = "", data = null) {
    super(500, message, data);
  }
}

module.exports = ThirdPartyException;
