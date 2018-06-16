const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const respond = require('./middlewares/respond');
const errorHandlers = require('./middlewares/errorHandlers');

const indexer = require('./indexer/indexer.routes');
const searcher = require('./searcher/searcher.routes');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(respond());

app.use('/index', indexer);
app.use('/search', searcher);

app.use(errorHandlers.routeNotFound);
app.use(errorHandlers.errorHandler('dev'));

module.exports = app;