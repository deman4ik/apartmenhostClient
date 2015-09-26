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
		var image;
		if(this.props.imageURL) {
			image = <img height={128} width={128} src={this.props.imageURL}/>
		}
		//генератор		
		return (
			<div>
				<div>
					<div><b>{this.props.title}</b></div>
					{image}
					<div>{this.props.text}</div>
				</div>
			</div>
		);
	}
});