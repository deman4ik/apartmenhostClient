/*
	Статья
*/
var Article = React.createClass({
	//состояние страницы статьи
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
	//генерация представления статьи
	render: function () {
		//генератор		
		return (
			<div>
				<div>
					<div><b>{this.props.title}</b></div>
					<div>{this.props.text}</div>
				</div>
			</div>
		);
	}
});