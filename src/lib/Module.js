var charge = require('./charge.js');
var Resource = require('./Resource.js');
var events = require('./eventsMixin.js');

	/*
	Модуль. Состоит из лчиного имени, списка зависимостей и скрипта владельца.
	Скрипт отличается от модуля тем, что скрипт - это файл Javascript, а модуль AMD сущность, которая помещается внутрь define.
	Модуль должен инициализироваться и иметь свойство ready не равным false;
	*/
	var regForceType = /^([a-z]*)!/i;
	var Module = function(name, dependencies, factory, caller) {
		var that = this;
		this.name = name;
		this.ready = false;
		this.exports = null;
		this.caller = caller;
		this.location = caller.location;
		this.factory = factory;
		this.eventListners = {};
		this.isready = false;
		this.watch = !!caller.watch;
		this.sync = caller.sync || false;

		/*
		Расширяем модуль событиями
		*/
		charge(this, events);
		/*
		Перечень компонентов необходимых для работы модуля. Он формируется на основе списка dependencies.
		*/
		this.resources = [];
		/*
		Приводим ресурсы к массиву
		*/
		if (dependencies===null) dependencies = [];
		if (!(dependencies instanceof Array)) dependencies = [dependencies];

		/*
		Формируем данные для сбора статистики
		*/
		this.total = dependencies.length; /* Общее количество ресурсов */
		this.left = this.total; /* Сколько осталось загрузить */

		/*
		Запускаем таймер, который будет осчитывать время до момента, когда будет выброшено исключение
		по слишком долгой загрузке скрипта. Время таймаута указывается в настройках.
		*/
		this.timeout = setTimeout(function() {
			if (this.left>0) {
				console.error('...', that, dependencies);
				throw 'Timeout for module';
			}
		}.bind(this), vendor.config.timeout);

		/*
		Приводим url зависимостей к абсолютному формату
		*/
		var loadings=0,ready=function() {
			loadings--;
			if (loadings===0) {

				that.load();
			}
		};
		loadings++;
		dependencies.forEach(function(src, index) {

			/*
			Вначале обеспечиваем поиск в предопределенных модулях
			*/
			var gotya = false;
			
			for (var moduleurl in vendor.modules) {
				if (vendor.modules.hasOwnProperty(moduleurl)) {
					if (src.substr(0, moduleurl.length)===moduleurl) {
						gotya = true;

						/*
						Получаем список опций
						*/
						var options = src.substr(moduleurl.length+1);
						/*
						Мы можем применить опции только если модуль обладает методом refactory
						*/
						if (options.length>0&&"function"===typeof vendor.modules[moduleurl].refactory) {
							options = options.split('|');	
							loadings++;
							that.resources[index] = new Resource(src, {
								root: that.caller.root,
								exports: true,
								wait: true, // Пусть ждет нас
								sync: that.caller.sync // Синхронно
							});
							//console.log('refactory', index);
							vendor.modules[moduleurl].refactory(options, function(content) {
								that.resources[this].module.exports = content;
								that.resources[this].ready();
								//console.log('set data to', index, moduleurl, options, content, this, Vendor.modules[moduleurl].exports);
								//console.log('this.resources', that.resources);
								ready();
							}.bind(index));

						} else {
							
							this.resources[index] = new Resource(src, {
								root: this.caller.root,
								exports: vendor.modules[moduleurl].exports,
								sync: that.caller.sync // Синхронно
							});
						}
					}
				}
			}
			if (!gotya) {
				/*
				Рассматриваем вариант принудительного типа
				*/
				if (regForceType.test(src)) {

					var forcetype = regForceType.exec(src)[1];
					src = src.substr(forcetype.length+1);
				} else {
					forcetype = false;
				}
				var url = this.determine(src);

				this.resources[index] = vendor.get(url, {
					root: this.caller.root,
					sync: that.caller.sync,
					forcetype: forcetype
				});
			}
			
		}.bind(this));
		ready();
		/*
		Создаем визуальный дебагинг
		*/

		if (vendor.config.visualDebugger) {
			document.querySelector('body').innerHTML = '';
			this.debugVisualElements = {};
			this.debugVisualElements.box = document.createElement('div');
			this.debugVisualElements.box.style.width = "30%";
			this.debugVisualElements.box.style.float = "left";
			this.debugVisualElements.box.style.boxSizing = "border-box";
			this.debugVisualElements.box.style.border = "1px gray solid";
			this.debugVisualElements.box.style.padding = "10px";
			this.debugVisualElements.box.style.margin = "1%";
			document.querySelector('body').appendChild(this.debugVisualElements.box);
			this.debugVisualElements.box.innerHTML = '<strong>'+this.name+'</strong>';

			this.debugVisualElements.dependsBox = document.createElement('ul');
			this.debugVisualElements.box.appendChild(this.debugVisualElements.dependsBox);
			this.debugVisualElements.depends = {};

			this.resources.forEach(function(res, index) {
				this.debugVisualElements.depends[res.url] = document.createElement('li');
				this.debugVisualElements.depends[res.url].innerHTML = res.url;
				this.debugVisualElements.dependsBox.appendChild(this.debugVisualElements.depends[res.url]);
			}.bind(this));
		}
		
		
	}

	Module.prototype = {
		constructor: Module,
		/*
		Возаращет абсолютный url для релативного пути от текущей директории
		*/
		getUrl: function(url) {
			return this.determine(url);
		},
		/*
		Приведение url к абсолютному виду. На данном этапе происходит фильтрация url по относительности, алиасам и пр.

		* Если путь начинается на ./ он рассматривает как относительный от файла из которого он вызван
		* Если вначале пути указан слеш /, то путь расчитывается от корня сайта
		* Если путь начинается с имени, без слешей, он расчитывается относительно пути, который определен как baseurl
		* Если путь начинается по маске [a-z]// значит использован алиас. После указания алиаса обязательно должен быть указан двойной слеш

		*/

		determine: function(url) {
			
			return vendor.absolutizer(url, {
				location:this.caller.location, 
				root: this.caller.root.location,
				aliases: vendor.config.aliases
			});
			
		},
		/*
		Обеспечиваем запуск модуля по готовности его ресурсов
		*/
		load: function() {
			var module = this;
			if (this.resources.length===0)
			this.perform();
			else {
				this.resources.forEach(function(resource, i) {
					var that = this;

					resource.ready(function() {
						/*
						Отладочная запись
						*/
						if (vendor.config.visualDebugger) { that.debugVisualElements.depends[this.url].style.color = 'green'; }
						that.left--;
						
						if (that.left<=0) {
							
							that.perform();

						}
					});
				}.bind(this));
			}
		},
		/*
		Выполнение модуля
		*/
		perform: function() {
			var module = this;
			var args = [];
			this.resources.forEach(function(resource) {
				/*
				При загрузке не javascript модуля, а, скажем, css файла переменная модуль не формируется. Поэтому необходимо проводить
				проверку на условие его наличия перед присвоением. Не Javascript модули присваиваются как null. Это относится к CSS и 
				другим возможным форматам не возвращающим данные.
				*/
				args.push(resource.module&&resource.module.exports||null);
				
			}.bind(this));
			if ("function"===typeof this.factory) {
				
					// /console.log('Init factory', module.location,  module.factory.toString());
					module.exports = module.factory.apply(module, args);
				
				
			} else {
				this.exports = this.factory;
			}

			

			

				this.ready();

				// Добавляем в список глобальных модулей, если присутствует четкое имя
				if (this.name!==null) {
					
					Vendor.registerModule(this.name, this);
				}
			
		}
	};

	if ("object"!==typeof Module.prototype.__proto__) Module.prototype.__proto__ = Module.prototype;

	module.exports = Module;