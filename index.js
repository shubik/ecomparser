var parserConstructor = require('./modules/ecomparser'),
    parserAnalyze     = require('./modules/analyze'),
    parserFindPrice   = require('./modules/find-price'),
    parserFindTitle   = require('./modules/find-title'),
    Ecomparser;


/* --- Assign constructor function --- */

module.exports = Ecomparser = parserConstructor;

/* --- Add static methods --- */

Ecomparser.analyze   = parserAnalyze;
Ecomparser.findPrice = parserFindPrice;
Ecomparser.findTitle = parserFindTitle;