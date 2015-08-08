/*
	Селектор опций
*/
//способы представления селектора опций
var OptionsSelectorView = {
	SELECT: "select", //выпадающий список
	CHECK: "check", //набор чекбоксов
	RADIO: "radio" //набор радиокнопок
}
//селектор опций
var OptionsSelector = React.createClass({
	//обработка нажатия на опцию
	handleOptionCheck: function () {
		var optionsList = "";
		if((this.props.options)&&(Array.isArray(this.props.options))) {
			this.props.options.forEach(function (item, i) {
				if(React.findDOMNode(this.refs[item.ref]).checked) optionsList += item.value + ";";
			}, this);
		}
		if(Utils.isFunction(this.props.onOptionChanged)) {
			this.props.onOptionChanged(optionsList.substring(0, optionsList.length - 1));
		}
	},
	//обработка выбора элемента выпадающего списка
	handleOptionSelected: function (e) {
		if(Utils.isFunction(this.props.onOptionChanged)) {
			this.props.onOptionChanged(e.target.value);
		}
	},
	//проверка статуса опции по умолчанию
	isDefaultChecked: function (item) {
		var res = false;
		if(this.props.defaultOptionsState)
			if(!Array.isArray(this.props.defaultOptionsState)) {
				if(this.props.defaultOptionsState.indexOf(item.value) != -1) res = true;
			} else {
				this.props.defaultOptionsState.forEach(function (itm, i) {
					if(item.value == itm) res = true;
				}, this);
			}
		if(React.findDOMNode(this.refs[item.ref]))
			React.findDOMNode(this.refs[item.ref]).checked = res;
		return res;
	},
	//формирование представления списка опций
	render: function () {
		//дополнительные стили
		var lblStale = {paddingLeft: "5px"};
		//представление списка
		var view;
		if(this.props.view) {
			view = this.props.view;
		} else {
			view = OptionsSelectorView.CHECK;
		}
		//верстка селектора
		var optionsList;
		if((this.props.options)&&(Array.isArray(this.props.options))) {
			switch(view) {
				case(OptionsSelectorView.SELECT): {
					var optionsItems = this.props.options.map(function (item, i) {
						return (
							<option key={i}
								value={item.value}
								selected={this.isDefaultChecked(item)}>
								{item.label}
							</option>
						);
					}, this);
					var emptyOption;
					if((this.props.appendEmptyOption)&&(this.props.emptyOptionLabel)) {
						emptyOption =	<option value=""
											selected={this.isDefaultChecked("")}>
											{this.props.emptyOptionLabel}
										</option>
					}
					optionsList =	<select className="w-select u-form-field" 
										onChange={this.handleOptionSelected}>
										{emptyOption}
										{optionsItems}
									</select>
					break;
				}
				case(OptionsSelectorView.CHECK): {
					optionsList = this.props.options.map(function (item, i) {
						return (
							<div key={i} className="w-checkbox">
								<input className="w-checkbox-input"
									type="checkbox"
									ref={item.ref}
									onChange={this.handleOptionCheck}
									defaultChecked={this.isDefaultChecked(item)}/>
								<label className="w-form-label" style={lblStale}>
									{item.label}
								</label>
							</div>
						);
					}, this);
					break;
				}
				case(OptionsSelectorView.RADIO): {
					if(this.props.name) {
						optionsList = this.props.options.map(function (item, i) {
							return (
								<div key={i} className="w-radio">
									<input className="w-radio-input"
										type="radio" 
										name={this.props.name}
										value={item.value}
										ref={item.ref}
										onChange={this.handleOptionCheck}
										defaultChecked={this.isDefaultChecked(item)}/>
									<label className="w-form-label" style={lblStale}>
										{item.label}
									</label>
								</div>							
							);
						}, this);
					} else {
						optionsList = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ID"})}/>
					}
					break;
				}			
				default: {
				}
			}			
		}
		//финальная сборка содержимого
		return (
			<div>
				{optionsList}
			</div>
		);
	}
});