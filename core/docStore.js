const config = require('config');
const Json2File = require('./helpers/json2File');

/**
 * Represents a document store (handles storing documents)
 * @class
 */
class DocStore {
    /**
     * Creates a new document store, tries to first load a saved copy from disk
     * @constructor
     */
    constructor() {
        const savedStore = Json2File.loadFromTextSync(config.get('docStore.path'));
        this._store = new Map(savedStore || []);
    }

    /**
     * Insert a new document to the store and save it to the disk
     * @param {string} docId The id of the document to be stored
     * @param {string} doc The document text to be stored
     */
    insert(docId, doc) {
        this._store.set(docId, doc);
        return Json2File.saveAsText(config.get('docStore.path'), [...this._store]);
    }

    /**
     * Fetch a document by it's id
     * @param {string} docId The id of the document to be fetched
     * @returns {string | null} The document found
     */
    get(docId) {
        return this._store.get(docId) || null;
    }
}

module.exports = new DocStore();