const Base = use('./Base')
const moment = use('moment')
const debug = require('debug')('mqmodel:getForGridTable')
class getForGridTable extends Base{
  static get publicMethod(){
    return ['getForGridTable']
  }

  getForGridTable({currentPage, pageSize, sorting, filters}){
      currentPage = Number(currentPage) || 0
      pageSize = Number(pageSize) || 10
      sorting = sorting || []
      filters = filters || []
      this.buildFilter(filters)
      this.buildSorting(sorting)
      debug(this.builder.toSQL())
      return this.builder.paginate(pageSize, currentPage + 1, true)
  }

  buildFilter(filters){
    for(let fitler of filters){
      fitler = JSON.parse(fitler)
      let {columnName, value, operation, dataType} = fitler
      switch(operation){
        case "contains":
          this.builder.where(columnName, 'like', `%${value}%`)
          break;
        case "equal":
            this.builder.where(columnName, value)
            break;
        case "notContains":
          this.builder.whereNot(columnName, 'like', `%${value}%`)
          break;
        case "startsWith":
            this.builder.where(columnName, 'like', `${value}%`)
            break;
        case "endsWith":
          this.builder.where(columnName, 'like', `%${value}`)
          break;
        case "equal":
          this.builder.where(columnName, value)
          break;
        case "notEqual":
            this.builder.whereNot(columnName, value)
            break;
        //number
        case "greaterThan":
          this.builder.where(columnName, '>', value)
          break;
        case "greaterThanOrEqual":
          this.builder.where(columnName, '>=', value)
          break;
        case "lessThan":
          this.builder.where(columnName,'<', value)
          break;
        case "lessThanOrEqual":
          this.builder.where(columnName,'<=', value)
          break;
        //date
        case "daterange":
          this.builder.where(columnName, '>=', moment(value.startDate).format("YYYY-MM-DD 00:00:00"))
          .andWhere(columnName, '<=', moment(value.endDate).format("YYYY-MM-DD 23:59:59"))
          break;
      }

    }
  }

  buildSorting(sorting){
    let sortArray = []
    for(let sort of sorting){
      sort = JSON.parse(sort)
      let {columnName, direction} = sort
      sortArray.push({
        column: columnName,
        order: direction
      })
    }
    this.builder.orderBy(sortArray)
  }
}

module.exports = getForGridTable