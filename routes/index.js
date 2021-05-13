const Route = use('Route');
const AuthMiddleware = use("App/Middleware/AuthMiddleware");
const ExtendMiddleware = use("App/Middleware/ExtendMiddleware");

Route.group(() => {

}).prefix("/v1").middleware([ExtendMiddleware]);