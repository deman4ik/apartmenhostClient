/*
	Темы статей
*/
var ArticlesTopics = React.createClass({
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
	//обработка нажатия на элемент
	onTopicClick: function (index) {
		if((this.props.onTopicChange)&&(Utils.isFunction(this.props.onTopicChange))) {
			this.props.onTopicChange(index);
		}
	},
	//генерация представления списка тем
	render: function () {
		var topics;
		if((this.props.topics)&&(Array.isArray(this.props.topics))) {
			topics = this.props.topics.map(function (item, i) {
				var itemText = item;
				if(i == this.props.current) {
					itemText = "[[" + itemText + "]]";
				}
				return (
					<li key={i}>
						<a href="javascript:void(0);" onClick={this.onTopicClick.bind(this, i)}>
							{itemText}
						</a>
					</li>
				);
			}, this);
		}
		//генератор		
		return (
			<div>
				<ul>
					{topics}
				</ul>
			</div>
		);
	}
});