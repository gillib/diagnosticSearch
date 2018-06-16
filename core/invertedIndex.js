const config = require('config');
const _ = require('lodash');
const Json2File = require('./helpers/json2File');

class InvertedIndex {
    constructor() {
        const savedIndex = Json2File.loadFromTextSync(config.get('invertedIndex.store.path'));
        this._index = new Map(savedIndex || []);
        this._totalDocIds = _extractDocIds(this._index);
    }

    get totalDocCount() {
        return this._totalDocIds.size;
    }

    addMultipleTokensForSingleDoc(docId, tokenArray) {
        const tokensWithFrequencies = _.countBy(tokenArray); //dictionary of <token, frequency>
        _.forOwn(tokensWithFrequencies, (frequency, token) => this._addDocAndFrequencyToToken(token, docId, frequency, tokenArray.length));
        this._totalDocIds.add(docId);
        return this._saveIndex();
    }

    getTokenDocs(token) {
        return this._index.get(token) || null;
    }

    _addDocAndFrequencyToToken(token, docId, frequency, tokenCountInDoc) {
        if (!this._index.has(token)) {
            this._index.set(token, {docs: {}, docCount: 0});
        }
        const indexedToken = this._index.get(token);
        indexedToken.docs[docId] = {frequency, normalizedTF: frequency / tokenCountInDoc};
        indexedToken.docCount++;
    }

    _saveIndex() {
        return Json2File.saveAsText(config.get('invertedIndex.store.path'), [...this._index]);
    }
}

module.exports = new InvertedIndex();

function _extractDocIds(invertedIndex) {
    const docIds = new Set();
    invertedIndex.forEach((tokenDocs, token) => {
        _.forEach(Object.keys(tokenDocs.docs), (docId) => {
            docIds.add(docId);
        });
    });
    return docIds;
}