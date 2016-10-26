var mixin = require('./mixin.js');
var determineResourceType = require('./determineResourceType.js');
var javascriptLoader = require('./loaderJs.js');
var cssLoader = require('./loaderCss.js');
var fileLoader = require('./loaderRaw.js');
var imagesLoader = require('./loaderImage.js');
var jsonLoader = require('./loaderJson.js');
var events = require('./eventsMixin.js');
var dirname = require('./dirname.js');
var charge = require('./charge.js');

/*
Абстрактный скрипт
*/
var Resource = function(url, config) {
	
	config = mixin({
		root: this,
		exports: false,
		wait: false,
		sync: false,
		forcetype: false
	}, config||{});



	var rehash = url.split('#');

	this.root = config.root;
	this.forcetype = config.forcetype;
	this.sourceurl = url;
	this.url = rehash[0];
	this.hash = rehash[1]||'master';
	this.sync = config.sync || false;
	this.location = dirname(url);
	this.script = null;
	this.eventListners = {};
	this.isready = false;
	this.module = null;

	charge(this, events);

	if (config.exports!==false) {
		/*
		Модуль предопределен
		*/
		this.module = {
			exports: config.exports
		}
		/*
		wait : true означается ожидание действий извне
		Используются для асинхронной принудительной загрузки ресурса
		*/
		if (!config.wait) {	
			this.ready();
		}
	} else {
		if (vendor.modules.hasOwnProperty[url]) { // Resource already preloaded
			this.module = vendor.modules[url];
			this.ready();
		} else {
			this.determine();	
		}
	}
}

Resource.prototype = {
	constructor: Resource,
	/*
	Данная функция определяет как именно воспринимать ресурс
	*/
	determine: function() {

		var pure = this.url,
		rtype = determineResourceType(this.url, this.forcetype),
		resource = this,
		callback = function(module) {

			this.module = module;
			this.ready();
			
		};
		/*
		Перед проверкой типа и запуском встроенного обработчика необходимо произвеси
		проверку на участие правила rerouting. Это правило может перенаправлять обработик
		на кастомный (указанный в настройках). Это позволит файлы с особыми параметрами 
		обрабатывать не стандратным AMD методом, а специальным, тем не менее не разрывая
		цепочку загрузок.
		Кастомный метод-обработик должен содердать в переменной rerouting:[#]:handler.
		Он будет выполнен в контексте ресурса, что позволит внутри него управлять модулем.

		Для того, что бы продолжить цепь загрузок, ресурс должен получить флаг ready и модуль.

		this.module = new Module(url, dependencies, factory, this.resource)
		url - путь отправной точки ресурса
		dependencies - зависимости модуля
		factory - фабрика модуля
		ссылка на старий ресурс, т.е. на этот

		*/

		var ok = true;
		if ("object"===typeof Vendor.config.rerouting) {
			for (var i = 0;i<Vendor.config.rerouting.length;i++) {
				if (
					Vendor.config.rerouting[i].expr&&
					Vendor.config.rerouting[i].expr.test(pure)&&
					(this.forcetype===false||this.forcetype===Vendor.config.rerouting[i].type)
				) {
					;(function(rer) {


						if (rer.requires instanceof Array && rer.requires.length>0) {

							callback = function(module) {
								
								vendor(rer.requires, function() {

									rer.handler.apply(resource, [module].concat(Array.prototype.slice.apply(arguments)));
								});
							}
						}
						else {
							callback = function(module) {
								
								rer.handler.call(resource, module);
							}
						}

						if (rer.preventLoad) {
							callback(null); ok = false;
						}
						
					})(Vendor.config.rerouting[i]);
					
				}	
			}
		}

		if (!ok) return;
		
		//if (this.forcetype) console.log('YOOO', rtype);

		// Js file
		switch(rtype) {
			case 1: // javascript
				new javascriptLoader(this, callback);
			break;
			case 2: // css
				new cssLoader(this, callback);
			break;
			case 3: // bower
				throw 'Bower components not supported yet';
			break;
			case 4: // json
				new jsonLoader(this, callback);
			break;
			case 5: // image
				new imagesLoader(this, callback);
			break;
			case 0: // some file
				new fileLoader(this, callback);
			break;
			default:

				throw 'Unknown resource type. '+resource.url;
			break;
		}
	},
	/*
	Загружает скрипт
	*/
	
}

if ("object"!==typeof Resource.prototype.__proto__) Resource.prototype.__proto__ = Resource.prototype;

module.exports = Resource;