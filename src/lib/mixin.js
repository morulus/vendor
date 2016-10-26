var mixinup = function(a,b) { 
	for(var i in b) { 
		
		if (b.hasOwnProperty(i)) { 
          
			a[i]=b[i]; 
		} 
	} 
	return a; 
} 

module.exports = function(a) { 
	var i=1; 
	for (;i<arguments.length;i++) { 
		if ("object"===typeof arguments[i]) {
			mixinup(a,arguments[i]); 
		} 
	} 
	return a;
}