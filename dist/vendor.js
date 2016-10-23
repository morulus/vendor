/*!
 * The MIT License (MIT)
 * 
 * Copyright (c) 2014-2016 Vladimir Kalmykov
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var determineResourceType = __webpack_require__(1);
	var dirname = __webpack_require__(4);
	var domain = __webpack_require__(5);
	var events = __webpack_require__(7);
	var getXmlHttp = __webpack_require__(8);
	var $inject = __webpack_require__(9);
	var mixin = __webpack_require__(10);
	var normalize = __webpack_require__(11);
	var queryString = __webpack_require__(13);
	var isInteractiveMode = __webpack_require__(14);
	var Vendor = __webpack_require__(15);
	var Define = __webpack_require__(24);
	var commonJsModule = __webpack_require__(25);
	var Module = __webpack_require__(23);
	var Resource = __webpack_require__(16);


		/*
		Полифилы и константы
		*/
		var httpmin_expr = /^([a-z]*):\/\/([^\?]*)$/i;

		Vendor.browser = {};

		// Определение браузера
		Vendor.browser.is_chrome = navigator.userAgent.indexOf('Chrome') > -1;
		Vendor.browser.is_explorer = navigator.userAgent.indexOf('MSIE') > -1;
		Vendor.browser.is_firefox = navigator.userAgent.indexOf('Firefox') > -1;
		Vendor.browser.is_safari = navigator.userAgent.indexOf("Safari") > -1;
		Vendor.browser.is_Opera = navigator.userAgent.indexOf("Presto") > -1;
		if ((Vendor.browser.is_chrome)&&(Vendor.browser.is_safari)) {Vendor.browser.is_safari=false;}

		/*
		forEach polyfill
		*/
		if (!Array.prototype.forEach) Array.prototype.forEach = function(callback) {
			for (var i = 0;i<this.length;i++) {
				callback.call(this[i], this[i], i);
			}
		}

		/*
		Bind polyfill
		*/
		if (!Function.prototype.bind) Function.prototype.bind = function(obj) {
			var fn = this,
			args = Array.prototype.slice.call(arguments, 1);
			return function(){
			    return fn.apply(obj, args.concat(Array.prototype.slice.call(arguments)));
			}
		}

		// indexOf polyfill
		if ("undefined"==typeof Array.prototype.indexOf)
		Array.prototype.indexOf = function(obj, start) {
		     for (var i = (start || 0), j = this.length; i < j; i++) {
		         if (this[i] === obj) { return i; }
		     }
		     return -1;
		}

		/* Fix window.location.origin */
		if (!window.location.origin) {
		  window.location.origin = window.location.protocol + "//" + window.location.hostname + (window.location.port ? ':' + window.location.port: '');
		}

		/* Автоопределение положения vendor */
		;(function() {

			var g = document.getElementsByTagName("SCRIPT");
			var srci = false, bsk = false, bwk = false;
			for (var j in g) {
				
				if (typeof g[j].attributes == "object") {
					// Search for src					
					for (var z=0;z<g[j].attributes.length;z++) {
						if (g[j].attributes[z].name.toLowerCase()==='src') {
							
							if (z!==false && typeof g[j].attributes === "object" && typeof g[j].attributes[z] === "object" && g[j].attributes[z] != null && /vendor\.js/.test(g[j].attributes[z].value)) {
								
								srci = z;
								break;
							};
						};
					}
				}
				if (srci!==false) {
					
					// Search for baseUrl					
					for (var z=0;z<g[j].attributes.length;z++) {

						if (g[j].attributes[z].name.toLowerCase()==='baseurl') {

							bsk = z;
							break;
						};
					}
					// Search for bowerComponents					
					for (var z=0;z<g[j].attributes.length;z++) {
						if (g[j].attributes[z].name.toLowerCase()==='bower-components') {
							bwk = z;
							break;
						};
					}
					// Parse location
					var f = document.location.href;
					if (f.lastIndexOf('/')>7) f = f.substring(0, f.lastIndexOf('/'));
					
					if (f.substr(-1)=='/') f = f.substr(0,-1);

					if (bsk!==false) {
						
						var h = g[j].attributes[bsk].value;
						
						if (h.substr(0,1)==='/') {
							var match = f.match(/^(http?[s]?:\/\/[^\/]*)/);
							if (match!==null) f = match[1];
						}
						var baseUrl = (h.substr(0,5).toLowerCase()==='http:') ? h : (f + (h.substr(0,1)==='/' ? '' : '/') + h);
						
					}
					else {
						
						var i = g[j].attributes[srci].value.toLowerCase();
						var h = i.split("vendor.js");
						var baseUrl = (h[0].substr(0,5)=='http:') ? h[0] : (f + (h[0].substr(0,1)=='/' ? '' : '/') + h[0])+(h[0].substr(h[0].length-1, 1)==='/' ? '' : '');
							
					}
					if (baseUrl.substr(baseUrl.length-1, 1)!=='/') baseUrl=baseUrl+'/';
					
					var importedConfig={
						baseUrl: baseUrl,
						bowerComponentsUrl: ((bwk!==false) ? (function() {
						var h = g[j].attributes[bwk].value;
						return (h.substr(0,5).toLowerCase()==='http:') ? h : (f + (h.substr(0,1)=='/' ? '' : '/') + h)+(h.substr(h.length-1, 1)==='/' ? '' : '');
					})() : baseUrl+"bower_components/"),
						noBowerrc: g[j].getAttribute('no-bowerrc') ? true : false,
						defineAlias: g[j].getAttribute('define-alias') ? g[j].getAttribute('define-alias') : 'define',
						requireAlias: g[j].getAttribute('require-alias') ? g[j].getAttribute('require-alias') : 'vendor',
					};
					/*
					Анализируем контент внутри тэга
					*/
					try {
						eval('importedConfig = mixin(importedConfig, '+g[j].innerHTML+')');
					} catch(e) {
						/* do nothing */
					}			

					Vendor.config(importedConfig);
					// import
					Vendor.selfLocationdefined = true;
					// Search for import
					if (g[j].getAttribute('data-import')) {
						Vendor.defineDataImport = g[j].getAttribute('data-import');
						Vendor.require(g[j].getAttribute('data-import'));
					}
					break;
				}				
			}
		})();

		/*
		Global registration
		*/

		window.Vendor = Vendor;
		window.require = Vendor;
		window.define = Define;
		window[Vendor.config.requireAlias] = Vendor; // Set Require ALias Variable
		window[Vendor.config.defineAlias] = Define; // Set Require ALias Variable
		window.module = commonJsModule; // CommonJs supports

		module.exports = Vendor;


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var imagesRegExpr = __webpack_require__(2);
	var resourceTypeMap = __webpack_require__(3);

	/*
	Определяет тип ресурса
	*/
	module.exports = function(pure, force) {
	    if (force&&!~resourceTypeMap.indexOf(force)) return resourceTypeMap.indexOf(force);
	    // Js file
	    if (pure.substr(pure.length-3, 3).toLowerCase()=='.js') {
	       return 1;
	    } else if (pure.substr(pure.length-4, 4).toLowerCase()=='.css') {
	        return 2;
	    } else if (pure.substr(pure.length-5, 5).toLowerCase()=='.json') {
	       return 4;
	    } else if (imagesRegExpr.test(pure)) {
	       return 5;
	    } else if (pure.lastIndexOf('.')>pure.lastIndexOf('/')) {
	        return 0;
	    } else {
	        return false;
	    }
	};


