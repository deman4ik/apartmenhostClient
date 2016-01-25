/*
	Меню упрвления сесией
*/
var AuthMenu = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние меню
	getInitialState: function () {
		return {
		}
	},
	//перерисовка текущего состояния окно браузера
	reloadWindow: function () {
		this.context.router.refresh();
	},
	//обработка нажатия на "Вход"
	handleLogIn: function () {
		this.props.onMenuItemSelected({
			code: "LogIn", 
			title: "UI_MENU_AUTH_LOGIN", 
			link: "main",
			path: "/main",
			authAccess: false
		});
		this.props.onLogIn({
			actionType: AppAfterAuthActionTypes.CALLBACK, 
			actionPrms: {callBack: this.reloadWindow, prms: {}}
		});
	},
	//обработка нажатия на "Выход"
	handleLogOut: function () {
		this.props.onMenuItemSelected({
			code: "LogOut", 
			title: "UI_MENU_AUTH_LOGOUT", 
			link: "main",
			path: "/main",
			authAccess: false
		});
		this.props.onLogOut({
			actionType: AppAfterAuthActionTypes.CALLBACK, 
			actionPrms: {callBack: this.reloadWindow, prms: {}}
		});
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function() {
		console.log(this.context.router.refresh);
	},	
	//генерация представления меню
	render: function () {
		//дополнительные стили для пункта меню
		var aStyle = {textDecoration: "none"}
		//текст и обработчик пункта меню аутентификации
		var text;
		var onClickHandler;
		//определяем текст и обработчик от состояния сессии
		if(!this.props.session.loggedIn) {
			text = Utils.getStrResource({lang: this.props.language, code: "UI_MENU_AUTH_LOGIN"});
			onClickHandler = this.handleLogIn;
		} else {
			text = Utils.getStrResource({lang: this.props.language, code: "UI_MENU_AUTH_LOGOUT"}) + ": " 
					+ ((this.props.session.sessionInfo.user.profile.firstName)?this.props.session.sessionInfo.user.profile.firstName:this.props.session.sessionInfo.user.profile.email);
			onClickHandler = this.handleLogOut;
		}
		return (
			<a className="w-nav-link u-nav-link"
				href="javascript:void(0);"
				onClick={onClickHandler}
				style={aStyle}>
				{text}
			</a>
		);
	}
});