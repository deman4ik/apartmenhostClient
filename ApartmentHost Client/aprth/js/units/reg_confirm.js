/*
	Подтверждение регистрации
*/
var RegConfirm = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние формы подтверждения регистрации
	getInitialState: function () {
		return {
			userId: "", //идентификатор пользователя
			code: "", //код подтверждения
			noCodeSpecified: false //флаг отсуствия кода подтверждения
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		if(this.context.router.getCurrentQuery().userId) this.setState({userId: this.context.router.getCurrentQuery().userId});
		if(this.context.router.getCurrentQuery().code) this.setState({code: this.context.router.getCurrentQuery().code}, this.checkPrmsAndConfirm);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//обработка результатов подтверждения
	handleConfirmResult: function (result) {
		this.props.onHideProgress();
		if(result.TYPE == clnt.respTypes.STD) {
			this.props.onShowError(Utils.getStrResource({
					lang: this.props.language, 
					code: "CLNT_COMMON_ERROR"}), 
				result.MESSAGE
			);
		} else {
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_CONFIRM_DONE"}));
			this.context.router.transitionTo("main");
		}
	},
	//подтверждение кода регистрации
	confirm: function () {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_COMMON_PROGRESS"
		}));		
		var confPrms = {
			language: this.props.language,
			data: {
				userId: this.state.userId,
				code: this.state.code
			}
		};
		clnt.registerConfirm(confPrms, this.handleConfirmResult);		
	},
	//обработка изменения поля формы подтверждения
	handleFormItemChange: function (e) {
		var tmp = {};
		_.extend(tmp, this.state);
		tmp[e.target.id] = e.target.value;
		this.setState(tmp);		
	},
	//выполнение подтверждения
	checkPrmsAndConfirm: function () {
		if(this.state.code) {
			this.setState({noCodeSpecified: false}, this.confirm());			
		} else {
			this.setState({noCodeSpecified: true});
		}
	},
	//отработка нажатия на подтверждение кода
	handleConfirmClick: function () {
		this.checkPrmsAndConfirm();
	},
	//отработка нажатия на отмену формы подтверждения
	handleCancelClick: function () {
		if(!this.context.router.goBack()) {
			this.context.router.transitionTo("main");
		}
	},
	//генерация представления формы подтверждения регистрации
	render: function () {
		//сожержимое формы
		var content;
		if(this.state.userId) {
			var cCodeInput = React.addons.classSet;
			var classesCodeInput = cCodeInput({
				"w-input": true,
				"u-form-field": true,
				"has-error": this.state.noCodeSpecified
			});
			content =	<div>
							<div className="w-row">
								<div className="w-col w-col-3">
									<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_REG_CODE"})}:</label>									
									<div className="u-t-small">
										{Utils.getStrResource({
											lang: this.props.language,
											code: "UI_NOTE_REG_CODE",
											values: ["UI_BTN_REG_CONFIRM"],
											searchVals: true
										})}
									</div>
								</div>
								<div className="w-col w-col-9">
									<input className={classesCodeInput}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_REG_CODE"})}
										type="text" 
										ref="code" 
										id="code"
										value={this.state.code}
										onChange={this.handleFormItemChange}/>
								</div>
							</div>
							<div className="u-block-spacer"></div>
							<div className="u-block-spacer"></div>										
							<input className="w-button u-btn-primary"
								type="button"
								value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REG_CONFIRM"})}
								onClick={this.handleConfirmClick}/>
							<input className="w-button u-btn-regular"
								type="button"
								value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
								onClick={this.handleCancelClick}/>
						</div>
		} else {
			content =	<div className="w-row">
							<div className="w-col w-col-12">
								<InLineMessage type={Utils.getMessageTypeErr()} 
									message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ID"})}/>
							</div>
						</div>
		}
		//генератор		
		return (
			<div className="w-section">
				<div className="w-container">
					<div className="u-block-underline h3">
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_REG_CONFIRM"})}</h3>
					</div>
					<div className="w-form">
						<form className="w-clearfix" id="regConfForm">
							<div className="u-block-spacer"></div>
							<div className="u-block-spacer"></div>
							{content}
						</form>
					</div>
				</div>
			</div>
		);
	}
});