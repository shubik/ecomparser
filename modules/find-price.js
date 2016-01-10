var _          = require('lodash'),
    Utils      = require('./utils'),
    ns         = require('../lib/ns'),
    htmlparser = require('htmlparser2');


function getNodeSelector (nodes, suffix) {
    suffix = suffix || '';

    var selector = _.reduce(nodes.reverse(), function(arr, node) {
        if (arr._done) return arr;

        if (node.attribs.id) {
            arr.push('#' + node.attribs.id);
            arr._done = true;
        } else {
            arr.push(node.tagname);
        }

        return arr;
    }, []);

    return selector.reverse().join(' ') + suffix;
}


function pricesAreSame (p1, p2) {
    return Number(p1).toFixed() === Number(p2).toFixed();
}


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

        // return retval;
    }


    /* --- 2) does page contain itemprop="price" --- */

    /*

     Parse node until we find itemprop="price" node

    */

    var DOMPath = [],
        targetFound = false,
        targetClosed = false,

        parser = new htmlparser.Parser({
            onopentag: function(tagname, attribs){
                if (!targetFound) {

                    var node = { tagname : tagname, attribs : attribs };
                    DOMPath.push(node);

                    if (attribs.itemprop && attribs.itemprop === 'price') {
                        targetFound = true;
                    }
                }
            },

            ontext: function(text){
                if (targetClosed) return;
                DOMPath[DOMPath.length - 1].text = text;
            },

            onclosetag: function(tagname){
                var lastNode = _.last(DOMPath);

                if (targetFound && !targetClosed) {

                    /* --- Check if content or text equals price --- */

                    if (lastNode.attribs.content && pricesAreSame(lastNode.attribs.content, price)) {
                        retval.type = 'itemprop';
                        retval.get = 'nodeContentAttr';
                        retval.selector = getNodeSelector(DOMPath, '[itemprop="price"]');
                        targetClosed = true;
                        return;
                    } else if (pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
                        retval.type = 'itemprop';
                        retval.get = 'nodeText';
                        retval.selector = getNodeSelector(DOMPath, '[itemprop="price"]');
                        targetClosed = true;
                        return;
                    } else {
                        targetFound = false;
                    }
                }

                if (lastNode.tagname === tagname) {
                    DOMPath.pop();
                }
            }
        }, { decodeEntities: true });


    parser.write(data.html);
    parser.end();



    /* --- 3) does page contain data-price="NNN" --- */

    var DOMPath = [],
        targetFound = false,
        targetClosed = false,

        parser = new htmlparser.Parser({
            onopentag: function(tagname, attribs){
                if (!targetFound) {

                    var node = { tagname : tagname, attribs : attribs };
                    DOMPath.push(node);

                    if (attribs['data-price']) {
                        targetFound = true;
                    }
                }
            },

            ontext: function(text){
                if (targetClosed) return;
                DOMPath[DOMPath.length - 1].text = text;
            },

            onclosetag: function(tagname){
                var lastNode = _.last(DOMPath);

                if (targetFound && !targetClosed) {

                    /* --- Check if data-price attribute value equals price --- */

                    if (lastNode.attribs['data-price'] && pricesAreSame(lastNode.attribs['data-price'], price)) {
                        retval.type = 'data-price';
                        targetClosed = true;
                        return;
                    } else {
                        targetFound = false;
                    }
                }

                if (lastNode.tagname === tagname) {
                    DOMPath.pop();
                }
            }
        }, { decodeEntities: true });


    parser.write(data.html);
    parser.end();


    /* --- 4) does page have property=\"v:pricerange\" --- */


    /* --- 5) does node have an ID prop --- */


    /* --- 6) does node have class with 'price' word in it --- */


    /* --- 7) does node's parent has class with "price" in it --- */


    /* --- 8) does any <script> tag have 'price':'NNN' or 'price'='NNN' markup --- */


    console.log('findPrice() done...');

    return retval;
}


// http://a-techno.com.ua/72767.html -- 1, 2
// http://www.notus.com.ua/Apple-iMac-215-4K-display-MK452-NEW-2015 -- 2, 5
// http://portativ.ua/product_98429.html -- 2
// http://xclusive.com.ua/catalog/macbook/mk452.html -- 3
// http://maclove.com.ua/catalog/261355/245048/70298 -- 7 class="uah"
// http://www.sokol.ua/monoblok-apple-imac-a1418-mk452ua-a-065b9/p702209/ -- 2
// http://foxmart.ua/kompyoutery/apple-imac-a1418-mk452uaa.html -- 2 (text, not content), 4
// http://pcshop.ua/Monoblok_Apple_iMac_MK452.aspx -- 6
// http://tid.ua/mikrovolnovaya-pech-gorenje-mo-17-dw-(mo17dw) -- 2 (text)
// http://myphone.kh.ua/monoblok-apple-imac-215-with-retina-4k-display-mk452-2015/ -- 8, 6
// http://chooser.com.ua/monoblok-apple-imac-215-with-retina-4k-display-mk452-2015 -- 9
// http://vivostore.ua/product/apple-new-imac-21-5-retina-mk452-2015 -- 8, 6
// https://store.iland.ua/apple-computers/personal-computers/imac/imac-21-5-retina-4-k-core-i5-3-1ghz-quad-core-8gb-1tb-intel-iris-pro-6200-mk452.html -- 6
// http://solvo.com.ua/products/apple-imac-215-with-retina-4k-display-mk452-2015 -- 9
// http://www.mrfix.com.ua/product/apple-imac-215-with-retina-4k-display-mk452/ -- 6
// http://mcstore.com.ua/catalog/imac_21_5/apple_imac_21_5_new_mk452/ -- 6
// http://www.ozon.ru/context/detail/id/18037252/ -- 6