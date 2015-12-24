var _               = require('lodash'),
    request         = require('request'),
    URLParser       = require('url'),
    HTMLParser      = require('fast-html-parser'),
    microdataParser = require('microdata-node'),
    deferred        = require('deferred'),
    cheerio         = require('cheerio'),
    ns              = require('./lib/ns'),
    opengraph       = require('./lib/og'),
    getbytag        = require('./lib/getbytag'),
    parseAttrs      = require('./lib/parseAttrs');


function parseDecimal(str) {
    return str.match(/(\d+).? ?(\d+)/)[0].replace(' ','');
}


function getHostInfo(siteData, hostname) {
    var retval = _.reduce(siteData, function(memo, data, host) {
        var reStr = host.replace('*', '.+?'),
            re = new RegExp(reStr),
            matches = hostname.match(re);

        if (matches !== null) memo = data;
        return memo;
    }, null);

    return retval;
}


module.exports = function(url, siteData) {
    var def = deferred(),
        reqOpts = {
            url : url,
            headers : {
                'User-Agent'      : 'curl/7.35.0', // Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36
                'Accept'          : '*',
                'Accept-Encoding' : '',
                'Cache-Control'   : 'max-age=0'
            }
        };

    request(reqOpts, function (error, response, html) {
        var retData  = {};

        retData.hostname = URLParser.parse(url).hostname;

        if (!error && response.statusCode == 200) {
            var hostInfo = getHostInfo(siteData, retData.hostname),
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

            body      = HTMLParser.parse(html);
            microdata = microdataParser.toJson(html);
            metatags  = body.querySelectorAll('meta');
            $body     = cheerio.load(html);


            // console.log('PRICE:', ns.get(microdata, 'items.0.properties.offers.0.properties.price.0'));
            console.log('$ URL:', $body('meta[property="og:url"]').attr('content'));
            console.log('$ PRICE:', $body('span[property="v:pricerange"]').text());


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
                retData.price = parseDecimal(ns.get(microdata, hostInfo.price.microdata));
            } else if (hostInfo.price.selector) {
                var el = body.querySelector(hostInfo.price.selector);
                retData.price = parseDecimal(el.childNodes[0].rawText);
            }

            /* --- Get currency ---*/

            if (hostInfo.priceCurrency.microdata) {
                retData.priceCurrency = ns.get(microdata, hostInfo.priceCurrency.microdata);
            } else {
                retData.priceCurrency = hostInfo.priceCurrency.default;
            }


            def.resolve(retData);

        } else {
            console.log('Error?', error, response);
            def.reject(error);
        }
    });

    return def.promise;
}