const config = require('config');
const Json2File = require('./helpers/json2File');

class DocStore {
    constructor() {
        const savedStore = Json2File.loadFromTextSync(config.get('docStore.path'));
        this._store = new Map(savedStore || []);
    }

    insert(docId, doc) {
        this._store.set(docId, doc);
        Json2File.saveAsText(config.get('docStore.path'), [...this._store]);
    }

    get(docId) {
        return this._store.get(docId);
    }
}

module.exports = new DocStore();