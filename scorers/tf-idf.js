const _ = require('lodash');
const similarity = require('compute-cosine-similarity');

module.exports = scoreByTFidf;

function scoreByTFidf(invertedIndex, queryTokensArray) {
    const queryTokensFrequencies = _.countBy(queryTokensArray);
    const idf = calcIdf(invertedIndex, Object.keys(queryTokensFrequencies));
    const docsTFidf = calcDocsTFidf(invertedIndex, idf);
    const queryTFidf = calcQueryTFidf(queryTokensFrequencies, queryTokensArray.length, idf);
    return calcDocsScores(docsTFidf, queryTFidf);
}

function calcIdf(invertedIndex, queryUniqueTokens) {
    const totalDocCount = invertedIndex.totalDocCount;
    const idf = {};
    _.each(queryUniqueTokens, (token) => {
        const tokenDocs = invertedIndex.getTokenDocs(token);
        if (tokenDocs) {
            idf[token] = 1 + Math.log(totalDocCount / tokenDocs.docCount)
        }
    });
    return idf;
}

function calcDocsTFidf(invertedIndex, idf) {
    const docsTFidf = {};
    _.forEach(idf, (idfVal, token) => {
        const tokenDocs = invertedIndex.getTokenDocs(token);
        if (tokenDocs) {
            _.forEach(tokenDocs.docs, (frequencyInDoc, docId) => {
                if (!docsTFidf[docId]) {
                    docsTFidf[docId] = {};
                }
                docsTFidf[docId][token] = frequencyInDoc.normalizedTF * idf[token];
            });
        }
    });
    return docsTFidf;
}

function calcQueryTFidf(queryTokensFrequencies, totalTokensInQuery, idf) {
    const queryTFIdf = {};
    _.forEach(queryTokensFrequencies, (frequency, token) => {
        const tf = frequency / totalTokensInQuery;
        queryTFIdf[token] = tf * (idf[token] || 0);
    });
    return queryTFIdf;
}

function calcDocsScores(docsTFidf, queryTFidf) {
    const scoredDocsIds = {};

    const sortedTokens = Object.keys(queryTFidf).sort();
    const queryVector = _.map(sortedTokens, (token) => queryTFidf[token]);

    _.forEach(docsTFidf, (singleDocTFidf, docId) => {
        const docVector = _.map(sortedTokens, (token) => singleDocTFidf[token] || 0);
        scoredDocsIds[docId] = similarity(docVector, queryVector);
    });

    return scoredDocsIds;
}