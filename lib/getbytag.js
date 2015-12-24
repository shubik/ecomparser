var _ = require('lodash'),
    parseAttrs = require('./parseAttrs');


module.exports = function(tags, prop, returnProp) {
    var content;

    content = _.reduce(tags, function(retval, tag) {
        var rawAttrs = tag.rawAttrs.replace(/\\"/g, '"');

        if (-~rawAttrs.indexOf(prop)) {
            retval = parseAttrs(rawAttrs)[returnProp];
        }

        return retval;
    }, null);

    return content;
}