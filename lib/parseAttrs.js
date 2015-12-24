var _ = require('lodash');

module.exports = function(str) {
    var kvpairs = str.match(/([a-z-]+)=("[^<>"]*"|'[^<>']*'|\w+)/g),
        attrs = _.reduce(kvpairs, function(memo, attr) {
            var key = attr.match(/(.+)=/)[1],
                val = attr.match(/="(.+)"/)[1];

            memo[key] = val;
            return memo;
        }, {});

    return attrs;
}