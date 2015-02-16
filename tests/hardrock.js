vendor.config({
	baseUrl: ''
});

	
	QUnit.test( "Get bower component", function( assert ) {
		stop();
		vendor('bower//bootstrap', function(module) {
			assert.equal(typeof $,"function", "OK" );
			start();
		});
		
	});

	QUnit.test( "Get bower component by getting bower.json", function( assert ) {
		stop();
		vendor('bower_components/jquery/bower.json', function(module) {
			
			assert.equal(typeof module,"function", "OK" );
			start();
		});
		
	});

	QUnit.test( "Get relative module", function( assert ) {
		stop();
		vendor('stuff/scripts/amd5include.js', function(module) {
			console.log('module', module);
			assert.equal(module,"Im echo", "OK" );
			start();
		});
		
	});
