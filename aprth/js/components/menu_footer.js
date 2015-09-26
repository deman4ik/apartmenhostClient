/*
	Главное меню подвала приложения
*/
var FooterMainMenu = React.createClass({
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
	//обработка нажатия на пункт меню
	onFooterMenuClick: function (menuItem) {
		this.context.router.transitionTo(menuItem.link, menuItem.linkParams, menuItem.linkQuery);
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function () {
		var menuTmp = Utils.getMenuObject("FOOTER_MENU");
		if(menuTmp) {
			this.setState({menu: menuTmp, menuReady: true});
		}
	},
	//генерация представления главного меню подвала
	render: function () {
		//рендер пунктов меню для указанной колонки меню
		var renderItems = function (colNumb, self) {
			var items = _.where(self.state.menu.items, {col: colNumb}).map(function (menuItem, i) {
				if((!menuItem.authAccess)||(self.props.session.loggedIn == menuItem.authAccess)) {
					return (
						<a key={i} className="u-lnk-footer2" href="javascript:void(0);" onClick={self.onFooterMenuClick.bind(self, menuItem)}>
							{Utils.getStrResource({lang: self.props.language, code: menuItem.title})}							
						</a>
					);
				}
			});
			return items;
		}
		//меню
		var menu;
		if(this.state.menuReady) {
			//если определены колонки
			if((this.state.menu.cntCols)&&(this.state.menu.cntCols > 0)) {
				//обходим колонки
				var cols = [];
				for(var i = 1; i <= this.state.menu.cntCols; i++) cols.push(i);
				menu = cols.map(function (colNumb, i) {
					//генерируем пункты для колонки
					var colItems = renderItems(colNumb, this);					
					//генерируем колонку с пунктами
					return (
						<div key={i} className="w-col w-col-4 w-col-small-4 w-col-tiny-4 u-col-footer">
							{colItems}							
						</div>
					);
				}, this);
			}			
		}
		//генерация представления меню
		return (
			<div>  
				{menu}						
			</div>
		);
	}
});