const Database = use('Database');
const DatabaseException = use("App/Exceptions/DatabaseException");

class BaseModel {
  constructor(tableName) {
    this.connection = Database.connection;
    this.collectionName = tableName;
    //add Trait for Model here
  }

  raw(...params){
    return this.connection.raw(...params)
  }

  get collection(){
    return this.connection(this.collectionName);
  }

  query() {
    let query = this.collection
    if(this._transacting){
      query = query.transacting(this._transacting)
      this._transacting = null
    }
    return query
  }

  get softDelete() {
    return false;
  }

  get setLastUpdated() {
    return false
  }

  get relationships(){
    return {}
  }

  async transaction() {
    return new Promise((resolve, reject) => {
      this.connection.transaction((trx) => {
          resolve(trx);
      }).catch(error =>{
        console.log("Transaction rejected: ", error)
      })
    });
  }

  transacting(t){
    this._transacting = t
    return this
  }
  
  join(relationshipName){
    let relationship = this.relationships[relationshipName]
    if(!relationship){
      throw  new DatabaseException(`not found ${relationshipName} in ${this.collectionName} Model`)
    }
    this.collection.join(...relationship)
    return this
  }

  getById(){
    throw new Error("this.Model.getById() has deprecated. Use this.Model.query().getById")
  }
  getOne(){
    throw new Error("this.Model.getOne() has deprecated. Use this.Model.query().getOne")
  }
  getAll(){
    throw new Error("this.Model.getAll() has deprecated. Use this.Model.query().getOne")
  }
  getByCondition(){
    throw new Error("this.Model.getByCondition() has deprecated. Use this.Model.query().getByCondition")
  }
  insertOne(){
    throw new Error("this.Model.insertOne() has deprecated. Use this.Model.query().insertOne")
  }
  insertMany(){
    throw new Error("this.Model.insertMany() has deprecated. Use this.Model.query().insertMany")
  }
  updateOne(){
    throw new Error("this.Model.updateOne() has deprecated. Use this.Model.query().updateOne")
  }
  updateByCondition(){
    throw new Error("this.Model.updateByCondition() has deprecated. Use this.Model.query().updateByCondition")
  }
  update(){
    throw new Error("this.Model.update() has deprecated. Use this.Model.query().updateOne")
  }
  delById(){
    throw new Error("this.Model.delById() has deprecated. Use this.Model.query().delById")
  }
  delByCondition(){
    throw new Error("this.Model.delByCondition() has deprecated. Use this.Model.query().delByCondition")
  }
}

module.exports = BaseModel;
