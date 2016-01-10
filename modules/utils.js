var _           = require('lodash'),
    windows1251 = require('windows-1251');


module.exports = Utils = {
    parseNumber: function (str) {
        var matches = str.match(/(\d+).? ?(\d+)/);
        if (matches !== null) return matches[0].replace(' ','');
        else return undefined;
    },

    getHostInfo: function (siteData, hostname) {
        var retval = _.reduce(siteData, function(memo, data, host) {
            var reStr = host.replace('*', '.+?'),
                re = new RegExp(reStr),
                matches = hostname.match(re);

            if (matches !== null) memo = data;
            return memo;
        }, null);

        return retval;
    },


    getCharset: function (html) {
        var matches = html.match(/charset=["]*([^>"\s]+)/i);
        return matches && matches.length ? matches[1].toLowerCase() : undefined;
    },


    decodeHTML: function (html) {
        var charset = Utils.getCharset(html),
            decoded;

        switch (charset) {
            case 'windows-1251':
                decoded = windows1251.decode(html, { 'mode': 'html' });
                break;

            default:
                decoded = html;
        }

        return decoded;
    },


    cleanTxt: function (str) {
        return (str || '').replace(/\r?\n|\r|\t| +(?= )/g, '').trim();
    },


    normalizeHTML: function (html) {
        return Utils.cleanTxt(html).replace(/>[ |\t\n\b]+/gi, ">").replace(/[ |\t\n\b]+</gi, "<").replace("&nbsp;", " ");
    },


    numberWithRegexSeparators: function (number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "[ |,]?");
    }
}