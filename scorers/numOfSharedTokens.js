const _ = require('lodash');

module.exports = numOfSharedTokensScorer;

function numOfSharedTokensScorer(invertedIndex, queryTokensArray) {
    const scoredDocsIds = {};
    const searchedTokensFrequencies = _.countBy(queryTokensArray);
    _.forEach(searchedTokensFrequencies, (frequencySearched, token) => {
        const tokenDocs = invertedIndex.getTokenDocs(token);

        if (tokenDocs) {
            _.forEach(tokenDocs.docs, (frequencyInDoc, docId) => {
                if (!_.isNumber(scoredDocsIds[docId])) {
                    scoredDocsIds[docId] = 0;
                }
                scoredDocsIds[docId] += frequencyInDoc.frequency * frequencySearched;
            });
        }
    });

    return scoredDocsIds;
}