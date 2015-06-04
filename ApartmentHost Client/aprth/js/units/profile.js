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
			profileReady: false, //профиль пользователя готов к отображению
			modeEdit: false //режим редактирования профиля		
		}
	},
	//обработка загруженных данных объявления
	handleLoadProfileResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({profile: resp.MESSAGE, profileReady: true});
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
	//обработка нажатия на карточку объявления
	handlePostClick: function (postId) {
		this.context.router.transitionTo("post", {postId: postId});
	},
	//обработка нажатия на кнопку редактирования
	handleEditClick: function () {
		this.setState({modeEdit: true});
	},
	//обработка нажатия на кнопку отмены редактирования
	handleCancelEditClick: function () {
		this.setState({modeEdit: false});
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
										value={this.state.profile.lastName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_LAST_NAME"})}/>
									<input className="w-input u-form-field rel"
										type="text"
										ref="firstName"
										value={this.state.profile.firstName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FIRST_NAME"})}/>
								</div>
				} else {
					userName = <div className="u-t-center">{this.state.profile.lastName} {this.state.profile.firstName}</div>
				}
				//пол
				var userGender;
				if(this.state.modeEdit) {
					userGender =	<div>
										<select className="w-select u-form-field" ref="gender" value={this.state.profile.gender}>
											<option value="DVAL_MALE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_MALE"})}</option>
											<option value="DVAL_FEMALE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_FEMALE"})}</option>
										</select>
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
										value={this.state.profile.email}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_MAIL"})}/>									
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
										value={this.state.profile.phone}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_PHONE"})}/>									
								</div>
				} else {
					userPhone = <div><strong>{this.state.profile.phone}</strong></div>
				}
				//о себе
				var userDesc;
				if(this.state.modeEdit) {
					userDesc =	<div>
									<input className="w-input u-form-field"
										type="text"
										ref="description"
										value={this.state.profile.description}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_ABOUT_ME"})}/>									
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
								<h1>{Utils.getStrResource({lang: this.props.language, code: item.apartment.type})}</h1>
								<div className="w-row">
									<div className="w-col w-col-5 w-col-stack w-col-small-6">
										<a className="w-clearfix w-inline-block u-lnk-cardlst-img" 
											href="javascript:;" 
											onClick={this.handlePostClick.bind(this, item.id)}>					
											<img src={item.apartment.img}/>
										</a>
									</div>
									<div className="w-col w-col-7 w-col-stack w-col-small-6">
										<div className="u-block-card-desc">
											<div>
												<a className="u-lnk-norm" href="javascript:;" onClick={this.handlePostClick.bind(this, item.id)}>
													{item.apartment.adress}
												</a>
											</div>
										</div>
									</div>
								</div>
							</div>
						);
					}, this);
				} else {
					adverts =	<InLineMessage type={Utils.getMessageTypeInf()} 
									message={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ADVERTS", searchVals: true, values: ["UI_BTN_LEASE"]})}/>;
				}
				//контроллер редактирования профиля
				var editControl;
				if(this.state.modeEdit) {
					editControl = 	<div>
										<button type="button" className="w-button u-btn-primary">
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_OK"})}
										</button>
										<button type="button" className="w-button u-btn-regular" onClick={this.handleCancelEditClick}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHANCEL"})}
										</button>
									</div>
				} else {
					editControl = 	<a className="u-t-right u-lnk-norm" href="javascript:;" onClick={this.handleEditClick}>
										{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_EDIT"})}
									</a>
				}
				//непосредственно объявление
				content =	<div className="w-container">
								<div className="w-section u-sect-card">
									<div className="w-row">
										<div className="w-col w-col-6 u-col-card">
											<div className="u-block-underline h3">
												<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PROFILE"})}</h3>
											</div>
											<div className="u-block-owner addition2">
												<img className="u-img-author-m" src="aprth/img/tmp/user1.jpg" width="96"/>
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
											<div className="u-block-centered">
												{adverts}												
											</div>
										</div>
									</div>
								</div>
								<div className="u-block-spacer"></div>
								<div className="u-block-spacer"></div>
							</div>
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