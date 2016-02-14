/*
	Счетчик результатов поиска
*/
var PostsSearchCounter = React.createClass({
	//генерация представления счетчика
	render: function () {
		return (
				<h1 className="txt search-result">
					{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_FILTER_RESULT"})} – {this.props.cntFound}
				</h1>
		);
	}
});
