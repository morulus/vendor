
var vendor = {};

var assembler = require('./extra/assembler.js');

Object.defineProperty(vendor, 'assembler', {
	get: function() { return new assembler(); },
	set: function() {},
	enumerable: true,
	configurable: true
});

module.exports = vendor;