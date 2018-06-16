const express = require('express');
const Searcher = require('../../core/searcher');

const router = express.Router();
const searcher = new Searcher();

router.post('/', function (req, res) {
    const amount = req.body.amount ? parseInt(req.body.amount) : undefined;
    res.respond(searcher.search(req.body.query, amount));
});

module.exports = router;