define(['wordBuilder', './a.txt', './c.txt', './d.txt'], function(wordBuilder, a, c, d) {
	return wordBuilder(c, a, d, a);
});