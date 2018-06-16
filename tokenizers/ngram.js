const _ = require('lodash');

module.exports = tokenizeByNGram;

function tokenizeByNGram(doc, config) {
    const words = doc.split(new RegExp(config['split_regex'])).filter(Boolean);
    const gramsSize = config['grams_size'];
    let tokens = [];
    _.forEach(words, word => tokens.push(...getGrams(word, gramsSize)));
    return tokens;
}

function getGrams(word, gramsSize) {
    const grams = [];
    for (let i = 0; i <= word.length - gramsSize; i++) {
        grams.push(word.substr(i, gramsSize));
    }
    return grams;
}