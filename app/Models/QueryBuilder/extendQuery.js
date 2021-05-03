const Base = use('./Base')
const moment = use('moment')
const DatabaseException = use('App/Exceptions/DatabaseException')
const debug = require('debug')('mqmodel:getForGridTable')
class getForGridTable extends Base{
  static get publicMethod(){
    return [
      'getById',
      'getOne',
      'getAll',
      'getByCondition',
      'insertOne',
      'insertMany',
      'updateOne',
      'updateByCondition',
      'delById',
      'delByCondition'
    ]
  }
  async getById(id, project ='*'){
    return await this.getOne({id: id}, project)
  }
  // project: object fields ['id', 'createdAt', ...], get all: '*'
  async getOne(condition, project = '*') {
    let [error, result] = await to(this.builder.where(condition).first(project));
    if (error) throw new DatabaseException(error);

    return result;
  }

  async getAll(condition, project = '*') {
    return await this.getByCondition(condition, project)
  }
  // conditionL object {id: 3}
  // project: object fields ['id', 'createdAt', ...], get all: '*'
  async getByCondition(condition, project = '*') {    
    let [error, result] = await to(this.builder.where(condition).select(project));    
    if (error) throw new DatabaseException(error);
    return result;
  }
  async insertOne(object, cb = false) {
    let [error, result] = await to(this.builder.clone().insert(object));
    if (error) throw new DatabaseException(error);    
    
    if (cb) {
      [error, result] = await to(this.getById(result[0]));
      if (error) throw new DatabaseException(error);
    }
    return result;
  }

  async insertMany(array) {
    let [error, result] = await to(this.builder.insert(array));
    if (error) throw new DatabaseException(error);

    return result;
  }

  async updateOne(id, fields) {
    delete fields['id']; // Delete fields _id if any in the data update
    fields = {
      ...fields,
      updatedAt: new Date(),
    };
    let builderUpdate = this.builder.clone()
    let builderSelect = this.builder.clone()        
    let [err, result] = await to(this.setBuilder(builderUpdate).updateByCondition({id: id}, fields));
    if (err) throw new DatabaseException(err);

    return this.setBuilder(builderSelect).getById(id);
  }

  // Find and update condition
  // Return a WriteResult object ({"nMatched": 1, "nUpserted": 0, "nModified": 1})
  async updateByCondition(condition, params = {}) {
    let [error, result] = await to(this.builder.where(condition).update(params));
    if (error) throw new DatabaseException(error);
    return result;
  }

  // id: id of the document to be deleted
  async delById(id) {
    let [error, result] = await to(this.builder.where('id', id).del());
    if (error) throw new DatabaseException(error);
    return result;
  }

  // If there is no empty condition or condition, it will be equivalent to all erasing, so there must be a condition to avoid risk
  async delByCondition(condition) {
    if (!condition || typeof condition !== "object" || Object.keys(condition).length === 0) {
      throw new DatabaseException('delete condition is required, and must be an object');
    }
    let [error, result] = await to(this.builder.where(condition).del());
    if (error) throw new DatabaseException(error);
    return result
  }

}

module.exports = getForGridTable