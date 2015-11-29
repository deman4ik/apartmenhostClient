/*
	Меню упрвления языком интерфейса
*/
var LangMenu = React.createClass({	
	//состояние меню
	getInitialState: function () {
		return {
			//поддерживаемые языки
			langs: []
		}
	},
	//обработка нажатия пункта меню
	handleLanguageClick: function (languageIndex) {		
		this.props.onLangugeChange(this.state.langs[languageIndex]);
	},
	//инициализация компонента при подключении к страничке
	componentDidMount: function() {
		this.setState({langs: Utils.getSupportedLanguages()});		
	},	
	//генерация представления меню
	render: function () {
		//элементы списка выбора языка
		var languageItems = this.state.langs.map(function (langItem, i) {
			var aStyle = {textDecoration: "none"};
			var cAncor = React.addons.classSet;
			var classesAncor = cAncor({
				"w-inline-block": true,
				"u-lnk-lang": true,
				"current": (this.props.language == langItem)
			});
			return (
				<a className={classesAncor}
					href="javascript:void(0);"
					style={aStyle}
					onClick={this.handleLanguageClick.bind(this, i)}>
						<div>{langItem}</div>
				</a>
			);
		}, this);
		return (
			<div className="w-col w-col-2 w-col-small-2 w-col-tiny-2 u-col-lang">
				{languageItems}				
			</div>
		);
	}
});