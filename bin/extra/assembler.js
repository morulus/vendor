var cwd = process.cwd().split('\\').join('/'),
fs = require('fs'),
path = require('path'),
linefy = require('./linefy-tree.js'),
scopesregex = /({[^{}}]*[\n\r]*})/g,
funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
chalk = require('chalk'),
unixify = function(p) {
	return p.replace('\\', '/');
},
searchIn = function(stack, needle) {
	for (var prop in stack) {
		if (stack.hasOwnProperty(prop)&&stack[prop]==needle) return true; 
	}
	return false;
},
/*
Converts relative path to relative by process current folder
*/
relative = function(p, root) {
	root = root || cwd;
	p = p.replace('\\', '/');
	root = root.substr(-1)==='/'?root:root+'/';
	if (p.substr(0,2)==='./') {
		p = p.substr(2);
	} else if (p.substr(0,1)==='/') {
		p = p.substr(1);
	}
	return root+p;
},
/*
Возвращает содержимое кода внутри скобок { } (без самих скобок)
contentonly возвращает только контент
*/
getScopeContent = function(code, contentonly) {
	var 
	prefixc = code.indexOf('{'),sufixc = code.lastIndexOf('}'),
	prefix=code.substring(0,prefixc),sufix=code.substring(sufixc+1,code.length);
	if (contentonly) {

		return code.substring(prefixc+1, sufixc);
	}
	return [prefix, code.substring(prefixc+1, sufixc), sufix];
},
/* Функция принимает в качестве текста код функции. Возвращает аргументы функции. */
getFunctionArguments = function(code) {
	if (funcarguments.test(code)) {
		var match = funcarguments.exec(code);
		return match[1].replace(' ','').split(',');
	}
	return [];
},
/* Removes all scopes { } except root */
killscopes = function(text) {
	var p = getScopeContent(text),
	prefix=p[0],sufix=[2],text=p[1];
	while(/({[^{}}]*[\n\r]*})/g.test(text)) {
		text = text.replace(/({[^{}}]*[\n\r]*})/g,'');
	}
	return prefix+text+sufix;
},
/* Test for empty function */
testemptyfunction = function(code) {
	return (/^[\n\r\s]*$/g.test(getScopeContent(code)[1]))
},
/*
Function requires code as text. Returns define function dependecies and function text
*/
getDefineFunctionData = function(code) {
	var defineData = {};
	var define = function(g, e, b) {
		var returnable=false,empty=false,code='';
		// Если передана только фабрика
		if (arguments.length===1) {
			if (typeof g === 'function') {
				b=g; g=null; e=null;
			} else if (g instanceof Array) {
				
				b=null; e=g; g=null; 
			} else {
				b=null; g=null; e=null;
			}
		}

		// Если передано два аргумента
		else if (arguments.length==2) {
			// Переданы зависимости и фабрика
			("object"==typeof g) && (b=e,e=g,g=null);
			// Передано имя и фабрика
			("string"==typeof g) && (b=e,e=0);
		}
		
		// Переданы все аргументы
		else {
			"string" != typeof g && (b = e, e = g, g = null);
			!(e instanceof Array) && (b = e, e = 0);
		}

		if (b!==null&&b!==undefined) {
			code=b.toString();
			// test for returne aviable
			var nsb = killscopes(code);
			if (/return /gi.test(nsb)) {
				returnable=!0;
			}

			// test for empty
			empty = testemptyfunction(code);
		} else {
			empty = !0;
		}

		/*
		Получаем список аргументов в теле функции
		*/


		defineData = {
			requires: e,
			arguments: getFunctionArguments(code),
			code: code,
			returnable: returnable,
			empty: empty
		}
	}

	try {
		eval(code);
		return defineData;
	} catch(e) {
		console.log('File has no root define declaration', code);
	}
}
/*
Assembler constructor
*/
assembler = function() {
	this.map = {};
	this.modules = {};
	this.aliases = {};
	this.report = {
		totaldefines: 0,
		uniqueModules: []
	}
	this.config = {
		out: '/',
		minOut: false,
		epistle: 'HAVE A NICE MAKING MONEY, GENTELMENS'
	};
};

assembler.prototype = {
	constructor: assembler
};

assembler.prototype.config = function() {};

