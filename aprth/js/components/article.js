/*
	Статья
*/
var Article = React.createClass({
	//состояние статьи
	getInitialState: function () {
		return {
		}
	},
	//форммирование содержимого сатьи
	createArticleText: function (text) {
		$("#ArticleText").html(text);		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.createArticleText(this.props.article.text)
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {		
		if(newProps.article.text != this.props.article.text)
			this.createArticleText(newProps.article.text);		
	},
	//генерация представления статьи
	render: function () {
		//заголовок статьи
		var title;
		if(!this.props.hideTitle) {
			title = <h2>{this.props.article.title}</h2>
		}
		//генератор		
		return (
			<div className="w-row">
				<div className="w-col w-col-9 u-col-howto">
					{title}
					<p id={"ArticleText"}></p>
				</div>
			</div>
		);
	}
});