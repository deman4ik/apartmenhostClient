/*
	Объект для фильтров
*/
var FilterFactory = function () {
	//поддерживаемые типы операций фильтра
	var operTypes = {
		FUNCTION: "function", //функция (в oper - имя функции OData)
		COMPARE: "compare" //операция сравнения (в oper - имя операции сравнения OData)
	}
	//поддерживаемые функции фильтра
	var funcsOData = {
		SUBSTR: "substringof", //поиск подстроки в строке
		INDEXOF: "indexof" //вхождение подстроки в строку
	}
	//поддерживаемые операции сравнения
	var cmpsOData = {
		EQS: "eqs", //сравнение строк
		EQB: "eqb", //сравнение булевых значений
		EQD: "eqd", //сравнение дат
		LEN: "len", //меньше или равно для чисел
		GEN: "gen", //больше или равно для чисел
		LED: "led", //меньше или равно для дат
		GED: "ged" //больше или равно для дат
	}
	//формирование элемента в фильтра
	var buildFilterItemFn = function (fieldName, value, operType, oper) {
		return {
			fieldName: fieldName,
			value: value,
			operType: operType,
			oper: oper
		}
	}
	//валидация элемента фильтра
	var validateFilterItemFn = function (filterItem) {
		var res = false;
		if(filterItem) {
			if(("fieldName" in filterItem)&&("value" in filterItem)&&("operType" in filterItem)&&("oper" in filterItem)) {
				res = true;
			}
		}
		return res;
	}
	//формирование объекта для фильтра объявлений
	var buildAdvertsFilterFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		var filter = [];
		if(("adress" in params)&&(params.adress)) {
			if(("adress" in params)&&(params.adress)) {
				filter.push(buildFilterItemFn("Apartment/Adress", params.adress, operTypes.FUNCTION, funcsOData.SUBSTR));
			}
			if(("sex" in params)&&(params.sex)) {
				filter.push(buildFilterItemFn("ResidentGender", params.sex, operTypes.FUNCTION, funcsOData.INDEXOF));
			}
			if(("dFrom" in params)&&(params.dFrom)) {
				filter.push(buildFilterItemFn("DateFrom", new Date(params.dFrom).to_yyyy_mm_dd(), operTypes.COMPARE, cmpsOData.LED));
			}
			if(("dTo" in params)&&(params.dTo)) {				
				filter.push(buildFilterItemFn("DateTo", new Date(params.dTo).to_yyyy_mm_dd(), operTypes.COMPARE, cmpsOData.GED));
			}
			if(("apartType" in params)&&(params.apartType)) {
				filter.push(buildFilterItemFn("Apartment/Type", params.apartType, operTypes.COMPARE, cmpsOData.EQS)); 
			}
			if(("priceTo" in params)&&(params.priceTo)) {
				filter.push(buildFilterItemFn("PriceDay", params.priceTo, operTypes.COMPARE, cmpsOData.LEN)); 
			}
			if(("priceFrom" in params)&&(params.priceFrom)) {
				filter.push(buildFilterItemFn("PriceDay", params.priceFrom, operTypes.COMPARE, cmpsOData.GEN)); 
			}			
		}
		if("userId" in params) {
			filter.push(buildFilterItemFn("User/Id", params.userId, operTypes.COMPARE, cmpsOData.EQS));
		}
		if("isFavorite" in params) {
			filter.push(buildFilterItemFn("IsFavorite", params.isFavorite, operTypes.COMPARE, cmpsOData.EQB));
		}
		return filter;
	}
	//формирование фильтра для передачи серверу
	var buildAdvertsServerFilterFn = function (advFilter) {
		if((!advFilter)||(!Array.isArray(advFilter))||(!advFilter.length > 0)) return "";
		var filter = "";
		advFilter.map(function (filterItem, i) {
			if(validateFilterItemFn(filterItem)) {
				if(filter) filter += " and ";
				switch(filterItem.operType) {
					case(operTypes.FUNCTION): {
						switch(filterItem.oper) {
							case(funcsOData.SUBSTR): {
								filter += "substringof('" + filterItem.value + "', " + filterItem.fieldName + ")";
								break;
							}
							case(funcsOData.INDEXOF): {
								filter += "indexof(" + filterItem.fieldName + ", '" + filterItem.value + "') ne -1";
								break;
							}							
							default: {
							}
						}
						break;
					}
					case(operTypes.COMPARE): {
						switch(filterItem.oper) {
							case(cmpsOData.EQS): {
								filter += filterItem.fieldName + " eq '" + filterItem.value + "'";
								break;
							}
							case(cmpsOData.EQB): {
								filter += filterItem.fieldName + " eq " + filterItem.value;
								break;
							}
							case(cmpsOData.EQD): {
								filter += filterItem.fieldName + " eq DateTime'" + filterItem.value + "'";
								break;
							}
							case(cmpsOData.LEN): {
								filter += filterItem.fieldName + " le " + filterItem.value;
								break;
							}
							case(cmpsOData.GEN): {
								filter += filterItem.fieldName + " ge " + filterItem.value;
								break;
							}
							case(cmpsOData.LED): {
								filter += filterItem.fieldName + " le DateTime'" + filterItem.value + "'";
								break;
							}
							case(cmpsOData.GED): {
								filter += filterItem.fieldName + " ge DateTime'" + filterItem.value + "'";
								break;
							}
							default: {
							}
						}
						break;
					}
					default: {
					}
				}
			}
		});
		if(filter != "") return "$filter=" + filter; else return "";
	}
	//публичные члены класса (интерфейс)
	return {
		buildAdvertsFilter: buildAdvertsFilterFn,
		buildAdvertsServerFilter: buildAdvertsServerFilterFn
	}
}

//фабрика формирования объектов для фильтров
var filterFactory = new FilterFactory();