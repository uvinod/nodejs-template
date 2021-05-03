const _ = use('lodash')
const messageConfig = use('config/message')

class ExceptionHandler {

  async handle(error, {request, response}) {
    let code = 500, message = "", data = {};
    if (typeof error !== "object") {
      error = new Error(error)
    }
    code = Number(error.code);
    message = error.message || "";
    data = error.data || error.stack || {};
    let extendCode = data.errorCode || message
    console.log("ERROR:",error);

    const exceptionName = error.constructor.name;
    message = this.makeMessage({code, message, data, extendCode})
    /* if(exceptionName === "ThirdPartyException"){
      //handler ThirdPartyException here
      if(error.data._thridParty === "stripe"){
        code = error.data.statusCode || 402
        message = error.data.message || message
      }
      if(error.data._thridParty === "messagebird"){
        code = error.data.statusCode || 400
        message = _.get(error,"data.errors.description", message)
      }
    } */

    response.error(code, message, data)
  }

  makeMessage({code, message, data, extendCode} = {}){
    message = messageConfig[extendCode] || messageConfig[message] || message
    message = this.makeContent({ content: message, variables: data })
    return message
  }

  makeContent({ content, variables = {} } = {}) {
    content = content.replace(/\${([a-z0-9]+)}/gi, '${variables.$1}')
    eval(`content=\`${content}\``)
    content = content.replace(/\${variables.([a-z0-9]+)}/gi, '${$1}')
    return content
  }
}

module.exports = ExceptionHandler;
