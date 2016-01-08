var _         = require('lodash'),
    URLParser = require('url'),
    request   = require('request'),
    deferred  = require('deferred'),
    cheerio   = require('cheerio'),
    microdataParser = require('microdata-node'),
    defaultHeaders;


defaultHeaders = {
    'User-Agent'      : 'curl/7.35.0',
    'Accept'          : '*/*',
    'Accept-Encoding' : '',
    'Cache-Control'   : 'max-age=0',
    'Referer'         : 'http://farennikov.com',
    'Connection'      : 'close'
}


module.exports = function(url, siteData) {
    var def = deferred(),
        reqOpts = {
            url : url,
            headers : defaultHeaders
        };


    /* --- Try loading and parsing page --- */

    request(reqOpts, function (error, response, html) {
        var retData = {};

        if (!error && response.statusCode === 200) {

            var parsedURL = URLParser.parse(url),
                hostInfo,
                $page,
                microdata,
                parsedImgURL;


            /* --- Detect character encoding and decode HTML if necessary --- */

            html = Utils.cleanTxt(html);
            html = Utils.decodeHTML(html);

            /* --- Set page's hostname --- */

            retData.hostname = parsedURL.hostname;
            hostInfo  = Utils.getHostInfo(siteData, retData.hostname);

            if (!hostInfo) return def.reject(new Error('Host info is not defined for ' + retData.hostname));

            $page     = cheerio.load(html);
            microdata = microdataParser.toJson(html);


            /* --- Set default values --- */

            retData.url           = url;
            retData.title         = null;
            retData.image         = null;
            retData.price         = null;
            retData.priceCurrency = null;


            /* --- Get title --- */

            if (hostInfo.title && hostInfo.title.selector) {
                if (hostInfo.title.attr) {
                    retData.title = $page(hostInfo.title.selector).attr(hostInfo.title.attr);
                } else {
                    retData.title = $page(hostInfo.title.selector).text();
                }
            }

            retData.title = Utils.cleanTxt(retData.title);


            /* --- Get image --- */

            if (hostInfo.image && hostInfo.image.microdata) {
                retData.image = ns.get(microdata, hostInfo.image.microdata);
            } else if (hostInfo.image.selector) {
                if (hostInfo.image.attr) {
                    retData.image = $page(hostInfo.image.selector).attr(hostInfo.image.attr);
                } else {
                    retData.image = $page(hostInfo.image.selector).text();
                }
            }


            /* --- Fix images with relative URLs --- */

            parsedImgURL = URLParser.parse(retData.image);

            if (parsedImgURL.host === null) {
                parsedImgURL.protocol = parsedURL.protocol;
                parsedImgURL.host = parsedURL.host;
                retData.image = URLParser.format(parsedImgURL);
            }


            /* --- Get canonical URL --- */

            if (hostInfo.url && hostInfo.url.selector) {
                if (hostInfo.url.attr) {
                    retData.url = $page(hostInfo.url.selector).attr(hostInfo.url.attr) || url;
                } else {
                    retData.url = $page(hostInfo.url.selector).text() || url;
                }
            }


            /* --- Get price ---*/

            if (hostInfo.price && hostInfo.price.microdata) {
                try {
                    retData.price = Utils.parseNumber(ns.get(microdata, hostInfo.price.microdata));
                } catch (err) {
                    console.warn('Parsing price failed for', hostInfo.price.microdata);
                    console.log('microdata:', JSON.stringify(ns.get(microdata, 'items'), null, 2));
                }
            } else if (hostInfo.price.selector) {

                if (hostInfo.price.attr) {
                    retData.price = Utils.parseNumber($page(hostInfo.price.selector).attr(hostInfo.price.attr));
                } else {
                    retData.price = Utils.parseNumber($page(hostInfo.price.selector).text());
                }
            }


            /* --- Get currency ---*/

            if (hostInfo.priceCurrency && hostInfo.priceCurrency.microdata) {
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


            /* --- Resolve deferred --- */

            def.resolve(retData);

        } else {
            def.reject(error);
        }
    });

    return def.promise;
}