/*
	Профиль пользователя
*/
var Profile = React.createClass({
	//генерация представления страницы по-умолчанию
	render: function () {
		//сообщение по умолчанию
		var underConstrMessage = Utils.getStrResource({lang: this.props.language, code: "UI_UNIT_UNDER_CONSTRUCTION"})
		//генератор
		return (
			<div className="empty-unit">
				<div className="content-center"><h1 className="text-center">{underConstrMessage}</h1></div>
			</div>
		);
	}
});