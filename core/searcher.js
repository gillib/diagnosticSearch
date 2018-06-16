const path = require('path');
const _ = require('lodash');
const config = require('config');

module.exports = class Searcher {
    constructor() {
        this._invertedIndex = require('./invertedIndex');
        this._docStore = require('./docStore');
        this._tokenizer = require(path.join('..', config.get('tokenizer.path')));
        this._scorer = require(path.join('..', config.get('scorer.path')));
    }

    search(query, amount = 10) {
        try {
            const startTime = Date.now();
            const tokensArray = this._tokenizer(query, config.get('tokenizer.config'));
            const scoredDocsIds = this._scorer(this._invertedIndex, tokensArray);

            const fullHitsArray = _.map(scoredDocsIds, (score, docId) => _.assign({docId, score})); //transform dictionary into array of hits containing docId and score

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
};