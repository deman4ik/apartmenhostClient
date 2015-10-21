/*
	Меню упрвления сесией
*/
var AuthMenu = React.createClass({
	//состояние меню
	getInitialState: function () {
		return {
		}
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
		this.props.onLogIn({actionType: AppAfterAuthActionTypes.REDIRECT, actionPrms: {link: "/"}});
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
		this.props.onLogOut();
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function() {
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