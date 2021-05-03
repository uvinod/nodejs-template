//const Group = require("./group")
const Route = require("./route");

class Group {
  constructor() {
    this.router = require('express').Router(); // make sure each group instantiates a new router object
    this._groups = []; //List of subgroups of the Group
    this._name = null; //group name
    this._register = null; //callback function
    this._routes = []; //list of group routes
    this._prefix = "/"; //prefix
    this.middlewares = [] //the group's middleware array
  } 
  
  //create a checkpoint to mark which group is creating a route.
  getPoint() {
    return Group.pointToObject || this
  }
  
  /**
   *
   * Register callback function for the group.
   */
  setRegister(register) {
    this._register = register
  }
  
  build() {
    if (typeof this._register === "function") {
      //for groups
      this._register()
    } else {
      //for the original build function
      const userRoute = use("routes")
    }
    //assign middleware
    if (this.middlewares.length > 0) this.router.use(...this.middlewares);
    // assign the routers directly to the group
    this._routes.map(route => {
      this.router.use(route.build())
    });
    // query the router of the smaller groups
    this._groups.map(group => {
      Group.pointToObject = group;
      this.router.use(group.getPrefix(), group.build())
    });
    
    return this.router
  }
  
  /** group method */
  group(register) {
    const group = new Group();
    group.setRegister(register);
    this.getPoint()._groups.push(group);
    return group
  }
  
  getPrefix() {
    return this._prefix
  }
  
  /**
   * Route.group(() => {...}).prefix("/url/to/api")
   */
  prefix(path) {
    this._prefix = path;
    return this
  }
  
  /**
   * Route.group(() => {...}).middleware([middleware1,middleware2])
   */
  middleware(middlewares) {
    this.middlewares = [
      ...this.middlewares,
      ...middlewares
    ];
    return this
  }
  
  //route method
  addMethod(url, action, method) {
    //console.log(`add route: [${method}] ${url} ${action}`)
    const route = new Route(url, action, method);
    this.getPoint()._routes.push(route);
    return route
  }
  
  get(url, action) {
    return this.addMethod(url, action, "get")
  }
  
  post(url, action) {
    return this.addMethod(url, action, "post")
  }
  
  put(url, action) {
    return this.addMethod(url, action, "put")
  }
  
  delete(url, action) {
    return this.addMethod(url, action, "delete")
  }
  
  resource(url, controller) {
    return this.group(() => {
      let Route = use('Route');
      Route.get("/", `${controller}.index`);
      Route.post("/", `${controller}.store`);
      Route.get("/:id", `${controller}.detail`);
      Route.put("/:id", `${controller}.update`);
      Route.delete("/:id", `${controller}.destroy`);
      Route.delete("/", `${controller}.delete`)
    }).prefix(url)
  }
}

module.exports = Group;
