/*
	Страница статьи
*/
var Article = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние страницы статьи
	getInitialState: function () {
		return {
			articleId: ""
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {		
		this.setState({articleId: this.context.router.getCurrentParams().articleId});
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		this.setState({articleId: this.context.router.getCurrentParams().articleId});
	},
	//генерация представления страницы статьи
	render: function () {
		//генератор		
		return (
			<div className="empty-unit">
				<div className="content-center">
					<InLineMessage type={Utils.getMessageTypeInf()} message={this.state.articleId}/>
				</div>
			</div>
		);
	}
});