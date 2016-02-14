/*
	Объект для аутентификации пользователя
*/
var AuthFactory = function () {
	//формирование записи объекта аутентификации
	var buildFn = function (params) {
		if(!params)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!params.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!params.userName) 
			throw new Error(Utils.getStrResource({lang: params.language, code: "CLNT_AUTH_NO_USER_NAME"}));
		if(!params.userPass) 
			throw new Error(Utils.getStrResource({lang: params.language, code: "CLNT_AUTH_NO_PASSWORD"}));
		return {
			firstName: params.firstName,
			userName: params.userName,
			userPass: params.userPass
		}
	}
	//формирование записи объекта аутентификации для передачи серверу при выполнении входа в систему
	var buildLogInFn = function (auth) {
		if(!auth)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!auth.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!auth.userName)
			throw new Error(Utils.getStrResource({lang: auth.language, code: "CLNT_AUTH_NO_USER_NAME"}));
		if(!auth.userPass)
			throw new Error(Utils.getStrResource({lang: auth.language, code: "CLNT_AUTH_NO_PASSWORD"}));
		return Utils.serialize({"email": auth.userName, "password": auth.userPass});
	}
	//формирование записи объекта аутентификации для передачи серверу при регистрации в системе
	var buildRegisterFn = function (auth) {
		if(!auth)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_OBJECT"}));
		if(!auth.language)
			throw new Error(Utils.getStrResource({code: "CLNT_NO_LANGUAGE"}));
		if(!auth.firstName)
			throw new Error(Utils.getStrResource({lang: auth.language, code: "CLNT_REGISTER_NO_FIRST_NAME"}));
		if(!auth.userName)
			throw new Error(Utils.getStrResource({lang: auth.language, code: "CLNT_AUTH_NO_USER_NAME"}));
		if(!auth.userPass)
			throw new Error(Utils.getStrResource({lang: auth.language, code: "CLNT_AUTH_NO_PASSWORD"}));
		return {"firstName": auth.firstName, "email": auth.userName, "password": auth.userPass};
	}
	//публичные члены класса (интерфейс)
	return {
		build: buildFn,
		buildLogIn: buildLogInFn,
		buildRegister: buildRegisterFn
	}
}

//фабрика формирования объектов аутентификации пользователя
var authFactory = new AuthFactory();