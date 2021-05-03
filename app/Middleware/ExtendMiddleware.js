const BaseMiddleware = use("./BaseMiddleware");
const Utils = use('App/Utils/utils');
const HttpUtil = use('App/Utils/http');
const ValidateUtil = use('App/Utils/validate');
const Lang = use('lang/lang_backend.json');
const logger = use('Logger')('api');

const {OK, BAD_REQUEST, UNAUTHORIZED, FORBIDDEN, NOT_FOUND, UNPROCESSABLE_ENTITY, INTERNAL_SERVER_ERROR} = HttpUtil;

/**
 * Extend the functionality of the response
 * success (data): call the function when there is data
 * error (code, message, data): call the function when there is an error
 */
class ExtendMiddleware extends BaseMiddleware {
  constructor(request, response, next) {
    super(request, response, next);
    this.request = request;
    this.response = response;

    let id = Date.now() +''+ Math.floor(Math.random() * 1000000000);
    let params = JSON.parse(JSON.stringify(this.getParamsFull()))
    delete params.idImages
    if(params.profile && params.profile.idImages){
      delete params.profile.idImages
    }
    logger.info(`REQUEST [${id}] ${JSON.stringify({
      method: this.request.method,
      url: this.request.originalUrl,
      headers: this.request.headers,
      data: params})}`)

    response.requestId = id;
    // extend request
    request.getParams = this.getParams.bind(this);
    request.getParamsFull = this.getParamsFull.bind(this);
    request.getParamsUrl = this.getParamsUrl.bind(this);
    request.getHeaders = this.getHeaders.bind(this);

    // extend response
    response.success = this.success.bind(this);
    response.error = this.error.bind(this);
    response.unauthorized = this.unauthorized.bind(this);
    response.forbidden = this.forbidden.bind(this);
    response.badRequest = this.badRequest.bind(this);
    response.unprocessable = this.unprocessable.bind(this);
    response.notFound = this.notFound.bind(this);
    response.internalServerError = this.internalServerError.bind(this);
    response.unauthorized = this.unauthorized.bind(this);
    response.notImplement = this.notImplement.bind(this);
    response.disableApi = this.disableApi.bind(this);
    response.ddd = this.ddd.bind(this);

    next()
  }

  getParams() {
    let p = {};
    Object.assign(p, this.request.query); // try to get from url query string
    Object.assign(p, this.request.body); // try to get from json
    return p;
  }

  getHeaders() {
    return {
      authUser: this.request.authUser,
      lang_code: this.request.headers.lang_code,
      role_code: this.request.headers.role_code,
      userAgent: this.request.headers['user-agent'],
      authorization: this.request.headers.authorization,
      other: this.request.headers
    }
  }

  getParamsFull() {
    let p = {};
    Object.assign(p, this.request.query);    // url query string, e.g api/users?param1=x&param2=y
    Object.assign(p, this.request.body);     // json parameters
    Object.assign(p, this.request.params);   // url parameters, e.g api/users/:id
    return p;
  }

  getParamsUrl() {
    return this.request.params || {}
  }

  getParamsBody() {
    return this.request.body || {}
  }

  getParamsQuery() {
    return this.request.query || {}
  }

  getRequiredParamsFromJson(req, required_param_names) {
    return ValidateUtil.checkRequiredParams(this.request.body, required_param_names);
  }

  getRequiredParamsFromJson2(req, required_param_names) {
    return ValidateUtil.checkRequiredParams2(this.request.body, required_param_names);
  }

  getRequiredParamsFromUrl(req, required_param_names) {
    return ValidateUtil.checkRequiredParams(this.request.query, required_param_names);
  }

  getRequiredParams(req, required_param_names) {
    const params = this.getParams();
    return ValidateUtil.checkRequiredParams(params, required_param_names);
  }

  getRequiredParams2(req, required_param_names) {
    const params = this.getParams();
    return ValidateUtil.checkRequiredParams2(params, required_param_names);
  }

  sendJSONResponse(data = null, httpCode = OK) {
    this.response.set('Access-Control-Allow-Origin', true);
    this.response.set('Access-Control-Allow-Credentials', true);
    
    this.response.status(httpCode);
    this.response.json(data);
  }

  success(data = null, httpCode = OK) {    
    logger.info(`RESPONSE [${this.response.requestId}][OK] ${JSON.stringify({
      data: data
    })}`)
    this.response.json(data);
  }

  handleError(httpCode, err, opt_info = null) {
    let data = {code: httpCode};
    if (typeof err === 'string' || err instanceof String) {
      data.message = Lang[err] ? Lang[err]['message'] : err;
    }

    if (!data.message) {
      data.message = Utils.getErrorString(err);
    }

    if (opt_info) {
      data.extra_info = opt_info;
    }
    this.response.status(httpCode).send(data);
  }

  error(httpCode, err, opt_info = null) {
    logger.info(`RESPONSE [${this.response.requestId}][OK] ${JSON.stringify({
      httpCode: httpCode,
      error: err,
      info: opt_info
    })}`)
    this.handleError(httpCode, err, opt_info);
  }

  unauthorized(err, opt_info = null) {
    if (!err) err = "Unauthorized";
    this.handleError(UNAUTHORIZED, err, opt_info);
  }

  forbidden(err, opt_info = null) {
    if (!err) err = "Forbidden";
    this.handleError(FORBIDDEN, err, opt_info);
  }

  badRequest(err, opt_info = null) {
    if (!err) err = "Bad request";
    this.handleError(BAD_REQUEST, err, opt_info);
  }

  unprocessable(err, opt_info = null) {
    if (!err) err = "Unprocessable entity";
    this.handleError(UNPROCESSABLE_ENTITY, err, opt_info);
  }

  notFound(err, opt_info = null) {
    if (!err) err = "Not found";
    this.handleError(NOT_FOUND, err, opt_info);
  }

  internalServerError(err, opt_info = null) {    
    if (!err) err = "Internal server error";
    this.handleError(INTERNAL_SERVER_ERROR, err, opt_info);
  }

  notImplement() {
    this.internalServerError('Function has not implemented yet')
  }

  disableApi(msg) {
    msg = msg || 'API was already disabled';
    this.internalServerError(msg)
  }

  ddd(input) {
    this.response.json(input);
  }
}

module.exports= ExtendMiddleware.export();
