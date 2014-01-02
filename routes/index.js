module.exports = function(app, route) {
    app.use(route.get('/', function * () {
        this.body = yield this.render('home');
    }));
};
