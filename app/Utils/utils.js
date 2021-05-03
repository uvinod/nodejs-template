const fs = require('fs');
const moment = require('moment');
const crypto = require('crypto');
const bcrypt = use("bcryptjs");
const authConfig = use("config/auth");
const saltRounds = 10;
const jwt = require('jsonwebtoken');

const UPLOAD_DIR = ''; // config folder store file upload
const Lang = require('../../lang/lang_backend.json');
const DefaultLangCode = 'en';

module.exports = {
  localizedText: function (langCode, key, words) {
    if (!Lang[key]) return key;
    if (!langCode) langCode = DefaultLangCode;
    let txt = Lang[key][langCode] || Lang[key][DefaultLangCode] || key;
    if (!words) return txt;
    return replace(txt, words);
  },
  
  getMsgObjectFromKey: function (reqOrLanguageCode, key, words) {
    let langCode = typeof reqOrLanguageCode === 'string' ? reqOrLanguageCode : reqOrLanguageCode.headers.lang_code;
    let result = {message: key};
    if (!langCode) langCode = DefaultLangCode;
    
    if (!Lang[key]) return result;
    
    result.ui_message = Lang[key][langCode] || Lang[key][DefaultLangCode];
    if (!words) return result;
    
    result.ui_message = replace(result.ui_message, words);
    return result;
  },
  
  getMsgFromKey: function (reqOrLanguageCode, key, words) {
    let langCode = typeof reqOrLanguageCode === 'string' ? reqOrLanguageCode : reqOrLanguageCode.headers.lang_code;
    return this.localizedText(langCode, key, words);
  },
  
  getFullName: function (req, familyName, givenName) {
    let langCode = req.headers.lang_code || DefaultLangCode;
    let value = givenName + ' ' + familyName;
    if (langCode == 'vi') {
      value = familyName + ' ' + givenName;
    }
    return value;
  },
  
  // req: request object of express
  getFullUrlFromRequest(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
  },
  
  fillOptionalFields(from, to, opsFields) {
    for (const key of opsFields) {
      if (from[key]) {
        to[key] = from[key];
        if (typeof to[key] === 'string') {
          to[key] = to[key].trim();
        }
      }
    }
    return to;
  },
  
  getAcceptableFieldsName(acceptableFields) {
    let str = '';
    for (let i = 0; i < acceptableFields.length; i++) {
      let name = '';
      if (typeof acceptableFields[i] === 'string') {
        name = acceptableFields[i];
      } else {
        name = acceptableFields[i].name;
      }
      if (str.length > 0) {
        str += ', ';
      }
      str += name;
    }
    return str;
  },
  
  getAcceptableFields(from, acceptableFields) {
    const result = {};
    for (const keyPath of acceptableFields) {
      let fullPath = typeof keyPath === 'string' ? keyPath : keyPath.name;
      const value = this.getObjectPropertyWithPath(fullPath, from);
      if (this.isUndefined(value)) {
        continue;
      }
      this.setObjectPropertyWithPath(fullPath, result, value);
    }
    return result;
  },
  
  // propertyPath: a string with format 'abc.def.ghi'
  getObjectPropertyWithPath: function (propertyPath, obj) {
    if (this.isUndefined(obj)) {
      return undefined;
    }
    let keys = propertyPath.split('.'), p = obj;
    for (let i = 0; i < keys.length; i++) {
      if (!this.objectHasProperty(p, keys[i])) {
        return undefined;
      }
      if (this.isUndefined(p[keys[i]])) {
        return undefined;
      }
      p = p[keys[i]];
    }
    return p;
  },
  
  // propertyPath: a string with format 'abc.def.ghi'
  setObjectPropertyWithPath: function (propertyPath, obj, value) {
    if (!obj) obj = {};
    let keys = propertyPath.split('.'), p = obj;
    for (let i = 0; i < keys.length; i++) {
      if (i == keys.length - 1) {
        p[keys[i]] = value;
      } else {
        p[keys[i]] = p[keys[i]] || {};
        p = p[keys[i]];
      }
    }
    return obj;
  },
  
  getErrorString: function (error) {
    if (error == undefined || error == null) return error;
    if (typeof error === 'string' || error instanceof String) return error;
    if (error.message) return error.message;
    if (error.ui_message) return error.ui_message;
    return error.toString();
  },
  
  parseDateString: function (str) {
    if (!str || str === '00-00-0000') return '';
    let value;
    const formats = ["D-M-YYYY", "D/M/YYYY"];
    for (let i = 0; i < formats.length; i++) {
      let m = moment(str, formats[i]);
      if (m.isValid()) {
        return m.format("YYYY-MM-DD");
      }
    }
    return '';
  },
  
  keepLastNItems: function (arr, n) {
    if (arr.length > n) {
      return arr.slice(arr.length - n, arr.length);
    }
    return arr;
  },
  
  // remove duplicate elements in array
  uniqElementsArray: function (arr) {
    return Array.from(new Set(arr));
  },
  
  onlyNumbersAndLetters: function (str) {
    if (typeof str != 'string') {
      return str;
    }
    return str.replace(/[^a-zA-Z0-9]/g, '');
  },  
  
  // only allow letters, numbers and -, _
  codeStringInvalid(str) {
    return /[^a-zA-Z0-9_-]/.test(str);
  },
  
  onlyNumbers: function (str) {
    if (typeof str != 'string') {
      return str;
    }
    return str.replace(/[^0-9]/g, '');
  },
  
  // Vietnamese with sign -> Vietnamese without accent
  // For example: 'Deputy foreman in charge of mound division' -> 'Vice director in charge of mound division'
  tiengVietKhongDau(str) {
    return str
      .replace(/[ÁÀẢÃẠÂẤẦẨẪẬĂẮẰẲẴẶ]/g, "A")
      .replace(/[áàảãạâấầẩẫậăắằẳẵặ]/g, "a")
      .replace(/[ÉÈẺẼẸÊẾỀỂỄỆ]/g, "E")
      .replace(/[éèẻẽẹêếềểễệ]/g, "e")
      .replace(/[ÍÌỈĨỊ]/g, "I")
      .replace(/[íìỉĩị]/g, "i")
      .replace(/[ÓÒỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢ]/g, "O")
      .replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, "o")
      .replace(/[ÚÙỦŨỤƯỨỪỬỮỰ]/g, "U")
      .replace(/[úùủũụưứừửữự]/g, "u")
      .replace(/[ÝỲỶỸỴ]/g, "Y")
      .replace(/[ýỳỷỹỵ]/g, "y")
      .replace(/[Đ]/g, "D")
      .replace(/[đ]/g, "d")
    //.replace(/[^a-z0-9]/gi,''); // final clean up
  },
  
  capitalizeText(str) {
    str = str.toLowerCase();
    let strArr = str.split(" ");
    strArr = strArr.map(value => {
      return value.charAt(0).toUpperCase() + value.slice(1)
    });
    return strArr.join(" ");
  },  
  
  // format number as 0001
  zeroLeading(num, len) {
    let s = num.toString();
    while (s.length < len) s = '0' + s;
    return s;
  },
  
  // John Doe -> johndoe@xxx.com
  emailFromFullName(fullName, domain = 'xxx.com') {
    let arr = this.tiengVietKhongDau(fullName.trim()).toLowerCase().split(' ');
    let name = arr[arr.length - 1];
    for (let i = 0; i < arr.length - 1; i++) {
      name += arr[i].substring(0, 1);
    }
    return name + '@' + domain;
  },
  
  // Refer to http://www.utf8-chartable.de/
  // https://stackoverflow.com/questions/21284228/removing-control-characters-in-utf-8-string
  removeAllControlCharacters: function (str) {
    if (typeof str != 'string') {
      return str;
    }
    return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
  },
  
  escapeRegExp: function (strToEscape) {
    // Escape special characters for use in a regular expression
    return strToEscape.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
  },
  
  trimChar: function (origString, charToTrim) {
    charToTrim = this.escapeRegExp(charToTrim);
    let regEx = new RegExp("^[" + charToTrim + "]+|[" + charToTrim + "]+$", "g");
    return origString.replace(regEx, "");
  },
  
  adjustSpaces: function (str, relacement = ' ') {
    if (!str) {
      return null;
    }
    // return str.trim().replace(/\s\s+/g, ' ');
    return str.replace(/\s+/g, relacement);
  },
  
  removeAllSpaces(str) {
    return this.adjustSpaces(str, '');
  },
  
  // Used for log
  limitStrLen(str, len) {
    if (str.length <= len || len <= 3) return str;
    return str.substring(0, len - 3) + '...';
  },
  
  getBearerTokenFromHeader: function (req) {
    if (!req.headers.authorization) {
      return {error: 'Missing access token'};
    }
    const BEARER = 'Bearer';
    let token = req.headers.authorization.trim();
    if (!token || token.length == 0) {
      return {error: 'Missing access token'};
    }
    let index = token.indexOf(BEARER);
    if (index == 0) {
      token = token.substring(BEARER.length, token.length);
    } else {
      return {error: 'Missing token type ' + BEARER};
    }
    return {token: token.trim()};
  },
  
  async jwtVerify(token, options) {
    return await jwt.verify(token, authConfig.SECRET_KEY, options);
  },
  
  // just test a lot with the request library (other http libraries are not sure)
  checkHttpResponse: function (err, res, body, expectedStatusCodes, actionName = null) {    
  // If there is an error, there will be no response (eg cannot connect, connect timeout ...)
    if (err) {
      return {error: err};
    }
    
    // If there is no error, there will be a response
    for (let i = 0; i < expectedStatusCodes.length; i++) {
      if (res.statusCode === expectedStatusCodes[i]) {
        if (this.isObject(body)) {
          return {data: body};
        }
        try {
          body = JSON.parse(body);
        } catch (e) {
          console.log('[utils/utils.js] checkHttpResponse error: ', e);
          body = null;
        }
        return {data: body};
      } else {
        // unexpected statusCode => error, continue below
      }
    }
    
    if (this.isObject(body)) {
      return {error: body};
    }
    
    let errMsg = 'Response Code: ' + res.statusCode;
    let info;
    try {
      let bodyObj = JSON.parse(body);
      info = bodyObj.message ? bodyObj.message : body;
    } catch (e) {
    }
    
    if (actionName) {
      errMsg = actionName + ' failed. ' + errMsg;
    }
    if (info) {
      errMsg = errMsg + '. More detail: ' + info;
    }
    return {error: errMsg};
  },
  
  // Bind arguments starting after however many are passed in (from ES6)
  bind_trailing_args: function (fn, ...bound_args) {
    return function (...args) {
      return fn(...args, ...bound_args);
    };
  },
  
  // Bind arguments starting with argument number "n" (from ES6)
  bind_args_from_n: function (fn, n, ...bound_args) {
    return function (...args) {
      return fn(...args.slice(0, n - 1), ...bound_args);
    };
  },
  
  getRandomInt: function (max) {
    return Math.floor(Math.random() * Math.floor(max));
  },
  
  getRandomIntBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
  },
  
  getRandomIntBetweenInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  },
  
  // ES5 version: construct arguments lists yourself
  // bind_trailing_args: function(fn) {
  //   let bound_args = [].slice.call(arguments, 1);
  //   return function() {
  //     let args = [].concat.call(arguments, bound_args);
  //     return fn.apply(this, args);
  //   };
  // }
  
  randomValueHex: function (len) {
    return crypto.randomBytes(Math.ceil(len / 2))
      .toString('hex') // convert to hexadecimal format
      .slice(0, len); // return required number of characters
  },
  
  randomValueBase64: function (len) {
    return crypto.randomBytes(Math.ceil(len * 3 / 4))
      .toString('base64') // convert to base64 format
      .slice(0, len) // return required number of characters
      .replace(/\+/g, '0') // replace '+' with '0'
      .replace(/\//g, '0'); // replace '/' with '0'
  },
  
  async hashPassword(str) {
    if (typeof str !== 'string') throw Error('Password must be a string');
    return await bcrypt.hash(str + authConfig.SECRET_KEY, saltRounds);
  },
  
  async comparePassWord(plainPassword, encryptedPassword) {
    return await bcrypt.compare(plainPassword + authConfig.SECRET_KEY, encryptedPassword)
  },
  
  genPasswordDefault() {
    return this.hash(authConfig.PASSWORD_DEFAULT);
  },
  
  paginationResult: function (skip, limit, list_data, total) {
    return {
      total: total || list_data.length,
      count: list_data.length,
      skip: skip,
      limit: limit,
      list_data: list_data
    };
  },
  
  getExtensionFromFileName: function (fileName) {
    if (!fileName) return '';
    fileName = this.trimChar(fileName, '.');
    let arr = fileName.split('.');
    if (arr.length > 1) return arr[arr.length - 1];
    return '';
  },
  
  getUrlWithPort: function (url, port) {
    return Env.getUrlWithPort(url, port);
  },
  
  // Delete the file in the upload folder
  removeFile(url) {
    if (!url || url.indexOf('http') == 0) return;
    let filePath = UPLOAD_DIR + url;
    fs.unlink(filePath, (err) => {
      if (err) console.error('[removeFile] ' + url + ' --> error: ', err);
    });
  },
  
  cloneObject(obj) {
    return JSON.parse(JSON.stringify(obj));
  },
  
  toBool(str) {
    if (str == true || str === 'true') return true;
    if (str == false || str === 'false') return false;
    return undefined;
  },
  
  isString(variable) {
    return typeof variable === 'string' || variable instanceof String;
  },
  
  toString(variable) {
    return this.isString(variable) ? variable : JSON.stringify(variable)
  },
  
  isNumber(variable) {
    return typeof variable === 'number' || variable instanceof Number;
  },
  
  isBoolean(variable) {
    return typeof variable === 'boolean';
  },
  
  isArray(variable) {
    return Array.isArray(variable);
  },
  
  isFunction(variable) {
    return typeof variable === 'function';
  },
  
  isObject(variable) {
    return variable !== null && typeof variable === 'object';
  },
  
  isNull(variable) {
    return variable === null;
  },
  
  isUndefined(variable) {
    return variable === undefined;
  },
  
  objectHasProperty(obj, pro) {
    return Object.prototype.hasOwnProperty.call(obj, pro);
  },
  
  isObjectEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
};

const PLACEHOLDER = '%';

function replace(word = '', words = '') {
  let translation = word;
  const values = [].concat(words);
  values.forEach((e, i) => {
    translation = translation.replace(PLACEHOLDER.concat(i), e);
  });
  return translation;
}
