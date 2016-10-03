var isInteractiveMode = require('./isInteractiveMode.js');

var javascriptLoader = function(resource, callback) {
	this.resource = resource;
	this.callback = callback;
	this.script = null;
	
	this.loadScript();
}

javascriptLoader.prototype = {
	constructor: javascriptLoader,
	loadScript: function() {

		var that = this;
		/* Создаем элемент SCRIPT без присвоения к документу, это вынужденное действие для работы с IE8 */
        this.script = document.createElement("SCRIPT");
       
        this.script.setAttribute("type", "text/javascript");
        this.script.setAttribute("async", true);

        /*
		Проверка на interactive необходимо для правильного связывания define со скриптом.
		В IE срабатывание скрипта может происходить не сразу после загрузки скрипта. 
		Поэтому данный скрипт должен быть заморожен до момета вызова define.
        */
        if (isInteractiveMode(this.script)) {
        	/*
			Активируем режим интерактив
        	*/
        	vendor.interactive = true;
        	var id = vendor.interactiveScripts.length;
        	vendor.interactiveScripts.push({
        		clear: function() {
        			/*
					При очистке скрипта ожидающего выполнения, мы вызывает тест на зевершение загрузки указывая,что он в режиме interactive
        			*/
        			vendor.interactiveScripts[id] = null;
        			that.readytest(true);
        		},
        		node: this.script   		
        	})
        	this.script.onload = this.script.onreadystatechange = function() {
	 			if (this.script.readyState==='loaded'||this.script.readyState==='complete') {
	 				this.readytest();
	 			}
	 		}.bind(this)
		} else {
			this.script.onload = this.script.onreadystatechange = function() {
				this.readytest();
			}.bind(this);
		}
		/*
		Сообщаем движку, что в данный момент происходит загрузка javascript ресурса
		*/
		vendor.processed['js']++;


        this.script.src = this.resource.url;

        (function() {
          return document.documentElement || document.getElementsByTagName("HEAD")[0];
        })().appendChild(this.script);
	},
	readytest: function(interactive) {

		if (!this.script.readyState || this.script.readyState === "loaded" || this.script.readyState === "complete" || interactive) {
			/*
			Сообщаем движку, что в данный загрузка одного javascript ресурса завершена
			*/
			vendor.processed['js']--;
			/*
			Чистим память
			*/
			this.script.onload = this.script.onreadystatechange = null;
			/* Удаляем скрипт */
          	try {
              	(function() {
                  return document.documentElement || document.getElementsByTagName("HEAD")[0];
                })().removeChild(this.script);
            } catch(e) {
            	if (typeof console=="object" && "function"==typeof console.log)
            	if (_w.vendor.debugMode) console.log('vendor.js: script node is already removed by another script', j);
            }
            /*
			После завершения загрузки скрипта мы должны обеспечить обратное связывание с define
            */	    
           

            this.throughDefine(function() {
            	this.callback.call(this.resource, this.module);
            }.bind(this));
		}
	},
	/*
	Функция проверяет был ли вызван define внутри файла
	*/
	throughDefine: function(callback) {
		
		if ("object"===typeof vendor.last&&vendor.last!==null) {
			
			this.module = new vendor.Module(vendor.last.name||this.resource.url, vendor.last.depends, vendor.last.factory, this.resource);
			vendor.last = null;
		} else {
			this.module = new vendor.Module(this.resource.url, [], null, this.resource);
		}

		this.module.ready(function() {
			callback()
		});
	}
}

module.exports = javascriptLoader;