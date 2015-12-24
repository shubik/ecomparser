var _               = require('lodash'),
    request         = require('request'),
    URLParser       = require('url'),
    deferred        = require('deferred'),
    cheerio         = require('cheerio'),
    microdataParser = require('microdata-node'),
    windows1251     = require('windows-1251'),
    ns              = require('./lib/ns');


function parseNum(str) {
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


function getCharset(html) {
    var matches = html.match(/charset=["]*([^>"\s]+)/i);
    return matches.length ? matches[1].toLowerCase() : undefined;
}


function decodeHTML(html) {
    var charset = getCharset(html),
        decoded;

    switch (charset) {
        case 'windows-1251':
            decoded = windows1251.decode(html);
            break;

        default:
            decoded = html;
    }

    return decoded;
}


module.exports = function(url, siteData) {
    var def = deferred(),
        reqOpts = {
            url : url,
            headers : {
                'User-Agent'      : 'curl/7.35.0',
                'Accept'          : '*',
                'Accept-Encoding' : '',
                'Cache-Control'   : 'max-age=0'
            }
        };

    request(reqOpts, function (error, response, html) {
        var retData  = {},
            charset;

        retData.hostname = URLParser.parse(url).hostname;


        if (!error && response.statusCode == 200) {

            /* --- Detect character encoding and decode HTML if necessary --- */

            html = decodeHTML(html);


            var hostInfo  = getHostInfo(siteData, retData.hostname),
                $page     = cheerio.load(html),
                microdata = microdataParser.toJson(html);


            /* --- Set default values --- */

            retData.url           = url;
            retData.title         = null;
            retData.image         = null;
            retData.price         = null;
            retData.priceCurrency = null;


            /* --- Get title --- */

            if (hostInfo.title.attr) {
                retData.title = $page(hostInfo.title.selector).attr(hostInfo.title.attr);
            } else {
                retData.title = $page(hostInfo.title.selector).text();
            }

            // retData.title = $page(hostInfo.title.selector).attr(hostInfo.title.attr);

            /* --- Get image --- */

            if (hostInfo.image.attr) {
                retData.image = $page(hostInfo.image.selector).attr(hostInfo.image.attr);
            } else {
                retData.image = $page(hostInfo.image.selector).text();
            }

            // retData.image = $page(hostInfo.image.selector).attr(hostInfo.image.attr);

            /* --- Get canonical URL --- */

            if (hostInfo.url.attr) {
                retData.url = $page(hostInfo.url.selector).attr(hostInfo.url.attr) || url;
            } else {
                retData.url = $page(hostInfo.url.selector).text() || url;
            }

            // retData.url = $page(hostInfo.url.selector).attr(hostInfo.url.attr) || url;

            /* --- Get price ---*/

            if (hostInfo.price.microdata) {
                retData.price = parseNum(ns.get(microdata, hostInfo.price.microdata));
            } else if (hostInfo.price.selector) {

                if (hostInfo.price.attr) {
                    retData.price = parseNum($page(hostInfo.price.selector).attr(hostInfo.price.attr));
                } else {
                    retData.price = parseNum($page(hostInfo.price.selector).text());
                }

            }


            /* --- Get currency ---*/

            if (hostInfo.priceCurrency.microdata) {
                retData.priceCurrency = ns.get(microdata, hostInfo.priceCurrency.microdata);
            } else if (hostInfo.priceCurrency.selector) {

                if (hostInfo.priceCurrency.attr) {
                    retData.priceCurrency = $page(hostInfo.priceCurrency.selector).attr(hostInfo.priceCurrency.attr);
                } else {
                    retData.priceCurrency = $page(hostInfo.priceCurrency.selector).text();
                }

            } else {
                retData.priceCurrency = hostInfo.priceCurrency.default;
            }

            /* --- Make sure necessary string values are decoded --- */

            // retData.title = decode(retData.title, charset);


            /* --- Resolve deferred --- */

            def.resolve(retData);

        } else {
            console.log('FAILED:', url, error, html);
            def.reject(error);
        }
    });

    return def.promise;
}