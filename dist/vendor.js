/* 
@ Bower 1.0.
@ author: Vladimir Morulus
@ license: MIT 
*/

// Fix for IE
if ("undefined"==typeof Array.prototype.indexOf)
Array.prototype.indexOf = function(obj, start) {
     for (var i = (start || 0), j = this.length; i < j; i++) {
         if (this[i] === obj) { return i; }
     }
     return -1;
}

if (typeof window.include != "function") {
	window.include = window.require = function(c, b, phantom) {

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
					var f = (typeof window.include._config.paths[this.src[i]] == "string") ? window.include._config.paths[this.src[i]] : this.src[i];
					/* Добавляем расширение .js если оно отсутствует */
					var k = f.substr(f.length - 3, 3) != ".js" ? f + ".js" : f;

					/* Если данный адрес уже был загружен, то пропускаем этам загрузки и сразу сообщаем, что компонент загружен */
					try {
						if (window.include._defined.indexOf(f) > -1) {
							h.loaded(k);
							continue;
						};
					} catch(e) {
						/* IE 8 */
						
					}

					/* --- Continue: элемент был найден в списках загруженных элементов */
					/* ---------------------------------------------------------------- */


					/* Проверяем надичие элемента в списке define.modules. Ведь запрашиваемвый элемент мог быть просто предопределен через define. */
					if ('undefined' != typeof window.define._modules[g]) {
						
						
						h.loaded(k);
						continue;
					};
					
					/* --- Continue: элемент был найден в списках define. 				*/
					/* ---------------------------------------------------------------- */
					

					/* Поскольку один и тот же ресурс может быть запрошен в разных ветках, мы должны его проверить на присутствие в специальных списках include._detained, куда мы определяем элементы, которые на данный момент уже проходят загрузку */
					
					if (include._detained.indexOf(f)>-1) {
						
						/* Если ресурс уже подгружается в параллельных ветках, то мы начинаем слушать завершения его подгрузки*/
						include._onRedetain(f, function() {
							/* Если ресурс не попал в define списки, т.е. он не поддерживает архитектуру AMD, тогда мы его просто закидываем в список загруженных модулей.
							Здесь g - это пользовательское имя ресурса, f - это полное имя ресурса, в том виде в каком он присутствует в _config.paths, k  - это реальный путь до файла */
							if ("undefined" == typeof window.define._modules[g])
							if (window.include._defined.indexOf(f)<0) window.include._defined.push(f);
							/* Учитывая, что загрузка свершилась, мы вызываем loaded() */	
							h.loaded(k, g)
						});
						continue;
					} else {

						/* Если ресурс запрошен впервые, мы его определяем в список detained, что бы параллельные ветки загрузок могли знать, что ресурс уже загружается */
						include._detained.push(f); 

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
				              var lse = function() {
				              
				              	if (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") {
					              	/* Если внутри ресурса была определена функция define с зависимостями, значит помимо загрузки основного скрипта нам нужно ждать так же загрузки саб-ресурсов.
					              	Т.е. если происходит внутренний include, мы должны ждать его завершения. 
					              	Поэтому, нужно произвести тестирование */

					              	/* Создаем функцию, которая определяет 100% загрузку компонента */
					              	var ok = function(defi) {
					              		
					              		 /* Если ресурс не определен в define._modules, нам нужно проследить, были вызвана функция define. 
						                Фабрики фиксируются в переменной _last модуля define. Здесь мы выполняем данную функцию и получаем переменную, которую вернула fabric компонента. 
						                В типичном случае присвоение знаения define._modules происходит в самой функции define, однако программист может вызвать define без указания имени компонента, тогда фабрика будет присваиваться последнему вызванному ресурсу. */             
						                if ("undefined" == typeof window.define._modules[s]) {
						                	
							                window.define._modules[s] = {
							                  fabric: defi || null
							                };  
						            	};
					              		/* Если ресурс присутствует в списках _detained, мы должна сообщить глобально о том, что он загружен */
					                	if (include._detained.indexOf(f)>-1) include.releaseDetained(f);
					                	 /* Определяем ресурс как загруженный, более для него не будет производиться никаких действий при следующем вызове. */
						                if (window.include._defined.indexOf(f)<0) 
						                {				                  
						                  	window.include._defined.push(f);
						                };
						                /* Сообщаем ветке о том, что ресурс был загружен */
						                h.loaded(k, g)
					              	};

					              	/* проверяем last на наличие функции */
					              	if ("function"==typeof window.define._last) {
					              		/* Если last - функция, мы должны выполнить её передав callback код завершения загрузки данного модуля */

					              		window.define._last(ok);
					              		window.define._last = false;
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
						            	console.log('vendor.js: script node is already removed by another script', j);
						            }
				               	 };
				              };


				              /* Определяем метод распознавания загрузки */				        
				              if (asynch) {
				              	/* Загрузка созданного на лету элемента SCRIPT */
				                j.onload = j.onreadystatechange = lse;
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
				        	
							j.src = (!/^http/.test(k) ? window.include._config.baseUrl : "") + k + (function(l) {
								if (l != "") {
									return "?" + l
								}
								return ""
							})(window.include._config.urlArgs);
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
							
							if ("undefined" != typeof window.define._modules[this.fabrics[g]]) {
								
								h.push(null != window.define._modules[this.fabrics[g]] ? window.define._modules[this.fabrics[g]].fabric : null)
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
	window.include.ext = window.include.prototype = {
		selector: "",
		constructor: window.include,
		init: function() {
			return window.include.ext.constructor
		}
	};
	window.selfLocationdefined = false; // Means we know our location
	window.include.defineDataImport = false;
	window.include._detained = [];
	window.include.queue = {

	};
	window.include._onRedetain = function(d, f) {
		typeof window.include.queue[d] != "object" && (window.include.queue[d] = []);
		window.include.queue[d].push(f);
	};
	window.include.releaseDetained = function(d){
		
		var nd = [];
		for (var dt = 0;dt<window.include._detained.length;dt++) {
			if (window.include._detained[dt]!=d) nd.push(window.include._detained[dt]);
		}
		window.include._detained = nd;
		
		
		typeof window.include.queue[d] == "object" && (function(d, q) {

			for (var i=0;i<q[d].length;i++) {
				
				q[d][i]();
			};
			delete q[d];
		})(d, window.include.queue);


	};
	window.include._defined = [];
	window.include._config = {
		baseUrl: "",
		urlArgs: "",
		paths: {}
	};
	window.include.brahmaInside = true;
	window.include.config = function(f) {
		
		var f = f || {};
		if (typeof f.paths == "object") {
			for (var b in f.paths) {
				window.include._config.paths[b] = f.paths[b]
			}
			delete f.paths
		}
		for (var a in f) {
			window.include._config[a] = f[a]
		}
	}
}
if (typeof window.define != "function") {
	/* define обеспечивает поддержку технологии AMD 
	define(имя компонента, зависимости, фабрика)
	define(имя компонента, фабрика)
	define(зависимости, фабрика)
	*/
	window.define = function(g, e, b, overwrite) {

		var overwrite = overwrite || false; // Remove old value and set new
		var b = b,
			g = g;
		if (arguments.length==1) { b=g; g=null,e=0,overwrite=null }
		else if (arguments.length==2) {
			("object"==typeof g) && (b=e,e=0,g=null,overwrite=null);
			("string"==typeof g) && (b=e,e=0,overwrite=null);
		}
		else {
			"string" != typeof g && (overwrite = b, b = e, e = g, g = null);
			!(e instanceof Array) && (overwrite = b, b = e, e = 0);

			/*	Очищаем modules[g] если имя присутствует */
			(g!=null) && (delete window.define._modules[g]);
		}

		/* Зависимости храняться в переменной e. Если она не указана или не является массивом, то e принимает значние 0. */
		
		var c = function(d) {
					
			d == null && (d = ("function" == typeof b ? b() : b));

			g != null && (window.define._modules[g] = {
				fabric: d
			});

			return d;
		};

		/* Проверяем инициализирован ли уже этот компонент 
		Переменная a будет содержать fabric модуля */
		var a = g != null ? (function(d) {

			return ("object" == typeof window.define._modules[d]) ? window.define._modules[d].fabric : null
		})(g) : null;


		window.define._last = function(callback) {
			switch(typeof b) {
				case 'function':
					callback(b());
				break;
				default:
					callback(b);
				break;
			};
		};
		a == null ? (function(h, f) {


			h == 0 ? (function(d) {
				var d = d;

				window.define._last = function(callback) {
					
					callback(d());
				};
				//d() // DEPRICATED.
			})(f) : (function(j, i) {
				var j = j;
				var i = i;
				/* Если зависимости есть, нам необходимо отложить присваиваение функции define fabric */
				window.define._last = function(callback) {

					var callback = callback;
					
					include(j, function() {
						
						/* Теперь когда мы получили подгрузку зависимостей мы можем определить _modules 
						Определяем что вернуло нам defined */

						switch(typeof b) {
							case "function":

								defined = b.apply(this, arguments);

							break;
							default: 
								defined = b; // Это может быть объект, да всё что угодно.
							break;
						};
						/* После того как зависимости загружены нам необходимо присвоить к списку modules данный ресурс */
						if (g!=null && "undefined" == window.define._modules[g]) {
							
							window.define._modules[g] = defined;
						} else {
							
						};

						/* Если нам передан callback, то производим его вызов с передачей defined */

						callback(defined);
					});
				};
				
			})(h, f)
		})(e, c) : c(a)
	};
	window.define.force = function(name, depends, fabric) {
		/* Использование функции предполагает, что все depends уже присутствуют в define._modules.
		Здесь нам необходимо создать define._modules[name].fabric со значение fabric.apply() */
		var result = null;
		(fabric==null) & (result = depends, fabric=null)

		if (fabric==null) {
			var fab = {
				fabric: result
			};
		} else {
			var args = [];
			if (depends instanceof Array) {
				for (var i =0;i<depends.length;i++) {
					("object" == typeof define._modules[depends[i]]) ? (args.push(define._modules[depends[i]].fabric)) : (args.push(null));
				};
			};
			var fab = {
				fabric: fabric.apply(this, args)
			};
		};

		define._modules[name] = fab;

	};

	window.define._modules = {
		'module' : null,
		'exports' : null,
		'include' : include
	};
	window.define._last = null;
	define.amd = {}
}
if (typeof window.includecss != "function") {
	window.includecss = function(b, f) {
		if (typeof b != "object") {
			b = [b]
		}
		for (var c = 0; c < b.length; c++) {
			var a = b[c].substr(b[c].length - 4, 4) != ".css" ? b[c] + ".css" : b[c];
			(a.substr(0,5).toLowerCase()!='http') && (a = window.include._config.baseUrl+a);
			var d = function() {
				return document.documentElement || document.getElementsByTagName("HEAD")[0]
			}().appendChild(document.createElement("LINK"));
			d.setAttribute("rel", "stylesheet");
			d.onload = f;
			d.href = a
		}
	}
}
if (typeof window.include == "function" && typeof window.include.brahmaInside == "boolean") {

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
			if (srci!==false && typeof g[j].attributes == "object" && typeof g[j].attributes[srci] == "object" && g[j].attributes[srci] != null && /vendor\.js/.test(g[j].attributes[srci].value)) {

				var i = g[j].attributes[srci].value.toLowerCase();
				var h = i.split("vendor.js");
				var f = document.location.href.split("/");

				f.pop();
				f = f.join("/");
				if (f.substr(-1)=='/') f = f.substr(0,-1);

				window.include.config({
					baseUrl: (h[0].substr(0,5)=='http:') ? h[0] : (f + (h[0].substr(0,1)=='/' ? '' : '/') + h[0])
				});
				// import
				include.selfLocationdefined = true;
				// Search for import
				if (g[j].getAttribute('data-import'))
				include.defineDataImport = g[j].getAttribute('data-import');
			}
		}
	})()
};