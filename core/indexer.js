const path = require('path');
const uuid = require('uuid/v4');
const _ = require('lodash');
const config = require('config');

/**
 * Represents an Indexer object, with it you can index documents for later retrieval
 * @class Indexer
 */
class Indexer {
    /**
     * Creates an Indexer object
     */
    constructor() {
        this._invertedIndex = require('./invertedIndex');
        this._docStore = require('./docStore');
        this._tokenizer = require(path.join('..', config.get('tokenizer.path')));
    }

    /**
     * Indexes and stores a text document
     * @param {string} doc The document text to be indexed and stored
     * @param {string} [docId=generated uuid] The id of the document to be indexed and stored
     * @returns {Promise<string>} A promise that resolves to the newly added document id
     */
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
}

module.exports = Indexer;
