;(function() {
	var UglifyJS = require("uglify-js");
	var fs = require('fs');
	var result = UglifyJS.minify("dist/vendor.js");
	
	fs.writeFile('vendor.js', result.code, function(err) {
		if (err) {
			console.log('Cant write file');
		} else {
			console.log('Project ready to publicate');
		}
	});
})();
