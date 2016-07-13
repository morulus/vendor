module.exports = function(url) {
	url=url.split('\\').join('/').split('?')[0];
	return url.substring(0, url.lastIndexOf('/')+1);
};