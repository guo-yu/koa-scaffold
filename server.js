var koa = require('koa'),
    path = require('path'),
    _ = require('underscore'),
    route = require('koa-route'),
    logger = require('koa-logger'),
    serve = require('koa-static'),
    depender = require('depender'),
    sys = require('./package.json'),
    render = require('./libs/render'),
    routes = require('./routes/index'),
    middlewares = require('./middlewares/index');

var defaults = {
    name: sys.name,
    port: 3000,
    env: 'development',
    views: path.join(__dirname, '/views'),
    public: path.join(__dirname, '/public'),
    session: { secret: sys.name }
};

var dirfinder = function(configs, key) {
    if (configs[key]) return path.resolve(__dirname , '../../', configs[key]);
    return defaults[key];
};

var Server = function(configs) {

    var app = koa(),
        settings = _.extend(defaults, configs);

    // app configs
    app.name = settings.name;
    app.env = settings.env;
    app.keys = [settings.session.secret];
    
    // middlewares 
    app.use(logger());
    app.use(serve(dirfinder(configs,'public')));
    app.use(render(dirfinder(configs,'views')));

    // error middlewares
    app.use(middlewares.error.common);
    app.on('error', middlewares.error.logger);

    this.app = app;
    this.deps = new depender;
    this.deps.define('route', route);
    this.deps.define('middlewares', middlewares);
    this.port = _.isNumber(parseInt(settings.port)) ? parseInt(settings.port) : defaults.port;

    return this;
}

// define models
Server.prototype.models = function(init) {
    var models = require('./models/index');
    this.deps.define('$db',models.db);
    this.deps.define('$Schema',models.Schema);
    this.deps.define('$models', this.deps.use(init));
    return this;
}

// define ctrlers
Server.prototype.ctrlers = function(init) {
    this.deps.define('$Ctrler',require('./ctrlers/index'));
    this.deps.define('$ctrlers', this.deps.use(init));
    return this;
}

// define routes
Server.prototype.routes = function(init) {
    this.deps.define('app', this.app);
    this.deps.use(init && typeof(init) === 'function' ? init : routes);
    this.app.use(route.get('*', middlewares.error.notfound));
    return this;
}

// start instance
Server.prototype.run = function(port) {
    if (!this.app) return false;
    if (_.isEmpty(this.app.routes)) this.routes();
    if (port && _.isNumber(parseInt(port))) this.port = parseInt(port);
    return this.app.listen(this.port);
}

module.exports = Server;
