var getXmlHttp = require('./getXmlHttp.js');
var jsonLoader = function(resource, callback) {
	this.resource = resource;
	this.callback = callback;
	var that = this;
	this.load(function(json) {

		that.callback.call(that.resource, {
			exports: json
		});
	});
}

jsonLoader.prototype = {
	constructor: jsonLoader,
	load: function(callback) {

		var xobj = getXmlHttp(),self=this;
	    if (xobj.overrideMimeType) xobj.overrideMimeType("application/json");

		xobj.onreadystatechange = function (e) {
			
	          if (xobj.readyState === 4 && xobj.status == "200") {
	            
	            try {
	            	var actual_JSON = JSON.parse(xobj.responseText);
	            } catch(e) {
	            	throw 'Corrupted JSON file: '+self.resource.url;
	            }

	            callback(actual_JSON);
	          }
	    };

	    xobj.open('GET', this.resource.url, !this.resource.sync);
	       
		xobj.send(null);
	}
}

module.exports = jsonLoader;