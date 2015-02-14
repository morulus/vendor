(function(_w) {
	/* 
	@ Bower 1.0.
	@ author: Vladimir Morulus
	@ license: MIT 
	*/

	// Несколько приватных данных
	var is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
	var is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
	var is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
	var is_safari = navigator.userAgent.indexOf("Safari") > -1;
	var is_Opera = navigator.userAgent.indexOf("Presto") > -1;
	if ((is_chrome)&&(is_safari)) {is_safari=false;}

	// Fix for IE
	if ("undefined"==typeof Array.prototype.indexOf)
	Array.prototype.indexOf = function(obj, start) {
	     for (var i = (start || 0), j = this.length; i < j; i++) {
	         if (this[i] === obj) { return i; }
	     }
	     return -1;
	}
	if (!_w.location.origin) {
	  _w.location.origin = _w.location.protocol + "//" + _w.location.hostname + (_w.location.port ? ':' + _w.location.port: '');
	}
	
	_w.vendor = function(userresources, callback) {
		var progressor = new (function() {
			this.userresources = userresources;
			this.callback = callback;
			this.loadings = 0;
			this.queue = [];
			this.execute = function() {

				if ("string"===typeof this.userresources) this.userresources = [userresources];
				this.max=this.loadings=this.userresources.length;
				for (var i = 0;i<this.userresources.length;i++) {
					this.determine(this.userresources[i]);
				}
			};
			this.loaded = function(module) {
				this.loadings--;
				this.progress = 1-(this.loadings/this.max);
				if (this.eachCallback) this.eachCallback.call(this, module);
				if (this.loadings===0) {
					if ("function"===typeof this.callback) this.callback.apply(window,this.queue);
				}
			}
			this.determine = function(path) {

				var that = this;
				this.queue.push(null);

				var q = this.queue.length-1;

				var pure = (function(path) { var qp = path.lastIndexOf('?'); if (qp<0) qp = path.length; return path.substring(0,qp); })(path);
				if (pure.substr(pure.length-3, 3).toLowerCase()=='.js') {
					
					vendor.require(path, function(module) {
						that.queue[q] = module;
						that.loaded(module);
					});
					return;
				}
				// Css file
				if (pure.substr(pure.length-4, 4).toLowerCase()=='.css') {
					
					vendor.requirecss(path, function() {
						that.queue[q] = null;
						that.loaded(null);
					});
					return;
				}
				// Bower
				if ('bower/'===pure.substr(0,6)) {
					
					vendor.bower(path.substring(6), function(module) {
						that.queue[q] = module;
						that.loaded(module);
					});
					return;
				}
				// Images
				if (vendor.constants.imagesRegExpr.test(path)) {
					
					vendor.images(path, function(module) {
						that.queue[q] = module;
						that.loaded(module);
					});
					return;
				}
					
					throw "vendor.js: Unknown resource type "+pure;
				that.loaded();
			};
			this.each = function(callback) {
				this.eachCallback = callback;
			};
			this.execute();
		})(userresources, callback);

		return progressor;
	};
	_w.vendor.constants = {
		imagesRegExpr: /\.[jpg|jpeg|gif|png|bmp]*$/i
	};
	_w.vendor.state = {
		interactive: false // Определяет иной способ обработки анонимный define функций через статус interactive
	}
	_w.vendor.isInteractiveMode = function(j) {
		return (j.attachEvent && !(j.attachEvent.toString && j.attachEvent.toString().indexOf('[native code') < 0) &&
	                   			 !(typeof opera !== 'undefined' && opera.toString() === '[object Opera]'));
	}
	_w.vendor.getInteractiveScript = function(execute) {
			for (var i=0;i<vendor._freezed.length;i++) {
				
				if (vendor._freezed[i]!==null && vendor._freezed[i].node.readyState === 'interactive') {

					// Устаналиваем last, т.к. далее последует инициализация
					_w.vendor.define._last = execute;
					// Интерактивный скрипт найден, разморашиваем инициализацию
					vendor._freezed[i].unfreeze();
				}
			}
	}
	_w.vendor.require = function(c, b, phantom) {

		var phantom = phantom || false;
		var a = new function(e, d) {
			
			if (typeof e == "string") {
				e = [e]
			}
			this.loads = e.length;
			this.src = e;
			this.stop = false;
			this.callback = d || false;
			this.fabrics = [];
			this.init = function() {
				
				var h = this;
				/* Перебираем каждый адрес */
				for (var i = 0; i < this.src.length; i++) {

					var g = this.src[i];

					/* Преопределяем fabric для данного ресурс. Это нужно для того, что бы ... */
					this.fabrics.push(g);
					var s = this.src[i];

					/* Устанавливаем реальный адрес исходя из предустановок _config.paths */
					var f = (typeof _w.vendor._config.paths[this.src[i]] == "string") ? _w.vendor._config.paths[this.src[i]] : this.src[i];
					/* Добавляем расширение .js если оно отсутствует */
					var k = f.substr(f.length - 3, 3) != ".js" ? f + ".js" : f;

					/* Если данный адрес уже был загружен, то пропускаем этам загрузки и сразу сообщаем, что компонент загружен */
					try {

						if (_w.vendor._defined.indexOf(f) > -1) {

							h.loaded(k);
							continue;
						} else {

						}
					} catch(e) {
						/* IE 8 */
						
					}

					/* --- Continue: элемент был найден в списках загруженных элементов */
					/* ---------------------------------------------------------------- */
					

					/* Проверяем надичие элемента в списке vendor.define.modules. Ведь запрашиваемвый элемент мог быть просто предопределен через vendor.define. */
					if ('undefined' != typeof _w.vendor.define._modules[g]) {
						h.loaded(k);
						continue;
					};
					
					/* --- Continue: элемент был найден в списках vendor.define. 				*/
					/* ---------------------------------------------------------------- */
					

					/* Поскольку один и тот же ресурс может быть запрошен в разных ветках, мы должны его проверить на присутствие в специальных списках vendor._detained, куда мы определяем элементы, которые на данный момент уже проходят загрузку */
					
					if (vendor._detained.indexOf(f)>-1) {
						
						/* Если ресурс уже подгружается в параллельных ветках, то мы начинаем слушать завершения его подгрузки*/
						vendor._onRedetain(f, function() {
							/* Если ресурс не попал в define списки, т.е. он не поддерживает архитектуру AMD, тогда мы его просто закидываем в список загруженных модулей.
							Здесь g - это пользовательское имя ресурса, f - это полное имя ресурса, в том виде в каком он присутствует в _config.paths, k  - это реальный путь до файла */
							if ("undefined" == typeof _w.vendor.define._modules[g])
							if (_w.vendor._defined.indexOf(f)<0) _w.vendor._defined.push(f);
							/* Учитывая, что загрузка свершилась, мы вызываем loaded() */	
							h.loaded(k, g)
						});
						continue;
					} else {

						/* Если ресурс запрошен впервые, мы его определяем в список detained, что бы параллельные ветки загрузок могли знать, что ресурс уже загружается */
						vendor._detained.push(f); 

						/* Согласно вопросу совместимости с синхронными загрузками, нам нужно произвести тест на подгрузку данного ресурса нативно. Нативная подгрузка лишает нас возможности использовать AMD интерфейс, но дает возможность работы с сайтами, на которых нативная подгрузка уже не отъемлена. 
						Мы тестируем страницу на присутствие тэга SCRIPT с подгружаемым адресом.
						Функция test требует аргумента - реальный путь до файла.
						Поскольку все асинхронные загрузки так или иначе попадают в detained, и так или иначе, не доходят до данной точки кода, если уже были асиенхронно подключены, конфликт с сгененрированными тэгами исключен. */
						var test = (function(scriptp) {
			                var exi = document.getElementsByTagName("SCRIPT");
			                for (var j in exi) {
			                  // Search for src
			                  if (typeof exi[j].attributes == "object") {
			                    var srci = false;
			                    for (var z=0;z<exi[j].attributes.length;z++) {
			                      if (exi[j].attributes[z].name.toLowerCase()=='src') {
			                        
			                        srci = z;
			                        break;
			                      };
			                    }
			                  }
			          
			                  if (srci!==false && typeof exi[j].attributes == "object" && typeof exi[j].attributes[srci] == "object" && exi[j].attributes[srci] != null && exi[j].attributes[srci].value == scriptp) {
			                    return exi[j];
			                  }
			                }
			                return false;
			            })(k);
			            /* Передав в функцию k (полный адрес ресурса), мы получили значение его присутствие в нативных тэгах. */
			            if (test!==false) {
			             	/* Если test !=== false, значит он содержит ссылку на node нативного скрипта. 
			             	asynch нам нужен, что бы позже определить как мы будет проверять загружен ли скрипт.
			             	*/
	            			var asynch = false;
	            			/* В j мы помещаем ссылку на элемент SCRIPT.*/
	          				var j = test;
			            } else {
			              	/* Если нативного скрипта не существует, то мы можем создать его на лету. */
			                var asynch = true;
			                /* Создаем элемент SCRIPT без присвоения к документу, это вынужденное действие для работы с IE8 */
			                var j = document.createElement("SCRIPT");
			               
			                j.setAttribute("type", "text/javascript");
			                j.setAttribute("async", true);
			             };
			              	/* (!) Возможно depricated функция */
							var define = function(f) {
								
							};

							/* Итак мы дошли до данного кода, так как элемент загружается впервые или он загружен (загружается) нативно. Это значит, что нам нужно определить загружен ли он. */
							(function(s, j) {
				              var s = s;

				              /* Определяем функцию, которая так или иначе будет выполнена при загрузке ресурса */
				              var lse = function(interactive) {
				              	
				              	if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete" || interactive) {

					              	/* Если внутри ресурса была определена функция define с зависимостями, значит помимо загрузки основного скрипта нам нужно ждать так же загрузки саб-ресурсов.
					              	Т.е. если происходит внутренний include, мы должны ждать его завершения. 
					              	Поэтому, нужно произвести тестирование */

					              	/* Создаем функцию, которая определяет 100% загрузку компонента */
					              	var ok = function(defi) {
					              		
					              		 /* Если ресурс не определен в vendor.define._modules, нам нужно проследить, были вызвана функция vendor.define. 
						                Фабрики фиксируются в переменной _last модуля vendor.define. Здесь мы выполняем данную функцию и получаем переменную, которую вернула fabric компонента. 
						                В типичном случае присвоение знаения vendor.define._modules происходит в самой функции define, однако программист может вызвать define без указания имени компонента, тогда фабрика будет присваиваться последнему вызванному ресурсу. */             
						                if ("undefined" == typeof _w.vendor.define._modules[s]) {
						                	
							                _w.vendor.define._modules[s] = {
							                  fabric: defi || null
							                };  
						            	};
					              		/* Если ресурс присутствует в списках _detained, мы должна сообщить глобально о том, что он загружен */
					                	if (vendor._detained.indexOf(f)>-1) vendor.releaseDetained(f);
					                	 /* Определяем ресурс как загруженный, более для него не будет производиться никаких действий при следующем вызове. */
						                if (_w.vendor._defined.indexOf(f)<0) 
						                {				                  
						                  	_w.vendor._defined.push(f);
						                };
						                /* Сообщаем ветке о том, что ресурс был загружен */
						                h.loaded(k, g)
					              	};

					              	/* проверяем last на наличие функции */
					              	if ("function"===typeof _w.vendor.define._last) {
					              		
					              		/* Если last - функция, мы должны выполнить её передав callback код завершения загрузки данного модуля */

					              		_w.vendor.define._last(ok);

					              		/* 
					              		! _w.vendor.define._last = false; 
					              		Данная процедура была удалена из-за совместимости с IE9. Необходимо провести тщательные тесты касательно
					              		данной функции.
					              		*/

					              	} else {
					              		ok();
					              	};
					              	/* Чистим память */
					              	j.onload = j.onreadystatechange = null;
					              	/* Удаляем скрипт */
					              	try {
						              	(function() {
						                  return document.documentElement || document.getElementsByTagName("HEAD")[0];
						                })().removeChild(j);
						            } catch(e) {
						            	if (typeof console=="object" && "function"==typeof console.log)
						            	if (_w.vendor.debugMode) console.log('vendor.js: script node is already removed by another script', j);
						            }
				               	 };
				              };


				              /* Определяем метод распознавания загрузки */				        
				              if (asynch) {
				              	/* Загрузка созданного на лету элемента SCRIPT 
								IE ведет себя очень плохо, он может выполнять скрипт не сразу после загрузки, что вызывает проблемы с анонимным define.
								Решение пришлось подсмотреть в requirejs. Использовать статус `interactive` readyStage.
				              	*/

				              	if (vendor.isInteractiveMode(j)) {

				        				vendor.state.interactive = true;
	                   			 		/* Если модуль работает в режиме статуса интерактив, мы должны отложить его инициализацию до момента когда define из модуля будет вызван */
	                   			 		

	           			 				/* Нам подходит только loaded или complete */
	           			 				
	               			 			var id = vendor._freezed.length;

	               			 			vendor._freezed.push({
				              				unfreeze: function() {
				              					
				              					vendor._freezed[id] = null; // Обнуляем сами себя
				              					lse(true); // Начинаем инициализацию
				              				},
				              				node: j
				              			});

				              			/*
											Если в модуле не присутствует define, что vendor может предполагать, мы должны призвести инициализацию принудительно
				              			*/
				              			setTimeout(function() {

				              			},50);
				              			// Подчищаем хвосты
				              			
	                   			 		
	                   			 		j.onload = j.onreadystatechange = function() {
	                   			 			if (j.readyState==='loaded'||j.readyState==='complete') {
	                   			 				lse();
	                   			 			}
	                   			 		}

	                   			 } else {
	                   			 		j.onload = j.onreadystatechange = lse;
	                   			 };
				               
				              }
				              else {
					               /* Загрузка по событию onload документа, так как оследить загружен ли несинхронный скрипт мы не можем.
					               Скрипт подгрузки документа взят отсюда: https://github.com/dperini/ContentLoaded/blob/master/src/contentloaded.js
					                */
					                /*!
									 * contentloaded.js
									 *
									 * Author: Diego Perini (diego.perini at gmail.com)
									 * Summary: cross-browser wrapper for DOMContentLoaded
									 * Updated: 20101020
									 * License: MIT
									 * Version: 1.2
									 *
									 * URL:
									 * http://javascript.nwbox.com/ContentLoaded/
									 * http://javascript.nwbox.com/ContentLoaded/MIT-LICENSE
									 *
									 */
					                (function (win, fn) {
						                  var done = false, top = true,
						              
						                  doc = win.document, root = doc.documentElement,
						              
						                  add = doc.addEventListener ? 'addEventListener' : 'attachEvent',
						                  rem = doc.addEventListener ? 'removeEventListener' : 'detachEvent',
						                  pre = doc.addEventListener ? '' : 'on',
						              
						                  init = function(e) {
						                      if (e.type == 'readystatechange' && doc.readyState != 'complete') return;
						                      (e.type == 'load' ? win : doc)[rem](pre + e.type, init, false);
						                      if (!done && (done = true)) fn.call(win, e.type || e);
						                  },
						              
						                  poll = function() {
						                      try { root.doScroll('left'); } catch(e) { setTimeout(poll, 50); return; }
						                      init('poll');
						                  };
						              
						                  if (doc.readyState == 'complete') fn.call(win, 'lazy');
						                  else {
						                      if (doc.createEventObject && root.doScroll) {
						                          try { top = !win.frameElement; } catch(e) { }
						                          if (top) poll();
						                      }
						                      doc[add](pre + 'DOMContentLoaded', init, false);
						                      doc[add](pre + 'readystatechange', init, false);
						                      win[add](pre + 'load', init, false);
						                  }
						              
					            	})(window, lse);
				       			};
				        })(s, j); // s - пользовательское имя скрипта, j - ссылка на элемент SCRIPT
						
						/* Если мы дошли до этой части скрипта, значит мы создали асинхронный SCRIPT и теперь должны инициализировать загрузку ресурса */
					
				        if (asynch) {
				        	
							j.src = (!/^http/.test(k) ? _w.vendor._config.baseUrl : "") + k + (function(l) {
								if (l != "") {
									return "?" + l
								}
								return ""
							})(_w.vendor._config.urlArgs);
							/* Лишь после присвоения src мы вставляем скрипт на страницу */
							(function() {
			                  return document.documentElement || document.getElementsByTagName("HEAD")[0];
			                })().appendChild(j);
						};
					};
					
					
				}
			};
			/* Функция сообщает о том, что модуль загружен */
			this.loaded = function(j, f) {

				if (this.stop) {
					return
				}
				this.loads--;
				
				if (this.loads < 1) {

					if (typeof this.callback == "function") {

						var h = [];
						
						for (var g = 0; g < this.fabrics.length; g++) {
							
							if ("undefined" != typeof _w.vendor.define._modules[this.fabrics[g]]) {
								
								h.push(null != _w.vendor.define._modules[this.fabrics[g]] ? _w.vendor.define._modules[this.fabrics[g]].fabric : null)
							} else {
								
								h.push(null)
							}
						}
						
						this.callback.apply(window, h)
					}
					this.stop = true
				}
			};
			this.init()
		}(c, b || false)
	};
	_w.vendor.ext = _w.vendor.prototype = {
		selector: "",
		constructor: _w.vendor,
		init: function() {
			return _w.vendor.ext.constructor
		}
	};
	_w.selfLocationdefined = false; // Means we know our location
	_w.vendor.defineDataImport = false;
	_w.vendor._detained = [];
	_w.vendor._freezed = [];
	_w.vendor.queue = {

	};
	_w.vendor._onRedetain = function(d, f) {
		typeof _w.vendor.queue[d] != "object" && (_w.vendor.queue[d] = []);
		_w.vendor.queue[d].push(f);
	};
	_w.vendor.releaseDetained = function(d){
		
		var nd = [];
		for (var dt = 0;dt<_w.vendor._detained.length;dt++) {
			if (_w.vendor._detained[dt]!=d) nd.push(_w.vendor._detained[dt]);
		}
		_w.vendor._detained = nd;
		
		
		typeof _w.vendor.queue[d] == "object" && (function(d, q) {

			for (var i=0;i<q[d].length;i++) {
				
				q[d][i]();
			};
			delete q[d];
		})(d, _w.vendor.queue);


	};
	_w.vendor._defined = [];
	_w.vendor._config = {
		baseUrl: "",
		urlArgs: "",
		bowerUrl: _w.location.origin+"/bower_components/",
		noBowerrc: false, // Не читать файл .bowerrc в корне сайта
		paths: {}
	};

	_w.vendor.brahmaInside = true;
	_w.vendor.config = function(f) {
		
		var f = f || {};
		if (typeof f.paths == "object") {
			for (var b in f.paths) {
				_w.vendor._config.paths[b] = f.paths[b]
			}
			delete f.paths
		}
		for (var a in f) {
			_w.vendor._config[a] = f[a]
		}
	}
		
	_w.vendor.define = function(g, e, b) {
		
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
		var fabric = b || null;

		// После того как include выполняет модуль переменная initialed принимает значение true
		// Если этого не происходит, то черещ 0,010 секунду выполнение модуля происходит автоматически
		// (см. #autoexecute)
		var initialed = false;

		// Функция генерирует фабрику
		var initial = function() {
			initialed = true;
			_w.vendor.define.synchCode = null;
			switch(typeof fabric) {
				case "function":
					var product = fabric.apply(window, arguments);
				break;
				default:
					var product = fabric;
				break;
			}

			// Здесь происходит присваивание фабрики

			if (name) {
				_w.vendor.define._modules[name] = {
					fabric: product
				}
			}

			return product;
		}

		// Генерируем код синхроного исполнения, который будет удален функцией include, в случае успешного присваивания модуля имени файла
		var synchCode = _w.vendor.define.synchCode = Math.random();

		// В случае отсутствия имени, мы предполагаем, что данная функция вызывана из подключаемого файла, поэтому её активацию необходимо передать в специальную функцию _last, которая будет выполнена объектом include, сразе загрузки файла

		if (depends instanceof Array && depends.length>0) {
			// В случае если у данного модуля присутствуют зависимости, нам необходимо вначале загрузить их, а уже после производить активацию модуля
			var execute = function(callback) {
				_w.vendor.define._last = null;
				var callback = callback;
				
				vendor.require(depends, function() {
					// Передаем в callback продукт фабрики
					callback(initial.apply(window, arguments));
				});
			};

		} else {

			var execute = function(callback) {
				_w.vendor.define._last = null;
				callback(initial.apply(window, arguments));
			}

			// Дополнительный функционал для обеспечения использования define без асинхронной загрузке
			initial();
		}

		/* Если обработка define идет в режтме interactive мы не должны присваивать _last, а необходимо найти скрипт, который в состоянии interactive */
		if (vendor.state.interactive) {
			vendor.getInteractiveScript(execute);
		} else{
			_w.vendor.define._last = execute;
		}
		

		// #autoexecute
		// Защита от использования функции define в синхронных файлах
		// Мы должны выполнить модуль сами, если это не сделал функционал include, сразу после вызова define
		// Исключением является случай когда у нас отсутствуют зависимости и указано имя, в таком случае мы можем инициализировать модуль моментально
		if (depends===null && name!==null) {
			execute(function(){});
		} else {
			setTimeout(function() {
				if (!initialed) execute(function(){});
			}, 10);
		};
	}


	_w.vendor.define._modules = {
		'module' : null,
		'exports' : null,
		'vendor' : vendor
	};
	_w.vendor.define._last = null;
	vendor.define.amd = {}


	_w.vendor.requirecss = function(b, f) {

		if (typeof b != "object") {
			b = [b]
		}
		for (var c = 0; c < b.length; c++) {
			var a = b[c].substr(b[c].length - 4, 4) != ".css" ? b[c] + ".css" : b[c];

			a = vendor.makeAbsFilePath(a);

			if (is_safari) {
				/* 
				Safari отказывается слушать событие onload link эелемента, поэтому мы его обманем
				Это решение от ZACH LEATHERMAN (http://www.zachleat.com/web/load-css-dynamically/)
				*/
				var id = 'dynamicCss' + (new Date).getTime();
				var s = document.createElement("STYLE");
				s.setAttribute("type","text/css");
				s.setAttribute("id",id);
				s.innerHTML = '@import url(' + a + ')';
				s = function() {
					return document.documentElement || document.getElementsByTagName("HEAD")[0]
				}().appendChild(s);
				var poll,poll = function() {
				    try {
				        var sheets = document.styleSheets;
				        for(var j=0, k=sheets.length; j<k; j++) {
				            if(sheets[j].ownerNode.id == id) {
				                sheets[j].cssRules;
				            }
				        }
				       
				        f();
				    } catch(e) {
				        window.setTimeout(poll, 50);
				    }
				};
				window.setTimeout(poll, 50);
			} else {
				var d = document.createElement("LINK");

				d.onload = function(e) { 
					
					f(e);
				};
				var d = function() {
					return document.documentElement || document.getElementsByTagName("HEAD")[0]
				}().appendChild(d);
				d.setAttribute("rel", "stylesheet");
				d.href = a
			}
		}
	}

	_w.vendor.getJson = function(path, callback) {

		var xobj = new XMLHttpRequest();
	    if (xobj.overrideMimeType) xobj.overrideMimeType("application/json");
	    
		

		xobj.onreadystatechange = function (e) {
			
	          if (xobj.readyState === 4 && xobj.status == "200") {
	            
	            var actual_JSON = JSON.parse(xobj.responseText);

	            callback(actual_JSON);
	          }
	    };

	    xobj.open('GET', path, true); // Replace 'my_data' with the path to your file
	       
		xobj.send(null);
	}

	/* 
	Функция преобраузет относительный путь в абсолютный, основываясь на знаниях местонахождения домашней директории vendor.
	! Путь, начинающийся с / всегда подставляется к домену сайта (_w.location.origin)
	! Если вначале пути не следует / то будет подставлено текущее глобальное значение _config.baseUrl или baseUrl, указанный во втором аргументе
	*/
	_w.vendor.makeAbsPath = function(path, baseUrl) {
		var absloc = (path.length>0) ? (path + (path.substr(-1, 1)==='/' ? '' : '/')) : path;
		(absloc.substr(0,4).toLowerCase()!='http') && ( (absloc.substring(0,1)==='/') ? (absloc = _w.location.origin+absloc) : (absloc = (baseUrl||_w.vendor._config.baseUrl)+absloc));
		return absloc;
	}

	/*
	Аналог makeAbsPath, только без указания / в конце
	*/
	_w.vendor.makeAbsFilePath = function(fn, baseUrl) {
		var filename = (function(path) { var qp = path.lastIndexOf('/'); if (qp<0) qp = -1; return path.substring(qp+1,path.length); })(fn);
		var path = fn.substring(0,fn.length-filename.length);
		var absloc = (path.length>0) ? (path + (path.substr(-1, 1)==='/' ? '' : '/')) : path;
		(absloc.substr(0,4).toLowerCase()!='http') && ( (absloc.substring(0,1)==='/') ? (absloc = _w.location.origin+absloc) : (absloc = (baseUrl||_w.vendor._config.baseUrl)+absloc));
		
		return absloc+filename;
	}

	_w.bower = _w.vendor.bower = function(r, callback) {
		if ("object"!==typeof r) r = [r];

		new (function(paths, callback) {

			this.paths = paths;
			this.packages = [];
			this.callback = callback;
			this.loadings = 0;

			this.execute = function() {
				
				for (var i = 0;i<this.paths.length;i++) {
					if ("string"!==typeof this.paths[i]) {
						// Throw error
						throw "vendor.js: The path to bower component is not a string"; 
						return false;
					};
					this.getBowerPackage(this.paths[i]);
				}
			}

			this.getBowerPackage = function(path) {
				var thisbower = this;
				this.packages.push({
					path: path,
					module: null
				});
				var package = this.packages[this.packages.length-1];
				this.loadings++;
				// Make path to bower.json
				var absloc = vendor.makeAbsPath(path, vendor._config.bowerUrl);

				new (function(absloc,bowerMng,callback) {
					this.callback = callback;
					this.loadings = 0;
					this.absloc = absloc;
					this.mainModule = null;
					this.execute = function() {
						var that = this;

						var absbowerjs = this.absloc + 'bower.json';
						
						vendor.getJson(absbowerjs, function(config) {
							
							if ("object"!==typeof config) {
								throw "vendor.js: bower.json not found"; 
								return false;
							}
							if ("undefined"===typeof config.main) {
								throw "vendor.js: bower.json has no main key"; 
								return false;
							}

							
							/* Функция продолжит загружать пакет при условии что остальные зависимости загружены */
							var cont = function() {
								if ("string"===typeof config.main) config.main = [config.main];
								var js=[],css=[];
								for (var i=0;i<config.main.length;i++) {
									// Js file
									
									var pure = (function(path) { var qp = path.lastIndexOf('?'); if (qp<0) qp = path.length; return path.substring(0,qp); })(config.main[i]);
									
									if (pure.substr(pure.length-3, 3).toLowerCase()=='.js') {

										js.push(absloc + config.main[i]);
									}
									// Css file
									if (pure.substr(pure.length-4, 4).toLowerCase()=='.css') {
										css.push(absloc + config.main[i]);
									}
								}

								if (js.length>0) {
									that.loadings++;
									
									vendor.require(js, function() {
										
										
										that.catchMainModule(arguments); // Подхватываем модуль, который вернем функции bower
										that.loaded();
										
									});
								}
								if (css.length>0) {

									that.loadings++;
									vendor.requirecss(css, function() {
										that.loaded();
									});
								}
							}

							/* Загружаем зависимости */
							var deps = [];
							if (config.dependencies) {
								for (var prop in config.dependencies) {
									if (config.dependencies.hasOwnProperty(prop)) {
										deps.push(prop);
									}
								}
							}
							if (deps.length>0) {
								vendor.bower(deps, cont);
							} else {
								cont();
							}
							
						});
					};
					this.loaded = function() {
						this.loadings--;
						if (this.loadings===0) {

							this.callback(this.mainModule);
						}
					};
					/* 
					Функция получает список полученных модулей, но выбирает только первый из них, который не является NUll или undefindd, как основной
					При полном завершеии загрузки Bower-компонента этот модуль будет возвращен в callback функцию
					*/
					this.catchMainModule = function(modules) {

						if (!modules instanceof Array) return false;
						for (var i=0;i<modules.length;i++) {
							if (modules[i]!==null && "undefined"!==typeof modules[i]) {

								this.mainModule = modules[i]; break;
							}
						}
					}

					this.execute();
				})(absloc, this, function(module) {
					package.module = module;
					//console.log('set to path'+package.path+' module ',module);

					thisbower.loaded();
				});
			},
			this.loaded = function() {
				this.loadings--;
				if (this.loadings===0) {
					var callbackModules = [];
					for (var i = 0;i<this.packages.length;i++) {
						callbackModules.push(this.packages[i].module)
					}
					this.callback.apply(window, callbackModules);
				}
			}
			this.execute();
		})(r, callback || false);
	}

	_w.vendor.images = function(imgs, callback) {
		var progressor = new (function(imgs, callback) {
			this.imgs = ("object"===typeof imgs) ? imgs : [imgs];

			this.callback = callback;
			this.images = [];
			this.loadings=0;
			this.eachCallback = false;
			this.progress = 0;
			this.execute = function() {

				for (var i=0;i<this.imgs.length;i++) {

					var absloc = vendor.makeAbsFilePath(this.imgs[i]);
					
					this.loadImage(absloc);
				}

				this.max = this.loadings;
			}
			this.loadImage = function(src, first) {
				var that = this;
				this.loadings++;
				img = new Image(), that = this;

				img.onload = img.onerror = function() {

					that.loaded(img);
				}
				this.images.push(img);
				img.src = src;
			};
			this.loaded = function(res) {
				this.loadings--;
				this.progress = 1-(this.loadings/this.max);
				if (this.eachCallback) this.eachCallback.call(this, res);
				if (this.loadings===0) this.done();
			};
			this.done = function() {
				if ("function"===typeof this.callback) this.callback.apply(window, this.images);
			};
			// Позволяет вместо единой функции callback указать callback для каждого загруженного ресурса
			this.each = function(callback) {
				this.eachCallback = callback;
			}
			this.execute();
		})(imgs, callback);
		return progressor;
	}

	/* Register global */
	_w.define = _w.vendor.define;
	_w.require = _w.vendor.require;

	/* Автоопределение положения vendor */
	if (typeof _w.vendor === "function" && typeof _w.vendor.brahmaInside === "boolean") {

		(function() {
			var g = document.getElementsByTagName("SCRIPT");
			for (var j in g) {
				// Search for src
				if (typeof g[j].attributes == "object") {
					var srci = false;
					for (var z=0;z<g[j].attributes.length;z++) {
						if (g[j].attributes[z].name.toLowerCase()=='src') {
							
							srci = z;
							break;
						};
					}
				}
				if (srci!==false && typeof g[j].attributes === "object" && typeof g[j].attributes[srci] === "object" && g[j].attributes[srci] != null && /vendor\.js/.test(g[j].attributes[srci].value)) {

					var i = g[j].attributes[srci].value.toLowerCase();
					var h = i.split("vendor.js");
					var f = document.location.href.split("/");

					f.pop();
					f = f.join("/");
					if (f.substr(-1)=='/') f = f.substr(0,-1);

					_w.vendor.config({
						baseUrl: (h[0].substr(0,5)=='http:') ? h[0] : (f + (h[0].substr(0,1)=='/' ? '' : '/') + h[0]),
						noBowerrc: g[j].attributes['no-bower'] ? true : false
					});
					// import
					vendor.selfLocationdefined = true;
					// Search for import
					if (g[j].getAttribute('data-import'))
					vendor.defineDataImport = g[j].getAttribute('data-import');
				}
			}
		})()
	};

	/* Автоопределение расположения bower компонентов */
	if (!vendor._config.noBowerrc) vendor.getJson(_w.location.origin+'/.bowerrc', function(data) {
		if ("object"===typeof data && "string"===typeof data.directory) {
			
			vendor._config.bowerUrl = vendor.makeAbsPath(data.directory);
		}
	});
})(window);