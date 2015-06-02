/*
	Меню социальных сервисов подвала приложения
*/
var FooterSocialMenu = React.createClass({
	//состояние меню
	getInitialState: function () {
		return {
			//пункты меню
			menu: {},
			//готовность меню к отображению
			menuReady: false
		}
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function () {
		var menuTmp = Utils.getMenuObject("FOOTER_MENU_SOCIAL");
		if(menuTmp) {
			this.setState({menu: menuTmp, menuReady: true});
		}
	},
	//генерация представления социального меню подвала
	render: function () {
		//дополнительные стили для пункта меню
		var aStyle = {textDecoration: "none"}
		//пункты меню
		var menuItems;
		if(this.state.menuReady) {
			menuItems = this.state.menu.items.map(function (menuItem, i) {
				if((!menuItem.authAccess)||(this.props.session.loggedIn == menuItem.authAccess)) {
					return (
						<a className="w-inline-block u-lnk-footer-social" href={menuItem.link} target="blank" style={aStyle}>
							<div>{Utils.getStrResource({lang: this.props.language, code: menuItem.title})}</div>
						</a>						
					);
				}
			}, this);
		}
		//генерация представления меню
		return (
			<div className="w-col w-col-8 w-col-small-8 w-col-tiny-8">
				{menuItems}
			</div>			
		);
	}
});