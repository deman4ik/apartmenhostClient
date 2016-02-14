/*
	Индикатор процесса
*/	
var Loader = React.createClass({
	//генерация представления индиктора
	render: function () {
		//генерация индикатора
		return (
			<div className="u-block-loader-bg show">
				<span className="spinner" title={this.props.loader.title}></span>
			</div>			
		);
	}
});