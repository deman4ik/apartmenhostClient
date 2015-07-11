/*
	Объект форма действия
*/
var FormFactory = function () {
	//типы данных полей форм
	var itemDataType = {
		STR: "str", //строка
		NUMB: "number", //число
		DATE: "date" //дата
	}
	//способы ввода данных в поля форм
	var itemInputType = {
		MANUAL: "manual", //ручной ввод
		TEXT: "text", //ручной ввод в текстовое многострочное поле
		DICT: "dict", //выбор из словаря
		RATE: "rate", //ввод через указание рейтинга
	}
	//конвертация серверного типа данных в клиентский
	var convertDataTypeToClient = function (serverDataType) {
		var res = itemDataType.STR;
		switch(serverDataType) {
			case("Str"): {
				res = itemDataType.STR;
				break;
			}
			case("Num"): {
				res = itemDataType.NUMB;
				break;
			}
			case("Date"): {
				res = itemDataType.DATE;
				break;
			}
			default: {
				res = itemDataType.STR;
			}
		}
		return res;
	}
	//проверка корректности типа данных
	var checkItemDataTypeFn = function (dataType) {
		var res = false;
		_.keys(itemDataType).forEach(function (dT, i) {
			if(itemDataType[dT] == dataType) res = true;
		});
		return res;
	}
	//проверка корректности способа ввода
	var checkItemInputTypeFn = function (inputType) {
		var res = false;
		_.keys(itemInputType).forEach(function (iT, i) {
			if(itemInputType[iT] == inputType) res = true;
		});
		return res;
	}
	//формирование элемента словаря
	var buildDictItemFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.id) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["DictItem", "id"]
			}));
		if(!params.label) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["DictItem", "label"]
			}));
		if(!params.value) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["DictItem", "value"]
			}));		
		return {
			id: params.id,
			label: params.label,
			value: params.value			
		}
	}
	//валидация элемента словаря
	var validateDictItemFn = function (dictItem) {
		var res = false;
		if(dictItem) {
			if(("id" in dictItem)&&("label" in dictItem)&&("value" in dictItem)) {
				res = true;
			}
		}
		return res;
	}
	//формирование словаря
	var buildDictFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.label) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["Dict", "label"]
			}));
		if(!params.name) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["Dict", "name"]
			}));
		return {
			label: params.label,
			name: params.name,
			vals: []
		}
	}
	//валидация словаря
	var validateDictFn = function (dict) {
		var res = false;
		if(dict) {
			if(("label" in dict)&&("name" in dict)&&("vals" in dict)&&(Array.isArray(dict["vals"]))) {
				var validItems = true;
				dict.vals.forEach(function (dictVal, i) {
					if(!validateDictItemFn(dictVal)) validItems = false;
				});
				if(validItems) res = true;
			}
		}
		return res;
	}
	//добавление записи в словарь
	var appedDictItemFn = function (dict, dictItem) {
		if((validateDictFn(dict))&&(validateDictItemFn(dictItem))) {
			dict.vals.push(dictItem);
		}
	}
	//формирование элемента формы
	var buildFormItemFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.label) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["FormItem", "label"]
			}));
		if(!params.name) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["FormItem", "name"]
			}));
		if(!params.dataType) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["FormItem", "dataType"]
			}));
		if(!checkItemDataTypeFn(params.dataType)) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_BAD_ELEM",
				values: ["FormItem", "dataType"]
			}));
		if(!params.inputType) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["FormItem", "inputType"]
			}));		
		if(!checkItemInputTypeFn(params.inputType)) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_BAD_ELEM",
				values: ["FormItem", "inputType"]
			}));
		if(!("required" in params)) params.required = false;
		if(!("visible" in params)) params.visible = true;
		if(!("dict" in params)) {
			params.dict = {};
		} else {
			if(!validateDictFn(params.dict)) 
				throw new Error(Utils.getStrResource({
					lang: params.language,
					code: "CLNT_BAD_ELEM",
					values: ["FormItem", "dict"]
				}));
		}
		if(!("value" in params)) {
			params.value = "";
		}
		return {
			label: params.label,
			name: params.name,
			dataType: params.dataType,
			inputType: params.inputType,
			required: params.required,
			visible: params.visible,
			dict: params.dict,
			value: params.value
		}
	}
	//валидация элемента формы
	var validateFormItemFn = function (formItem) {
		var res = false;
		if(formItem) {
			if(("label" in formItem)&&("name" in formItem)&&("visible" in formItem)&&("required" in formItem)
				&&("dataType" in formItem)&&(checkItemDataTypeFn(formItem["dataType"]))
				&&("inputType" in formItem)&&(checkItemInputTypeFn(formItem["inputType"]))
				&&("dict" in formItem)&&(($.isEmptyObject(formItem["dict"]))||(validateDictFn(formItem["dict"])))) {
					res = true;
			}
		}
		return res;
	}
	//формирование формы
	var buildFormFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.title) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["Form", "title"]
			}));
		if(!("okButtonCaption" in params)) 
			params.okButtonCaption = Utils.getStrResource({lang: params.language, code: "UI_BTN_OK"});
		if(!("chancelButtonCaption" in params)) 
			params.chancelButtonCaption = Utils.getStrResource({lang: params.language, code: "UI_BTN_CHANCEL"});
		return {
			title: params.title,
			okButtonCaption: params.okButtonCaption,
			chancelButtonCaption: params.chancelButtonCaption,
			items: []
		}		
	}
	//валидация формы
	var validateFormFn = function (form) {
		var res = false;
		if(form) {
			if(("title" in form)&&("okButtonCaption" in form)&&("chancelButtonCaption" in form)&&("items" in form)) {
				var validItems = true;
				form.items.forEach(function (formItem, i) {
					if(!validateFormItemFn(formItem)) validItems = false;
				});
				if(validItems) res = true;
			}
		}
		return res;
	}
	//добавление элемента формы
	var appedFormItemFn = function (form, formItem) {
		if((validateFormFn(form))&&(validateFormItemFn(formItem))) {
			form.items.push(formItem);
		}
	}	
	//генерация формы на основе метаданных сервера
	var buildFormOnMetaFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.title) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["Form", "title"]
			}));
		if(!params.data) 
			throw new Error(Utils.getStrResource({
				lang: params.language,
				code: "CLNT_NO_ELEM",
				values: ["Form", "data"]
			}));
		if(!("okButtonCaption" in params)) 
			params.okButtonCaption = Utils.getStrResource({lang: params.language, code: "UI_BTN_OK"});
		if(!("chancelButtonCaption" in params)) 
			params.chancelButtonCaption = Utils.getStrResource({lang: params.language, code: "UI_BTN_CHANCEL"});
		var frmTmp = buildFormFn({
			language: params.language,
			title: params.title,
			okButtonCaption: params.okButtonCaption,
			chancelButtonCaption: params.chancelButtonCaption
		});
		params.data.items.forEach(function (item, i) {
			if(item.name != "MD_ITM_PROPSVALS") {				
				var frmItemTmp = buildFormItemFn({
					language: params.language,
					label: Utils.getStrResource({lang: params.language, code: item.name}),
					name: item.name,
					dataType: convertDataTypeToClient(item.type),
					inputType: itemInputType.MANUAL,
					required: ((item.postRule.requiredForm)?true:false),
					visible: ((item.postRule.visible)?true:false)
				});
				appedFormItemFn(frmTmp, frmItemTmp);
			} else {
				item.metadata.items.forEach(function (item, i) {
					var dict = {};
					var haveDict = false;
					if(("dictionaryName" in item)&&("dictionaryItems" in item)&&(Array.isArray(item["dictionaryItems"]))) {
						haveDict = true;
						dict = buildDictFn({
							language: params.language,
							label: Utils.getStrResource({lang: params.language, code: item.dictionaryName}),
							name: item.dictionaryName
						});
						item.dictionaryItems.forEach(function (dictItem, i) {
							appedDictItemFn(dict, buildDictItemFn({
								language: params.language,
								id: dictItem.id,
								label: Utils.getStrResource({lang: params.language, code: dictItem.strValue}),
								value: dictItem.strValue
							}));
						});
					}
					var frmItemTmp = buildFormItemFn({
						language: params.language,
						label: Utils.getStrResource({lang: params.language, code: item.name}),
						name: item.name,
						dataType: convertDataTypeToClient(item.type),
						inputType: ((haveDict)?itemInputType.DICT:itemInputType.MANUAL),
						required: ((item.postRule.requiredForm)?true:false),
						visible: ((item.postRule.visible)?true:false),
						dict: dict
					});
					appedFormItemFn(frmTmp, frmItemTmp);
				});
			}		
		});
		return frmTmp;
	}
	//публичные члены класса (интерфейс)
	return {
		itemDataType: itemDataType,
		itemInputType: itemInputType,
		checkItemDataType: checkItemDataTypeFn,
		checkItemInputType: checkItemInputTypeFn,
		buildDictItem: buildDictItemFn,
		validateDictItem: validateDictItemFn,
		buildDict: buildDictFn,
		validateDict: validateDictFn,
		appedDictItem: appedDictItemFn,
		buildFormItem: buildFormItemFn,
		validateFormItem: validateFormItemFn,
		buildForm: buildFormFn,
		validateForm: validateFormFn,
		appedFormItem: appedFormItemFn,
		buildFormOnMeta: buildFormOnMetaFn
	}
}

//фабрика формирования форм
var formFactory = new FormFactory();