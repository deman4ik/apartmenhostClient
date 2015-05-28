/*
	Панель навигации
*/
var NavBar = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//обработка нажатия на заголовок
	handleTitleClick: function () {
		this.context.router.transitionTo("main");
	},
	//рендеринг представления панели навигации
	render: function () {
		//дополнительные стили для пункта меню
		var aStyle = {textDecoration: "none"}
		//главное меню
		var mainMenu;
		mainMenu =	<MainMenu session={this.props.session}						
						onMenuItemSelected={this.props.onMenuItemSelected}
						onLangugeChange={this.props.onLangugeChange}
						onLogIn={this.props.onLogIn}
						onLogOut={this.props.onLogOut}
						language={this.props.language}/>;
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
						<div className="w-nav-button u-nav-button">
							<div className="w-icon-nav-menu u-nav-icon"></div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});