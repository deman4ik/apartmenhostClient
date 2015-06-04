/*
	Панель навигации
*/
var NavBar = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние панели навигации
	getInitialState: function () {
		return {
			//признак открытости меню (в мобильном виде)
			menuOpen: false
		}
	},				
	//обработка нажатия на заголовок
	handleTitleClick: function () {
		this.context.router.transitionTo("main");
	},
	//обработка нажатия на кнопку отображения меню (в мобильном виде)
	handleNavButtonClick: function () {
		this.setState({menuOpen: !this.state.menuOpen})
	},
	//обработка нажатия на пункт меню
	handleMenuItemClick: function (menuItem) {
		this.setState({menuOpen: false});
		this.props.onMenuItemSelected(menuItem);
	},
	//рендеринг представления панели навигации
	render: function () {
		//дополнительные стили для пункта меню
		var aStyle = {textDecoration: "none"}
		var cNavBtn = React.addons.classSet;
		var classesNavBtn = cNavBtn({			 
			"w-nav-button": true,
			"u-nav-button": true,
			"w--open": this.state.menuOpen
		});
		//главное меню
		var mainMenu;
		mainMenu =	<MainMenu session={this.props.session}						
						onMenuItemSelected={this.handleMenuItemClick}
						onLangugeChange={this.props.onLangugeChange}
						onLogIn={this.props.onLogIn}
						onLogOut={this.props.onLogOut}
						language={this.props.language}
						menuOpen={this.state.menuOpen}/>;
		//генерация представления
		return (
			<div className="w-section u-sect-page-header">
				<div className="w-nav u-navbar-header" 
					data-collapse="medium" 
					data-animation="over-right" 
					data-duration="400" 
					data-contain="1">
					<div className="w-container u-nav-content">
						<a className="w-nav-brand" style={aStyle} href="javascript:;" onClick={this.handleTitleClick}>
							<img className="u-img-complogo" src="aprth/img/logo.png" width="72"/>
							<div className="u-t-comptitle">
								{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_APP"})}
							</div>
						</a>
						{mainMenu}
						<div className={classesNavBtn}>
							<div className="w-icon-nav-menu u-nav-icon" onClick={this.handleNavButtonClick}></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});