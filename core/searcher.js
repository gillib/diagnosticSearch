/**
 * @typedef {Object} QueryResult The result returned from a search query
 * @property {number} took Time in milliseconds the query took to execute
 * @property {string} query Query string
 * @property {number} total Total amount of hits (results) found
 * @property {Array<QueryResultHit>} hits The hits (results) found in the query
 */

/**
 * @typedef {Object} QueryResultHit A hit object returned as part of a search query result
 * @property {string} docId Document id
 * @property {number} score Similarity score, the higher the better match to the query
 * @property {string} doc Document text
 */

const path = require('path');
const _ = require('lodash');
const config = require('config');

/**
 * Represents a Searcher object, with it you can search and retrieve indexed documents
 * @class Indexer
 */
class Searcher {
    /**
     * Creates a Searcher object
     */
    constructor() {
        this._invertedIndex = require('./invertedIndex');
        this._docStore = require('./docStore');
        this._tokenizer = require(path.join('..', config.get('tokenizer.path')));
        this._scorer = require(path.join('..', config.get('scorer.path')));
    }

    /**
     * Runs a free text query on the saved index
     * @param {string} query The free text query
     * @param {number} [amount] The maximum amount of results to be returned (must be an integer greater or equal to 0)
     *
     * @returns {QueryResult} Query result
     */
    search(query, amount = 10) {
        try {
            const startTime = Date.now();

            /** @type {Array<string>} */
            const tokensArray = this._tokenizer(query, config.get('tokenizer.config'));

            /** The key is docId, the value is the score
             * @type {Object<string, number>} */
            const scoredDocsIds = this._scorer(this._invertedIndex, tokensArray);

            /** @type {Array<{docId: string, score: number}>} */
            const fullHitsArray = _.map(scoredDocsIds, (score, docId) => _.assign({docId, score})); //transform dictionary into array of hits containing docId and score

            /** See QueryResultHit definition at the top of this file
             * @type {Array<QueryResultHit>} */
            const hits = _.chain(fullHitsArray) //allows to chain multiple transformer functions of the lodash library
                .orderBy('score', 'desc')
                .take(amount)
                .map(result => _.assign(result, {doc: this._docStore.get(result.docId)}))//add to the result a doc property with the original doc text
                .value();

            const took = Date.now() - startTime;
            console.log(`completed search | took ${took} milliseconds | query = ${query} | max_amount = ${amount}`);
            return {
                took,
                query,
                total: fullHitsArray.length,
                hits
            }
        }
        catch (err) {
            console.error(err);
            throw err;
        }
    }
}

module.exports = Searcher;
