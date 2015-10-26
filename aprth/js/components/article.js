/*
	Статья
*/
var Article = React.createClass({
	//состояние статьи
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
			<div className="w-row">
				<div className="w-col w-col-3">
					<h2>{this.props.article.title}</h2>
				</div>
				<div className="w-col w-col-9">
					<p>{this.props.article.text}</p>
				</div>
			</div>
		);
	}
});