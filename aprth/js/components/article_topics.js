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
					"article-topic": true,
					"article-topic-active": (i == this.props.current)
				});				
				//генерация элемента ссписка тем
				return (
					<div key={i} 
						onClick={this.onTopicClick.bind(this, i)}
						className={classesTitle}>
						<h2>{item}</h2>
					</div>
				);
			}, this);
		}
		//генератор		
		return (
			<div>
				{topics}
			</div>
		);
	}
});