Diagnosic Search is an inverted index based search engine developed for
my job interview

### Setup:
- Install node.js version 10.4.0
- copy the diagnosticSearch directory and all it's content to your
machine
- open the terminal in the diagnosticSearch directory and install the
project dependencies by entering the following command
     `npm i`
- open the default.json file located in the config directory and change
the port value to one that is free on your machine

### Run Server:
open the terminal in the diagnosticSearch directory and enter the
following command `npm start`

### Indexing Documents
###### Using curl
open your terminal and enter the following command

```
curl -d "doc=the dish ran away with the spoon" -X POST http://127.0.0.1:5000/index
```

###### Using Postman
POST http://localhost:5000/index

For the body use `x-www-formurlencoded`
with 1 parameter called `doc` and it's value will be the document text


**- As of now, there is no support of multiple indexes.**

###### Indexing Result
If the indexing was successful, the result will be the docId.


### Searching
###### Using curl
open your terminal and enter the following command

```
curl -d "query=a cat ran away today" -X POST http://127.0.0.1:5000/search
```

by default, only the 10 best results will return.
you can query more results by adding the `amount` parameter to the
command like the following:
```
curl -d "query=a cat ran away today&amount=20" -X POST http://127.0.0.1:5000/search
```

###### Using Postman
POST http://localhost:5000/search

For the body use `x-www-formurlencoded`
with 1 parameter called `query` and 1 optional parameter called `amount`
their meanings are specified in the **Using Postman** section above.

###### Search Result
```
{
    "took": 4, // time in milliseconds
    "query": "a cat ran away", // the query string
    "total": 2, // amount of hits found
    "hits": [
        {
            "docId": "067e66bd-de40-4647-a9c6-65b441b08457",
            "score": 2,
            "doc": "the dish ran away with the spoon"
        },
        {
            "docId": "594c910f-bcc1-4b21-be4f-dfcda4874b8f",
            "score": 1,
            "doc": "the cat and the hat"
        }
    ]
}
```

### Under The Hood
###### Tokenizers
The tokenizer is used both by the indexer and searcher to split the
indexed documents or query string into tokens.

You are provided with 2 built in tokenizers which are located in the
tokenizers directory:

- **regexSplit** - Splits the document into tokens by a regular expression.
The regex should be specified in the config file (/config/defualt.json) under
`tokenizer.config.split_regex`
- **ngram** - Splits the document by a regular expression into tokens
which are then split up into sub-tokens (grams) each equal to the
`tokenizer.config.grams_size` configuration.

You can config the engine to work with a different tokenizer by changing
the  `tokenizer.path` config value to the path of the newly added
tokenizer file.
You can also add custom keys to the `tokeziner.config` section.
While developing a new tokenizer, make sure you follow the design
pattern used in the existing tokenizers-

- **function input-** document, config
- **function output-** an array of all tokens (with duplicates if they
exist)

###### Scorers

The scorers are used by the searcher to score each document in the index
regarding it's similarity to the query string.

You are provided with 2 built in scorers which are located in the
scorers directory:

- **numOfSharedTokens** - For each document finds the amount of shared
tokens between that document and the query string.
- **tf-idf** - This is an experimental scorer for this project.
scores documents according to the well-known tf-idf algorithm **without**
normalizating of the word vectors to unit vectors.

You can config the engine to work with a different scorer by changing
the  `scorer.path` config value to the path of the newly added
scorer file.
While developing a new scorer, make sure you follow the design
pattern used in the existing scorers-

- **function input-** invertedIndex, queryTokensArray (with duplicates if
they exist)
- **function output-** a dictionary of <docId, score>

The inverted index has 1 relevant property and 1 relevant method -

**property**
```
invertedIndex.totalDocCount
```
The total amount of unique document ids indexed

**function**
```
invertedIndex.getTokenDocs(token)
```
This function gets a token.
The function will search the index for that token and if succeeds it
will return an object as the following:

```
{
    "docCount": <int>, //the number of documents containg the token)
    "docs": {
        <docId>: { //the key represents a random document ID
            "frequency": <int>, // the number of occurrences the token appears in the document
            "normalizedTF": <float> // the number of occurrences the token appears in the document devided by the number of tokens in the document
        }
    }
}
```
As of now, there is no support for knowing what's the token's location
with in each document.

###### Storage
As of this stage, the storage mechanism is very simple and not scalable.
When the engine starts, it loads the whole Document Storage and the
whole Inverted Index Storage to memory.
That will continue sitting in your machine's memory until you shut the
engine down.

Each time you index a new document, the whole 2 storage files are
replaced by a new ones containing the documents and the inverted index.
This obviously isn't efficient and would be one of the first things to
change if I would continue developing this engine.

The storage locations are specified in the config file (config/defualt.json)
under `docStore.path` and under `invertedIndex.store.path`

### Testing
Configure the engine to use the `numOfSharedTokens` scorer and split
the document by spaces.

Run the following commands:
```
curl -d doc="the dish ran away with the spoon" -X POST http://127.0.0.1:5000/index
curl -d doc="the cat and the hat" -X POST http://127.0.0.1:5000/index
curl -d doc="the cow says moo" -X POST http://127.0.0.1:5000/index
```
```
curl -d "query=a cat ran away today" -X POST http://127.0.0.1:5000/search
```

Should expect the return value to look similar to the following json:
```
{
    "took": 4,
    "query": "a cat ran away",
    "total": 3,
    "hits": [
        {
            "docId": "067e66bd-de40-4647-a9c6-65b441b08457",
            "score": 2,
            "doc": "the dish ran away with the spoon"
        },
        {
            "docId": "594c910f-bcc1-4b21-be4f-dfcda4874b8f",
            "score": 1,
            "doc": "the cat and the hat"
        }
    ]
}
```

### About Me
Gil Bartsion

Senior Software Developer and Team Leader

For any quiestions or inquiries
gillib@gmail.com
