var _               = require('lodash'),
    request         = require('request'),
    URLParser       = require('url'),
    deferred        = require('deferred'),
    cheerio         = require('cheerio'),
    microdataParser = require('microdata-node'),
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
        var retData  = {};

        retData.hostname = URLParser.parse(url).hostname;

        if (!error && response.statusCode == 200) {

            var hostInfo  = getHostInfo(siteData, retData.hostname),
                $body     = cheerio.load(html),
                microdata = microdataParser.toJson(html);

            /* --- Set default values --- */

            retData.url           = url;
            retData.title         = null;
            retData.image         = null;
            retData.price         = null;
            retData.priceCurrency = null;


            /* --- Get title --- */

            retData.title = $body(hostInfo.title.selector).attr(hostInfo.title.attr);

            /* --- Get image --- */

            retData.image = $body(hostInfo.image.selector).attr(hostInfo.image.attr);

            /* --- Get canonical URL --- */

            retData.url = $body(hostInfo.url.selector).attr(hostInfo.url.attr);

            /* --- Get price ---*/

            if (hostInfo.price.microdata) {
                retData.price = parseNum(ns.get(microdata, hostInfo.price.microdata));
            } else if (hostInfo.price.selector) {

                if (hostInfo.price.attr) {
                    retData.price = parseNum($body(hostInfo.price.selector).attr(hostInfo.price.attr));
                } else {
                    retData.price = parseNum($body(hostInfo.price.selector).text());
                }

            }


            /* --- Get currency ---*/

            if (hostInfo.priceCurrency.microdata) {
                retData.priceCurrency = ns.get(microdata, hostInfo.priceCurrency.microdata);
            } else if (hostInfo.priceCurrency.selector) {

                switch (hostInfo.priceCurrency.attr) {
                    case 'text':
                        retData.priceCurrency = $body(hostInfo.priceCurrency.selector).text();
                        break;

                    default:
                        retData.priceCurrency = $body(hostInfo.priceCurrency.selector).attr(hostInfo.priceCurrency.attr);
                }
            } else {
                retData.priceCurrency = hostInfo.priceCurrency.default;
            }


            def.resolve(retData);

        } else {
            console.log('FAILED:', url, error);
            def.reject(error);
        }
    });

    return def.promise;
}