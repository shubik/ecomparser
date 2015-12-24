var _ = require('lodash'),
    parseAttrs = require('./parseAttrs');


module.exports = function(tags, prop) {
    var key = 'og:' + prop,
        content;

    content = _.reduce(tags, function(retval, tag) {
        var rawAttrs = tag.rawAttrs.replace(/\\"/g, '"');

        if (-~rawAttrs.indexOf(key)) {
            retval = parseAttrs(rawAttrs).content;
        }

        return retval;
    }, null);

    return content;
}