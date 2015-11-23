/*
	Список заголовков статей
*/
var ArticleTopicsList = React.createClass({
	//состояние списка заголовков статей
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
	//обработка нажатия на элемент
	onTopicClick: function (index) {
		if((this.props.onTopicChange)&&(Utils.isFunction(this.props.onTopicChange))) {
			this.props.onTopicChange(index);
		}
	},
	//генерация представления списка тем
	render: function () {
		//список заголовков
		var topics;
		if((this.props.topics)&&(Array.isArray(this.props.topics))) {
			topics = this.props.topics.map(function (item, i) {
				//стиль элемента
				var cTitle = React.addons.classSet;
				var classesTitle = cTitle({
					"u-t-article-topic": true,
					"active": (i == this.props.current)
				});				
				//генерация элемента ссписка тем
				return (
					<h2 key={i} 
						onClick={this.onTopicClick.bind(this, i)}
						className={classesTitle}>
						{item}
					</h2>
				);
			}, this);
		}
		//генератор		
		return (
			<div name="article_topics">
				{topics}
			</div>
		);
	}
});