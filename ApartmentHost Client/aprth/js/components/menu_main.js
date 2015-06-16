/*
	Главное меню приложения
*/
var MainMenu = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние меню
	getInitialState: function () {
		return {
			//пункты меню
			menu: {},
			//готовность меню к отображению
			menuReady: false
		}
	},
	//обработка нажатия пункта меню
	handleMenuItemClick: function (itemIndex) {
		this.props.onMenuItemSelected(this.state.menu.items[itemIndex]);
		this.context.router.transitionTo(this.state.menu.items[itemIndex].link);		
	},
	//обработка нажатия на кнопку сдачи квартиры
	handleAddPostClick: function () {
		this.props.onMenuItemSelected({
			code: "Lease", 
			title: "UI_BTN_LEASE", 
			link: "addpost",
			path: "/addpost",
			authAccess: false
		});
		if(this.props.session.loggedIn)
			this.context.router.transitionTo("addpost");
		else
			this.props.onLogIn({actionType: AppAfterAuthActionTypes.REDIRECT, actionPrms: {link: "addpost"}});
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function () {
		var menuTmp = Utils.getMenuObject("MAIN_MENU");
		if(menuTmp) {
			this.setState({menu: menuTmp, menuReady: true}, function () {
				Webflow.require("navbar").destroy();
				Webflow.require("navbar").ready();
			});
		}
	},	
	//генерация представления главного меню
	render: function () {
		//дополнительные стили для пункта меню
		var aStyle = {textDecoration: "none"}
		var cNav = React.addons.classSet;
		var classesNav = cNav({
			"w-nav-menu": true,
			"u-nav-menu": true,
			"w--nav-menu-open": this.props.menuOpen
		});
		//меню управления сессией
		var authMenu;
		authMenu =	<AuthMenu session={this.props.session}
						onLogIn={this.props.onLogIn}
						onLogOut={this.props.onLogOut}
						onMenuItemSelected={this.props.onMenuItemSelected}
						language={this.props.language}/>;
		//пункты главного меню
		var items;
		if(this.state.menuReady) {
			items = this.state.menu.items.map(function (menuItem, i) {
				if((!menuItem.authAccess)||(this.props.session.loggedIn == menuItem.authAccess)) {
					var cItem = React.addons.classSet;
					var classesItem = cItem({
						"w-nav-link": true,
						"u-nav-link": true,
						"w--current": (this.context.router.getCurrentPathname() == menuItem.path)
					});
					return (
						<a className={classesItem} 
							key={i}
							href="javascript:;"
							style={aStyle}
							onClick={this.handleMenuItemClick.bind(this, i)}>
								{Utils.getStrResource({lang: this.props.language, code: menuItem.title})}
						</a>
					);
				}
			}, this);
		}
		//кнопка "Сдать жильё"
		var rentButton = 	<a className="u-btn nav" href="javascript:;" style={aStyle} onClick={this.handleAddPostClick}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LEASE"})}
							</a>;

		//генерация представления меню
		return (
			<nav className={classesNav} role="navigation">
				{items}
				{authMenu}
				{rentButton}
			</nav>
		);
	}
});