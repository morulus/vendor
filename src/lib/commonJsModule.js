module.exports = Object.create(null, {
	"exports": {
		set: function(module) {
			Vendor.define(function() {
				return module;
			});
		}
	}
});