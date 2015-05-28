/*
	Индикатор процесса
*/	
var Loader = React.createClass({
	//генерация представления индиктора
	render: function () {
		//дополнительный стиль для ячейки таблицы
		var tdStyle = {paddingRight: "15px"};
		//генерация индикатора
		return (
			<div className="loading-wraper">
				<center>
					<div className="panel panel-warning panel-loading">
						<div className="panel-body bg-warning">
							<table>
								<tr>
									<td style={tdStyle}>
										<img src="aprth/img/loader.gif"/>
									</td>
									<td>
										<strong className="text-warning loaderBoxTitleText">{this.props.loader.title}</strong>&nbsp;
										<span className="text-warning loaderBoxBodyText">{this.props.loader.text}</span>
									</td>
								</tr>
							</table>
						</div>
					</div>
				</center>
			</div>
		);
	}
});