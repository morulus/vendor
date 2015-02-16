vendor.config({
	baseUrl: ''
});

	define('test_vendor_module', function() {
		return '123';
	});
	define('test_vendor_module2', ['test_vendor_module'], function() {
		return '456';
	});
	QUnit.test( "Test Vendor define", function( assert ) {
		stop();
		vendor('test_vendor_module', function(module) {
			assert.equal(module,123, "OK" );
			start();
		});
		
	});
	QUnit.test( "Test Vendor define with depends", function( assert ) {
		stop();
		vendor('test_vendor_module2', function(module) {
			assert.equal(module,456, "OK" );
			start();
		});
		
	});
	QUnit.test( "Test Vendor include file", function( assert ) {
		stop();
		vendor(['stuff/scripts/amd1'], function(amd1) {

			assert.equal(amd1,678, "OK" );
			start();
		});
	});
	QUnit.test( "Test Vendor include file with depeneds", function( assert ) {
		stop();
		// amd2 depends on amd3
		vendor(['stuff/scripts/amd2'], function(amd2) {
			assert.equal(amd2,3, "OK" );
			start();
		});
	});
	QUnit.test( "Test Vendor calling define synch without name", function( assert ) {
		stop();
		window.helloWorld = 0;
		// amd2 depends on amd3
		define(function() {
			window.helloWorld++;
		});
		setTimeout(function() {
			assert.equal(window.helloWorld,1, "OK" );
			start();
		}, 500);
	});
	QUnit.test( "Test Vendor calling define asynch without name", function( assert ) {
		stop();
		vendor(['stuff/scripts/amd4'], function(mod) {
			assert.equal(mod,333, "OK" );
			start();
		});
	});
	QUnit.test( "Get json file", function( assert ) {
		stop();
		vendor.getJson('stuff/json/test.json', function(data) {
			assert.equal(data.hello,'world', "OK" );
			start();
		});
	});
	QUnit.test( "Get json file with vendor", function( assert ) {
		stop();
		vendor('stuff/json/test.json', function(data) {
			assert.equal(data.hello,'world', "OK" );
			start();
		});
	});
	QUnit.test( "Test no factory only object", function( assert ) {
		stop();
		vendor('stuff/scripts/product.js', function(data) {
			assert.equal(data.just,'data', "OK" );
			start();
		});
	});
	QUnit.test( "Test no factory", function( assert ) {
		stop();
		vendor('stuff/scripts/nofactory.js', function(data) {

			assert.equal(data,null, "OK" );
			start();
		});
	});
