/*
	Календарь
*/
var Calendar = React.createClass({
	//состояние компонента
	getInitialState: function () {
		return {			
		}
	},
	//подключение к слушателю смены значения
	applyDatePickedListener: function (props) {
		$("#" + props.name).on("changeDate", function (e) {
			props.onDatePicked(props.name, e.date);
		});
	},
	//отключение от слушателя смены значения
	chancelDatePickedListener: function (props) {
		$("#" + props.name).off("changeDate");
	},
	//применение значения по умолчанию
	applyDefaultValue: function (props) {		
		if(props.defaultValue) {
			$("#" + props.name).datepicker("setDate", props.defaultValue);
		} else {
			$("#" + props.name).datepicker("setDate", "");
		}		
	},
	//инициализация виджета календаря
	initDatePicker: function (props) {
		$("#" + props.name).datepicker({
			language: Utils.getStrResource({lang: props.language, code: "CALENDAR"}),
			format: Utils.getStrResource({lang: props.language, code: "DATE_FORMAT"}),
			autoclose: true,
			clearBtn: true,
			todayHighlight: true,
			disableTouchKeyboard: true,
			multidate: false,
			multidateSeparator: ";"
		});			
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.initDatePicker(this.props);
		this.applyDefaultValue(this.props);
		this.applyDatePickedListener(this.props);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//сборка представления компонента
	render: function () {
		//дополнительные стили
		dStyle = {display: "inline"};
		//финальная сборка
		return (
			<div style={dStyle}>
				<input id={this.props.name}
					className={this.props.inputClasses} 
					placeholder={this.props.placeholder}/>				
			</div>
		);
	}
});