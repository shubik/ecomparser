var _     = require('lodash'),
    Utils = require('./utils'),
    ns    = require('../lib/ns');


module.exports = function(data, price) {

    price = price.toString();

    var priceRegexpPart = Utils.numberWithRegexSeparators(price),
        retval = {};


    /*

    1) is in microdata?
    2) itemprop=\"price\" (value in content or text)?  "42 554 грн"  "43&nbsp;383"  "43,383"
    3) data-price="NNN"
    4) had "id" prop?
    5) property=\"v:pricerange\"?
    6) has class with "price" in it?
    7) parent has class with "price" in it?
    8) has a unique looking class?
    9) JS 'price': '42554'

    */


    /* --- 1) If page has microdata ---*/

    if (data.schema) {
        var microdata = ns.stringify(data.microdata),
            namespace = _.reduce(microdata, function(memo, val, key) {
                if (val.toString() === price) memo = key;
                return memo;
            }, null);

        retval.type = 'microdata';
        retval.key = namespace;

        return retval;
    }

    console.log('findPrice() done...');
}