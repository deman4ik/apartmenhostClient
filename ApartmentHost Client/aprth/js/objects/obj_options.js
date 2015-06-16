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
	//публичные члены класса (интерфейс)
	return {
		buildOptions: buildOptionsFn		
	}
}

//фабрика формирования форм
var optionsFactory = new OptionsFactory();