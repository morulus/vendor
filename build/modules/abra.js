define(['wordBuilder', './a.txt', './b.txt', './r.txt'], function(wordBuilder, a, b, r) {
	return wordBuilder(a, b, r, a);
}, {
	sync: true
});