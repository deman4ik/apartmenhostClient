/*
	Календарь
*/
var Calendar = React.createClass({
	//состояние компонента
	getInitialState: function () {
		return {			
		}
	},
	//оповещение родителя о смене даты
	notifyParentDatePicked: function (props, date) {
		if((props.onDatePicked)&&(Utils.isFunction(props.onDatePicked))) {
			props.onDatePicked(props.name, date);
		}
	},
	//подключение к слушателю смены значения
	applyDatePickedListener: function (props) {
		$("#" + props.name).on("changeDate", Utils.bind(function (e) {
			this.notifyParentDatePicked(props, e.date);
		}, this));
	},
	//отключение от слушателя смены значения
	chancelDatePickedListener: function (props) {
		$("#" + props.name).off("changeDate");
	},
	//применение значения по умолчанию
	applyDefaultValue: function (props) {
		if(props.defaultValue) {
			$("#" + props.name).datepicker("setDate", props.defaultValue);
		}
	},
	//очистка значения
	clearValue: function (props) {
		$("#" + props.name).datepicker("clearDates");
	},
	//инициализация виджета календаря
	initDatePicker: function (props) {
		var datesDisabled = [];
		if(props.disabledDates) datesDisabled = props.disabledDates;
		$("#" + props.name).datepicker({
			language: Utils.getStrResource({lang: props.language, code: "CALENDAR"}),
			format: Utils.getStrResource({lang: props.language, code: "DATE_FORMAT"}),
			autoclose: true,
			clearBtn: true,
			todayHighlight: true,
			disableTouchKeyboard: true,
			multidate: false,
			multidateSeparator: ";",
			datesDisabled: datesDisabled
		});			
	},
	//пересоздание виджета календаря
	reInitDatePicker: function (props) {
		this.chancelDatePickedListener(props);
		$("#" + props.name).datepicker("remove");
		this.initDatePicker(props);
		this.applyDefaultValue(props);
		this.applyDatePickedListener(props);
		this.initDatePicker(props);
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.initDatePicker(this.props);
		this.applyDefaultValue(this.props);
		this.applyDatePickedListener(this.props);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.name == this.props.name) {
			if(!newProps.defaultValue) {
				this.chancelDatePickedListener(newProps);
				this.clearValue(newProps);
				this.applyDatePickedListener(newProps);
			} else {
				this.chancelDatePickedListener(newProps);
				this.applyDefaultValue(newProps);
				this.applyDatePickedListener(newProps);
			}
			if(Utils.serialize(newProps.disabledDates) != Utils.serialize(this.props.disabledDates)) {
				this.reInitDatePicker(newProps);
			}
		}
	},
	//при ручном изменении значения поля ввода
	handleDateChange: function (event) {
		if(!event.target.value) {
			this.notifyParentDatePicked(this.props, undefined);
		}
	},
	//при сбросе даты крестом
	handleClearClick: function () {
		this.chancelDatePickedListener(this.props);
		this.clearValue(this.props);
		this.applyDatePickedListener(this.props);
		this.notifyParentDatePicked(this.props, undefined);
	},
	//сборка представления компонента
	render: function () {
		//финальная сборка
		return (
			<div className="u-datepicker-holder has-icon">
				<input id={this.props.name}
					className={this.props.inputClasses} 
					placeholder={this.props.placeholder}
					onChange={this.handleDateChange}/>
				<i className="u-form-field-icon glyphicon glyphicon-remove"
					onClick={this.handleClearClick}/>
			</div>
		);
	}
});