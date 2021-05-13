const to = require("await-to-js").default;

const BaseMiddleware = use("./BaseMiddleware");
const Auth = use("Auth");
const Utils = require("../Utils/utils");
const authConfig = use('config/auth')
const Cookies = require('cookie-universal')

class AuthMiddleware extends BaseMiddleware {
  constructor(request, response, next) {
    super(request, response, next);

    this.checkToken().then(res => {
      if (res.error) return response.unauthorized(res.error);
      if (res.errorImage) {
        response.writeHead(400, {'Content-type':'text/html'})
        response.end("No image");
        return false
      }

      this.next();
    }).catch(err => {
      return response.unauthorized(err.message);
    })
  }

  async checkToken() {
    
    let cookies = Cookies(this.request, this.response)
    
    let cookieToken = cookies.get("token");
    let jwtToken = this.request.headers.authorization ? Utils.getBearerTokenFromHeader(this.request) : true;
    if(!cookieToken && !this.request.headers.authorization) return { errorImage: "No image!"}
    if (jwtToken.error) return jwtToken;
    let token = jwtToken.token || cookieToken;
    let [error, result] = await to(Auth.verify(token, {
      key: authConfig['SECRET_KEY_ADMIN']
    }));
    if (error) return {error: error.message};
    if(result.type !== "admin"){
      return this.response.error(403, "Forbidden")
    }
    if(result.exp - Date.now()/1000 < authConfig['JWT_REFRESH_TIME']){
      let newToken = Auth.generateJWT({
        _id: result.id,
        username: result.username,
        roles: result.roles,
        permissions: result.permissions,
        type: result.type
      }, {
        key: authConfig['SECRET_KEY_ADMIN'],
        expiresIn: authConfig['JWT_EXPIRE_ADMIN']
      });

      cookies.set('token', newToken)

      this.response.set('Access-Control-Expose-Headers', 'access-token')
      this.response.set('access-token', newToken);
    }
    else{
      cookies.set('token', token)
    }
    this.request.auth = this.makeAuthObject(result);
    
    return {token};
  }

  makeAuthObject(tokenData) {
    return {
      ...tokenData
    }
  }
}

module.exports = AuthMiddleware.export();
