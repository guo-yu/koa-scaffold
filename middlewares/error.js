exports.common = function * (next) {
    try {
        yield next;
    } catch (err) {
        if (err.message === '404') return exports.notfound();
        this.status = err.status || 500;
        this.type = 'html';
        this.body = '<p>Something <em>exploded</em>, please contact Maru.</p>';
        this.app.emit('error', err, this);
    }
}

exports.logger = function(err) {
    console.log('sent error %s to the cloud', err.message);
    console.log(err);
}

exports.notfound = function *() {
    this.status = 404;
    this.body = '404';
    // this.format({
    //     text: function() {
    //         this.body = '404 Not found';
    //     },
    //     html: function() {
    //         exports.render(404, req.url, res);
    //     },
    //     json: function() {
    //         exports.json(404, req.url, res);
    //     }
    // });
}