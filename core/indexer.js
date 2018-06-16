const path = require('path');
const uuid = require('uuid/v4');
const _ = require('lodash');
const config = require('config');

module.exports = class Indexer {
    constructor() {
        this._invertedIndex = require('./invertedIndex');
        this._docStore = require('./docStore');
        this._tokenizer = require(path.join('..', config.get('tokenizer.path')));
    }

    index(doc, docId = uuid()) {
        try {
            this._docStore.insert(docId, doc);
            const tokenArray = this._tokenizer(doc, config.get('tokenizer.config'));
            return this._invertedIndex.addMultipleTokensForSingleDoc(docId, tokenArray)
                .then(() => {
                    console.log('indexed document | docId = ' + docId + ' | total doc count = ' + this._invertedIndex.totalDocCount);
                    return docId;
                });
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
};