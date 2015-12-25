/*
	Диалог входа в систему
*/
var LogInForm = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние
	getInitialState: function () {
		return {
			confirmResetPassword: false, //признак восстановления пароля
			sessionInfo: {}, //информация о сесси и пользователе
			askMailForm: {}, //форма запроса e-mail
			displayAskMail: false //флаг отображения формы запроса e-mail
		};
	},
	//сборка формы жалобы
	buildAskeMailForm: function (props) {
		var formTmp = formFactory.buildForm({
			language: props.language,
			title: Utils.getStrResource({lang: props.language, code: "UI_TITLE_SET_EMAIL"})
		});
		var mailItemTmp;		
		mailItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_MAIL"}),
			name: "userMail",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.MANUAL,
			required: true
		});
		formFactory.appedFormItem(formTmp, mailItemTmp);		
		this.setState({askMailForm: formTmp});
	},
	//ввод e-mail
	onAskMailFormOK: function (values) {
		if(_.find(values, {name: "userMail"})) {
			var userMail = _.find(values, {name: "userMail"}).value;			
			this.setProfileMail(userMail);
		}		
	},
	//отмена запроса e-mail
	onAskMailFormChancel: function () {
		this.setState({displayAskMail: false});
	},
	//обработка результата отправки e-mail аккаунта
	handleSetProfileMail: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({displayAskMail: false}, function() {
				this.props.onLogInCancel();
				this.context.router.transitionTo("confirm", null, {userId: this.state.sessionInfo.user.profile.id});
			});			
		}
	},
	//обработка результата входа
	handleLogIn: function (result) {
		this.props.onHideProgress();
		if(result.TYPE == clnt.respTypes.STD) {
			this.props.onShowError(Utils.getStrResource({
					lang: this.props.language, 
					code: "CLNT_LOGIN_ERR"}), 
				result.MESSAGE
			);
			if(result.MESSAGE == Utils.getStrResource({lang: this.props.language, code: "SRV_USER_NOT_CONFIRMED"})) {
				this.props.onLogInCancel();
				this.context.router.transitionTo("confirm", null, {userId: result.userId});
			}
		} else {
			this.setState({sessionInfo: result.MESSAGE}, Utils.bind(function () {
				if(("askForEmail" in this.state.sessionInfo)&&(this.state.sessionInfo.askForEmail)) {
					this.setState({displayAskMail: true});
				} else {
					this.props.onLogInOk(this.state.sessionInfo);
				}
			}, this));			
		}		
	},
	//отправка адреса e-mail для аккаунта
	setProfileMail: function (mail) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var setPrms = {
			language: this.props.language,
			session: this.state.sessionInfo,
			data: {email: mail}
		}
		clnt.setProfileMail(setPrms, this.handleSetProfileMail);
	},
	//обработка результата сброса пароля
	handleResetPassword: function (result) {
		this.props.onHideProgress();
		if(result.TYPE == clnt.respTypes.STD) {
			this.props.onShowError(Utils.getStrResource({
					lang: this.props.language, 
					code: "CLNT_COMMON_ERROR"}), 
				result.MESSAGE
			);
		} else {
			this.props.onLogInCancel();
			this.context.router.transitionTo("reset", null, {userId: result.MESSAGE.data[0]});
		}
	},
	//вход в систему
	logIn: function (auth) {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_LOGIN_PROCESS"
		}));
		clnt.login({language: this.props.language, data: auth}, this.handleLogIn);
	},	
	//сброс пароля
	resetPassword: function (email) {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_COMMON_PROGRESS"
		}));		
		var resData = {
			language: this.props.language, 
			data: {
				email: email
			}
		}		
		clnt.resetPassword(resData, this.handleResetPassword);
	},
	//сброс пароля подтвержден
	doResetPassword: function () {
		this.setState({confirmResetPassword: false}, Utils.bind(function () {
			this.resetPassword(React.findDOMNode(this.refs.login).value);
		}, this));		
	},
	//сброса пароля отменен
	doNotResetPassword: function () {
		this.setState({confirmResetPassword: false});
	},
	//обработка кнопки "Войти"
	handleLogInClick: function () {
		try {
			var auth = authFactory.build({
				language: this.props.language,
				userName: React.findDOMNode(this.refs.login).value,
				userPass: React.findDOMNode(this.refs.password).value
			});
			this.logIn(auth);			
		} catch (e) {
			this.props.onShowError(Utils.getStrResource({
					lang: this.props.language, 
					code: "CLNT_LOGIN_ERR"}),
				e.message
			);
		}		
	},
	//обработка кнопки "Регистрация"
	handleRegisterClick: function () {
		this.props.onLogInCancel();
		this.context.router.transitionTo("register");
	},
	//обработка кнопки "Забыл пароль"
	handlePasswordResetClick: function () {
		if(React.findDOMNode(this.refs.login).value) {
			this.setState({confirmResetPassword: true});			
		} else {
			this.props.onShowError(
				Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_AUTH_NO_USER_NAME"})
			);
		}
	},
	//обработка кнопки "Войти через FB"
	handleLogInFbClick: function () {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_LOGIN_PROCESS"
		}));
		clnt.loginNetwork({language: this.props.language, network: clnt.socialNetworks.FB}, this.handleLogIn);
	},
	//обработка кнопки "Войти через VK"
	handleLogInVkClick: function () {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_LOGIN_PROCESS"
		}));
		clnt.loginNetwork({language: this.props.language, network: clnt.socialNetworks.VK}, this.handleLogIn);		
	},
	//обработка кнопки "Отмена"
	handleCloseClick: function () {
		this.props.onLogInCancel();
	},	
	//обработка события клавиатуры
	handleKeyDown: function (event) {
		if(event.keyCode == 27) {
			this.handleCloseClick();
		}
		if(event.keyCode == 13) {
			this.handleLogInClick();
		}
	},
	bindKeyDown: function () {
		$(document.body).on("keydown", this.handleKeyDown);
	},
	unBindKeyDown: function () {
		$(document.body).off("keydown", this.handleKeyDown);
	},
	//инициализация при старте приложения
	componentDidMount: function () {
		this.bindKeyDown();
		this.buildAskeMailForm(this.props);
	},
	//отключение компонента от страницы
	componentWillUnmount: function() {
		this.unBindKeyDown();
	},
	//генерация диалога
	render: function () {
		//подтверждение восстановления пароля
		var confResetPasswordDlg;
		if(this.state.confirmResetPassword) {
			confResetPasswordDlg =	<MessageConf language={this.props.language}
										title={Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_CONFIRM"})}
										text={Utils.getStrResource({lang: this.props.language, code: "CLNT_CONFIRM_RESET_PASSWORD", values: [React.findDOMNode(this.refs.login).value]})}
										onOk={this.doResetPassword}
										onCancel={this.doNotResetPassword}/>
		}
		//запрос e-mail		
		var askMailForm;
		if(this.state.displayAskMail) {
			askMailForm =	<FormBuilder form={this.state.askMailForm} 
								onOK={this.onAskMailFormOK} 
								onChancel={this.onAskMailFormChancel} 
								onShowError={this.props.onShowError}
								language={this.props.language}/>
		}
		//генерация представления
		return (
			<div>
				<div className="modal show messagebox-wraper" id="loginBox">					
					<div className="modal-dialog login-form">
						{confResetPasswordDlg}
						{askMailForm}
						<div className="modal-content">
							<div className="modal-header">
								<button type="button" className="close" onClick={this.handleCloseClick}>×</button>	
								<h4 className="modal-title">
									{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_LOGIN"})}
								</h4>
							</div>
							<div className="u-form-body">
							  <div>
							  	<a className="u-btn block loginfb" href="javascript:void(0);" onClick={this.handleLogInFbClick}>
							  		<img className="u-img-login-icon" 
							  			src="aprth/img/facebook-512px.svg" 
							  			width="32" 
							  			height="32" 
							  			title={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN_FB"})}/>
							  			{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN_FB"})}
							  	</a>
							  </div>								
							  <div className="form-group">
							  	<a className="u-btn block loginvk" href="javascript:void(0);" onClick={this.handleLogInVkClick}>
							  		<img className="u-img-login-icon" 
							  			src="aprth/img/vkontakte-512px.svg" 
							  			width="32" 
							  			height="32" 
							  			title={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN_VK"})}/>
							  			{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN_VK"})}
							  	</a>
							  </div>							  
							  <div className="u-block-spacer2"></div>
								<form className="w-clearfix" role="form" id="loginForm">					
									<div>
											<center>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_LOGIN_EMAIL"})}</center>
											<input type="text" 
												className="form-control"
												placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_USER"})}
												ref="login"
												defaultValue={this.props.defaultUser}/>
									</div>
									<div className="form-group">
											<input type="password"
												className="form-control"
												placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_PASS"})}
												ref="password"
												defaultValue={this.props.defaultPassword}/>
									</div>
									<div className="form-group">						
										<a className="u-lnk-norm u-t-right text-warning"
											href="javascript:void(0);"
											onClick={this.handlePasswordResetClick}>
											{Utils.getStrResource({lang: this.props.language, code: "CLNT_RESTORE_PASS_FORGET"})}
										</a>
									</div>
									<div className="u-block-spacer"></div>
									<div className="form-group">
										<button type="button" className="w-button block u-btn-primary" onClick={this.handleLogInClick}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN"})}
										</button>
								  </div>
								</form>
							</div>
							<div className="modal-footer">			
								<span className="u-t-left">{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_LOGIN_NOACCNT"})}</span>	
								<a className="u-lnk-norm u-t-right text-warning" 
								  href="javascript:void(0);"
									onClick={this.handleRegisterClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REGISTER"})}
								</a>													
							</div>
						</div>
					</div>
				</div>
				<div className="modal-backdrop fade in" ></div>
			</div>
		);
	}
});