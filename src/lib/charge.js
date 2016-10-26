module.exports = function(object, proto) {
	for (var prop in proto) {
		if (proto.hasOwnProperty(prop)) {
			if ("object"===typeof proto[prop]) {
				object[prop] = new Object(proto[prop]);
			} else {
				object[prop] = proto[prop];
			}
		}
	}
};