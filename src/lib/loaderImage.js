var imagesLoader = function(resource, callback) {
	this.resource = resource;
	this.callback = callback;
}

imagesLoader.prototype = {
	constructor: imagesLoader,
	load: function() {
		var img = new Image(), that = this;

		img.onload = img.onerror = function() {
			that.callback.call(that.resource, img);
		}
		
		img.src = this.resource.src;
	}
}

module.exports = imagesLoader;
