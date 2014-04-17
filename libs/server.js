/**
*
* Global dependencies
*
**/
var koa = require('koa');
var _ = require('underscore');
var depender = require('depender');
var bodyParser = require('koa-bodyparser');
var methodOverride = require('koa-methodoverride');
var views = require('koa-views');
var router = require('koa-router');
var logger = require('koa-logger');
var serve = require('koa-static');
var session = require('koa-session');
var errors = require('koa-error');
var locals = require('koa-locals');
var less = require('koa-less');
var sass = require('koa-sass');

/**
*
* Local dependencies
*
**/
var pkg = require('../package');
var finder = require('./finder');
var defaults = require('../configs');

/**
*
* Expose main function
*
**/
module.exports = Server;

/**
*
* Server Class
* @configs[Object]: the config object, 
* checkout `./configs/default.js` for more infomation.
*
**/
function Server(configs) {

  var dirs = {};
  var app = koa();
  var devMode = true;
  var settings = _.extend(_.clone(defaults), configs || {});

  if (!settings.session.secret) {
    settings.session.secret = settings.database.name;
  }

  if (settings.env === 'production') devMode = false;

  // find `views` and `public` abs path
  dirs.views = finder(configs, 'views');
  dirs.publics = finder(configs, 'publics');
  dirs.uploads = finder(configs, 'uploads');

  // setup koa settings
  app.env = settings.env;
  app.name = settings.name || pkg.name;
  app.keys = [settings.session.secret];

  // setup server settings
  this.port = _.isNumber(settings.port) ? settings.port : defaults.port;

  // load all middlewares
  app.use(views(dirs.views, settings['view engine']));
  app.use(logger(devMode ? 'dev' : settings.logformat));
  app.use(bodyParser({ limit: settings.limit }));
  app.use(methodOverride());
  // app.use(cookieParser(settings.session.secret));
  app.use(session());
  app.use(less(dirs.publics));
  app.use(sass(dirs.publics));
  app.use(serve({ src: dirs.publics }));
  app.use(errors());

  // expose locals to template engine
  locals(app, {
    sys: pkg,
    site: settings,
    url: devMode ? 'http://localhost:' + app.get('port') : settings.url
  });

  this.app = app;
  this.deps = new depender;
  this.settings = settings;

  // if (settings.session.store) {
  //   this.deps.define('sessionStore', settings.session.store);
  // }

  return this;
}

/**
*
* Define routes
* @init[Function]: the callback function to inject routes into `app`.
*
**/
Server.prototype.routes = function(routes) {
  this.deps.define('app', this.app);
  this.deps.use(routes);
  return this;
}

/**
*
* Start server instance
* @port[Number]: on which spec port we'll start.
*
**/
Server.prototype.run = function(port) {
  var app = this.app;
  var selectedPort = port && _.isNumber(port);
  if (selectedPort) this.port = port;
  return app.listen(this.port);
}