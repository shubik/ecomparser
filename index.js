var _               = require('lodash'),
    request         = require('request'),
    URLParser       = require('url'),
    HTMLParser      = require('fast-html-parser'),
    microdataParser = require('microdata-node'),
    deferred        = require('deferred'),
    ns              = require('./lib/ns'),
    opengraph       = require('./lib/og'),
    getbytag        = require('./lib/getbytag'),
    parseAttrs      = require('./lib/parseAttrs'),
    noop            = function() {};


module.exports = function(url, siteData) {
    var def = deferred();

    request(url, function (error, response, html) {
        var retData  = {},
            hostname = URLParser.parse(url).hostname;


        retData.hostname = hostname;

        if (!error && response.statusCode == 200) {

            var hostInfo = siteData[hostname],
                body,
                microdata,
                metatags;

            /* --- Set default values --- */

            retData.url           = url;
            retData.title         = null;
            retData.image         = null;
            retData.price         = null;
            retData.priceCurrency = null;

            /* --- Parse page and meta tags --- */

            body = HTMLParser.parse(html);
            microdata = microdataParser.toJson(html);
            metatags = body.querySelectorAll('meta');

            // console.log('microdata:', JSON.stringify(microdata, null, 2));


            /* --- Get title --- */

            if (hostInfo.title.opengraph) {
                retData.title = opengraph(metatags, hostInfo.title.opengraph);
            } else if (hostInfo.title.selector) {
                var el = body.querySelector(hostInfo.title.selector);
                retData.title = el.childNodes[0].rawText;
            }

            /* --- Get image --- */

            if (hostInfo.image.opengraph) {
                retData.image = opengraph(metatags, hostInfo.image.opengraph);
            } else if (hostInfo.image.selector) {
                var el = body.querySelector(hostInfo.image.selector),
                    attr = hostInfo.image.attr || 'src';

                retData.image = parseAttrs(el.rawAttrs)[attr];
            }

            /* --- Get canonical URL --- */

            if (hostInfo.url.opengraph) {
                retData.url = opengraph(metatags, hostInfo.url.opengraph);
            } else if (hostInfo.url.link) {
                retData.url = getbytag(body.querySelectorAll('link'), hostInfo.url.link, hostInfo.url.attr);
            }

            /* --- Get price ---*/

            if (hostInfo.price.microdata) {
                retData.price = ns.get(microdata, hostInfo.price.microdata);
            } else if (hostInfo.price.selector) {
                var el = body.querySelector(hostInfo.price.selector);
                retData.price = el.childNodes[0].rawText.match(/\d+.?\d?\d?/)[0];
            }

            /* --- Get currency ---*/

            if (hostInfo.priceCurrency.microdata) {
                retData.priceCurrency = ns.get(microdata, hostInfo.priceCurrency.microdata);
            } else {
                retData.priceCurrency = hostInfo.priceCurrency.default;
            }


            def.resolve(retData);

        } else {
            def.reject(error);
        }
    });

    return def.promise;
}