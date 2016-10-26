var getXmlHttp = require('./getXmlHttp.js');

var fileLoader = function(resource, callback) {
	
	this.resource = resource;
	
	this.callback = callback;
	var that = this;
	this.load(function(err, data) {
		var module;

		if (err) {
			throw err;
			module = null;
		} else {
			module = {
				exports: data
			}
		}
		that.callback.call(that.resource, module);
	});
}

fileLoader.prototype = {
	constructor: fileLoader,
	load: function(callback) {
		var xobj = getXmlHttp();
	    if (xobj.overrideMimeType) xobj.overrideMimeType("application/x-www-form-urlencoded");

		xobj.open('GET', this.resource.url, !this.resource.sync);
		xobj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
		xobj.onreadystatechange = function() {
			 if (xobj.readyState == 4) {

				if(xobj.status == 200) {

					callback(false, xobj.response||xobj.responseText);
				} else {

					callback(true, xobj.responseText);
				}
			}
	    };

	    xobj.send(this.resource.post ? queryString(this.resource.post) :  null);
	}
}

module.exports = fileLoader;