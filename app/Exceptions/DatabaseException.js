const Exception = use("Exception");
const {INTERNAL_SERVER_ERROR} = require('../Utils/http');

class DatabaseException extends Exception {
  
  constructor(error = "") {
    let message = error;
    if (typeof error != "string") {
      message = error.message
    }
    
    let data = {};
    if (error.name === "MongoError") {
      message = `[Database Error]: ${error.message}`;
      data = error.stack
    }
    super(INTERNAL_SERVER_ERROR, message, data);
  }
}

module.exports = DatabaseException;
