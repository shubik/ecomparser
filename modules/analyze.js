var request         = require('request'),
    deferred        = require('deferred'),
    microdataParser = require('microdata-node'),
    ns              = require('../lib/ns'),
    Utils           = require('./utils'),
    defaultHeaders  = require('./headers.json');


module.exports = function(url) {
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
            retData.charset = Utils.getCharset(html);

            html = Utils.normalizeHTML(html);
            html = Utils.decodeHTML(html);

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

            /* --- Attach HTML and microdata --- */

            retData.html = html;
            retData.microdata = microdata;

            def.resolve(retData);

        } else {
            console.log('FAILED:', url, error, html);
            def.reject(error);
        }
    });

    return def.promise;
}