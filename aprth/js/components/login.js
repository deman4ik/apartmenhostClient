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
			confirmResetPassword: false //признак восстановления пароля
		};
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
		} else {
			this.props.onLogInOk(result.MESSAGE);
		}		
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
		//генерация представления
		return (
			<div>
				<div className="modal show messagebox-wraper" id="loginBox">					
					<div className="modal-dialog login-form">
						{confResetPasswordDlg}
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