/*
	Профиль пользователя
*/
var Profile = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},	
	//состояние объявления
	getInitialState: function () {
		return {			
			profile: {}, //профиль пользователя
			profileTmp: {}, //буфер для редактирования профиля
			profileReady: false, //профиль пользователя готов к отображению
			modeEdit: false, //режим редактирования профиля	
			notifyApp: false //флаг необходимости оповещения приложения о смене профиля пользователя 	
		}
	},
	//обработка загруженных данных объявления
	handleLoadProfileResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({profile: resp.MESSAGE, profileTmp: resp.MESSAGE, profileReady: true});
			if((this.state.notifyApp)||(resp.MESSAGE.cardCount != this.props.session.sessionInfo.user.profile.cardCount)) {
				this.setState({notifyApp: false});
				this.props.onProfileChange(resp.MESSAGE);
			}
		}
	},
	//обработка результатов удаления объявления
	handleDeletePostResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({notifyApp: true}, function () {this.loadProfile();});
		}
	},
	//обработка результатов обновления профиля
	handleProfileUpdateResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({modeEdit: false, notifyApp: true}, function () {this.loadProfile();});
		}
	},	
	//загрузка данных профиля
	loadProfile: function () {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				profileId: this.props.session.sessionInfo.user.profile.id,
				session: this.props.session.sessionInfo
			}
			clnt.getProfile(getPrms, this.handleLoadProfileResult);
		}
	},
	//обработка изменения поля формы редактирования профиля
	handleFormItemChange: function (e) {
		var tmp = {};
		_.extend(tmp, this.state.profileTmp)
		tmp[e.target.id] = e.target.value;
		this.setState({profileTmp: tmp});
	},	
	//обработка нажатия на карточку объявления
	handlePostClick: function (postId) {
		this.context.router.transitionTo("modifypost", {mode: ModifyPostModes.EDIT}, {postId: postId});
	},
	//обработка нажатия на кнопку редактирования
	handleEditClick: function () {
		var tmp = {};
		_.extend(tmp, this.state.profile);
		this.setState({profileTmp: tmp, modeEdit: true});
	},
	//обработка нажатия на кнопку отмены редактирования
	handleCancelEditClick: function () {
		this.setState({modeEdit: false});
	},
	//обработка нажатия на кнопку изменения профиля
	handleOKEditClick: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var updPrms = {
			language: this.props.language, 
			data: {
				id: this.state.profileTmp.id,
				email: this.state.profileTmp.email,
				firstName: this.state.profileTmp.firstName,
				lastName: this.state.profileTmp.lastName,
				gender: this.state.profileTmp.gender,
				phone: this.state.profileTmp.phone,
				description: this.state.profileTmp.description
			},
			session: this.props.session.sessionInfo
		}
		clnt.updateProfile(updPrms, this.handleProfileUpdateResult);
	},
	//обработка нажатия на кнопку создания объявления
	handleAddPostClick: function () {
		this.context.router.transitionTo("modifypost", {mode: ModifyPostModes.ADD});
	},
	//обработка нажатия на кнопку удаления объявления
	handleDeletePostClick: function (postId) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var delPrms = {
			language: this.props.language, 
			postId: postId,
			session: this.props.session.sessionInfo
		}
		clnt.removeAdvert(delPrms, this.handleDeletePostResult);
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.loadProfile();
	},	
	//генерация представления страницы по-умолчанию
	render: function () {
		//содержимое профиля
		var content;
		if(this.props.session.loggedIn) {
			if(this.state.profileReady) {
				//имя пользователя
				var userName;
				if(this.state.modeEdit) {
					userName =	<div>
									<input className="w-input u-form-field rel"
										type="text"
										ref="lastName"
										id="lastName"
										value={this.state.profileTmp.lastName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_LAST_NAME"})}
										onChange={this.handleFormItemChange}/>
									<input className="w-input u-form-field rel"
										type="text"
										ref="firstName"
										id="firstName"
										value={this.state.profileTmp.firstName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FIRST_NAME"})}
										onChange={this.handleFormItemChange}/>
								</div>
				} else {
					userName =	<div className="u-t-center">
									{this.state.profile.lastName} {this.state.profile.firstName}
									<Rater total={5} rating={this.state.profile.rating}/>
								</div>
				}
				//пол
				var userGender;
				if(this.state.modeEdit) {
					userGender =	<div>
										<OptionsSelector view={OptionsSelectorView.SELECT}
											options={optionsFactory.buildOptions({
														language: this.props.language, 
														id: "gender",
														options: ["DVAL_MALE", "DVAL_FEMALE"]})}
											language={this.props.language}
											defaultOptionsState={this.state.profileTmp.gender}
											onOptionChanged={Utils.bind(function (value) {this.handleFormItemChange({target: {id: "gender", value: value}})}, this)}/>
									</div>
				} else {
					userGender = <div><strong>{Utils.getStrResource({lang: this.props.language, code: this.state.profile.gender})}</strong></div>
				}
				//почта
				var userMail;
				if(this.state.modeEdit) {
					userMail =	<div>
									<input className="w-input u-form-field"
										type="text"
										ref="email"
										id="email"
										value={this.state.profileTmp.email}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_MAIL"})}
										onChange={this.handleFormItemChange}/>									
								</div>
				} else {
					userMail = <div><strong>{this.state.profile.email}</strong></div>
				}
				//телефон
				var userPhone;
				if(this.state.modeEdit) {
					userPhone =	<div>
									<input className="w-input u-form-field"
										type="text"
										ref="phone"
										id="phone"
										value={this.state.profileTmp.phone}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_PHONE"})}
										onChange={this.handleFormItemChange}/>
								</div>
				} else {
					userPhone = <div><strong>{this.state.profile.phone}</strong></div>
				}
				//о себе
				var userDesc;
				if(this.state.modeEdit) {
					userDesc =	<div>
									<textarea className="w-input u-form-field"
										ref="description"
										id="description"
										value={this.state.profileTmp.description}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_ABOUT_ME"})}
										onChange={this.handleFormItemChange}>
									</textarea>
								</div>
				} else {
					userDesc = <div>{this.state.profile.description}</div>
				}
				//объявления (хоть ты, Лешенька, и говоришь что оно будет только одно, и БЕЗ КНОПКИ УДАЛИТЬ, я закладываю возможность вёрстки СПИСКА объявлений)
				var adverts;
				if((this.state.profile.adverts)&&(Array.isArray(this.state.profile.adverts))&&(this.state.profile.advertsCount > 0)) {
					adverts = this.state.profile.adverts.map(function (item, i) {
						return (
							<div key={i}>
								<a className="w-inline-block u-lnk-norm" 
									href="javascript:void(0);" 
									onClick={this.handlePostClick.bind(this, item.id)}>
									<div className="w-row u-row-cardlst bordered">
										<div className="w-col w-col-5 w-col-stack w-col-small-6">
											<img src={_.find(item.apartment.pictures, {default: true}).url}/>
										</div>
										<div className="w-col w-col-7 w-col-stack w-col-small-6">
											<div className="u-block-card-desc">
												<h1>{Utils.getStrResource({lang: this.props.language, code: item.apartment.type})}</h1>
												<div>{item.apartment.adress}</div>
											</div>
										</div>
									</div>
								</a>
								<div className="u-block-spacer"></div>
								<div className="w-clearfix u-block-right">
									<a className="u-btn btn-sm u-btn-danger"
										href="javascript:void(0);"
										onClick={this.handleDeletePostClick.bind(this, item.id)}>
										{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_DELETE_ADVERT"})}										
									</a>
								</div>
								<div className="u-block-spacer"></div>							
							</div>
						);
					}, this);
				} else {
					adverts =	<center>
									<a className="u-t-right u-lnk-norm" href="javascript:void(0);" onClick={this.handleAddPostClick}>
										{Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ADVERTS"})}
									</a>
								</center>
				}				
				//контроллер редактирования профиля
				var editControl;
				if(this.state.modeEdit) {
					editControl = 	<div>
										<button type="button" className="w-button u-btn-primary" onClick={this.handleOKEditClick}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_OK"})}
										</button>
										<button type="button" className="w-button u-btn-regular" onClick={this.handleCancelEditClick}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
										</button>
									</div>
				} else {
					editControl = 	<a className="u-t-right u-lnk-norm" href="javascript:void(0);" onClick={this.handleEditClick}>
										{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_EDIT"})}
									</a>
				}
				//непосредственно профиль с объявлениями
				content =	<section className="w-container">
								<div className="w-section u-sect-card">
									<div className="w-row">
										<div className="w-col w-col-6 u-col-card">
											<div className="u-block-underline h3">
												<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PROFILE"})}</h3>
											</div>
											<div className="u-block-owner addition2">
												<img className="u-img-author-m" src={this.state.profile.picture.url} width="96"/>
												{userName}												
											</div>
											<div className="w-row u-row-descr">
												<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
													<div>{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_GENDER"})}</div>
												</div>
												<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
													{userGender}													
												</div>
											</div>
											<div className="w-row u-row-descr">
												<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
													<div>{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_MAIL"})}</div>
												</div>
												<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
													{userMail}													
												</div>
											</div>
											<div className="w-row u-row-descr">
												<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
													<div>{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PHONE"})}</div>
												</div>
												<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
													{userPhone}
												</div>
											</div>
											<div className="w-row u-row-descr">
												<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
													<div>{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_ABOUT_ME"})}</div>
												</div>
												<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
													{userDesc}
												</div>
											</div>
											<div className="w-row u-row-descr">
												<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
													<div className="u-block-spacer"></div>
												</div>
												<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6 w-clearfix">
													{editControl}
												</div>
											</div>
											<div className="u-block-owner addition"></div>
											<div className="empty"></div>
										</div>
										<div className="w-col w-col-6 u-col-card">
											<div className="u-block-underline h3">
												<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ADVERT"})}</h3>
											</div>											
											{adverts}											
										</div>
									</div>
								</div>
								<div className="u-block-spacer"></div>
								<div className="u-block-spacer"></div>
							</section>
			} else {
				content =	<InLineMessage type={Utils.getMessageTypeErr()}
								message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA"})}/>
			}
		} else {
			content =	<InLineMessage type={Utils.getMessageTypeErr()}
							message={Utils.getStrResource({lang: this.props.language, code: "SRV_UNAUTH"})}/>
		}
		//генератор
		return (
			<div classNameName="content-center">
				{content}
			</div>
		);
	}
});