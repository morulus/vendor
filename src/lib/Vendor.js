var domain_expr = require('./regExprDomain.js');
var resourceTypeMap = require('./constResourceTypes.js');
var domain = require('./domain.js');
var mixin = require('./mixin.js');
var Resource = require('./Resource.js');
var Module = require('./Module.js');
var normalize = require('./normalize.js');
var dirname = require('./dirname.js');

/*
Основная функция vendor
*/
var Vendor = function(resources, callback, options) {
	
	if ("function"!==typeof callback) {
		// CommonJs like request
		throw new Error('VendorJs do not supports CommonJs style for require() function. In AMD style the function require() must have callback function at second argument. Use Browserify or Webpack compiler to build AMD bundle.');
	} else {
		// Amd request
		Vendor.anonymModule(false, resources, callback, options||{});
	}
}

Vendor.Module = Module;

/*
Зарегистрированные модули
*/
Vendor.modules = {};

Vendor.addAlias = function(name, path) {
	Vendor.config.aliases[name] = path;
}
/*
Создает новый анонимный модуль
*/
Vendor.anonymModule = function(name, resources, callback, config) {

	
	/*
	У нас выходит так, что любая загрузка начинается с анонимного модуля,
	- а значит это подходящее место для подмены define. На сайте, на котором
	будет использоваться Vendor может стоят что угодно, в т.ч. и RequireJS.
	Если мы присвоим переменной define ссылку на функцию Vendor:define, то 
	сам RequireJS станет нерабочим. Но мы можем подменять Define лишь на время
	загрузки скрипта. Я назову этот ход borrowDefine.
	*/
	var caller = mixin({
		location: Vendor.config.baseUrl,
		module: {
			exports: callback
		}, /* Исходный путь */
		script: null,
		watch: false,
		sync: false,
		stack: vendor.config.makeStack ? (new Error("request").stack) : null
	}, config||{});
	
	caller.root = caller;


	return new Module(name||null, resources||null, Vendor.borrowDefine(callback||null), caller);
}
/*
Синхронная загрузка. На всегда загрузки приостанавливает работу сайта.
*/
Vendor.sync = function(resources, callback) {
	var caller = {
		location: Vendor.config.baseUrl,
		module: {
			exports: callback
		}, /* Исходный путь */
		script: null,
		watch: false,
		sync: true
	};
	
	caller.root = caller;


	return new Module(name||null, resources||null, Vendor.borrowDefine(callback||null), caller);
}

/*
Подмена функции window.define на время загрузки модуля.
Функция принимает в качестве аргумента коллбэк и возвращает этот же коллбэк, 
но в обертке возвращающий родной define на место.
Если "родного" define нету, функция просто возвращает usercall.
*/
Vendor.borrowDefine = function(usercall) {
	
	if (window.define!==Vendor.define) {

		Vendor.$define_=window.define;
		window.define=Vendor.define;

		return function() {
			
			if ("function"===typeof usercall) usercall.apply(this, arguments);
			if (!Vendor.isProcessed)
			if (window.define===Vendor.define) window.define=Vendor.$define_;
		}
	} else {
		return usercall
	}
}
/*
Массив статистики процессов загрузки
*/
Vendor.processed = {
	js: 0,
	css: 0,
	other: 0
};
/*
Объект, который содержит данные из только что вызванного define
*/
Vendor.last = null;
/*
Проверяет происходит ли в данный момент загрузка js файла
*/
Vendor.isProcessed = function() {
	return (this.processed['js']>0);
}

Vendor.resources = {};

Vendor.config = function(data) {
	/*
	Прежде чем симксовать конфигурацию, проверить некоторые параметры
	*/
	if ("object"===typeof data.modules) {
		for (var mod in data.modules) {
			if (data.modules.hasOwnProperty(mod)) {
				this.registerModule(mod, {
					exports: data.modules[mod]
				})
			}
		}
		delete data.modules;
	};

	mixin(Vendor.config, data);
}

Vendor.config.aliases = {};

Vendor.interactive = false; // Этот режим активен только для IE
Vendor.interactiveScripts = [];
Vendor.getInteractiveScript = function(data, infoonly) {
	for (var i=0;i<Vendor.interactiveScripts.length;i++) {
		
		if (Vendor.interactiveScripts[i]!==null && Vendor.interactiveScripts[i].node.readyState === 'interactive') {

			// Устаналиваем last, т.к. далее последует инициализация
			Vendor.last = data;
			// Интерактивный скрипт найден, разморашиваем инициализацию

			Vendor.interactiveScripts[i].clear();
			
			return true;
		}
	}
	return false;
}

Vendor.config({
	baseUrl: '/',
	timeout: 5000,
	publicName: 'vendor',
	visualDebugger: false, // Отображает все модули на сайте в виде таблиц
	defineAlias: 'define', 
	requireAlias: 'vendor',
	makeStack: false // Make stack error on each request (for debug)
});


Vendor.loaders = {};

/*
Эта функция принимает только абсолютный путь или он будет преобразован в абсолютный самым примитивным образом
*/
Vendor.get = function(src, config) {
	var resourceUID = (config.forcetype?config.forcetype+'!':'')+src;
	if ("object"!==typeof Vendor.resources[resourceUID]) {
		Vendor.resources[resourceUID] = new Resource(src, config);
	}
	return Vendor.resources[resourceUID];
}

/*
Регистриует новый готовый модуль
*/
Vendor.registerModule = function(name, exports) {
	Vendor.modules[name] = exports;
}

/*
Парсеры url - это набор процедур по преобразованию пользовательского url в абсолютный url.
*/
Vendor.urlParsers = [
	/*
	Простое совпадение начала пути с именем alias
	*/
	function(url, settings) {
		for (var a in settings.aliases) {
			if (settings.aliases.hasOwnProperty(a)) {
				if (a===url.substr(0, a.length)) {
					return settings.aliases[a]+url.substr(a.length);
				}
			}
		}
		
	    return url;
	    
	}
];

Vendor.addUrlParser = function(fn) {
	Vendor.urlParsers.unshift(fn);
}

/*
Выводит всю доступную информацию о файле. При наличии функции callback кроме
всего прочего произведет загрузку файла.
*/
Vendor.info = function(src, callback) {
	var url = this.absolutizer(src, {
		location:Vendor.config.baseUrl, 
		root: Vendor.config.baseUrl,
		aliases: Vendor.config.aliases
	});

	return {
		url: url,
		dirname: dirname(url),
		domain: domain(url)
	}
}

/*
Превращает любой путь в абсолютной на основе установок корневой локации и алиасов
*/
Vendor.absolutizer = function(url, settings) {
    for (var i=0;i<this.urlParsers.length;++i) {
        url = this.urlParsers[i](url, settings);
    }

    if (domain_expr.test(url)) {
        // Do nothing
    } else if (url.substring(0,2)==='./') {
        /* Локально-относительный путь */
        url = settings.location+url.substr(2);
    } else if (url.substring(0,1)==='/') {
        /* Путь от корня сайта */
        url = domain(settings.location)+url.substr(1);
    } else {
        /* Путь от baseUrl */
        url = settings.root+url;
    }

    /*
    Нормализация url
    */
    var url = normalize(url);
    /*
    Установка расширения, если оно отсутствует
    */
    if (!(url.lastIndexOf('/')<url.lastIndexOf('.'))) {
        url=url+'.js';
    }

    return url;
};

module.exports = Vendor;