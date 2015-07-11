/*
	Генератор элемента формы
*/
var FormItem = React.createClass({
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
			this.onInvalidItem();			
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
	//появление невалидного элемента формы
	onInvalidItem: function () {
		this.props.onInvalidItem();
	},
	//обработка смены значения
	onItemValueChange: function (value) {
		if(this.state.itemMetaIsValid)
			this.props.onItemValueChange(this.state.item.name, value);
	},
	//генерация представления элемента формы
	render: function () {
		//содержимое элемента формы
		var content;
		if(this.state.itemMetaIsValid) {
			if(this.state.item.visible) {
				if(this.state.item.inputType) {
					switch(this.state.item.inputType) {
						case(formFactory.itemInputType.MANUAL): {
							content =	<FormItemInput item={this.state.item} 
											onItemValueChange={this.onItemValueChange} 
											onInvalidItem={this.onInvalidItem}
											language={this.props.language}/>
							break;
						}
						case(formFactory.itemInputType.TEXT): {
							content =	<FormItemText item={this.state.item} 
											onItemValueChange={this.onItemValueChange} 
											onInvalidItem={this.onInvalidItem}
											language={this.props.language}/>
							break;
						}
						case(formFactory.itemInputType.DICT): {
							content = 	<FormItemDrop item={this.state.item} 
											onItemValueChange={this.onItemValueChange} 
											onInvalidItem={this.onInvalidItem}
											language={this.props.language}/>
							break;
						}
						case(formFactory.itemInputType.RATE): {
							content = 	<FormItemRate item={this.state.item} 
											onItemValueChange={this.onItemValueChange} 
											onInvalidItem={this.onInvalidItem}
											language={this.props.language}/>
							break;
						}
						default: {
						}
					}
				}
			}
		} else {
			content = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_FORM_ITEM_BAD_META"})}/>
		}
		//представление элемента формы
		return (
			<div>
				{content}
			</div>
		);
	}
});