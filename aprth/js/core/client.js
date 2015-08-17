/*
	Клиентская библиотека для работы с Azure-сервером
*/
var Client = function (clientConfig) {
	//флаг отладки: true - в консоль пишется всё что проходит через log, false - в консоль не пишется ничего, из того, что проходит через log
	var debug = true;
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
		userAdvert: "Card", //работа с пользовательскими объявлениями
		toggleAdvertFavor: "Favorite", //переключение состояния объявления в списке избранных
		makeReservation: "Reservation/Make", //бронирование
		acceptDeclineReservation: "Reservation/AcceptDecline", //подтверждение/отклонение резерва
		reservation: "Reservation", //запросы на бронирование
		userProfile: "Profile", //работа с профилем пользователя
		review: "Review", //работа с отзывами
		uploadApartmentPicture: "Picture/Upload/Apartment", //работа с картинками - загрузка картинки недвижимости
		removeApartmentPicture: "Picture/Delete/Apartment", //работа с картинками - удаление картинки недвижимости
		uploadProfilePicture: "Picture/Upload/Profile", //работа с картинками - загрузка картинки профиля
		removeProfilePicture: "Picture/Delete/Profile", //работа с картинками - удаление картинки профиля
		setDefaultPicture: "Picture/Default", //работа с картинками - установка картинки по умолчанию
		register: "StandartRegistration", //запрос на регистрацию
		registerConfirm: "EmailConfirm", //подтверждение регистрации
		resetPassword: "PasswordReset", //запрос на сброс пароля
		changePassword: "PasswordChange" //смена пароля
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
				//работа с профилем пользователя
				case (serverActions.userProfile): {
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
						//исправление
						case(serverMethods.upd): {
							return fillSrvStdReqData(serverActions.userProfile, serverMethods.upd, prms.data);
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
						//считывание/поиск карточек
						case(serverMethods.get): {
							return fillSrvStdReqData(serverActions.userAdvert + "s?filter=" + Utils.serialize(prms.data), serverMethods.get, "");
							break;
						}
						//добавление
						case(serverMethods.ins): {
							return fillSrvStdReqData(serverActions.userAdvert, serverMethods.ins, prms.data);
							break;
						}
						//исправление
						case(serverMethods.upd): {
							if(!prms.data.postId) 
								throw new Error(Utils.getStrResource({
									lang: prms.language,
									code: "CLNT_NO_ELEM",
									values: ["ServerRequest", "postId"]
								}));	
							return fillSrvStdReqData(serverActions.userAdvert + "/" + prms.data.postId, serverMethods.upd, prms.data);		
							break;
						}
						//удаление
						case(serverMethods.del): {
							if(!prms.data.postId) 
								throw new Error(Utils.getStrResource({
									lang: prms.language,
									code: "CLNT_NO_ELEM",
									values: ["ServerRequest", "postId"]
								}));
							return fillSrvStdReqData(serverActions.userAdvert + "/" + prms.data.postId, serverMethods.del, "");		
							break;
						}
						//неизвестный метод
						default: {
							throw new Error("Метод '" + prms.method + "' для действия '" + prms.action + "' не поддерживается сервером!");
						}
					}					
					break;
				}
				//работа с картинками недвижимости - загрузка
				case (serverActions.uploadApartmentPicture): {
					if(!prms.data.apartId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "apartId"]
						}));
					if(!prms.data.pictures) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "pictures"]
						}));
					return fillSrvStdReqData(serverActions.uploadApartmentPicture + "/" + prms.data.apartId, serverMethods.ins, prms.data.pictures);
					break;
				}
				//работа с картинками недвижимости - удаление
				case (serverActions.removeApartmentPicture): {
					if(!prms.data.apartId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "apartId"]
						}));
					if(!prms.data.pictIds) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "pictIds"]
						}));
					return fillSrvStdReqData(serverActions.removeApartmentPicture + "/" + prms.data.apartId, serverMethods.del, prms.data.pictIds);
					break;
				}
				//работа с картинками профиля - загрузка
				case (serverActions.uploadProfilePicture): {
					if(!prms.data.profileId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "profileId"]
						}));
					if(!prms.data.picture) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "picture"]
						}));
					return fillSrvStdReqData(serverActions.uploadProfilePicture + "/" + prms.data.profileId, serverMethods.ins, prms.data.picture);
					break;
				}
				//работа с картинками профиля - удаление
				case (serverActions.removeProfilePicture): {
					if(!prms.data.profileId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "profileId"]
						}));
					return fillSrvStdReqData(serverActions.removeProfilePicture + "/" + prms.data.profileId, serverMethods.del, "");
					break;
				}
				//работа с картинками - установка картинки по умолчанию
				case (serverActions.setDefaultPicture): {
					if(!prms.data.pictId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "pictId"]
						}));
					return fillSrvStdReqData(serverActions.setDefaultPicture + "/" + prms.data.pictId, serverMethods.ins, "");
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
				//работа с заявками на бронирование - бронирование
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
				//работа с заявками на бронирование - получение списка
				case(serverActions.reservation): {
					return fillSrvStdReqData(serverActions.reservation + "s", serverMethods.get, "");
					break;
				}
				//работа с заявками на бронирование - подтверждение/отклонение
				case(serverActions.acceptDeclineReservation): {
					if(!prms.data) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					if(!prms.data.reservId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "reservId"]
						}));
					if(!prms.data.status) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "status"]
						}));
					return fillSrvStdReqData(serverActions.acceptDeclineReservation + "/" + prms.data.reservId + "/" + prms.data.status, serverMethods.ins, "");
					break;
				}
				//отзывы
				case(serverActions.review): {
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
						//считывание отзывов
						case(serverMethods.get): {
							if(!prms.data.reviewType) 
								throw new Error(Utils.getStrResource({
									lang: prms.language,
									code: "CLNT_NO_ELEM",
									values: ["ServerRequest", "reviewType"]
								}));
							return fillSrvStdReqData(serverActions.review + "s/" + prms.data.reviewType, serverMethods.get, "");
							break;
						}
						//добавление отзывов
						case(serverMethods.ins): {
							if(!prms.data.resId) 
								throw new Error(Utils.getStrResource({
									lang: prms.language,
									code: "CLNT_NO_ELEM",
									values: ["ServerRequest", "resId"]
								}));							
							return fillSrvStdReqData(serverActions.review + "/" + prms.data.resId, serverMethods.ins, prms.data);
							break;
						}
						//неизвестный метод
						default: {
							throw new Error("Метод '" + prms.method + "' для действия '" + prms.action + "' не поддерживается сервером!");
						}
					}					
					break;
				}
				//регистрация
				case(serverActions.register): {
					if(!prms.data)
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					if(!prms.data.email) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "email"]
						}));
					if(!prms.data.password) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "password"]
						}));
					return fillSrvStdReqData(serverActions.register, serverMethods.ins, prms.data);
					break;
				}
				//подтверждение регистрации
				case(serverActions.registerConfirm): {
					if(!prms.data)
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					if(!prms.data.userId) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "userId"]
						}));
					if(!prms.data.code) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "code"]
						}));
					return fillSrvStdReqData(serverActions.registerConfirm, serverMethods.ins, prms.data);
					break;
				}				
				//запрос на сброс пароля
				case(serverActions.resetPassword): {
					if(!prms.data)
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					if(!prms.data.email) 
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "email"]
						}));
					return fillSrvStdReqData(serverActions.resetPassword, serverMethods.ins, prms.data);
					break;
				}
				//смена/восстановление пароля
				case(serverActions.changePassword): {
					if(!prms.data)
						throw new Error(Utils.getStrResource({
							lang: prms.language,
							code: "CLNT_NO_ELEM",
							values: ["ServerRequest", "data"]
						}));
					return fillSrvStdReqData(serverActions.changePassword, serverMethods.ins, prms.data);
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
		} else {
			clnt.currentUser = {};
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
	//считывание/поиск объявлений
	var getAdverts = function (prms, callBack) {
		try {
			execServerApi({
				language: prms.language,
				session: prms.session,
				req: buildServerRequest({
					language: prms.language,
					action: serverActions.userAdvert,
					method: serverMethods.get,
					data: prms.filter
				}),
				callBack: function (resp) {
					if(resp.STATE == respStates.ERR)
						callBack(resp);
					else {
						resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);						
						resp.MESSAGE.map(function (item, i) {
							if(item.apartment) Utils.setApartmentDefaultPicture(item.apartment);
							if(item.user) Utils.setProfileDefaultPicture(item.user);
							if((item.reviews)&&(Array.isArray(item.reviews))) {
								item.reviews.map(function (review, i) {
									Utils.setProfileDefaultPicture(review.fromUser);
								}, this);
							}
						}, this);
						callBack(resp);
					}
				}
			});
		} catch (error) {
			log(["GETING ADVERS ERROR", error]);
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
										var profTmp =  Utils.deSerialize(stdResp.MESSAGE)[0];
										if(!profTmp.emailConfirmed) {
											callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, Utils.getStrResource({lang: prms.language, code: "SRV_USER_NOT_CONFIRMED"})));
										} else {											
											connectionData.user.profile = profTmp;
											callBack(fillSrvStdRespData(respTypes.DATA, respStates.OK, connectionData));
										}
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
		//аутентификация через VK
		loginVK: function () {
			log(["LOGIN VIA VK"]);
			clnt.login("VK").then(function () {
				log(["LOGIN VIA VK RESULT:", clnt.currentUser]);
			}, function (error) {
				log(["LOGIN VIA VK ERROR:", error]);
			});
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
		//формирование заявки на бронирование
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
				log(["MAKE RESERVATION ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//подтверждение/отклонение заявки на бронирование
		acceptDeclineReservation: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.acceptDeclineReservation,
						method: serverMethods.ins,
						data: {reservId: prms.reservId, status: prms.status}
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
				log(["PROCESS RESERVATION ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//считывание/поиск объявлений
		getAdverts: getAdverts,
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
				log(["ADD CARD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//исправление объявления
		updateAdvert: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userAdvert,
						method: serverMethods.upd,
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
				log(["UPDATE CARD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//удаление объявления
		removeAdvert: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userAdvert,
						method: serverMethods.del,
						data:  {postId: prms.postId}
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
				log(["REMOVE CARD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//загрузка картинки недвижимости пользователя
		uploadApartmentPicture: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.uploadApartmentPicture,
						method: serverMethods.ins,
						data: {
							apartId: prms.apartId,
							pictures: prms.pictures
						}
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
				log(["UPLOAD APARTMENT PICTURE ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//удаление картинки недвижимости пользователя
		removeApartmentPicture: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.removeApartmentPicture,
						method: serverMethods.del,
						data: {
							apartId: prms.apartId,
							pictIds: prms.pictIds
						}
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
				log(["REMOVE APARTMENT PICTURE ERROR", error]);
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
					var getAdvertsPrms = {
						language: prms.language, 
						filter: {userId: prms.profileId},
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
							if((!profileItem.picture)||(!profileItem.picture.url)) {
								profileItem.picture = {};
								profileItem.picture.url = config.defaultProfilePictureUrl;
								profileItem.picture.default = true;
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
		},
		//обновление профиля
		updateProfile: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.userProfile,
						method: serverMethods.upd,
						data:  prms.data
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
				log(["UPDATE PROFILE ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//загрузка картинки профиля
		uploadProfilePicture: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.uploadProfilePicture,
						method: serverMethods.ins,
						data: {
							profileId: prms.profileId,
							picture: prms.picture
						}
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
				log(["UPLOAD PROFILE PICTURE ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//удаление картинки профиля
		removeProfilePicture: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.removeProfilePicture,
						method: serverMethods.del,
						data: {profileId: prms.profileId}
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
				log(["REMOVE PROFILE PICTURE ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//установка картинки по умолчанию
		setDefaultPicture: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.setDefaultPicture,
						method: serverMethods.ins,
						data: {
							pictId: prms.pictId
						}
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
				log(["SET DEFAULT PICTURE ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//загрузка отзывов
		getReviews: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.review,
						method: serverMethods.get,
						data: {reviewType: prms.reviewType}
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							resp.MESSAGE.map(function (item, i) {
								if(item.reservation) {
									if(item.reservation.user) Utils.setProfileDefaultPicture(item.reservation.user);
									if(item.reservation.card) {
										if(item.reservation.card.user) Utils.setProfileDefaultPicture(item.reservation.card.user);
										if(item.reservation.card.apartment) Utils.setApartmentDefaultPicture(item.reservation.card.apartment);
									}
								}								
							}, this);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["GETING REVIEWS ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//добавление отзыва
		addReview: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.review,
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
				log(["ADDING REVIEW ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//загрузка заявок
		getReservations: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.reservation,
						method: serverMethods.get
					}),
					callBack: function (resp) {
						if(resp.STATE == respStates.ERR)
							callBack(resp);
						else {
							resp.MESSAGE = Utils.deSerialize(resp.MESSAGE);
							resp.MESSAGE.map(function (item, i) {
								if(item.card) {
									if(item.card.apartment) Utils.setApartmentDefaultPicture(item.card.apartment);									
								}
								if(item.user) Utils.setProfileDefaultPicture(item.user);
							}, this);
							callBack(resp);
						}
					}
				});
			} catch (error) {
				log(["GETING RESERVATIONS ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//регистрация
		register: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.register,
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
				log(["REGISTER ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//подтверждение регистрации
		registerConfirm: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.registerConfirm,
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
				log(["REGISTER CONFIRM ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//запрос на сброс пароля
		resetPassword: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.resetPassword,
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
				log(["RESET PASSWORD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//восстановление пароля (подтверждение)
		resetPasswordConf: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.changePassword,
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
				log(["RESET PASSWORD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},
		//смена пароля
		changePassword: function (prms, callBack) {
			try {
				execServerApi({
					language: prms.language,
					session: prms.session,
					req: buildServerRequest({
						language: prms.language,
						action: serverActions.changePassword,
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
				log(["CHANGE PASSWORD ERROR", error]);
				if(Utils.isFunction(callBack))
					callBack(fillSrvStdRespData(respTypes.STD, respStates.ERR, error.message));
			}
		},		
	}
}

var clnt = new Client({serverAppUrl: config.serverAppUrl, serverAppKey: config.serverAppKey});