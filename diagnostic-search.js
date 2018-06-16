const config = require('config');
const DSApp = require('./api/app');

const server = DSApp.listen(config.get('api.port'), function () {
    const host = server.address().address;
    const port = server.address().port;

    console.log('Diagnostic Search server listening at http://%s:%s', host, port);
});