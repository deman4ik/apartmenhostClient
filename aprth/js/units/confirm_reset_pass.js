/*
	Подтверждение сброса пароля
*/
var ResetPassConfirm = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние формы сброса пароля
	getInitialState: function () {
		return {
			userId: "", //идентификатор пользователя
			code: "", //код подтверждения
			password: "", //пароль
			passwordConf: "", //подтверждение пароля
			noCodeSpecified: false, //флаг отсуствия кода подтверждения
			noPassSpecified: false, //флаг отсуствия пароля
			noPassConfSpecified: false, //флаг отсуствия подтверждения пароля
			badPassConfSpecified: false, //флаг некорректного подтверждения пароля
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		if(this.context.router.getCurrentQuery().userId) this.setState({userId: this.context.router.getCurrentQuery().userId});
		if(this.context.router.getCurrentQuery().code) this.setState({code: this.context.router.getCurrentQuery().code});
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
				Utils.getStrResource({lang: this.props.language, code: "CLNT_PASS_RESET_DONE"}));
			this.context.router.transitionTo("main");
		}
	},
	//подтверждение кода сброса пароля
	confirm: function () {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_COMMON_PROGRESS"
		}));		
		var confPrms = {
			language: this.props.language,
			data: {
				userId: this.state.userId,
				code: this.state.code,
				password: this.state.password
			}
		};
		clnt.resetPasswordConf(confPrms, this.handleConfirmResult);		
	},
	//обработка изменения поля формы подтверждения
	handleFormItemChange: function (e) {
		var tmp = {};
		_.extend(tmp, this.state);
		tmp[e.target.id] = e.target.value;
		this.setState(tmp);		
	},
	//выполнение подтверждения
	checkPrmsAndConfirm: function (doConfirm) {
		var tmpState = {}
		_.extend(tmpState, this.state);
		tmpState.noCodeSpecified = false; 
		tmpState.noPassSpecified = false;
		tmpState.noPassConfSpecified = false;
		tmpState.badPassConfSpecified = false;
		if(
			(this.state.code)&&
			(this.state.password)&&
			(this.state.passwordConf)&&
			(this.state.password == this.state.passwordConf)
		) {
			this.setState(tmpState, this.confirm);
		} else {
			if(!this.state.code) tmpState.noCodeSpecified = true;
			if(!this.state.password) tmpState.noPassSpecified = true;
			if(!this.state.passwordConf) tmpState.noPassConfSpecified = true;
			if(this.state.password != this.state.passwordConf) tmpState.badPassConfSpecified = true;
			this.setState(tmpState);
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
	//генерация представления формы сброса пароля
	render: function () {
		//содержимое формы
		var content;
		if(this.state.userId) {
			var cCodeInput = React.addons.classSet;
			var classesCodeInput = cCodeInput({
				"w-input": true,
				"u-form-field": true,
				"has-error": this.state.noCodeSpecified
			});
			var cPassInput = React.addons.classSet;
			var classesPassInput = cPassInput({
				"w-input": true,
				"u-form-field": true,
				"has-error": this.state.noPassSpecified
			});
			var cPassConfInput = React.addons.classSet;
			var classesPassConfInput = cPassConfInput({
				"w-input": true,
				"u-form-field": true,
				"has-error": ((this.state.noPassConfSpecified)||(this.state.badPassConfSpecified))
			});
			content =	<div>
							<div className="w-row">
								<div className="w-col w-col-3">
									<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_CONF_CODE"})}:</label>									
									<div className="u-t-small">
										{Utils.getStrResource({
											lang: this.props.language,
											code: "UI_NOTE_RESET_PASS",
											values: ["UI_BTN_RESET_PASS"],
											searchVals: true
										})}
									</div>
								</div>
								<div className="w-col w-col-9">
									<input className={classesCodeInput}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_CONF_CODE"})}
										type="text" 
										ref="code" 
										id="code"
										value={this.state.code}
										onChange={this.handleFormItemChange}/>
								</div>
							</div>
							<div className="u-block-spacer2"></div>
							<div className="w-row">
								<div className="w-col w-col-3">
									<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_NEW_PASS"})}:</label>									
								</div>
								<div className="w-col w-col-9">
									<input className={classesPassInput}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_NEW_PASS"})}
										type="password" 
										ref="password" 
										id="password"
										value={this.state.password}
										onChange={this.handleFormItemChange}/>
								</div>
							</div>
							<div className="w-row">
								<div className="w-col w-col-3">
									<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_NEW_PASS_CONF"})}:</label>									
								</div>
								<div className="w-col w-col-9">
									<input className={classesPassConfInput}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_NEW_PASS_CONF"})}
										type="password" 
										ref="passwordConf" 
										id="passwordConf"
										value={this.state.passwordConf}
										onChange={this.handleFormItemChange}/>
								</div>
							</div>
							<div className="u-block-spacer"></div>
							<div className="u-block-spacer"></div>										
							<input className="w-button u-btn-primary"
								type="button"
								value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_RESET_PASS"})}
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
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_PASS_RESET_CONFIRM"})}</h3>
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