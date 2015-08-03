/*
	Корневой класс приложения
*/
//типы действий после аутентификации
var AppAfterAuthActionTypes = {
	NOTHING: "nothing", //не делать ничего
	CALLBACK: "callback", //вызов указанной функции
	REDIRECT: "redirect" //редирект текущей локации
}
//класс приложения
var App = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func, //ссылка на роутер
	},
	//глобальное состояние приложения
	getInitialState: function () {
		return {
			//флаг готовности приложения к работе
			appReady: false,
			//язык приложения
			language: "",
			//признак доступности мультиязычного интерфейса
			languageEnabled: "",
			//выполняется процесс входа в систему
			loggingIn: false,
			//действие после входа/выхода
			afterAuth: {
				actionType: "", //выполняемое действие из списка AppAfterAuthActionTypes
				actionPrms: { //параметры действия
					link: "", //путь для редиректа
					callBack: "", //функция для вызова
					prms: {} //параметры редиректа или функции
				}
			},
			//состояние сессии
			session: {
				loggedIn: false, //состояние входа в систему
				sessionInfo: {} //данные сессии
			},
			//отображение индикатора загрузки
			loading: false,
			//состояние индикатора загрузки
			loaderState: {
				title: "", //заголовок
				text: "" //текст
			},
			//отображение диалога сообщения
			message: false,
			//состояние диалога сообщения
			messageState: {
				type: Utils.getMessageTypeInf(), //тип
				title: "", //заголовок
				text: "" //текст
			},
		};
	},
	//инициализация объекта описывающего поведение системы после входа/выхода
	initAfterAuth: function () {
		return {
			actionType: "",
			actionPrms: {
				link: "",
				callBack: "",
				prms: {}
			}
		}
	},
	//отработка действия после входа/выхода
	processAfterAuth: function () {
		//работаем от типа действия
		switch(this.state.afterAuth.actionType) {
			//редирект
			case(AppAfterAuthActionTypes.REDIRECT): {
				this.context.router.transitionTo(
					this.state.afterAuth.actionPrms.link, 
					this.state.afterAuth.actionPrms.prms);
				break;
			}
			//вызов функции
			case(AppAfterAuthActionTypes.CALLBACK): {
				this.state.afterAuth.actionPrms.callBack(this.state.afterAuth.actionPrms.prms);
			}
			default: {}
		}
	},
	//установка языка приложения
	setLanguage: function (language) {
		this.setState({language: language});
	},
	//отображение индикатора процесса
	showLoader: function (title, text) {
		this.setState({loading: true, loaderState: {title: title, text: text}});
	},
	//сокрытие индикатора процесса
	hideLoader: function () {
		this.setState({loading: false});
		fixFooter();
	},
	//отображение диалога сообщения
	showDialogMessage: function (title, text) {
		this.setState({message: true, messageState: {type: Utils.getMessageTypeInf(), title: title, text: text}});
	},
	//отображение диалога ошибки
	showDialogError: function (title, text) {
		this.setState({message: true, messageState: {type: Utils.getMessageTypeErr(), title: title, text: text}});
	},
	//сокрытие диалога сообщения и ошибки
	hideDialog: function () {
		this.setState({message: false});
	},
	//нажатие на кнопку "Войти"
	handleLogIn: function (prms) {
		var afterAuthTmp = this.initAfterAuth();
		if(prms) {
			if(("actionType" in prms)&&("actionPrms" in prms)) {
				//работаем от типа действия
				switch(prms.actionType) {
					//редирект
					case(AppAfterAuthActionTypes.REDIRECT): {
						if(prms.actionPrms.link) {
							afterAuthTmp.actionType = AppAfterAuthActionTypes.REDIRECT;
							afterAuthTmp.actionPrms.link = prms.actionPrms.link;
						}
						if(prms.actionPrms.prms) {
							afterAuthTmp.actionPrms.prms = prms.actionPrms.prms;
						}
						break;
					}
					//вызов функции
					case(AppAfterAuthActionTypes.CALLBACK): {
						if(prms.actionPrms.callBack) {
							afterAuthTmp.actionType = AppAfterAuthActionTypes.CALLBACK;
							afterAuthTmp.actionPrms.callBack = prms.actionPrms.callBack;
						}
						if(prms.actionPrms.prms) {
							afterAuthTmp.actionPrms.prms = prms.actionPrms.prms;
						}						
					}
					default: {}
				}
			}
		}
		_.extend(this.state.afterAuth, afterAuthTmp);
		this.setState({loggingIn: true, afterAuth: afterAuthTmp});
	},
	//обработка результатов выполнения входа в систему
	handleLogInOk: function (sessionInfo) {
		this.setState(
			{
				loggingIn: false, 
				session: {loggedIn: true, sessionInfo: sessionInfo}
			}, 
			function () {
				Utils.saveObjectState("sessionState", this.state.session);
				this.processAfterAuth();
			}
		);
	},
	//отмена входа в систему
	handleLogInCancel: function () {
		this.setState({loggingIn: false});
	},
	//нажатие на кнопку "Выйти"
	handleLogOut: function () {		
		var afterAuthTmp = _.extend(
			this.initAfterAuth(), 
			{actionType: AppAfterAuthActionTypes.REDIRECT, actionPrms: {link: "/"}}
		);
		_.extend(this.state.afterAuth, afterAuthTmp);
		this.setState(
			{
				session: {loggedIn: false, sessionInfo: {}},
				afterAuth: afterAuthTmp
			}, 
			function () {
				Utils.deleteObjectState("sessionState");
				Utils.deleteObjectState("filterParams");
				this.processAfterAuth();
			}
		);
	},
	//выбор пункта главного меню
	handleMenuItemSelected: function (menuItem) {
	},
	//смена языка интерфейса
	handleLanguageChange: function (language) {
		this.setLanguage(language);
	},
	//смена размеров окна
	handleResize: function () {
		fixFooter();
	},
	//изменение профиля пользователя
	handleProfileChange: function (newProfile) {		
		if(this.state.session.loggedIn) {			
			var tmp = {};
			_.extend(tmp, this.state.session);
			_.extend(tmp.sessionInfo, newProfile);
			_.extend(tmp.sessionInfo.user.profile, newProfile);
			this.setState({session: tmp}, Utils.bind(function () {Utils.saveObjectState("sessionState", this.state.session);}, this));
		}		
	},
	//инициализация при старте приложения
	componentDidMount: function () {
		var sessionState = Utils.loadObjectState("sessionState");
		this.handleResize();
		window.addEventListener("resize", this.handleResize);
		if(sessionState) {
			this.setState({session: sessionState, 
				language: config.languageDefault,
				languageEnabled: config.languagesEnabled,
				appReady: true
			});
		} else {
			this.setState({language: config.languageDefault,
				languageEnabled: config.languagesEnabled,
				appReady: true
			});
		}
	},
	//завершение перерисовки состояния
	componentDidUpdate: function (prevProps, prevState) {
	},
	//генерация приложения
	render: function () {
		//индикатор процесса
		var loader;		
		if(this.state.loading) loader = <Loader loader={this.state.loaderState}/>;
		//диалог сообщения
		var message;
		if(this.state.message) message =	<MessageBox message={this.state.messageState} 
												language={this.state.language}
												onClose={this.hideDialog}/>;
		//диалог входа в систему
		var logInForm;
		if(this.state.loggingIn) logInForm =	<LogInForm onLogInCancel={this.handleLogInCancel} 
													onLogInOk={this.handleLogInOk}
													onDisplayProgress={this.showLoader}
													onHideProgress={this.hideLoader}
													onShowError={this.showDialogError}
													defaultUser={config.demoUser}
													defaultPassword={config.demoPassword}
													language={this.state.language}/>;
		//навигация
		var navBar;
		navBar =	<NavBar session={this.state.session}
						onLogIn={this.handleLogIn}
						onLogOut={this.handleLogOut}
						onShowError={this.showDialogError}
						language={this.state.language}						
						onMenuItemSelected={this.handleMenuItemSelected}/>;
		//подвал
		var footer;
		footer =	<Footer session={this.state.session} 
						language={this.state.language}
						languageEnabled={this.state.languageEnabled}
						onLangugeChange={this.handleLanguageChange}/>
		//общее содержимое
		var content;
		if(this.state.appReady) {
			content = 	<section className="u-sect-main">
							{loader}
							{message}
							{logInForm}
							{navBar}
							<div className="content_wrapper">
								<RouteHandler session={this.state.session}
									onLogIn={this.handleLogIn}
									onDisplayProgress={this.showLoader}
									onHideProgress={this.hideLoader}
									onShowError={this.showDialogError}
									onShowMessage={this.showDialogMessage}
									onProfileChange={this.handleProfileChange}
									language={this.state.language}/>
							</div>							
						</section>
		}
		//генератор
		return (
			<div>
				{content}
				{footer}
			</div>
		);
	}
});
//инициализация роутера
var routes = (
	<Route name="app" handler={App} path="/">
		<Route name="main" handler={Main}/>
		<Route name="search" handler={PostsSearch}/>
		<Route name="favorites" handler={PostsFavorites}/>
		<Route name="article" handler={Article} path="articles/:articleId"/>
		<Route name="profile" handler={Profile}/>
		<Route name="modifypost" handler={ModifyPost} path="modifypost/:mode"/>
		<Route name="post" handler={Post}  path="posts/:postId"/>
		<Route name="confirm" handler={RegConfirm}/>
		<DefaultRoute handler={DefaultPage}/>
		<NotFoundRoute handler={Unit404}/>		
		<Redirect from="/" to="/main"/>
	</Route>	
);
//запуск роутера
Router.run(routes, function (Handler) {
	React.render(<Handler/>, document.getElementById("application"));
});