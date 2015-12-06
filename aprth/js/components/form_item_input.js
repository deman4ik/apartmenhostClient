/*
	Генератор элмента формы типа "Поле для ввода"
*/
var FormItemInput = React.createClass({
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
	//генерация поля ввода
	render: function () {
		//сам элемент
		var item;
		if(this.state.itemMetaIsValid) {
			//тип данных
			var inputDataType = "text";
			if(this.props.isPassword) {
				inputDataType = "password";
			} else {
				if(this.state.item.dataType) {
					switch(this.state.item.dataType) {
						case(formFactory.itemDataType.STR): {
							inputDataType = "text";
							break;
						}
						case(formFactory.itemDataType.NUMB): {
							inputDataType = "number";
							break;
						}
						case(formFactory.itemDataType.DATE): {
							inputDataType = "date";
							break;
						}			
						default: {
							inputDataType = "text";
						}
					}
				}
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
				"has-error": (("valid" in this.state.item)&&(!this.state.item.valid)) /*,
				"has-success": ((this.state.item.required)&&((("valid" in this.state.item)&&(this.state.item.valid))))*/
			});
			var classesInput = cItem({
				"w-input": true,
				"u-form-field": true,
				"hidden": (this.state.item.inputType==formFactory.itemInputType.LBL)
			});
			var itemLabelType;
			if (this.state.item.inputType==formFactory.itemInputType.LBL) {
				itemLabelType = <span>{this.state.item.value}</span>
			}			
			//собираем элемент
			item =	<div className={classesItem}>
						<label for={this.state.item.name} className="control-label hidden-xs hidden-sm col-md-4 col-lg-4">{req}{this.state.item.label}</label>
						<div className="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12 col-md-8 col-lg-8">
							<input type={inputDataType}
								value={this.state.item.value}
								className={classesInput}
								id={this.state.item.name}
								placeholder={this.state.item.label}
								ref={this.state.item.name}
								onChange={this.handleChange}/>
							{itemLabelType}
						</div>
					</div>
		} else {
			item = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_FORM_ITEM_BAD_META"})}/>
		}
		//представление поля ввода
		return (
			<div name="form_item_input">
				{item}
			</div>
		);		
	}
});