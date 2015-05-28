/*
	Список объявлений
*/
var PostsList = React.createClass({
	//состояние списка
	getInitialState: function () {
		return {			
		};
	},
	//инициализация списка
	componentDidMount: function () {
	},
	//обновление параметров списка
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления списка
	render: function () {
		//элементы списка
		var items = this.props.items.map(function (item, i) {
			return (
				<PostItem onFavorChange={this.props.onFavorChange}
					onItemClick={this.props.onItemClick}
					language={this.props.language}
					item={item}/>
			);
		}, this);
		//представление списка
		return (
			<div>
				<div className="u-block-cardlst">
					{items}
				</div>
			</div>
		);
	}
});