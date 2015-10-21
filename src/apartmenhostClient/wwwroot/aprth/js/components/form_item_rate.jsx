/*
	Генератор элмента формы типа "Ввод рейтинга"
*/
var FormItemRate = React.createClass({
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
	handleChange: function (value) {
		var tmpItem = {};
		_.extend(tmpItem, this.state.item);
		tmpItem.value = value;
		this.setState({item: tmpItem});
		this.props.onItemValueChange(value);
	},
	//генерация поля рейтинга
	render: function () {
		//сам элемент
		var item;
		if(this.state.itemMetaIsValid) {
			//обязательность
			var req;
			if(this.state.item.required) {
				req = "*";
			}
			//классы элемента
			var cItem = React.addons.classSet;
			var classesItem = cItem({
				"form-group": true,
				"has-error": (("valid" in this.state.item)&&(!this.state.item.valid)),
				"has-success": ((this.state.item.required)&&((("valid" in this.state.item)&&(this.state.item.valid))))
			});
			//собираем элемент
			item =	<div className={classesItem}>
						<label for={this.state.item.name} className="control-label hidden-xs hidden-sm col-md-4 col-lg-4">{req}{this.state.item.label}</label>
						<div className="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12 col-md-8 col-lg-8">
							<Rater total={5}
								align={"left"}
								rating={this.state.item.value}
								onRate={this.handleChange} 
								language={this.props.language}/>							
						</div>
					</div>
		} else {
			item = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_FORM_ITEM_BAD_META"})}/>
		}
		//представление поля ввода
		return (
			<div>
				{item}
			</div>
		);		
	}
});