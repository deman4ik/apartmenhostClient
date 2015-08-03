/*
	Полезные функции, используемые глобально, во всём приложении
*/
//роутер
var Router = ReactRouter;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Redirect = Router.Redirect;
//утилиты
var Utils = {
	//определение режима работы Bootstrap в зависимости от размера устройства
	findBootstrapEnvironment: function () {
		var envs = ["xs", "sm", "md", "lg"];
		$el = $("<div>");
		$el.appendTo($("body"));
		for (var i = envs.length - 1; i >= 0; i--) {
			var env = envs[i];
			$el.addClass("hidden-" + env);
			if ($el.is(":hidden")) {
				$el.remove();
				return env;
			}
		}
	},
	//флаг сокрытия развёрнутого навигационного меню при нажатии на пункт меню (для мобильного вида Bootstrap NavBar)
	collapseNavBarOnItemClick: function () {
		var collapse;
		if(Utils.findBootstrapEnvironment() == "xs") collapse = "collapse";
		return collapse;
	},
	//проерка на число
	isNumber: function (numb) {
		return !isNaN(numb);
	},
	//проверка на функцию
	isFunction: function (fnc) {
		if(!fnc) return false;
		var getType = {};
		return fnc && getType.toString.call(fnc) === '[object Function]';
	},
	//сериализация объекта
	serialize: function (obj) {
		return JSON.stringify(obj);	
	},
	//десериализация объекта
	deSerialize: function (str) {
		var res = null;
		try {
			res = eval("(" + str + ")");
		} catch (e) {
			res = null;
		}
		return res;
	},
	//типы сообщений - ошибка
	getMessageTypeErr: function () {
		return 0;
	},
	//типы сообщений - информация
	getMessageTypeInf: function () {
		return 1;
	},
	//выдача локализованной строки
	getStrResource: function (prms) {		
		var str = "";
		if(!("searchVals" in prms)) {
			prms.searchVals = false;
		}
		if(!("searchUndefined" in prms)) {
			prms.searchUndefined = true;
		}
		if(!("lang" in prms)||(!prms.lang)) {
			prms.lang = "DEFAULT";
		}
		str = _.values(_.pick(_.findWhere(langs, {lang: prms.lang}), prms.code))[0];
		if(str) {
			if((prms.values)&&(Array.isArray(prms.values))) {
				prms.values.forEach(function (val, i) {
					str = str.replace("%" + (i + 1) + "$s", (prms.searchVals?_.findWhere(langs, {lang: prms.lang})[val]:val));
				});
			}
			str = str.replace(/\%[0-9]\$s/g, "");
		} else {
			if(prms.searchUndefined) {
				str = _.findWhere(langs, {lang: prms.lang}).UNDEFINED_RESOURCE;				
			}
		}		
		return str;
	},
	//выдача списка поддерживаемых языков
	getSupportedLanguages: function () {
		return _.where(langs, {display: true}).map(function (lang) {return lang.lang});
	},
	//выдача пунктов меню из ресурсов
	getMenuObject: function (menuName) {
		return _.findWhere(menus, {menuName: menuName});
	},
	//сохранение объекта в БД
	saveObjectState: function (key, obj) {
		localStorage.setItem(key, this.serialize(obj));
	},
	//считывание объекта из хранилища
	loadObjectState: function (key) {
		return this.deSerialize(localStorage.getItem(key));
	},
	//удаление объекта из хранилища
	deleteObjectState: function (key) {
		localStorage.removeItem(key);
	},
	//разница в днях между двумя датами
	daysBetween: function (from, to) {
    	return (to - from) / (1000 * 60 * 60 * 24);
	},
	//привязка контекста к произвольной функции
	bind: function (func, context) {
		return function() {
			return func.apply(context, arguments);
		};
	},
	//форматирование даты согласно региональным настройкам
	formatDate: function (prms) {
		var res;
		if(("date" in prms)&&(prms.date)) {
			if(!("lang" in prms)||(!prms.lang)) {
				prms.lang = "DEFAULT";
			}
			var dTmp = new Date(prms.date);
			switch(_.findWhere(langs, {lang: prms.lang})["DATE_FORMAT"]) {
				case("dd.mm.yyyy"): {
					res = dTmp.to_dd_mm_yyyy(prms.separator);
					break;
				}
				case("mm/dd/yyyy"): {
					res = dTmp.to_mm_dd_yyyy(prms.separator);
					break;
				}
				default: {
					res = dTmp.to_dd_mm_yyyy(prms.separator);
				}
			}
		}
		return res;
	},
	//формирование массива дней в укащанном диапазоне дат
	getDays: function(startDate, stopDate) {
    	var dateArray = [];
    	if((startDate)&&(stopDate)) {
    		var currentDate = startDate;    	
    		while (currentDate <= stopDate) {
        		dateArray.push(new Date(currentDate))
        		currentDate = currentDate.addDays(1);
    		}
    	}
    	return dateArray;
	},
	//формирование массива со списком дней, входящих в указанные интервалы
	buildDaysList: function (prms) {
		var res = [];
		if(("dates" in prms)&&(prms.dates)&&(Array.isArray(prms.dates))) {
			if(!("lang" in prms)||(!prms.lang)) {
				prms.lang = "DEFAULT";
			}			
			prms.dates.forEach(function (item, i) {
				var dF = new Date(item.dateFrom);
				var dT = new Date(item.dateTo);
				var days = this.getDays(dF, dT);
				days.forEach(function (day, j) {
					res.push(this.formatDate({lang: prms.lang, date: day, separator: "/"}));
				}, this);				
			}, this);
		}		
		return res;
	},
	//проверка массива диапазонов на непересекаемость
	checkDaysListNoCross: function (prms) {
		var res = false;
		if(("dates" in prms)&&(prms.dates)&&(Array.isArray(prms.dates))) {
			var tmp = this.buildDaysList(prms);
			var tmpUniq = _.uniq(tmp);
			if(tmp.length == tmpUniq.length) res = true;
		}
		return res;
	},
	//установка изображения по умолчанию для объекта недвижимости
	setApartmentDefaultPicture: function (apartment) {
		var defPict = {
			default: true,
			id: "default",
			large: config.defaultPictureUrl,
			mid: config.defaultPictureUrl,
			name: "default",
			small: config.defaultPictureUrl,
			url: config.defaultPictureUrl,
			xlarge: config.defaultPictureUrl,
			xsmall: config.defaultPictureUrl
		}
		if(apartment.pictures) {
			if(apartment.pictures.length == 0) {
				apartment.pictures.push(defPict);								
			} else {
				if(!_.find(apartment.pictures, {default: true})) {
					apartment.pictures[0].default = true;
				}
			}
		} else {
			apartment.pictures = [];
			apartment.pictures.push(defPict);
		}
		if((!apartment.defaultPicture)||((apartment.defaultPicture)&&(!apartment.defaultPicture.url))) {
			apartment.defaultPicture = defPict;
		}
	},
	//установка изображения по умолчанию для пользователя
	setProfileDefaultPicture: function (user) {
		if((!user.picture)||(!user.picture.url)) {
			user.picture = {};
			user.picture.url = config.defaultProfilePictureUrl;
			user.picture.mid = config.defaultProfilePictureUrl;
			user.picture.default = true;
		}
	}
}