/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = /\.(jpg|jpeg|gif|png|bmp)*$/i;

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = [
	    'unknown',
	    'javascript',
	    'css',
	    'bower',
	    'json',
	    'image'
	];

/***/ },
/* 4 */
/***/ function(module, exports) {

	module.exports = function(url) {
		url=url.split('\\').join('/').split('?')[0];
		return url.substring(0, url.lastIndexOf('/')+1);
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var regExprDomain = __webpack_require__(6);

	module.exports = function(url) {
	    url=url.split('\\').join('/');
	    if (regExprDomain.test(url)) {
	    	var protodomen = regExprDomain.exec(url);
	        return protodomen[1]+'://'+protodomen[2]+'/';
	    } else {

	        return window.location.origin+'/';
	    }
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	module.exports = /^([a-z]*):\/\/([^\/]*)/i;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = {
		bind : function(e, callback, once) {
			if (typeof this.eventListners[e] != 'object') this.eventListners[e] = [];
			
			this.eventListners[e].push({
				callback: callback,
				once: once
			});

			return this;
		},
		on: function() {
			this.bind.apply(this, arguments);
			return this;
		},	
		once : function(e, callback) {
			this.bind(e, callback, true);
			return this;
		},
		trigger : function() {
			
			
			if (typeof arguments[0] == 'integer') {
				var uin = arguments[0];
				var e = arguments[1];
				var args = (arguments.length>2) ? arguments[2] : [];
			} else {
				var uin = false;
				var e = arguments[0];
				var args = (arguments.length>1) ? arguments[1] : [];
			};
			
			var response = false;

			if (typeof this.eventListners[e] == 'object' && this.eventListners[e].length>0) {
				var todelete = [];
				for (var i = 0; i<this.eventListners[e].length; i++) {
					if (typeof this.eventListners[e][i] === 'object') {
						if (typeof this.eventListners[e][i].callback === "function") response = this.eventListners[e][i].callback.apply(this, args);
						
						if (this.eventListners[e][i].once) {

							todelete.push(i);
						};
					};
				};
				
				if (todelete.length>0) for (var i in todelete) {
					this.eventListners[e].splice(todelete[i], 1);
				};
			};
			return response;
		},
		ready : function() {

			if (arguments.length===0) {
				this.isready = true;
				this.trigger('ready');
			} else if ("function"===typeof arguments[0]) {

				if (this.isready) arguments[0].apply(this);
				else this.bind('ready', arguments[0]);
			}
			return this;
		}
	}

/***/ },
/* 8 */
/***/ function(module, exports) {

	module.exports = function(){
	var xmlhttp;
	try {
	  xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
	} catch (e) {
	  try {
	    xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
	  } catch (E) {
	    xmlhttp = false;
	  }
	}
	if (!xmlhttp && typeof XMLHttpRequest!='undefined') {
	  xmlhttp = new XMLHttpRequest();
	}
	return xmlhttp;
	};

/***/ },
/* 9 */
/***/ function(module, exports) {

	var funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
	scopesregex = /({[^{}}]*[\n\r]*})/g,
	funcarguments = new RegExp(/[\d\t]*function[ ]?\(([^\)]*)\)/i),
	getFunctionArguments = function(code) {
	    if (funcarguments.test(code)) {
	        var match = funcarguments.exec(code);
	        return match[1].replace(/ /g,'').split(',');
	    }
	    return [];
	};

	module.exports = function(callback, context) {
	    var prefixedArguments = [],
	    requiredArguments = getFunctionArguments(callback.toString());


	    for (var i = 0;i<requiredArguments.length;++i) {
	        if (this instanceof Array) {
	            for (var j = 0;j<this.length;++j) {
	                if (this[j].hasOwnProperty(requiredArguments[i])
	                    &&("object"===typeof this[j][requiredArguments[i]]||"function"===typeof this[j][requiredArguments[i]])) {
	                    prefixedArguments[i] = this[j][requiredArguments[i]];
	                }
	            }
	        }
	        else if (this.hasOwnProperty(requiredArguments[i])
	            && ("object"===typeof this[requiredArguments[i]] || "function"===typeof this[requiredArguments[i]])) {

	            prefixedArguments[i] = this[requiredArguments[i]];
	        }
	    }
	    
	    var injected = function() {
	        return callback.apply(context||this, prefixedArguments.concat(Array.prototype.slice.call(arguments)));
	    }
	    injected.$$injected = true;
	    return injected;
	}

/***/ },
/* 10 */
/***/ function(module, exports) {

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

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var domain = __webpack_require__(5);
	var httpmin_expr_protocol = __webpack_require__(12);

	module.exports = function(url) {

	    var protocol,domain;
	    url=url.split('\\').join('/');
	    if (httpmin_expr_protocol.test(url)) {
	        var protdom = httpmin_expr_protocol.exec(url);

	        protocol=protdom[1];
	        domain=protdom[2];
	    } else {
	        
	        protocol='http://';
	        domain=url;
	    }

	    var urlp = domain.split('/');
	    



	    var res = [];
	    for (var i = 0;i<urlp.length;++i) {
	        if (urlp[i]==='') continue;
	        if (urlp[i]==='.') continue;
	        if (urlp[i]==='..') { res.pop(); continue; }
	        res.push(urlp[i]);
	    }

	    return protocol+'://'+res.join('/');
	};

/***/ },
/* 12 */
/***/ function(module, exports) {

	module.exports = /^([a-z]*):\/\/([^ ]+)$/i;

/***/ },
/* 13 */
/***/ function(module, exports) {

	
	    var Utils={},stringify;
	    Utils.hexTable = new Array(256);
	    for (var i = 0; i < 256; ++i) {
	        Utils.hexTable[i] = '%' + ((i < 16 ? '0' : '') + i.toString(16)).toUpperCase();
	    }

	    var internals = {
	        delimiter: '&',
	        arrayPrefixGenerators: {
	            brackets: function (prefix, key) {

	                return prefix + '[]';
	            },
	            indices: function (prefix, key) {

	                return prefix + '[' + key + ']';
	            },
	            repeat: function (prefix, key) {

	                return prefix;
	            }
	        },
	        strictNullHandling: false
	    };

	    Utils.arrayToObject = function (source) {

	        var obj = Object.create(null);
	        for (var i = 0, il = source.length; i < il; ++i) {
	            if (typeof source[i] !== 'undefined') {

	                obj[i] = source[i];
	            }
	        }

	        return obj;
	    };


	    Utils.merge = function (target, source) {

	        if (!source) {
	            return target;
	        }

	        if (typeof source !== 'object') {
	            if (Array.isArray(target)) {
	                target.push(source);
	            }
	            else if (typeof target === 'object') {
	                target[source] = true;
	            }
	            else {
	                target = [target, source];
	            }

	            return target;
	        }

	        if (typeof target !== 'object') {
	            target = [target].concat(source);
	            return target;
	        }

	        if (Array.isArray(target) &&
	            !Array.isArray(source)) {

	            target = exports.arrayToObject(target);
	        }

	        var keys = Object.keys(source);
	        for (var k = 0, kl = keys.length; k < kl; ++k) {
	            var key = keys[k];
	            var value = source[key];

	            if (!target[key]) {
	                target[key] = value;
	            }
	            else {
	                target[key] = exports.merge(target[key], value);
	            }
	        }

	        return target;
	    };


	    Utils.decode = function (str) {

	        try {
	            return decodeURIComponent(str.replace(/\+/g, ' '));
	        } catch (e) {
	            return str;
	        }
	    };

	    Utils.encode = function (str) {

	        // This code was originally written by Brian White (mscdex) for the io.js core querystring library.
	        // It has been adapted here for stricter adherence to RFC 3986
	        if (str.length === 0) {
	            return str;
	        }

	        if (typeof str !== 'string') {
	            str = '' + str;
	        }

	        var out = '';
	        for (var i = 0, il = str.length; i < il; ++i) {
	            var c = str.charCodeAt(i);

	            if (c === 0x2D || // -
	                c === 0x2E || // .
	                c === 0x5F || // _
	                c === 0x7E || // ~
	                (c >= 0x30 && c <= 0x39) || // 0-9
	                (c >= 0x41 && c <= 0x5A) || // a-z
	                (c >= 0x61 && c <= 0x7A)) { // A-Z

	                out += str[i];
	                continue;
	            }

	            if (c < 0x80) {
	                out += Utils.hexTable[c];
	                continue;
	            }

	            if (c < 0x800) {
	                out += Utils.hexTable[0xC0 | (c >> 6)] + Utils.hexTable[0x80 | (c & 0x3F)];
	                continue;
	            }

	            if (c < 0xD800 || c >= 0xE000) {
	                out += Utils.hexTable[0xE0 | (c >> 12)] + Utils.hexTable[0x80 | ((c >> 6) & 0x3F)] + Utils.hexTable[0x80 | (c & 0x3F)];
	                continue;
	            }

	            ++i;
	            c = 0x10000 + (((c & 0x3FF) << 10) | (str.charCodeAt(i) & 0x3FF));
	            out += Utils.hexTable[0xF0 | (c >> 18)] + Utils.hexTable[0x80 | ((c >> 12) & 0x3F)] + Utils.hexTable[0x80 | ((c >> 6) & 0x3F)] + Utils.hexTable[0x80 | (c & 0x3F)];
	        }

	        return out;
	    };

	    Utils.compact = function (obj, refs) {

	        if (typeof obj !== 'object' ||
	            obj === null) {

	            return obj;
	        }

	        refs = refs || [];
	        var lookup = refs.indexOf(obj);
	        if (lookup !== -1) {
	            return refs[lookup];
	        }

	        refs.push(obj);

	        if (Array.isArray(obj)) {
	            var compacted = [];

	            for (var i = 0, il = obj.length; i < il; ++i) {
	                if (typeof obj[i] !== 'undefined') {
	                    compacted.push(obj[i]);
	                }
	            }

	            return compacted;
	        }

	        var keys = Object.keys(obj);
	        for (i = 0, il = keys.length; i < il; ++i) {
	            var key = keys[i];
	            obj[key] = exports.compact(obj[key], refs);
	        }

	        return obj;
	    };


	    Utils.isRegExp = function (obj) {

	        return Object.prototype.toString.call(obj) === '[object RegExp]';
	    };


	    Utils.isBuffer = function (obj) {

	        if (obj === null ||
	            typeof obj === 'undefined') {

	            return false;
	        }

	        return !!(obj.constructor &&
	                  obj.constructor.isBuffer &&
	                  obj.constructor.isBuffer(obj));
	    };

	    Utils.stringify = function (obj, prefix, generateArrayPrefix, strictNullHandling, filter) {

	        if (typeof filter === 'function') {
	            obj = filter(prefix, obj);
	        }
	        else if (Utils.isBuffer(obj)) {
	            obj = obj.toString();
	        }
	        else if (obj instanceof Date) {
	            obj = obj.toISOString();
	        }
	        else if (obj === null) {
	            if (strictNullHandling) {
	                return Utils.encode(prefix);
	            }

	            obj = '';
	        }

	        if (typeof obj === 'string' ||
	            typeof obj === 'number' ||
	            typeof obj === 'boolean') {

	            return [Utils.encode(prefix) + '=' + Utils.encode(obj)];
	        }

	        var values = [];

	        if (typeof obj === 'undefined') {
	            return values;
	        }

	        var objKeys = Array.isArray(filter) ? filter : Object.keys(obj);
	        for (var i = 0, il = objKeys.length; i < il; ++i) {
	            var key = objKeys[i];

	            if (Array.isArray(obj)) {
	                values = values.concat(Utils.stringify(obj[key], generateArrayPrefix(prefix, key), generateArrayPrefix, strictNullHandling, filter));
	            }
	            else {
	                values = values.concat(Utils.stringify(obj[key], prefix + '[' + key + ']', generateArrayPrefix, strictNullHandling, filter));
	            }
	        }

	        return values;
	    };

	    module.exports = function (obj, options) {

	        options = options || {};
	        var delimiter = typeof options.delimiter === 'undefined' ? internals.delimiter : options.delimiter;
	        var strictNullHandling = typeof options.strictNullHandling === 'boolean' ? options.strictNullHandling : internals.strictNullHandling;
	        var objKeys;
	        var filter;
	        if (typeof options.filter === 'function') {
	            filter = options.filter;
	            obj = filter('', obj);
	        }
	        else if (Array.isArray(options.filter)) {
	            objKeys = filter = options.filter;
	        }

	        var keys = [];

	        if (typeof obj !== 'object' ||
	            obj === null) {

	            return '';
	        }

	        var arrayFormat;
	        if (options.arrayFormat in internals.arrayPrefixGenerators) {
	            arrayFormat = options.arrayFormat;
	        }
	        else if ('indices' in options) {
	            arrayFormat = options.indices ? 'indices' : 'repeat';
	        }
	        else {
	            arrayFormat = 'indices';
	        }

	        var generateArrayPrefix = internals.arrayPrefixGenerators[arrayFormat];

	        if (!objKeys) {
	            objKeys = Object.keys(obj);
	        }
	        for (var i = 0, il = objKeys.length; i < il; ++i) {
	            var key = objKeys[i];
	            keys = keys.concat(Utils.stringify(obj[key], key, generateArrayPrefix, strictNullHandling, filter));
	        }

	        return keys.join(delimiter);
	    }

/***/ },
/* 14 */
/***/ function(module, exports) {

	module.exports = function(j) {
		return (j.attachEvent && !(j.attachEvent.toString && j.attachEvent.toString().indexOf('[native code') < 0) && !(typeof opera !== 'undefined' && opera.toString() === '[object Opera]'));
	}

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var domain_expr = __webpack_require__(6);
	var resourceTypeMap = __webpack_require__(3);
	var domain = __webpack_require__(5);
	var mixin = __webpack_require__(10);
	var Resource = __webpack_require__(16);
	var Module = __webpack_require__(23);
	var normalize = __webpack_require__(11);
	var dirname = __webpack_require__(4);

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

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var mixin = __webpack_require__(10);
	var determineResourceType = __webpack_require__(1);
	var javascriptLoader = __webpack_require__(17);
	var cssLoader = __webpack_require__(18);
	var fileLoader = __webpack_require__(19);
	var imagesLoader = __webpack_require__(20);
	var jsonLoader = __webpack_require__(21);
	var events = __webpack_require__(7);
	var dirname = __webpack_require__(4);
	var charge = __webpack_require__(22);

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

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var isInteractiveMode = __webpack_require__(14);

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

/***/ },
/* 18 */
/***/ function(module, exports) {

	var cssLoader = function(resource, callback) {
		this.resource = resource;
		this.callback = callback;
		var that = this;

		this.load();
	}

	cssLoader.prototype = {
		constructor: cssLoader,
		load: function() {
			var that = this;
			if (Vendor.browser.is_safari) {
				/*
				Код взят с https://github.com/guybedford/require-css/blob/master/css.js
				*/

				var head = document.getElementsByTagName('head')[0];

			  var engine = window.navigator.userAgent.match(/Trident\/([^ ;]*)|AppleWebKit\/([^ ;]*)|Opera\/([^ ;]*)|rv\:([^ ;]*)(.*?)Gecko\/([^ ;]*)|MSIE\s([^ ;]*)|AndroidWebKit\/([^ ;]*)/) || 0;

			  // use <style> @import load method (IE < 9, Firefox < 18)
			  var useImportLoad = false;
			  
			  // set to false for explicit <link> load checking when onload doesn't work perfectly (webkit)
			  var useOnload = true;

			  // trident / msie
			  if (engine[1] || engine[7])
			    useImportLoad = parseInt(engine[1]) < 6 || parseInt(engine[7]) <= 9;
			  // webkit
			  else if (engine[2] || engine[8])
			    useOnload = false;
			  // gecko
			  else if (engine[4])
			    useImportLoad = parseInt(engine[4]) < 18;


				var curStyle, curSheet;
			  var createStyle = function () {
			    curStyle = document.createElement('style');
			    head.appendChild(curStyle);
			    curSheet = curStyle.styleSheet || curStyle.sheet;
			  }
			  var ieCnt = 0;
			  var ieLoads = [];
			  var ieCurCallback;
			  
			  var createIeLoad = function(url) {
			    curSheet.addImport(url);
			    curStyle.onload = function(){ processIeLoad() };
			    
			    ieCnt++;
			    if (ieCnt == 31) {
			      createStyle();
			      ieCnt = 0;
			    }
			  }
			  var processIeLoad = function() {
			    ieCurCallback();
			 
			    var nextLoad = ieLoads.shift();
			 
			    if (!nextLoad) {
			      ieCurCallback = null;
			      return;
			    }
			 
			    ieCurCallback = nextLoad[1];
			    createIeLoad(nextLoad[0]);
			  }
			  var importLoad = function(url, callback) {
			    if (!curSheet || !curSheet.addImport)
			      createStyle();

			    if (curSheet && curSheet.addImport) {
			      // old IE
			      if (ieCurCallback) {
			        ieLoads.push([url, callback]);
			      }
			      else {
			        createIeLoad(url);
			        ieCurCallback = callback;
			      }
			    }
			    else {
			      // old Firefox
			      curStyle.textContent = '@import "' + url + '";';

			      var loadInterval = setInterval(function() {
			        try {
			          curStyle.sheet.cssRules;
			          clearInterval(loadInterval);
			          callback();
			        } catch(e) {}
			      }, 10);
			    }
			  }

			  // <link> load method
			  var linkLoad = function(url, callback) {
			    var link = document.createElement('link');
			    link.type = 'text/css';
			    link.rel = 'stylesheet';
			    if (useOnload)
			      link.onload = function() {
			        link.onload = function() {};
			        // for style dimensions queries, a short delay can still be necessary
			        setTimeout(callback, 7);
			      }
			    else
			      var loadInterval = setInterval(function() {
			        for (var i = 0; i < document.styleSheets.length; i++) {
			          var sheet = document.styleSheets[i];
			          if (sheet.href == link.href) {
			            clearInterval(loadInterval);
			            return callback();
			          }
			        }
			      }, 10);
			    link.href = url;
			    head.appendChild(link);
			  }

			  importLoad(this.resource.url, function() {
			  	that.callback.call(that.resource, null);	
			  });
			} else {
				var d = document.createElement("LINK");

				d.onload = function(e) { 
					 that.callback.call(that.resource, null);	
				};
				var d = function() {
					return document.getElementsByTagName("HEAD")[0] || document.documentElement
				}().appendChild(d);
				d.setAttribute("rel", "stylesheet");
				d.setAttribute("type", "text/css");
				d.href = this.resource.url;
			}
		}
	}

	module.exports = cssLoader;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var getXmlHttp = __webpack_require__(8);

	var fileLoader = function(resource, callback) {
		
		this.resource = resource;
		
		this.callback = callback;
		var that = this;
		this.load(function(err, data) {
			var module;

			if (err) {
				throw err;
				module = null;
			} else {
				module = {
					exports: data
				}
			}
			that.callback.call(that.resource, module);
		});
	}

	fileLoader.prototype = {
		constructor: fileLoader,
		load: function(callback) {
			var xobj = getXmlHttp();
		    if (xobj.overrideMimeType) xobj.overrideMimeType("application/x-www-form-urlencoded");

			xobj.open('GET', this.resource.url, !this.resource.sync);
			xobj.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
			xobj.onreadystatechange = function() {
				 if (xobj.readyState == 4) {

					if(xobj.status == 200) {

						callback(false, xobj.response||xobj.responseText);
					} else {

						callback(true, xobj.responseText);
					}
				}
		    };

		    xobj.send(this.resource.post ? queryString(this.resource.post) :  null);
		}
	}

	module.exports = fileLoader;

/***/ },
/* 20 */
/***/ function(module, exports) {

	var imagesLoader = function(resource, callback) {
		this.resource = resource;
		this.callback = callback;
	}

	imagesLoader.prototype = {
		constructor: imagesLoader,
		load: function() {
			var img = new Image(), that = this;

			img.onload = img.onerror = function() {
				that.callback.call(that.resource, img);
			}
			
			img.src = this.resource.src;
		}
	}

	module.exports = imagesLoader;


/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var getXmlHttp = __webpack_require__(8);
	var jsonLoader = function(resource, callback) {
		this.resource = resource;
		this.callback = callback;
		var that = this;
		this.load(function(json) {

			that.callback.call(that.resource, {
				exports: json
			});
		});
	}

	jsonLoader.prototype = {
		constructor: jsonLoader,
		load: function(callback) {

			var xobj = getXmlHttp(),self=this;
		    if (xobj.overrideMimeType) xobj.overrideMimeType("application/json");

			xobj.onreadystatechange = function (e) {
				
		          if (xobj.readyState === 4 && xobj.status == "200") {
		            
		            try {
		            	var actual_JSON = JSON.parse(xobj.responseText);
		            } catch(e) {
		            	throw 'Corrupted JSON file: '+self.resource.url;
		            }

		            callback(actual_JSON);
		          }
		    };

		    xobj.open('GET', this.resource.url, !this.resource.sync);
		       
			xobj.send(null);
		}
	}

	module.exports = jsonLoader;

/***/ },
/* 22 */
/***/ function(module, exports) {

	module.exports = function(object, proto) {
		for (var prop in proto) {
			if (proto.hasOwnProperty(prop)) {
				if ("object"===typeof proto[prop]) {
					object[prop] = new Object(proto[prop]);
				} else {
					object[prop] = proto[prop];
				}
			}
		}
	};

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var charge = __webpack_require__(22);
	var Resource = __webpack_require__(16);
	var events = __webpack_require__(7);

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

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var Vendor = __webpack_require__(15);
	var $inject = __webpack_require__(9);


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

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = Object.create(null, {
		"exports": {
			set: function(module) {
				Vendor.define(function() {
					return module;
				});
			}
		}
	});

/***/ }
/******/ ]);