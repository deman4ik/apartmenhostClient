/*
	Клиентская библиотека для работы с Azure-сервером
*/
var Client = function (clientConfig) {
	//флаг отладки: true - в консоль пишется всё что проходит через log, false - в консоль не пишется ничего, из того, что проходит через log
	var debug = true;
	//серверные объекты, поддерживающие метаописания
	var serverMetaObjects = ["Apartment", "Card", "User"];
	//поддерживаемые серверные методы
	var serverMethods = {
		get: "GET",
		ins: "POST",
		upd: "PUT",
		del: "DELETE"
	}
	//поддерживаемые серверные действия
	var serverActions = {
		login: "StandartLogin", //аутентификация
		getUserInfo: "User", //получение сведений о пользователе
		getMeta: "Metadata", //получение метаописания объекта
		userApart: "Apartment", //работа с пользовательскими объектами недвижимости
		userAdvert: "Card", //работа с пользовательскими объявлениями
		toggleAdvertFavor: "Favorite", //переключение состояния объявления в списке избранных
		makeReservation: "Reservation/Make" //бронирование
	}
	//коды стандартных ответов сервера
	var serverStdErrCodes = {
		unAuth: 401 //пользователь неавторизован
	}
	//объект клиента Azure-сервера
	var clnt = new WindowsAzure.MobileServiceClient(clientConfig.serverAppUrl, clientConfig.serverAppKey);
	//типы ответа сервера
	var	respTypes = {
		STD: 0, //стандартное сообщение сервера об успехе или ошибке операции
		DATA: 1 //данные, специфичные для операции
	}
	//состояния ответа сервера
	var	respStates = {
		ERR: 0, //код для ошибки
		OK: 1 //код для успеха
	}
	//протоколирование всего в консоли, с учетом состояния флага отладки
	var log = function (message) {
		if(debug) message.forEach(function (messageItem) {console.log(messageItem)});
	}
	//инициализация типового запроса
	var initSrvStdReqData = function () {
		return {
			API_NAME: "",			
			API_METHOD: "",
			API_DATA: ""
		}
	}
	//инициализация типового ответа
	var initSrvStdRespData = function () {
		return {
			TYPE: -1,
			STATE: -1,
			MESSAGE: ""
		}
	}
	//формирование типового запроса
	var fillSrvStdReqData = function (apiName, apiMethod, apiData) {
		var res = initSrvStdReqData();
		res.API_NAME = apiName;		
		res.API_METHOD = apiMethod;
		res.API_DATA = apiData;
		return res;
	}
	//формирование типового ответа
	var fillSrvStdRespData = function (type, state, message) {
		var res = initSrvStdRespData();
		res.TYPE = type;
		res.STATE = state;
		res.MESSAGE = message;
		return res;
	}
	//проверка - является ли сообщение об ошибке сервера стандартным сообщением Azure или это наш объект ошибки
	var isServerRespNotAzureStd = function (resp) {
		if("code" in resp) {
			return true;
		} else {
			return false;
		}
	}
	//проверка корректность объекта сессии
	var checkSession = function (session) {
		var res = false;
		if((session)&&("user" in session)&&("userId" in session.user)&&("authenticationToken" in session)) res = true;
		return res;
	}
	//формирование типового запроса к серверу, в зависимости от серверного действия
	var buildServerRequest = function (prms) {
		if(!prms) throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!prms.language) throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!prms.action) 
			throw new Error(Utils.getStrResource({
				lang: prms.language,
				code: "CLNT_NO_ELEM",
				values: ["ServerRequest", "action"]
			}));		
		try {
			//работаем от действия
			switch (prms.action) {
				//вход в систему
				case (serverActions.login): {					
					return fillSrvStdReqData(
						serverActions.login, 
						serverMethods.ins, 
						authFactory.buildLogIn(_.extend(prms.data, {language: prms.language}))
					);
					break;
				}
				//считывание информации о пользователе
				case (serverActions.getUserInfo): {
					return fillSrvStdReqData(serverActions.getUserInfo, serverMethods.get, "");
					break;
				}
				//получение метаданных объекта
				case (serverActions.getMeta): {
					if(!prms.data) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));					
					if(_.indexOf(serverMetaObjects, prms.data) == -1) throw new Error("Объекты типа '" + prms.data + "' не поддерживаются сервером!");
					return fillSrvStdReqData(serverActions.getMeta + "/" + prms.data, serverMethods.get, "");
					break;
				}
				//работа с недвижимостью пользователя
				case (serverActions.userApart): {
					if(!prms.method) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "method"]
						}));
					//работаем от метода
					switch (prms.method) {
						//добавление
						case(serverMethods.ins): {
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							//return fillSrvStdReqData(serverActions.userApart, serverMethods.ins, apartmentFactory.buildInsert(prms.data));
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							break;
						}
						//удаление
						case(serverMethods.del): {
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							//var delData = apartmentFactory.buildDel(prms.data);
							//return fillSrvStdReqData(serverActions.userApart + "/" + delData.id, serverMethods.del, delData);
							//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
							break;
						}
						//неизвестный метод
						default: {
							throw new Error("Метод '" + prms.method + "' для действия '" + prms.action + "' не поддерживается сервером!");
						}
					}					
					break;
				}
				//работа с объявлениями пользователя
				case (serverActions.userAdvert): {
					if(!prms.method) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "method"]
						}));
					if(!prms.data) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));					
					//работаем от метода
					switch (prms.method) {
						//добавление
						case(serverMethods.ins): {
							return fillSrvStdReqData(serverActions.userAdvert, serverMethods.ins, prms.data);
							break;
						}
						//удаление
						case(serverMethods.del): {							
							break;
						}
						//неизвестный метод
						default: {
							throw new Error("Метод '" + prms.method + "' для действия '" + prms.action + "' не поддерживается сервером!");
						}
					}					
					break;
				}
				//изменение статуса объявления в избранном
				case (serverActions.toggleAdvertFavor): {
					if(!prms.data) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					return fillSrvStdReqData(serverActions.toggleAdvertFavor + "/" + prms.data, serverMethods.ins, "");
					break;
				}
				//бронирование
				case (serverActions.makeReservation): {
					if(!prms.data) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					if(!prms.data.postId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "postId"]
						}));
					if(!prms.data.dateFrom) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "dateFrom"]
						}));
					if(!prms.data.dateTo) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "dateTo"]
						}));
					return fillSrvStdReqData(serverActions.makeReservation + "/" + prms.data.postId + "/" + prms.data.dateFrom + "/" + prms.data.dateTo, serverMethods.ins, "");
					break;
				}
				//неизвестное действие
				default: {
					throw new Error("Действие '" + prms.action + "' не поддерживается сервером!");
				}
			}
		} catch (error) {
			log(["SERVER REQUEST BUILD ERROR:", error.message]);
			throw new Error("Ошибка сборки запроса для действия '" + prms.action + "': " + error.message);
		}
	}
	//универсальный метод обращения к серверу
	var	execServerApi = function (prms) {			
		log(["EXECUTE SERVER API WITH:", prms]);
		if(!prms)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!prms.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if((!prms.callBack)||(!Utils.isFunction(prms.callBack)))
			throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_WS_NO_CALL_BACK"}));
		if((prms.session)&&(checkSession(prms.session))) {
			clnt.currentUser = {
				"userId": prms.session.user.userId,
				"mobileServiceAuthenticationToken": prms.session.authenticationToken
			};
		}
		if(prms.req) {
			clnt.invokeApi(prms.req.API_NAME, {
				body: prms.req.API_DATA,
				method: prms.req.API_METHOD
			}).done(
				function (result) {					
					log(["EXECUTE SERVER API RESULT:", result]);
					prms.callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, result.response));
				},
				function (error) {
					log(["EXECUTE SERVER API ERROR:", error]);
					var srvErr = Utils.deSerialize(error.request.response);
					var errMessage = "";
					if(!srvErr) {
						errMessage = Utils.getStrResource({lang: prms.language, code: "SRV_COMMON_ERROR"});
					} else {
						if(isServerRespNotAzureStd(srvErr)) {
							var values = [];
							if((srvErr.data)&&(Array.isArray(srvErr.data))) {
								srvErr.data.forEach(function (item, i) {
									var tmp = Utils.getStrResource({lang: prms.language, code: item, searchUndefined: false});
									if(!tmp) values.push(item); else values.push(tmp);
								});
							}
							errMessage = Utils.getStrResource({lang: prms.language, code: srvErr.code, values: values});
						} else {
							switch (error.request.status) {
								case (serverStdErrCodes.unAuth): {								
									errMessage = Utils.getStrResource({lang: prms.language, code: "SRV_UNAUTH"});
									break;
								}
								default: {			
									errMessage = Utils.getStrResource({lang: prms.language, code: "SRV_COMMON_ERROR"});
								}
							}
						}
					}
					prms.callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, errMessage));					
				}
			);
		} else {
			throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_WS_NO_QUERY"}));
		}
	}
	//считывание списка объявлений
	var	getAdverts = function (prms, callBack) {
		try {
			if(!prms)
				throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
			if(!prms.language)
				throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
			if((!callBack)||(!Utils.isFunction(callBack)))
				throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_WS_NO_CALL_BACK"}));
			var filter;
			if(!prms.filter) {
				filter = "";
			} else {
				filter = filterFactory.buildAdvertsServerFilter(prms.filter);
			}
			log(["FILTER IS: ", filter]);
			if((prms.session)&&(checkSession(prms.session))) {
				clnt.currentUser = {
					"userId": prms.session.user.userId,
					"mobileServiceAuthenticationToken": prms.session.authenticationToken
				};
			}
			var advTable = clnt.getTable("Card");
			advTable.read(filter).then(function (advItems) {					
				//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ОБЪЕКТАМ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
				advItems.forEach(function (item, i) {
					item.user.img = "aprth/img/tmp/user1.jpg";
					item.apartment.img = "aprth/img/tmp/2013-10-04_151552.jpg";
				});
				//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ОБЪЕКТАМ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
				log(["GETING ADVERTS SERVER RESULT:", advItems]);
				callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, advItems));
			}, function (error) {
				log(["GETING ADVERTS SERVER ERROR:", error]);
				callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			});
		} catch (error) {
			log(["GETING ADVERTS ERROR:", error]);
			if(Utils.isFunction(callBack))
				callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
		}
	}
	//публичные члены класса (интерфейс)
	return {
		//методы сервера
		serverMethods: serverMethods,		
		//типы ответа сервера
		respTypes: respTypes,
		//состояния ответа сервера
		respStates: respStates,		
		//выдача объекта клиента в консоль
		printClnt: function () {
			log([clnt]);
		},
		//аутентификация на сервере
		login: function (prms, callBack) {
			try {
				log(["LOGING IN WITH CREDENTAILS:", prms]);
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.login,
						method: serverMethods.ins,
						data: prms.data
					}),
					callBack: function (stdResp) {								
						if(stdResp.STATE == respStates.ERR) {
							callBack(stdResp);
						} else {
							var connectionData = Utils.deSerialize(stdResp.MESSAGE);
							execServerApi({
								language: prms.language,
								session: {
									user: {
										userId: connectionData.user.userId
									},
									authenticationToken: connectionData.authenticationToken
								},
								req: buildServerRequest({
									language: prms.language,
									action: serverActions.getUserInfo,
									method: serverMethods.get,
									data: null
								}),
								callBack: function (stdResp) {
									if(stdResp.STATE == respStates.ERR) {
										callBack(stdResp);
									} else {
										connectionData.user.profile = Utils.deSerialize(stdResp.MESSAGE)[0];
										callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, connectionData));
									}
								}
							});
						}
					}
				});				
			} catch (error) {
				log(["LOGIN ERROR:", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//аутентификация через FaceBook
		loginFB: function () {
			log(["LOGIN VIA FB"]);
			clnt.login("FB").then(function () {
				log(["LOGIN VIA FB RESULT:", clnt.currentUser]);
			}, function (error) {
				log(["LOGIN VIA FB ERROR:", error]);
			});
		},
		//получение метаописания объекта
		getObjectMeta: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.getMeta,
						method: serverMethods.get,
						data: prms.data
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["GETTING METADATA ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},		
		//добавление объекта недвижимости пользователя
		addUserApart: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userApart,
						method: serverMethods.ins,
						data: prms.apartItem
					}),
					callBack: callBack
				});
			} catch (error) {
				log(["ADDING APARTMENT ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//удаление объекта недвижимости пользователя
		removeUserApart: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userApart,
						method: serverMethods.del,
						data: prms.apartItem
					}),
					callBack: callBack
				});
			} catch (error) {
				log(["REMOVING APARTMENT ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//считывание списка объявлений
		getAdverts: getAdverts,
		//считывание объявления
		getAdvert: function (prms, callBack) {
			try {
				if(!prms)
					throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
				if(!prms.language)
					throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
				if((!callBack)||(!Utils.isFunction(callBack)))
					throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_WS_NO_CALL_BACK"}));
				if(!prms.postId)
					throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_NO_ID"}));
				if((prms.session)&&(checkSession(prms.session))) {
					clnt.currentUser = {
						"userId": prms.session.user.userId,
						"mobileServiceAuthenticationToken": prms.session.authenticationToken
					};
				}
				var advTable = clnt.getTable("Card");
				advTable.lookup(prms.postId).then(function (advItem) {
					//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ОБЪЕКТАМ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
					advItem.user.img = "aprth/img/tmp/user1.jpg";
					advItem.apartment.img = "aprth/img/tmp/2013-10-04_151552.jpg";
					//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ОБЪЕКТАМ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
					log(["GETING ADVERT SERVER RESULT:", advItem]);
					callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, advItem));
				}, function (error) {
					log(["GETING ADVERT SERVER ERROR:", error]);
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
				});
			} catch (error) {
				log(["GETING ADVERT ERROR:", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//смена статуса объявления в избранном
		toggleAdvertFavor: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.toggleAdvertFavor,
						method: serverMethods.ins,
						data: prms.postId
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["TOGGLING FAVOR ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//смена статуса объявления в избранном
		makeReservation: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.makeReservation,
						method: serverMethods.ins,
						data: {postId: prms.postId, dateFrom: prms.dateFrom, dateTo: prms.dateTo}
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["TOGGLING FAVOR ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//добавление объявления
		addAdvert: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userAdvert,
						method: serverMethods.ins,
						data: prms.data
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["TOGGLING FAVOR ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//считывание профиля пользователя
		getProfile: function (prms, callBack) {
			try {
				if(!prms)
					throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
				if(!prms.language)
					throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
				if((!callBack)||(!Utils.isFunction(callBack)))
					throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_WS_NO_CALL_BACK"}));
				if(!prms.profileId)
					throw new Error(Utils.getStrResource({lang: prms.language, code: "CLNT_NO_ID"}));
				if((!prms.session)||(!checkSession(prms.session)))
					throw new Error(Utils.getStrResource({lang: prms.language, code: "SRV_UNAUTH"}));
				clnt.currentUser = {
					"userId": prms.session.user.userId,
					"mobileServiceAuthenticationToken": prms.session.authenticationToken
				};
				var profileTable = clnt.getTable("Profile");
				profileTable.lookup(prms.profileId).then(function (profileItem) {
					//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ПРОФИЛЮ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
					profileItem.img = "aprth/img/tmp/user1.jpg";
					//ПОДМЕШИВАЕМ СТАТИЧНЫЕ КАРТИНКИ К ПРОФИЛЮ - УБРАТЬ КОГДА ЗАРАБОТАЮТ КАРТИНКИ
					var getAdvertsPrms = {
						language: prms.language, 
						filter: filterFactory.buildAdvertsFilter({language: prms.language, userId: prms.profileId}),
						session: prms.session
					}		
					getAdverts(getAdvertsPrms, function (resp) {
						if(resp.STATE == respStates.ERR) {
							callBack(resp);
						} else {
							if((resp.MESSAGE)&&(Array.isArray(resp.MESSAGE))&&(resp.MESSAGE.length > 0)) {
								profileItem.adverts = resp.MESSAGE;
								profileItem.advertsCount = resp.MESSAGE.length;
							} else {
								profileItem.adverts = [];
								profileItem.advertsCount = 0;
							}
							log(["GETING PROFILE SERVER RESULT:", profileItem]);
							callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, profileItem));
						}
					});
				}, function (error) {
					log(["GETING PROFILE SERVER ERROR:", error]);
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
				});
			} catch (error) {
				log(["GETING PROFILE ERROR:", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		}
	}
}

var clnt = new Client({serverAppUrl: config.serverAppUrl, serverAppKey: config.serverAppKey});