//расширение для дат - конвертация в формат ГГГГ-ММ-ДД
Date.prototype.to_yyyy_mm_dd = function (separ) {
	var s = (separ)?separ:"-";
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	return yyyy + s + (mm[1]?mm:"0" + mm[0]) + s + (dd[1]?dd:"0" + dd[0]);
};

//расширение для дат - конвертация в формат ДД-ММ-ГГГГ
Date.prototype.to_dd_mm_yyyy = function (separ) {
	var s = (separ)?separ:".";
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	return (dd[1]?dd:"0" + dd[0]) + s + (mm[1]?mm:"0" + mm[0]) + s + yyyy;
};

//расширение для дат - конвертация в формат ММ-ДД-ГГГГ
Date.prototype.to_mm_dd_yyyy = function (separ) {
	var s = (separ)?separ:"/";
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth() + 1).toString();
	var dd = this.getDate().toString();
	return (mm[1]?mm:"0" + mm[0]) + s + (dd[1]?dd:"0" + dd[0]) + s + yyyy;
};

//расширение для дат - добавление дней к дате
Date.prototype.addDays = function(days) {
    var dat = new Date(this.valueOf())
    dat.setDate(dat.getDate() + days);
    return dat;
};

//расширения для карт - хранение и удаление маркеров
google.maps.Map.prototype.markers = new Array();
google.maps.Map.prototype.getMarkers = function() {
	return this.markers;
};
google.maps.Map.prototype.clearMarkers = function() {
	for(var i = 0; i < this.markers.length; i++){
		this.markers[i].setMap(null);
	}
	this.markers = new Array();
};
google.maps.Marker.prototype._setMap = google.maps.Marker.prototype.setMap;
google.maps.Marker.prototype.setMap = function(map) {
	if (map) {
		map.markers[map.markers.length] = this;
	}
	this._setMap(map);
};