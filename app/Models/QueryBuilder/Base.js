class Base{
  constructor(builder){
    this.queryBuilder = Base.queryBuilder
    this.builder = builder
  }
  setBuilder(newBuilder){
    this.builder = newBuilder    
    return this
  }
  static init(queryBuilder){
    this.queryBuilder = queryBuilder
    this.export()
  }
  static get publicMethod(){
    return []
  }
  static export(){
    let instance = this
    for(let method of this.publicMethod){
      this.queryBuilder.prototype[method] = function(...params){
        let obj = new instance(this)
        return obj[method](...params)
      }
    }
  }
}

module.exports = Base