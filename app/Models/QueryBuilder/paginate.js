const Base = use('./Base')
class Paginate extends Base{
  static get publicMethod(){
    return ['paginate']
  }
  paginate(perPage = 10, page = 1, isLengthAware = false){
     // Object that will be returned
     let paginator = {};

     // Validate argument type
     if (isNaN(perPage)) {
       throw new Error('Paginator error: perPage must be a number.');
     }

     if (isNaN(page)) {
       throw new Error('Paginator error: page must be an number.');
     }

     if (typeof isLengthAware != 'boolean') {
       throw new Error('Paginator error: isLengthAware must be a boolean.');
     }

     // Don't allow negative pages
     if (page < 1) {
       page = 1;
     }
     perPage = Number(perPage)
     const offset = (page - 1) * perPage;

     let promises = [];

     // If the paginator is aware of its length, count the resulting rows
     if (isLengthAware) {
       promises.push(this.builder.clone().clearSelect().clearOrder().count('* as total').first());
     } else {
       promises.push(new Promise((resolve, _) => resolve()));
     }

     if(perPage !== -1){
     // This will paginate the data itself
      promises.push(this.builder.offset(offset).limit(perPage));
     }
     else{
      promises.push(this.builder);
     }

     return Promise.all(promises).then(([countQuery, result]) => {
       // If the paginator is length aware...
       if (isLengthAware) {
         const total = countQuery.total;

         paginator = {
           ...paginator,
           total: total,
           last_page: Math.max(Math.ceil(total / perPage), 1)
         }
       }

       // Add pagination data to paginator object
       paginator = {
         ...paginator,
         limit: perPage,
         current_page: page,
         skip: offset,
         to: offset + result.length,
         data: result
       }

       return paginator;
     });
  }
}

module.exports = Paginate