// production error handler
// no stacktraces leaked to user
function errorHandlerWithoutError(err, req, res, next) {
    res.status(err.status || 500)
        .json({
            message: err.message,
            error: {}
        });
}

// development error handler
// will print stacktrace
function errorHandlerWithError(err, req, res, next) {
    res.status(err.status || 500)
        .json({
            message: err.message,
            error: err
        });
}

function errorHandler(env) {
    if (env === 'dev' || env === 'development') {
        return errorHandlerWithError;
    }
    else {
        return errorHandlerWithoutError;
    }
}

// catch 404 and forward to error handler
function routeNotFound(req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
}

module.exports = {
    errorHandler: errorHandler,
    routeNotFound: routeNotFound
};