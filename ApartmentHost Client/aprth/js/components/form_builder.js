/*
	Генератор форм
*/
var FormBuilder = React.createClass({
	//состояние формы
	getInitialState: function () {
		return {
			form: {},
			formMetaIsValid: false
		};
	},
	//установка состояния формы
	setFormState: function (formData) {
		if((formData)&&(formFactory.validateForm(formData))) {			
			this.state.form = _.extend(this.state.form, formData);
			this.setState({formMetaIsValid: true});
		} else {
			this.setState({form: {}, formMetaIsValid: false});
		}
	},
	//инициализация формы
	componentDidMount: function () {
		this.setFormState(this.props.form);		
	},
	//обновление параметров формы
	componentWillReceiveProps: function (newProps) {
		this.setFormState(newProps.form);
	},
	//валиадция формы
	validate: function (itemName) {
		var valid = true;
		var formTmp = _.extend({}, this.state.form);
		formTmp.items.forEach(function (formItem, i) {
			if((!itemName)||(formItem.name == itemName)) {
				if((formItem.required)&&(!formItem.value)) {
					valid = false;
					formItem.valid = false;
				} else {
					formItem.valid = true;
				}
			}
		});
		this.setState({form: formTmp});
		return valid;
	},
	//появление невалидного элемента формы
	onInvalidItem: function () {
		this.setState({form: {}, formMetaIsValid: false});
	},
	//изменение значения элемента формы
	onItemValueChange: function (itemName, value) {		
		var formTmp = _.extend({}, this.state.form);
		_.findWhere(formTmp.items, {name: itemName}).value = value;
		this.setState({form: formTmp}, function () {this.validate(itemName);});
	},
	//обработка кнопки "ОК"
	handleOKClick: function () {
		if(this.validate()) {
			var formValues = _.map(this.state.form.items, _.clone);
			this.props.onOK(formValues);
		}
	},	
	//обработка кнопки "Отмена"
	handleChancelClick: function () {
		this.props.onChancel();
	},	
	//генерация представления формы
	render: function () {		
		//сама форма
		var form;
		if(this.state.formMetaIsValid) {
			//элементы формы
			var items;
			if(this.state.form.items) {
				items = this.state.form.items.map(function (formItem, i) {
					return (
						<FormItem item={formItem} 
							onItemValueChange={this.onItemValueChange}
							onInvalidItem={this.onInvalidItem}
							language={this.props.language}/>
					);
				}, this);
			}
			//собираем форму
			form =	<div>
			    <div className="modal show messagebox-wraper">
						<div className="modal-dialog">
							<div className="modal-content">
								<div className="modal-header">
									<h4 className="modal-title">{this.state.form.title}</h4>
								</div>
								<div className="modal-body">
									<br/>
									<form className="form-horizontal loginForm" role="form">
										<div className="panel-default">
											<div className="panel-body">
												{items}
											</div>
										</div>
									</form>
								</div>
								<div className="modal-footer">
									<button type="button" className="w-button u-btn-primary" onClick={this.handleOKClick}>{this.state.form.okButtonCaption}</button>
									<button type="button" className="w-button u-btn-regular" onClick={this.handleChancelClick}>{this.state.form.chancelButtonCaption}</button>
								</div>
							</div>
						</div>
					</div>
					<div className="modal-backdrop fade in"></div>
				</div>
		} else {
			form = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "CLNT_FORM_BAD_META"})}/>
		}
		//финальное построение формы
		return (
			<div>
				{form}
			</div>																
		);
	}
});