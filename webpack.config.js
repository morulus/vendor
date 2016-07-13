var webpack = require('webpack');
var fs = require('fs');
module.exports = {
	context: __dirname,
	entry: './src/vendor.js',
	output: {
		path: './dist',
		filename: 'vendor.js',
		libraryName: 'Vendor',
		libraryTarget: 'amd'
	},
	plugins: [
		new webpack.BannerPlugin(fs.readFileSync('LICENSE.MD', 'utf-8'), {
			raw: false
		})
	]
}