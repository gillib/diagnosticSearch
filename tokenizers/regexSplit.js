module.exports = tokenizeByRegex;

function tokenizeByRegex(doc, config) {
    return doc.split(new RegExp(config['split_regex'])).filter(Boolean);
}