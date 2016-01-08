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

    /* --- 2) does page contain itemprop=\"price\" --- */


    /* --- 3) does page contain data-price="NNN" --- */


    /* --- 4) does page have property=\"v:pricerange\" --- */


    /* --- 5) does node have an ID prop --- */


    /* --- 6) does node have class with 'price' word in it --- */


    /* --- 7) does node's parent has class with "price" in it --- */


    /* --- 8) does any <script> tag have 'price':'NNN' or 'price'='NNN' markup --- */


    console.log('findPrice() done...');
}