define(['../core.js', '../common/extend.js', '../common/mix.js', '../extras/ref.js', '../classes.js'], function(core, extend, mix, ref) {
	/*
	Наделяет объект способности создавать фабрики, объекты и модули
	*/
	core.extensions['industry'] = {
		properties: {
			__industry: {
				factories: {}
			}
		},
		proto: {
			factory: function(name, absClass) {
				
				/* Создает новую или расширяет существующую фабрику */
				if ("object"!==typeof this.__industry.factories[name]) {
					this.__industry.factories[name] = {
						properties: {},
						proto: {},
						construct: null
					};
				};
				/*
				Расширяем конструктор
				*/
				if (this.__industry.factories[name].construct!==null&&"function"===typeof absClass.constructor) {
					this.__industry.factories[name].construct = mix(this.__industry.factories[name].construct, absClass.constructor);
				}
				/*
				Расширяем прототип
				*/
				if ("object"===typeof absClass.proto) {
					inherit(this.__industry.factories[name].proto, absClass.proto);
				}
				return this.__industry.factories[name];
				
			},
			/*
			Создает объект на основе фабрики. Если фабрика не указана явно, то принимает имя по-умолчанию default.
			Default позволяет создавать быстрые объекты. my.create();
			*/
			create: function(name, extra) {
				
				("string"!==typeof name) && (extra=name,name="default");
				("object"!==typeof extra) && (extra={});


				var module = {};
				if ("object"===typeof this.__industry.factories[name]) {
					module = charge(module, this.__industry.factories[name]);
				}
				extend(module,extend||{});

				/*
				Указываем ссылку на хозяина
				*/
				module.parent = ref(this);

				return module;
			},

		}
	}
});