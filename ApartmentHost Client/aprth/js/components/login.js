/*
	Диалог входа в систему
*/
var LogInForm = React.createClass({
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
	//вход в систему
	logIn: function (auth) {
		this.props.onDisplayProgress(Utils.getStrResource({
			lang: this.props.language, 
			code: "CLNT_LOGIN_PROCESS"
		}));
		clnt.login({language: this.props.language, data: auth}, this.handleLogIn);
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
	//обработка кнопки "Войти через FB"
	handleLogInFbClick: function () {
		clnt.loginFB();		
	},
	//обработка кнопки "Отмена"
	handleCloseClick: function () {
		this.props.onLogInCancel();
	},
	//генерация диалога
	render: function () {
		//генерация представления
		return (
			<div>
				<div className="modal fade show in" id="loginBox">
					<div className="modal-dialog">
						<div className="modal-content">
							<div className="modal-header">
								<h4 className="modal-title">
									{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_LOGIN"})}
								</h4>
							</div>
							<div className="modal-body">
								<br/>
								<form className="form-horizontal loginForm" role="form" id="loginForm">
									<div className="panel-default">
										<div className="panel-body">
											<div className="form-group">
												<label for="inputLogin" className="control-label hidden-xs hidden-sm col-md-4 col-lg-4">
													{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_USER"})}
												</label>
												<div className="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12 col-md-8 col-lg-8">
													<input type="text" 
														className="form-control"
														placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_USER"})}
														ref="login"
														defaultValue={this.props.defaultUser}/>
												</div>
											</div>
											<div className="form-group">
												<label for="inputPassword" className="control-label hidden-xs hidden-sm col-md-4 col-lg-4">
													{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PASS"})}
												</label>
												<div className="col-xs-offset-0 col-xs-12 col-sm-offset-0 col-sm-12 col-md-8 col-lg-8">
													<input type="password"
														className="form-control"
														placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_PASS"})}
														ref="password"
														defaultValue={this.props.defaultPassword}/>
												</div>
											</div>
										</div>
									</div>
								</form>
							</div>
							<div className="modal-footer">
								<button type="button" className="w-button u-btn-primary" onClick={this.handleLogInClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN"})}
								</button>
								<button type="button" className="w-button u-btn-regular" onClick={this.handleLogInFbClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_LOGIN_FB"})}
								</button>
								<button type="button" className="w-button u-btn-regular" onClick={this.handleCloseClick}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
								</button>								
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
});