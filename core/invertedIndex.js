/**
 * @typedef {Object} IndexedTokenData Indexed document data of a specific token
 * @property {number} docCount The amount of docs that have this token
 * @property {Object<string, DocData>} docs Dictionary[docId, DocData] The document data of this token.
 */

/**
 * @typedef {Object} DocData
 * @property {number} frequency amount of this token's occurrences in this document
 * @property {number} normalizedTF frequency divided by the amount of tokens in this document
 */

const config = require('config');
const _ = require('lodash');
const Json2File = require('./helpers/json2File');

/**
 * Represents an inverted index
 * @class
 */
class InvertedIndex {
    /**
     * Creates a inverted index object, tries to first load a saved copy from disk and map all unique document ids
     * @constructor
     */
    constructor() {
        const savedIndex = Json2File.loadFromTextSync(config.get('invertedIndex.store.path'));
        this._index = new Map(savedIndex || []);
        this._totalDocIds = _extractDocIds(this._index);
    }

    /**
     * The total amount of documents in the index
     *
     * @returns {number}
     */
    get totalDocCount() {
        return this._totalDocIds.size;
    }

    /**
     * Add an array of tokens from a single document to the index
     * @param {string} docId The id of the document which the tokens belong to
     * @param {Array<string>} tokenArray Array of tokens to be indexed
     *
     * @returns {Promise} A promise that resolves when the index is saved to disk
     */
    addMultipleTokensForSingleDoc(docId, tokenArray) {
        const tokensWithFrequencies = _.countBy(tokenArray); //dictionary of <token, frequency>
        _.forOwn(tokensWithFrequencies, (frequency, token) => this._addDocAndFrequencyToToken(token, docId, frequency, tokenArray.length));
        this._totalDocIds.add(docId);
        return this._saveIndex();
    }

    /**
     * Get indexed document data of a specific token
     * @param {string} token A token to return it's indexed document data
     *
     * @returns {IndexedTokenData | null}
     */
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