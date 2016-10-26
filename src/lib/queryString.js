
    var Utils={},stringify;
    Utils.hexTable = new Array(256);
    for (var i = 0; i < 256; ++i) {
        Utils.hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
    }

    var internals = {
        delimiter: '&',
        arrayPrefixGenerators: {
            brackets: function (prefix, key) {

                return prefix + '[]';
            },
            indices: function (prefix, key) {

                return prefix + '[' + key + ']';
            },
            repeat: function (prefix, key) {

                return prefix;
            }
        },
        strictNullHandling: false
    };

    Utils.arrayToObject = function (source) {

        var obj = Object.create(null);
        for (var i = 0, il = source.length; i < il; ++i) {
            if (typeof source[i] !== 'undefined') {

                obj[i] = source[i];
            }
        }

        return obj;
    };


    Utils.merge = function (target, source) {

        if (!source) {
            return target;
        }

        if (typeof source !== 'object') {
            if (Array.isArray(target)) {
                target.push(source);
            }
            else if (typeof target === 'object') {
                target[source] = true;
            }
            else {
                target = [target, source];
            }

            return target;
        }

        if (typeof target !== 'object') {
            target = [target].concat(source);
            return target;
        }

        if (Array.isArray(target) &&
            !Array.isArray(source)) {

            target = exports.arrayToObject(target);
        }

        var keys = Object.keys(source);
        for (var k = 0, kl = keys.length; k < kl; ++k) {
            var key = keys[k];
            var value = source[key];

            if (!target[key]) {
                target[key] = value;
            }
            else {
                target[key] = exports.merge(target[key], value);
            }
        }

        return target;
    };


    Utils.decode = function (str) {

        try {
            return decodeURIComponent(str.replace(/\+/g, ' '));
        } catch (e) {
            return str;
        }
    };

    Utils.encode = function (str) {

        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
        // It has been adapted here for stricter adherence to RFC 3986
        if (str.length === 0) {
            return str;
        }

        if (typeof str !== 'string') {
            str = '' + str;
        }

        var out = '';
        for (var i = 0, il = str.length; i < il; ++i) {
            var c = str.charCodeAt(i);

            if (c === 0x2D || // -
                c === 0x2E || // .
                c === 0x5F || // _
                c === 0x7E || // ~
                (c >= 0x30 && c <= 0x39) || // 0-9
                (c >= 0x41 && c <= 0x5A) || // a-z
                (c >= 0x61 && c <= 0x7A)) { // A-Z

                out += str[i];
                continue;
            }

            if (c < 0x80) {
                out += Utils.hexTable[c];
                continue;
            }

            if (c < 0x800) {
                out += Utils.hexTable[0xC0 | (c >> 6)] + Utils.hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            if (c < 0xD800 || c >= 0xE000) {
                out += Utils.hexTable[0xE0 | (c >> 12)] + Utils.hexTable[0x80 | ((c >> 6) & 0x3F)] + Utils.hexTable[0x80 | (c & 0x3F)];
                continue;
            }

            ++i;
            c = 0x10000 + (((c & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF));
            out += Utils.hexTable[0xF0 | (c >> 18)] + Utils.hexTable[0x80 | ((c >> 12) & 0x3F)] + Utils.hexTable[0x80 | ((c >> 6) & 0x3F)] + Utils.hexTable[0x80 | (c & 0x3F)];
        }

        return out;
    };

    Utils.compact = function (obj, refs) {

        if (typeof obj !== 'object' ||
            obj === null) {

            return obj;
        }

        refs = refs || [];
        var lookup = refs.indexOf(obj);
        if (lookup !== -1) {
            return refs[lookup];
        }

        refs.push(obj);

        if (Array.isArray(obj)) {
            var compacted = [];

            for (var i = 0, il = obj.length; i < il; ++i) {
                if (typeof obj[i] !== 'undefined') {
                    compacted.push(obj[i]);
                }
            }

            return compacted;
        }

        var keys = Object.keys(obj);
        for (i = 0, il = keys.length; i < il; ++i) {
            var key = keys[i];
            obj[key] = exports.compact(obj[key], refs);
        }

        return obj;
    };


    Utils.isRegExp = function (obj) {

        return Object.prototype.toString.call(obj) === '[object RegExp]';
    };


    Utils.isBuffer = function (obj) {

        if (obj === null ||
            typeof obj === 'undefined') {

            return false;
        }

        return !!(obj.constructor &&
                  obj.constructor.isBuffer &&
                  obj.constructor.isBuffer(obj));
    };

    Utils.stringify = function (obj, prefix, generateArrayPrefix, strictNullHandling, filter) {

        if (typeof filter === 'function') {
            obj = filter(prefix, obj);
        }
        else if (Utils.isBuffer(obj)) {
            obj = obj.toString();
        }
        else if (obj instanceof Date) {
            obj = obj.toISOString();
        }
        else if (obj === null) {
            if (strictNullHandling) {
                return Utils.encode(prefix);
            }

            obj = '';
        }

        if (typeof obj === 'string' ||
            typeof obj === 'number' ||
            typeof obj === 'boolean') {

            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];
        }

        var values = [];

        if (typeof obj === 'undefined') {
            return values;
        }

        var objKeys = Array.isArray(filter) ? filter : Object.keys(obj);
        for (var i = 0, il = objKeys.length; i < il; ++i) {
            var key = objKeys[i];

            if (Array.isArray(obj)) {
                values = values.concat(Utils.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, filter));
            }
            else {
                values = values.concat(Utils.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix, strictNullHandling, filter));
            }
        }

        return values;
    };

    module.exports = function (obj, options) {

        options = options || {};
        var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
        var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
        var objKeys;
        var filter;
        if (typeof options.filter === 'function') {
            filter = options.filter;
            obj = filter('', obj);
        }
        else if (Array.isArray(options.filter)) {
            objKeys = filter = options.filter;
        }

        var keys = [];

        if (typeof obj !== 'object' ||
            obj === null) {

            return '';
        }

        var arrayFormat;
        if (options.arrayFormat in internals.arrayPrefixGenerators) {
            arrayFormat = options.arrayFormat;
        }
        else if ('indices' in options) {
            arrayFormat = options.indices ? 'indices' : 'repeat';
        }
        else {
            arrayFormat = 'indices';
        }

        var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

        if (!objKeys) {
            objKeys = Object.keys(obj);
        }
        for (var i = 0, il = objKeys.length; i < il; ++i) {
            var key = objKeys[i];
            keys = keys.concat(Utils.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, filter));
        }

        return keys.join(delimiter);
    }