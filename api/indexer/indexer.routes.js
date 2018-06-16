const express = require('express');
const Indexer = require('../../core/indexer');

const router = express.Router();
const indexer = new Indexer();

router.post('/', async function (req, res) {
    try {
        const docId = await indexer.index(req.body.doc);
        res.respond(docId);
    }
    catch (err) {
        res.respond(err);
    }
});

module.exports = router;
