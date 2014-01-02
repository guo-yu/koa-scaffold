var views = require('co-views');

exports = module.exports = function(dir, engine) {
    return function * (next) {
        if (this.render) return yield next;
        this.render = views(dir ? dir : __dirname + '/../views', { ext: 'jade' });
        yield next;
    };
};