/*
Write file with stringified content
*/
assembler.prototype.build = function(file) {
	var timestamp = new Date(),that = this,complete=function() {
		var executionTime = (new Date())-timestamp;	
		console.log(chalk.green.bold('Build complete')+chalk.cyan(' in ')+chalk.cyan.bold(executionTime)+chalk.cyan('ms.')+"\n");
		console.log(chalk.bgYellow.black(' $ ') + chalk.bgYellow.black(that.config.epistle)+chalk.bgYellow.black(' $ ')+"\n");
	};
	console.log(chalk.cyan.bold('VENDOR assembler will start build process...'.toUpperCase())+"\n");
	

	console.log(chalk.cyan('Build settings:'));
	console.log(chalk.cyan('Source: ')+chalk.cyan.bold(file));
	console.log(chalk.cyan('Out: ')+chalk.cyan.bold(this.config.out));
	console.log(chalk.cyan('Minified Out: ')+chalk.cyan.bold(this.config.minOut ? this.config.minOut : 'none'));
	console.log("");
	var contents = this.stringify(file),fn=relative(this.config.out),realaliases=[];
	console.log(chalk.cyan('Сurrent assembly includes '+chalk.bold(that.report.uniqueModules.length)+' files:'));
	for (var i=0;i<that.report.uniqueModules.length;i++) {
		console.log(chalk.cyan('+ ')+chalk.cyan.bold(that.report.uniqueModules[i]));
	}

	for (var i in this.aliases) {
		if (this.aliases.hasOwnProperty(i)&&this.aliases[i]!==null&&this.aliases[i]!=='null') {
			realaliases.push(this.aliases[i]);
		}
	}
	console.log("\n"+chalk.cyan('Initialed '+chalk.cyan.bold(realaliases.length)+' variables:'));
	console.log(chalk.cyan.bold(realaliases.join(' '))+"\n");

	fs.writeFile(fn, contents, function(err) {
		if (err) {
			console.log(chalk.red('Error while file write'), err);
		} else {
			var stats = fs.statSync(fn);
			console.log(chalk.green.bold('OK ')+chalk.cyan('Successful build to')+chalk.cyan.bold(that.config.out)+chalk.cyan(' [')+chalk.cyan.bold((stats["size"]/1024).toFixed(2).toString())+chalk.cyan('kb]'));
			// Minify
			if (that.config.minOut) {

				var UglifyJS = require("uglify-js"),
				minify = UglifyJS.minify(fn);
				fs.writeFile(relative(that.config.minOut), minify.code, function(err) {
					if (err) {
						console.log('Cant write file'.cyan);
					} else {
						var stats = fs.statSync(relative(that.config.minOut));
						console.log(chalk.green.bold('OK ')+chalk.cyan('Successful ')+chalk.bgCyan.black(' compressed ')+chalk.cyan(' build to ')+chalk.cyan.bold(that.config.minOut)+chalk.cyan(' [')+chalk.cyan.bold((stats["size"]/1024).toFixed(2).toString())+chalk.cyan('kb]'));
						complete();
					}
				});
			} else {
				complete();
			}
		}
	});

	
}

/*
Excludes define() from files. Required components are included in final script as variables. 
*/
assembler.prototype.stringify = function(file) {
	this.analyze(file);

	var linefyTree = linefy(this.map, true),
	source=[];
	var that = this;

	linefyTree.forEach(function(files,i) {
		
		var scope = [];

		files.forEach(function(file) {
			that.report.uniqueModules.push(unixify(file));
			var varname = path.basename(file).split('.'),vardeps=[],mop=2,noclosure=true;
			varname.pop();varname=varname.join('');
			while (searchIn(that.aliases, varname)) {
				varname=varname+''+mop; ++mop;
			}
			/*
			Необходимо передать в функцию запрашиваемые переменные
			*/
			if (that.map[file] instanceof Array) {
				that.map[file].forEach(function(d) {
					if (that.modules[d].returnable)
					vardeps.push(that.aliases[d]);
					else vardeps.push('null');
				});
			}
			/*
			Проверяем имена переменных, запрошенных в функции. Если они совпадают с именами переменных, передаваемых в функцию, 
			то создание контекста нам не требуется. Это поможет сократить объект кода за счет удаления лишних анонимных функций.
			*/
			try {
				for (var a = 0;a<that.modules[file].arguments.length;++a) {
					if (vardeps[a]!=='null'&&vardeps[a]!=that.modules[file].arguments[a]) { noclosure=false; break; }
				}
			} catch(e) {
				console.log(chalk.red('Error in file:'), file);
			}

			/*
			Урезаем количество передаваймых в функцию знаечний до количества аргумнетов функции
			*/
			if (vardeps.length>that.modules[file].arguments.length) vardeps = vardeps.slice(0,that.modules[file].arguments.length);

			if (!that.modules[file].empty) {
				that.aliases[file] = varname;
				if (i===linefyTree.length-1 || !that.modules[file].returnable) {
					if (noclosure) {
						
						scope.push(getScopeContent(that.modules[file].code, true));
					} else {
						scope.push(';('+that.modules[file].code+')('+vardeps.join(',')+');');
					}
				}
				else
				scope.push('var '+varname+' = ('+that.modules[file].code+')('+vardeps.join(',')+');');
			} else {
				that.aliases[file] = 'null';
			}
		});

		source.push(scope.join("\n\n"));
	});

	return source.join("\n\n");

};
/*
Parses the Javascript file. Looks for define() function and add depenendecies and code to this.module and this.map.
*/
assembler.prototype.analyze = function(file) {
	var content = fs.readFileSync(relative(file), 'utf-8'),
	def = getDefineFunctionData(content);

	if ("object"===typeof def) {
		this.modules[file] = def;
		/*
		Get each of required file, if it is not initialed yet
		*/
		for (var prop in def.requires) {
			if (def.requires.hasOwnProperty(prop)) {
				def.requires[prop] = path.normalize(relative(def.requires[prop], path.dirname(file)));
			}
		}
		this.map[file] = def.requires;
		/* Requires each of required files */
		for (var prop in def.requires) {
			if (def.requires.hasOwnProperty(prop)) {
				if ("undefined"===typeof this.modules[def.requires[prop]])
				this.analyze(def.requires[prop]);
			}
		}
	}
}

module.exports = assembler;