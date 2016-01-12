var _          = require('lodash'),
    Utils      = require('./utils'),
    ns         = require('../lib/ns'),
    htmlparser = require('htmlparser2'),
    filters,
    selfClosingHTMLTags;


selfClosingHTMLTags = [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr'
];


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
    return Number(p1).toFixed(2) === Number(p2).toFixed(2);
}


function cleanAndLower (str) {
    return Utils.cleanTxt(str).toLowerCase();
}



/* --- Filters for product price --- */

function matchPriceItemprop (node, price, payload, path) {
    if (node.attribs.itemprop && node.attribs.content && pricesAreSame(node.attribs.content, price)) {
        payload.push({
            type     : 'itemprop',
            target   : 'nodeContentAttr',
            selector : getNodeSelector(path, '[itemprop="price"]')
        });
    } else if (node.attribs.itemprop && pricesAreSame(Utils.parseNumber(node.text), price)) {
        payload.push({
            type     : 'itemprop',
            target   : 'nodeText',
            selector : getNodeSelector(path, '[itemprop="price"]')
        });
    }
}

function matchPriceDataPriceAttr (node, price, payload, path) {
    if (node.attribs['data-price'] && pricesAreSame(node.attribs['data-price'], price)) {
        payload.push({
            type     : 'data-price',
            target   : 'nodeText'
        });
    }
}

function matchPriceVPricerangeAttr (node, price, payload, path) {
    if (node.attribs['property'] && node.attribs['property'] === 'v:pricerange' && pricesAreSame(Utils.parseNumber(node.text), price)) {
        payload.push({ type : 'v:pricerange' });
        success = true;
    }
}

function matchPriceNodeWithIdHasPrice (node, price, payload, path) {
    if (node.attribs['id'] && pricesAreSame(Utils.parseNumber(node.text), price)) {
        payload.push({
            type     : 'id',
            target   : 'nodeText',
            selector : '#' + node.attribs['id']
        });
    }
}

function matchPriceNodeWithClass (node, price, payload, path) {
    if (node.attribs['class']) {
        var matches = node.attribs['class'].match(/\b(?=\w*price)\w+\b/i);

        if (matches && pricesAreSame(Utils.parseNumber(node.text), price)) {
            payload.push({
                type     : 'class',
                target   : 'nodeText',
                selector : '.' + matches[0]
            });
        }
    }
}

function matchPriceAllNodes (node, price, payload, path) {
    if (pricesAreSame(Utils.parseNumber(node.text), price)) {
        payload.push({
            type     : 'selector',
            target   : 'nodeText',
            selector : getNodeSelector(path)
        });
    }
}


/* --- Filters for product title --- */

function matchTitleAllNodes (node, title, payload, path) {
    var title = cleanAndLower(title);

    if (cleanAndLower(node.text || '') === title) {

        if (node.attribs.itemprop && node.attribs.itemprop === 'title') {

            payload.push({
                titleType     : 'itemprop',
                titleSelector : 'meta[property="og:title"]'
            });

        } else if (node.attribs.property && node.attribs.property === 'v:itemreviewed') {

            payload.push({
                titleType     : 'v:itemreviewed',
                titleSelector : 'meta[property="og:title"]'
            });

        } else if (node.attribs.id) {

            payload.push({
                titleType     : 'id',
                titleSelector : '#' + node.attribs.id
            });

        } else if (node.attribs['class']) {

            var matches = node.attribs['class'].match(/\b(?=\w*[title|product|name])\w+\b/i);

            if (matches) {
                payload.push({
                    titleType     : 'class',
                    titleSelector : '.' + matches[0]
                });
            }

        } else {
            payload.push({
                titleType     : 'selector',
                titleSelector : getNodeSelector(path)
            });
        }

    }

    if (node.attribs.property && node.attribs.property === 'og:title' && cleanAndLower(node.attribs.content) === title) {
        console.log('matchTitleAllNodes() og:title', title);
    }
}


filtersPrice = [
    matchPriceItemprop,
    matchPriceDataPriceAttr,
    matchPriceVPricerangeAttr,
    matchPriceNodeWithIdHasPrice,
    matchPriceNodeWithClass,
    matchPriceAllNodes
];


filtersTitle = [
    matchTitleAllNodes
];



module.exports = function(data, price, title) {

    price = price.toString();

    var priceRegexpPart = Utils.numberWithRegexSeparators(price),
        retval = [];


    /*

    1) is in microdata?
    2) itemprop="price" (value in content or text)?  "42 554 грн"  "43&nbsp;383"  "43,383"
    3) data-price="NNN"
    4) property="v:pricerange"?
    5) has "id" prop?
    6) has class with "price" in it?
    7) parent has class with "price" in it?

    */


    /* --- 1) If page has microdata ---*/

    if (data.schema) {
        var microdata = ns.stringify(data.microdata),
            namespace = _.reduce(microdata, function(memo, val, key) {
                if (val.toString() === price) memo = key;
                return memo;
            }, null);

        namespace !== null && retval.push({
            type : 'microdata',
            key  : namespace
        });
    }


    /* --- Parse DOM and make necessary checks --- */

    var DOMPath      = [],
        targetFound  = false,
        targetClosed = false,

        parser = new htmlparser.Parser({
            onopentag: function(tagname, attribs){
                var node = { tagname : tagname, attribs : attribs };
                DOMPath.push(node);

                if (-~selfClosingHTMLTags.indexOf(tagname)) {

                    _.each(filtersPrice, function(filter) {
                        filter(DOMPath[DOMPath.length - 1], price, retval, DOMPath);
                    });

                    _.each(filtersTitle, function(filter) {
                        filter(DOMPath[DOMPath.length - 1], title, retval, DOMPath);
                    });
                }
            },

            ontext: function(text){
                if (targetClosed) return;
                DOMPath[DOMPath.length - 1].text = text;

                _.each(filtersPrice, function(filter) {
                    filter(DOMPath[DOMPath.length - 1], price, retval, DOMPath);
                });

                _.each(filtersTitle, function(filter) {
                    filter(DOMPath[DOMPath.length - 1], title, retval, DOMPath);
                });
            },

            onclosetag: function(tagname){
                var lastNode = _.last(DOMPath);

                if (lastNode.tagname === tagname) {
                    DOMPath.pop();
                }
            }
        }, { decodeEntities: true });


    parser.write(data.html);
    parser.end();


    return retval;
}
