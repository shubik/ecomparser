var _  = require('lodash');

stringifyIterator = function (memo, obj, str, options) {
    if (arguments.length === 3) {
        options = str || {};
        str = '';
    }

    for (var prop in obj) {

        if (obj.hasOwnProperty(prop)) {

            var oldStr = (str.length > 0) ? str : prop,
                newStr = (str.length > 0) ? str + '.' + prop : prop;

            if (typeof obj[prop] === 'object') {
                stringifyIterator(memo, obj[prop], newStr, options);
            } else {
                if (options.keepLastIntact) {
                    memo[oldStr] = memo[oldStr] || {};
                    memo[oldStr][prop] = (obj[prop] == null ? '' : obj[prop]).toString();
                } else {
                    memo[newStr] = (obj[prop] == null ? '' : obj[prop]).toString();
                }
            }
        }
    }

    return memo;
};



module.exports = ns = function (context, nspace, payload) {
    context = context || {};

    var iter  = function (obj, parts, value) {
        var part = parts.shift();

        obj[part] = obj[part] || {};

        if (parts.length === 0) {
            obj[part] = value;
            return obj;
        } else {
            return iter(obj[part], parts, value);
        }
    };

    iter(context, nspace.split('.'), payload);
    return context;
};

ns.get = function (context, nspace) {
    var result = _.reduce(nspace.split('.'), function(memo, part) {
        if (memo !== undefined) {
            return memo[part];
        } else {
            return undefined;
        }
    }, context);

    return result;
};


ns.getKeys = function(obj, cb){
    if(typeof obj != 'object') return;
    for (var key in obj) {
        cb(key, obj[key]);
        ns.getKeys(obj[key], cb);
        return;
    }
};

ns.stringify = function (context, keepLastIntact) {
    var payload = {};

    keepLastIntact = keepLastIntact || false;
    stringifyIterator(payload, context, { keepLastIntact: keepLastIntact });

    return payload;
}

ns.find = function(context, childAttr, searchVal) {
    var payload = {};
    findIterator(payload, context, searchVal);
    return payload;
}