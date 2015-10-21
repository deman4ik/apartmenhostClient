/*
	Объект опции
*/
var OptionsFactory = function () {
	//сборка списка опций
	var buildOptionsFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.id)
			throw new Error(Utils.getStrResource({lang: params.language, code: "CLNT_NO_ID"}));
		var res;
		if((params.options)&&(Array.isArray(params.options))) {
			res = [];
			params.options.map(function (option, i) {
				var label;
				if((params.labels)&&(params.labels[i])) {
					label = params.labels[i];
				} else {
					label = Utils.getStrResource({lang: params.language, code: option});
				}
				res.push({
					ref: params.id + "_" + i,
					label: label,
					value: option
				});
			});
		}
		return res;
	}
	//проверка возможности разбора списка опций
	var isParsebleFn = function (optionsString) {
		var res = false;
		if(optionsString) {
			try {				
				var optionsStringTmp = ((optionsString.lastIndexOf(";") == optionsString.length - 1)||(optionsString.lastIndexOf(",") == optionsString.length - 1))? optionsString.slice(0, optionsString.length - 1):optionsString;
				optionsStringTmp = ((optionsStringTmp.indexOf(";") == 0)||(optionsStringTmp.indexOf(",") == 0))? optionsStringTmp.slice(1):optionsStringTmp;
				if((optionsStringTmp.split(";").length > 1)||(optionsStringTmp.split(",").length > 1)) res = true;
			} catch (e) {			
			}
		}
		return res;
	}
	//разбор списка опций
	var parseFn = function (optionsString) {		
		var tmp = [];		
		if(optionsString) {
			if(optionsString.split(";").length > 1) {
				var optionsStringTmp = (optionsString.lastIndexOf(";") == optionsString.length - 1)? optionsString.slice(0, optionsString.length - 1):optionsString;
				optionsStringTmp = (optionsStringTmp.indexOf(";") == 0)? optionsStringTmp.slice(1):optionsStringTmp;
				tmp = optionsStringTmp.split(";");
			} else {
				if(optionsString.split(",").length > 1) {
					var optionsStringTmp = (optionsString.lastIndexOf(",") == optionsString.length - 1)? optionsString.slice(0, optionsString.length - 1):optionsString;
					optionsStringTmp = (optionsStringTmp.indexOf(",") == 0)? optionsStringTmp.slice(1):optionsStringTmp;
					tmp = optionsStringTmp.split(",");
				} else {					
					tmp.push(optionsString);
				}
			}
		}
		return tmp;
	}
	//публичные члены класса (интерфейс)
	return {
		buildOptions: buildOptionsFn,
		isParseble: isParsebleFn,
		parse: parseFn	
	}
}

//фабрика формирования форм
var optionsFactory = new OptionsFactory();