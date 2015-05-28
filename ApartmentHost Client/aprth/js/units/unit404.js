/*
	Страница для ошибки 404
*/
var Unit404 = React.createClass({
	//генерация представления страницы 404
	render: function () {
		//сообщение об отсутствии адреса
		var notFoundMessage = Utils.getStrResource({lang: this.props.language, code: "UI_UNIT_NOT_FOUND"})
		//генератор
		return (
			<div className="empty-unit">
				<div className="content-center">
					<InLineMessage type={Utils.getMessageTypeErr()} message={notFoundMessage}/>
				</div>
			</div>
		);
	}
});