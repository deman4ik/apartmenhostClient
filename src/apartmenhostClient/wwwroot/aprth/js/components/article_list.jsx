/*
	Список статей
*/
var ArticleList = React.createClass({
	//состояние списка статей
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
	//генерация представления списка тем
	render: function () {
		//список статей
		var articles;
		if((this.props.articles)&&(Array.isArray(this.props.articles))) {
			articles = this.props.articles.map(function (item, i) {
				return (
					<div key={i}>
						<Article article={item}/>
					</div>
				);
			}, this);
		}
		//генератор		
		return (
			<div>
				{articles}
			</div>
		);
	}
});