const Route = use('Route');
const AuthAdminMiddleware = use("App/Middleware/AuthAdminMiddleware");
const ExtendMiddleware = use("App/Middleware/ExtendMiddleware");

Route.group(() => {

}).prefix("/v1").middleware([ExtendMiddleware]);