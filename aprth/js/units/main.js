/*
	Главная страница
*/
var Main = React.createClass({
	//состояние главной страницы
	getInitialState: function () {
		return {			
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления главной страницы
	render: function () {
		//сообщение по умолчанию
		var underConstrMessage = Utils.getStrResource({lang: this.props.language, code: "UI_UNIT_UNDER_CONSTRUCTION"})
		//генератор		
		return (
			<div className="empty-unit">
				<div className="content-center">
					<h1 className="text-center">{underConstrMessage}</h1>
				</div>
			</div>
		);
	}
});