var Vendor = require('./Vendor.js');
var $inject = require('./inject.js');


	var Define = Vendor.define = function(g, e, b) {
		
		// Если передана только фабрика
		if (arguments.length==1) {
			b=g; g=null; e=null;
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

		// Формируем humanfrendly переменные
		var name = g || null;
		var depends = e || null;
		var factory = b || null;

		/*
		Преобразуем объект в factory
		*/
		if (typeof factory != "function")
	        factory = function() {
	            return this;
	        }.bind(factory)

	    /*
	    Внедряем injectors в module
	    #injector
	    */
	    factory = $inject.call({
	        require: Vendor,
	        exports: {},
	        module: {}
	    }, factory);
	    /* ^#injector */

		/*
		Если процесс работает в режиме interactive мы игнорируем систему last и находим интерактивный скрипт
		*/
		if (Vendor.interactive) {
			Vendor.getInteractiveScript({
				name: name,
				depends: depends,
				factory: factory
			});
		}
		/*
		Отправляем запрос в вендер на предмет того, есть ли сейчас активные загружаемые файлы.
		Если их нет, то мы воспринимам данный код как произвольный и создаем новый анонимный модуль.
		*/
		else if (Vendor.last===null && Vendor.isProcessed()) {
			if (name!==null) {
				/*
				Похоже что внутри загружаемого модуля производится define еще одного модуля,
				но возможно и того же. Поэтому в случае если имя указано, мы производим запись
				в модуль, но продолжаем слушать last
				*/
				Vendor.anonymModule(name, depends, factory);
			}
			Vendor.last = {
				name: name,
				depends: depends,
				factory: factory
			}
		} else {
			Vendor.anonymModule(name, depends, factory);
		}	
	}

	Define.amd = {};

	module.exports = Define;