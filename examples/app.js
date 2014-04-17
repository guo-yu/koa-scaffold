// require Server class
var Server = require('../index');

// create app instance and chain all stuff together,
// as you can see, express-scaffold injects models and ctrlers into
// app instance, it is a convenience way to organize all resource and modules
// which almost every route needs.
new Server({
  name: 'My very first App',
  database: {
    name: 'appdb'
  }
})
.routes(function(app) {
  console.log(app.locals.site.name + ' is running');
  // finally, we're going to make all route work,
  // `routes` function contains all routes your app will invoke.
  app.get('/users', function(req, res, next){
    // using `user` ctrler we made before to find all users,
    // and response with JSON string.
    ctrlers.user.find({}, function(err, users) {
      if (err) return next(err);
      res.json(users);
    });
  });
})
.run();