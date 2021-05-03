const Utils = require('./utils');

module.exports = {  
  // Accept empty string
  checkRequiredParams: function (input, requiredParams) {
    if (!requiredParams) return input;
    if (!Array.isArray(requiredParams)) return {error: `requiredParams must be array, but value is ${requiredParams}`};
    if (requiredParams.length === 0) return input;
    
    for (let i = 0; i < requiredParams.length; i++) {
      let keys = requiredParams[i].split('.');
      let obj = input[keys[0]];
      let path = keys[0];
      if (obj === undefined || obj == null) {
        return {error: 'Missing param ' + path};
      }
      if (keys.length <= 1) {
        continue;
      }
      for (let j = 1; j < keys.length; j++) {
        path = path + '.' + keys[j];
        obj = obj[keys[j]];
        if (obj === undefined || obj == null) {
          return {error: 'Missing param ' + path};
        }
      }
    }
    return input;
  },  
  
  // Normally, it will not accept empty string
  // If any param is empty but acceptEmpty = true, it will accept the param
  // example of requiredParams:
  // [
  //   {
  //     name: 'staff_type',
  //     acceptValues: [1, 2, 3],
  //     dataType: 'array'
  //   },
  //   'name.familyName',
  //   'skype'
  // ]
  //
  // input should be this
  // {
  //   staff_type: 1,
  //   skype: "xxx",
  //   name : {
  //     familyName: "John"
  //   }
  // }
  checkRequiredParams2: function (input, requiredParams) {
    if (!requiredParams) return input;
    if (!Array.isArray(requiredParams)) return {error: `requiredParams must be array, but value is ${requiredParams}`};
    if (requiredParams.length === 0) return input;
    
    // dataType: must be result from typeof (E.g: 'string', 'number', 'boolean', 'array'...)    
    // acceptEmpty: applies to both string and array, to accept empty and empty strings
    function check(value, key, acceptValues, acceptEmpty, dataType, message) {
      let msg =  (message && message.acceptEmpty) ? message.acceptEmpty : 'Param ' + key + ' is missing or empty';
      
      if (dataType) {
        let errMsg = key + ' must be ' + dataType + ', but value is ' + value;
        
        if (dataType === 'array') {
          if (!Array.isArray(value)) return errMsg;
  
          if (!acceptEmpty && value.length === 0) return msg;
        }
        
        if (dataType === 'number' && isNaN(value)) return errMsg;
        
        if (dataType === 'boolean' && !Utils.isBoolean(Utils.toBool(value))) return errMsg;
        
        if (['array', 'number', 'boolean'].indexOf(dataType) === -1 && dataType !== typeof value) return errMsg;
  
        if (dataType === 'object' && Object.keys(value).length === 0 && !acceptEmpty) return msg;
      }
      
      if (!value && dataType !== 'number' && dataType !== 'boolean') {
        if (acceptEmpty === true) {
          if (value === "" && (dataType === undefined || dataType === 'string')) return null;
        }
        return msg;
      }
      
      if (acceptValues && acceptValues.indexOf(value) === -1) {
        return (message && message.acceptValue) ? message.acceptValue : 'Value of ' + key + ' is invalid';
      }
      return null;
    }
    
    for (let p of requiredParams) {
      let obj, path;
      let fullPath = Utils.isString(p) ? p : p.name;
      let keys = fullPath.split('.');
      
      for (let j = 0; j < keys.length; j++) {
        let key = keys[j];
        if (j === 0) {
          obj = input[key];
          path = key;
        } else {
          obj = obj[key];
          path = path + '.' + key;
        }
        
        let msg;
        if (j === keys.length - 1) {
          // last node
          msg = check(obj, path, p.acceptValues, p.acceptEmpty, p.dataType, p.message);
          if (!msg) {
            if (p.dataType === 'number' && !Utils.isNumber(obj)) {
              // make sure dataType is exactly number
              Utils.setObjectPropertyWithPath(path, input, Number(obj));
            }
            if (p.dataType === 'boolean' && !Utils.isBoolean(obj)) {
              // make sure dataType is exactly boolean
              Utils.setObjectPropertyWithPath(path, input, Utils.toBool(obj));
            }
          }
        } else {
          // middle node
          msg = check(obj, path);
        }
        if (msg) {
          return {error: msg};
        }
      }
    }
    return input;
  },
  
  checkRequiredParamsIfAvailable(input, requiredParams) {
    if (!requiredParams) return input;
    if (!Array.isArray(requiredParams)) return {error: `requiredParams must be array, but value is ${requiredParams}`};
    if (requiredParams.length === 0) return input;
    
    let required = [];
    for (let p of requiredParams) {
      let fullPath = Utils.isString(p) ? p : p.name;
      let keys = fullPath.split('.');
      
      let obj = {...input}, path;
      for (let j = 0; j < keys.length; j++) {
        path = keys[j];
        obj = obj[path];
      }
      
      if (typeof obj === 'undefined') {
        continue;
      }
      required.push(p);
    }
    return this.checkRequiredParams2(input, required);
  }
};
