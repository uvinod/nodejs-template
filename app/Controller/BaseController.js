const to = require('await-to-js').default;
const debug = require('debug')('mqcontroller');
const _ = use('lodash');
const ApiException = use("App/Exceptions/ApiException");
const HttpUtil = use('App/Utils/http');
const {INTERNAL_SERVER_ERROR, UNPROCESSABLE_ENTITY} = HttpUtil;
const Env = use('Env');
class BaseController {
  constructor() {
    this.isProductionEnv = Env.get('NODE_ENV', 'development') === 'production';
  }

  async index(data) {
    return await this.Model.query().getForGridTable(data)
  }

  async detail(id, allowFields = '*') {
    if (!id) throw new ApiException(UNPROCESSABLE_ENTITY, "ID is required!");

    return this.getOneByID(id, allowFields)
  }

  async getOneByID(id, allowFields = '*') {
    return await this.Model.query().getById(id, allowFields)
  }

  async store(input, cb = false) {
    return await this.Model.query().insertOne(input, cb);
  }

  async update(id, input) {
    return await this.Model.query().updateOne(id, input)
  }

  async destroy(id) {
    if (!id) throw new ApiException(UNPROCESSABLE_ENTITY, "ID is required!");

    let [err, rs] = await to(this.Model.query().delById(id));
    if (err) throw new ApiException(INTERNAL_SERVER_ERROR, err.message);

    return {message: `Delete successfully: ${rs} record`}
  }

  async delete({request, response}) {
    let ids = request.query.ids;
    if (!ids || !Array.isArray(ids)) throw new ApiException(UNPROCESSABLE_ENTITY, "ID is required. Expected: Array!");
    await this.Model.query().delByIds(ids);
    return true
  }

  getData(object, path, defaultValue){
    return _.get(object, path, defaultValue)
  }
  /**
  * Check the validity of the data the client sends to the API.
  * @param {object} data sent by the client
  * @param {object} allowFields object for the fields and data types that api accepts
  * @param {object}
  * {boolean} removeNotAllow removes fields not in allowFields, default: false
  */
  validate(data, allowFields, options) {
    options = options || {removeNotAllow: false};
    let result = this.validateFields(data, allowFields, options.removeNotAllow);
    if (result.error) {
      throw new ApiException(UNPROCESSABLE_ENTITY, result.message)
    }
    return result.data
  }

  validateError(errorType, data) {
    let message = "unknown";
    switch (errorType) {
      case "Invalid Type":
        message = `Datatype of ${data.path} is incorrect. Expected: ${data.typeOfField} but got: ${data.realType}`;
        break;
      case "required":
        message = `${data.path} is required. But not found.`
    }
    return {
      error: true,
      message: message
    }
  }

  validateFields(data, allowFields = {}, removeNotAllow = false, path = "", newData = null) {
    debug("path: ", path);
    debug("data: ", data);
    debug("allowFields: ", allowFields);

    let result = {
      error: false,
      message: "OK",
    };
    let root = false;
    if (newData == null) {
      root = true;
      newData = removeNotAllow ? {} : data
    }

    if (typeof allowFields == "string") {
      debug("type is string...");
      let typeOfField = allowFields;
      let isRequired = typeOfField.indexOf("!") !== -1; //kiểm tra dấu ! ở cuối là bắt buộc
      typeOfField = typeOfField.replace(/\!/, ""); //tách lấy kiểu dữ liệu mong muốn
      let isExists = (data != null);
      let isEmpty = (data === "");

      if (path[path.length - 1] == ".") path = path.substring(0, path.length - 1);

      if (isRequired && (!isExists || isEmpty)) { //nếu field là bắt buộc như lại không tồn tại trong data.
        let error = this.validateError("required", {
          path
        });
        debug(error.message);
        return error
      } else if (isExists) {
        let realType = typeof data;
        let typeAllowed = realType == typeOfField;

        //nếu không đúng kiểu dữ liệu mong muốn, thì cố gắng convert về đúng kiểu.
        if (!typeAllowed) {
          if (typeOfField == "any") {
            typeAllowed = true;
          } else if (typeOfField == "number") {
            typeAllowed = !isNaN(data);
            if (typeAllowed) _.set(newData, path, Number(data))
          } else if (typeOfField == "boolean") {
            if (typeof data == "string") data = data.toLowerCase();
            typeAllowed = ["true", "false", "1", "0", 1, 0, true, false].includes(data);
            if (typeAllowed) _.set(newData, path, ["true", "1", 1, true].includes(data))
          } else if (typeOfField == "date" || typeOfField == "moment") {
            typeAllowed = new Date(data) != "Invalid Date";
            if (typeAllowed) _.set(newData, path, new Date(data))
          }
          else if(typeOfField == "string"){
            _.set(newData, path, String(data))
          }
        } else {
          _.set(newData, path, data)
        }
        debug({typeOfField, realType, typeAllowed});

        if (!typeAllowed) {
          return this.validateError("Invalid Type", {
            path,
            typeOfField,
            realType
          })
        }
      }
      else {
        _.unset(newData, path)
      }
    } else {
      //duyệt các key của object.
      for (let fieldName in allowFields) {
        let typeOfField = allowFields[fieldName];
        let fieldValue = data ? data[fieldName] : undefined;

        debug("Loop for check:", fieldName);
        debug("data: ", fieldValue);
        debug("allowFields", allowFields[fieldName]);

        //kiểm tra nếu là array thì đệ quy tiếp vào các element để check
        if (Array.isArray(typeOfField)) {
          if (Array.isArray(fieldValue)) {
            debug("case 1: check array:");
            if(fieldValue.length === 0){
              if(typeof typeOfField[0] === "object"){
                fieldValue.push({})
              }
              else if(typeOfField[0].indexOf("!") !== -1){
                debug("element is required but array empty")
                return this.validateError('required',{
                  path: `${path}${fieldName}`
                })
              }
            }

            for (let i in fieldValue) {
              result = this.validateFields(fieldValue[i], typeOfField[0], removeNotAllow, `${path}${fieldName}.${i}.`, newData);
              if (result.error) return result
            }
          } else {
            debug("case 2: check array but data is not array");
            if (fieldValue == undefined) {
              //return this.validateError("required",{path: `${path}${fieldName}`})
              result = this.validateFields(fieldValue, typeOfField[0], removeNotAllow, `${path}${fieldName}[0].`)
            } else {
              return this.validateError("Invalid Type", {
                path: `${path}${fieldName}`,
                typeOfField: "array",
                realType: typeof fieldValue
              })
            }

            //result = this.validateFields(fieldValue, typeOfField[0], `${path}${fieldName}[0].`)
          }

        } else if (typeof typeOfField == "object") {
          //nếu là là object thì đệ quy vào trong để check tiếp
          debug("case 3: check object:");
          result = this.validateFields(fieldValue, typeOfField, removeNotAllow, `${path}${fieldName}.`, newData)
        } else {
          //nếu là string thì đệ quy để nhảy vào check các phần tử lá
          debug("case 4: check type is string:");
          result = this.validateFields(fieldValue, typeOfField, removeNotAllow, `${path}${fieldName}`, newData)
        }
        if (result.error) {
          return result
        } else {
          result = {
            ...result,
            data: {
              ...result.data,
            }
          }
        }
      }
    }
    if (root) {
      return {
        ...result,
        data: newData
      }
    }
    return result
  }
}

module.exports = BaseController;
