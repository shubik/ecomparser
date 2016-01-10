var _          = require('lodash'),
    Utils      = require('./utils'),
    ns         = require('../lib/ns'),
    htmlparser = require('htmlparser2'),
    filters;


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



/* --- onclosetag filters --- */

function matchItemprop (lastNode, price, payload, DOMPath) {
    if (lastNode.attribs.itemprop && lastNode.attribs.content && pricesAreSame(lastNode.attribs.content, price)) {
        payload.push({
            type     : 'itemprop',
            target   : 'nodeContentAttr',
            selector : getNodeSelector(DOMPath, '[itemprop="price"]')
        });
    } else if (lastNode.attribs.itemprop && pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
        payload.push({
            type     : 'itemprop',
            target   : 'nodeText',
            selector : getNodeSelector(DOMPath, '[itemprop="price"]')
        });
    }
}

function matchDataPriceAttr (lastNode, price, payload, DOMPath) {
    if (lastNode.attribs['data-price'] && pricesAreSame(lastNode.attribs['data-price'], price)) {
        payload.push({
            type     : 'data-price',
            target   : 'nodeText'
        });
    }
}

function matchVPricerangeAttr (lastNode, price, payload, DOMPath) {
    if (lastNode.attribs['property'] && lastNode.attribs['property'] === 'v:pricerange' && pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
        payload.push({ type : 'v:pricerange' });
        success = true;
    }
}

function matchNodeWithIdHasPrice (lastNode, price, payload, DOMPath) {
    if (lastNode.attribs['id'] && pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
        payload.push({
            type     : 'has-id',
            target   : 'nodeText',
            selector : '#' + lastNode.attribs['id']
        });
    }
}

function matchNodeWithClass (lastNode, price, payload, DOMPath) {
    if (lastNode.attribs['class']) {
        var matches = lastNode.attribs['class'].match(/\b(?=\w*price)\w+\b/i);

        if (matches && pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
            payload.push({
                type     : 'class-has-price',
                target   : 'nodeText',
                selector : '.' + matches[0]
            });
        }
    }
}


function matchAllNodes (lastNode, price, payload, DOMPath) {
    if (pricesAreSame(Utils.parseNumber(lastNode.text), price)) {
        payload.push({
            type     : 'selector',
            target   : 'nodeText',
            selector : getNodeSelector(DOMPath)
        });
    }
}


filters = [
    matchItemprop,
    matchDataPriceAttr,
    matchVPricerangeAttr,
    matchNodeWithIdHasPrice,
    matchNodeWithClass,
    matchAllNodes
];




module.exports = function(data, price) {

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
            },

            ontext: function(text){
                if (targetClosed) return;
                DOMPath[DOMPath.length - 1].text = text;

                _.each(filters, function(filter) {
                    filter(DOMPath[DOMPath.length - 1], price, retval, DOMPath);
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
