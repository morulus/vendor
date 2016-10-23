var determineResourceType = require('./lib/determineResourceType.js');
var dirname = require('./lib/dirname.js');
var domain = require('./lib/domain.js');
var events = require('./lib/eventsMixin.js');
var getXmlHttp = require('./lib/getXmlHttp.js');
var $inject = require('./lib/inject.js');
var mixin = require('./lib/mixin.js');
var normalize = require('./lib/normalize.js');
var queryString = require('./lib/queryString.js');
var isInteractiveMode = require('./lib/isInteractiveMode.js');
var Vendor = require('./lib/Vendor.js');
var Define = require('./lib/Define.js');
var commonJsModule = require('./lib/commonJsModule.js');
var Module = require('./lib/Module.js');
var Resource = require('./lib/Resource.js');


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
