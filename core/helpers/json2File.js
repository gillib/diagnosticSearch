const fs = require('fs');
const {promisify} = require('util');

module.exports = class Json2File {
    static async saveAsText(path, jsonObj) {
        const wF = promisify(fs.writeFile);
        const err = await wF(path, JSON.stringify(jsonObj));
        if (err) throw err;
    }

    static loadFromTextSync(path) {
        try {
            const data = fs.readFileSync(path, 'utf-8');
            return JSON.parse(data);
        }
        catch {
            return null;
        }
    }
};