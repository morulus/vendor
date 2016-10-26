define(['wordBuilder', './firstUpper.js', './abra.js', './cada.js', './bra.js', './static.json', './stylizer'], function(wordBuilder, firstUpper, abra, cada, bra, staticData) {
	return function() {
		return firstUpper(wordBuilder(abra, cada, bra, staticData.exclamation));
	}
});