/*
	Список опций
*/
var OptionsSelector = React.createClass({
	//обработка нажатия на опцию
	handleOptionCheck: function () {
		var optionsList = "";
		if((this.props.options)&&(Array.isArray(this.props.options))) {
			this.props.options.forEach(function (item, i) {
				if(React.findDOMNode(this.refs[item.value]).checked) optionsList += item.value + ";";
			}, this);
		}
		this.props.onOptionChanged(optionsList.substring(0, optionsList.length - 1));
	},
	//проверка статуса опции по умолчанию
	isDefaultChecked: function (item) {
		var res = false;
		if(this.props.defaultOptionsState)
			if(this.props.defaultOptionsState.indexOf(item.value) != -1) res = true;
		if(React.findDOMNode(this.refs[item.value]))
			React.findDOMNode(this.refs[item.value]).checked = res;
		return res;
	},
	//формирование представления списка опций
	render: function () {
		//дополнительные стили
		var lblStale = {paddingLeft: "5px"};
		//верстка элементов
		var optionsList;
		if((this.props.options)&&(Array.isArray(this.props.options))) {
			optionsList = this.props.options.map(function (item, i) {
				return (
					<div key={i} className="w-checkbox">
						<input className="w-checkbox-input"
							type="checkbox"
							ref={item.value}
							onChange={this.handleOptionCheck}
							defaultChecked={this.isDefaultChecked(item)}/>
						<label className="w-form-label" style={lblStale}>
							{item.label}
						</label>
					</div>
				);
			}, this);
		}
		//финальная сборка содержимого
		return (
			<div>
				{optionsList}
			</div>
		);
	}
});