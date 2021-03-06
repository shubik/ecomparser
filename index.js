var _               = require('lodash'),
    request         = require('request'),
    URLParser       = require('url'),
    deferred        = require('deferred'),
    cheerio         = require('cheerio'),
    microdataParser = require('microdata-node'),
    windows1251     = require('windows-1251'),
    ns              = require('./lib/ns'),
    defaultHeaders,
    Ecomparser;


defaultHeaders = {
    'User-Agent'      : 'curl/7.35.0',
    'Accept'          : '*/*',
    'Accept-Encoding' : '',
    'Cache-Control'   : 'max-age=0',
    'Referer'         : 'http://farennikov.com',
    'Connection'      : 'close'
}


function parseNumber(str) {
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
            decoded = windows1251.decode(html, { 'mode': 'html' });
            break;

        default:
            decoded = html;
    }

    return decoded;
}


function cleanTxt(str) {
    str = str.replace(/ +(?= )/g, '');
    str = str.replace(/\r?\n|\r/g, '');
    return str.trim();
}


module.exports = Ecomparser = function(url, siteData) {
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

            html = decodeHTML(html);

            /* --- Set page's hostname --- */

            retData.hostname = parsedURL.hostname;
            hostInfo  = getHostInfo(siteData, retData.hostname);

            if (!hostInfo) return def.reject(new Error('Host info is not defined for ' + retData.hostname));

            $page     = cheerio.load(html);
            microdata = microdataParser.toJson(html);


            // console.log('microdata:', JSON.stringify(ns.get(microdata, 'items.5.properties.image'), null, 2));


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

            retData.title = cleanTxt(retData.title);


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
                    retData.price = parseNumber(ns.get(microdata, hostInfo.price.microdata));
                } catch (err) {
                    console.warn('Parsing price failed for', hostInfo.price.microdata);
                    console.log('microdata:', JSON.stringify(ns.get(microdata, 'items'), null, 2));
                }
            } else if (hostInfo.price.selector) {

                if (hostInfo.price.attr) {
                    retData.price = parseNumber($page(hostInfo.price.selector).attr(hostInfo.price.attr));
                } else {
                    retData.price = parseNumber($page(hostInfo.price.selector).text());
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
            console.log('FAILED:', url, error, html);
            def.reject(error);
        }
    });

    return def.promise;
}


Ecomparser.analize = function(url) {
    var def = deferred(),
        reqOpts = {
            url : url,
            headers : defaultHeaders
        };


    /* --- Try loading and parsing page --- */

    request(reqOpts, function (error, response, html) {
        var retData = {},
            microdata;

        if (!error && response.statusCode === 200) {

            /* --- Set defaults --- */

            retData.opengaph = false;
            retData.schema = false;
            retData.charset = getCharset(html);

            /* --- Check opengaph markup --- */

            if (html.match(/property=["|']*og:name/gi)) {
                retData.opengaph = true;
                retData.name = true;
            }

            if (html.match(/property=["|']*og:url/gi)) {
                retData.opengaph = true;
                retData.url = true;
            }

            if (html.match(/property=["|']*og:image/gi)) {
                retData.opengaph = true;
                retData.image = true;
            }


            /* --- Check microformat (schema) --- */

            microdata = microdataParser.toJson(html);

            if (microdata) retData.schema = true;

            def.resolve(retData);

        } else {
            console.log('FAILED:', url, error, html);
            def.reject(error);
        }
    });

    return def.promise;
}