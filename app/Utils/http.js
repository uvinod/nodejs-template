const Lang = use('lang/lang_backend.json');
const DefaultLangCode = 'en';

module.exports = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  
  createErrorInvalidInput(msgOrKey, langCode) {
    return this.createError(this.BAD_REQUEST, msgOrKey, langCode);
  },
  
  createError(code, msgOrKey, langCode) {
    let err = {
      code: code,
      message: msgOrKey
    };
    if (Lang[msgOrKey]) {      
      // this is the key -> find the corresponding message content by key
      err.message = Lang[msgOrKey][langCode] || Lang[msgOrKey][DefaultLangCode] || key;
    }
    return err;
  }
};
