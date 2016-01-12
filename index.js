var parserConstructor = require('./modules/ecomparser'),
    parserAnalyze     = require('./modules/analyze'),
    parserFindAttrs   = require('./modules/find-attributes'),
    Ecomparser;


/* --- Assign constructor function --- */

module.exports = Ecomparser = parserConstructor;

/* --- Add static methods --- */

Ecomparser.analyze = parserAnalyze;
Ecomparser.findAttributes = parserFindAttrs;