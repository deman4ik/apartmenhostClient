/*
	Генератор элмента формы типа "Выпадающий список"
*/
var FormItemDrop = React.createClass({
	//состояние элемента формы
	getInitialState: function () {
		return {
			item: {},
			itemMetaIsValid: false
		};
	},
	//установка состояния элемента формы по переданным параметрам элемента
	setFormItemState: function (itemData) {
		if((itemData)&&(formFactory.validateFormItem(itemData))) {
			this.state.item = _.extend(this.state.item, itemData);
			this.setState({itemMetaIsValid: true});
		} else {
			this.setState({item: {}, itemMetaIsValid: false});
			this.props.onInvalidItem();
		}
	},
	//проверка статуса опции по умолчанию
	isDefaultSelected: function (value) {
		var res = false;
		if(value == item.value) res = true;
		return res;
	},
	//инициализация элемента формы
	componentDidMount: function () {		
		this.setFormItemState(this.props.item);
	},
	//обновление параметров элемента формы
	componentWillReceiveProps: function (newProps) {
		this.setFormItemState(newProps.item);
	},
	//обработка смены значения
	handleChange: function (event) {
		var tmpItem = {};
		_.extend(tmpItem, this.state.item);
		tmpItem.value = event.target.value;
		this.setState({item: tmpItem});
		this.props.onItemValueChange(event.target.value);
	},
	//генерация выпадающего списка
	render: function () {
		//выпадающий список
		var item;
		if(this.state.itemMetaIsValid) {
			//элементы списка
			var options;
			if((this.state.item.dict.vals)&&(Array.isArray(this.state.item.dict.vals))) {
				options = this.state.item.dict.vals.map(function (dictItem, i) {
					if((dictItem.value)&&(dictItem.label)) {
						return (
							<option value={dictItem.value}
								selected={this.isDefaultSelected(dictItem.value)}>
								{dictItem.label}
							</option>
						);
					}
				}, this);
			}
			//обязательность
			var req;
			if(this.state.item.required) {
				req = "*";
			}
			//классы элемента
			var cItem = React.addons.classSet;
			var classesItem = cItem({
				"form-group": true,
				"has-error": (("valid" in this.state.item)&&(!this.state.item.valid))
			});
			//сам элемент
			item =	<div className={classesItem}>
						<label for={this.state.item.name} className="control-label hidden-xs hidden-sm col-md-4 col-lg-4">{req}{this.state.item.label}</label>
						<div className="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12 col-md-8 col-lg-8">
							<select className="form-control"
								id={this.state.item.name}
								placeholder={this.state.item.label}
								ref={this.state.item.name}
								onChange={this.handleChange}>
								<option value="" 
									selected={this.isDefaultSelected("")}>
									{this.state.item.label}
								</option>
								{options}
							</select>
						</div>
					</div>
		} else {
			item = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_FORM_ITEM_BAD_META"})}/>
		}
		//представление выпажающего списка
		return (
			<div>
				{item}
			</div>
		);
	}
});