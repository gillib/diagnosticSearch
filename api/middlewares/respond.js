function respondLogic(req, res, next) {
    function respond(promise) {
        Promise.resolve(promise).then(function (data) {
            res.status(200).json(data);
        }, function (err) {
            next(err);
        });
    }

    res.respond = respond;
    next();
}

module.exports = function respondMiddleware() {
    return respondLogic;
};