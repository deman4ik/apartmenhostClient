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
	}
}