var _               = require('lodash'),
    deferred        = require('deferred'),
    HTMLParser      = require('fast-html-parser'),
    request         = require('request'),
    microdataParser = require('microdata-node'),
    URLParser       = require('url'),
    ns              = require('./lib/ns'),
    siteData        = require('./templates/data.json'),
    noop            = function() {};


module.exports = function(url) {
    var def = deferred();

    request(url, function (error, response, html) {
        var retData  = {},
            hostname = URLParser.parse(url).hostname;

        retData.hostname = hostname;

        if (!error && response.statusCode == 200) {

            retData.error = null;

            var hostInfo = siteData[hostname],
                body,
                microdata,
                price,
                priceCurrency,
                meta,
                title,
                canonicalUrl;


            /* --- Parse page --- */

            body = HTMLParser.parse(html);
            microdata = microdataParser.toJson(html);

            /* --- Get og:title --- */

            meta = body.querySelectorAll('meta');

            title = _.reduce(meta, function(retval, tag) {
                if (-~tag.rawAttrs.indexOf('og:title')) {
                    var attrs = tag.rawAttrs.match(/(\w+)=("[^<>"]*"|'[^<>']*'|\w+)/g),
                        attrsObj = _.reduce(attrs, function(retval, attr) {
                            var key = attr.match(/(.+)=/)[1],
                                val = attr.match(/="(.+)"/)[1];

                            retval[key] = val;
                            return retval;
                        }, {});

                    retval = attrsObj.content;
                }

                return retval;
            }, '');

            retData.title = title;

            /* --- Get price and currency ---*/

            retData.price = ns.get(microdata, hostInfo.price.microdata);
            retData.priceCurrency = ns.get(microdata, hostInfo.priceCurrency.microdata);

            def.resolve(retData);

        } else {
            def.reject(new Error("Foo"));
        }
    });

    return def.promise;
}







/*

Return:
canonical
title
price
price currency
image URL

*/