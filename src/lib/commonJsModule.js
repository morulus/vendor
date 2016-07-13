module.exports = Object.create(null, {
	"exports": {
		set: function(module) {
			
			define(function() {
				return module;
			});
		}
	}
});