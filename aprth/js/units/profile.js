/*
	Профиль пользователя
*/
//закладки отзывов/запросов
var ProfileReviewsTabs = [
	"UI_TAB_PROFILE_REVIEWS_IN", //меня бронировали
	"UI_TAB_PROFILE_REVIEWS_OUT", //я бронировал
	"UI_TAB_PROFILE_ORDERS" //заявки
]
//типы запросов на бронирование
var ProfileOrdersTypes = {
	owner: "DVAL_OWNER", //я хозяин, запрос мне
	renter: "DVAL_RENTER" //я арендатор, запрос от меня
}
//состояния запросов на бронирование
var ProfileOrdersStates = {	
	accepted: "DVAL_ACCEPTED", //подтвержден
	declined: "DVAL_DECLINED", //отклонен
	pending: "DVAL_PENDING" //одидает подтверждения
}
//профиль пользователя
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
			notifyApp: false, //флаг необходимости оповещения приложения о смене профиля пользователя
			confirmDeletePost: false, //флаг отображения подтверждения удаления объявления
			displayAddReview: false, //флаг отображения формы добавления отзыва
			displayChPwd: false, //флаг отображения формы смены пароля
			addReviewForm: {}, //форма добавления отзыва
			chPwdForm: {}, //форма смены пароля
			currentReviewItem: {}, //элемент, на который оставляем отзыв
			reviewsIn: { //меня бронировали
				loaded: false, //список загружен
				count: 0, //количество отзывов
				list: [] //список отзывов
			},
			reviewsOut: { //я бронировал
				loaded: false, //список загружен
				count: 0, //количество отзывов
				list: [] //список отзывов
			},
			orders: { //запросы
				loaded: false, //список загружен
				count: 0, //количество запросов
				list: [] //список запросов
			},
			activeReviewsTab: ProfileReviewsTabs[0], //активная закладка отзывов/запросов
			deletingPostItemId: "" //удаляемое объявление
		}
	},
	//сборка формы отзыва
	buildReviewForm: function (props) {
		var formTmp = formFactory.buildForm({
			language: props.language,
			title: Utils.getStrResource({lang: props.language, code: "UI_TITLE_REVIEW"})
		});
		var rateItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_REVIEW_RATE"}),
			name: "reviewRating",
			dataType: formFactory.itemDataType.NUMB,
			inputType: formFactory.itemInputType.RATE,
			required: false,
			value: 0
		});
		var textItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_REVIEW_TEXT"}),
			name: "reviewText",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.TEXT,
			required: true,
			value: ""
		});
		formFactory.appedFormItem(formTmp, rateItemTmp);
		formFactory.appedFormItem(formTmp, textItemTmp);
		this.setState({addReviewForm: formTmp});
	},
	//сборка формы смены пароля
	buildChPwdForm: function (props) {
		var formTmp = formFactory.buildForm({
			language: props.language,
			title: Utils.getStrResource({lang: props.language, code: "UI_TITLE_CHPWD"})
		});
		var currPwdItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_PASS"}),
			name: "currenPass",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.PWD,
			required: true,
			value: ""
		});
		var newPwdItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_NEW_PASS"}),
			name: "newPass",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.PWD,
			required: true,
			value: ""
		});
		var newPwdConfItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_NEW_PASS_CONF"}),
			name: "newPassConf",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.PWD,
			required: true,
			value: ""
		});
		formFactory.appedFormItem(formTmp, currPwdItemTmp);
		formFactory.appedFormItem(formTmp, newPwdItemTmp);
		formFactory.appedFormItem(formTmp, newPwdConfItemTmp);
		this.setState({chPwdForm: formTmp});
	},
	//отправка отзыва
	onAddReviewFormOK: function (values) {		
		this.addReview(
			this.state.currentReviewItem.reservation.id, 
			_.find(values, {name: "reviewRating"}).value, 
			_.find(values, {name: "reviewText"}).value
		);
	},
	//отмена отправки отзыва
	onAddReviewFormChancel: function () {
		this.setState({displayAddReview: false}, function() {this.buildReviewForm(this.props);});
	},
	//смена пароля
	onChPwdFormOK: function (values) {		
		this.changePassword(
			_.find(values, {name: "currenPass"}).value, 
			_.find(values, {name: "newPass"}).value,
			_.find(values, {name: "newPassConf"}).value
		);
	},
	//отмена отправки отзыва
	onChPwdFormChancel: function () {
		this.setState({displayChPwd: false}, function() {this.buildChPwdForm(this.props);});
	},
	//обработка загруженных данных объявления
	handleLoadProfileResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({profile: resp.MESSAGE, profileTmp: resp.MESSAGE, profileReady: true}, this.loadActiveTab);
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
	//обработка загруженных данных отзывов "Я бронировал"
	handleLoadReviewsIn: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var tmpReviewsIn = {
				loaded: true,
				count: resp.MESSAGE.length,
				list: resp.MESSAGE
			};
			this.setState({reviewsIn: tmpReviewsIn});
		}
	},
	//обработка загруженных данных отзывов "Меня бронировали"
	handleLoadReviewsOut: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var tmpReviewsOut = {
				loaded: true,
				count: resp.MESSAGE.length,
				list: resp.MESSAGE
			};
			this.setState({reviewsOut: tmpReviewsOut});
		}
	},
	//обработка загруженных данных заявок
	handleLoadOrders: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var tmpOrders = {
				loaded: true,
				count: resp.MESSAGE.length,
				list: resp.MESSAGE
			};
			this.setState({orders: tmpOrders});
		}
	},
	//обработка результатов подтверждения/отклонения заявки
	handleProcessReservation: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.loadOrders();
		}
	},
	//обработка результатов добавления отзыва
	handleAddReview: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({displayAddReview: false}, function() {
				this.buildReviewForm(this.props);
				this.loadActiveTab(true);
			});
		}
	},
	//обработка результата смены пароля
	handleChangePassword: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_PASS_CHANGE_DONE"}));
			this.setState({displayChPwd: false}, function() {this.buildChPwdForm(this.props);});
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
	//загрузка отзывов "Меня бронировали"
	loadReviewsIn: function () {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				reviewType: ProfileOrdersTypes.owner,
				session: this.props.session.sessionInfo
			}
			clnt.getReviews(getPrms, this.handleLoadReviewsIn);
		}
	},
	//загрузка отзывов "Я бронировал"
	loadReviewsOut: function () {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				reviewType: ProfileOrdersTypes.renter,
				session: this.props.session.sessionInfo
			}
			clnt.getReviews(getPrms, this.handleLoadReviewsOut);
		}
	},
	//загрузка заявок
	loadOrders: function () {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getPrms = {
				language: this.props.language, 
				session: this.props.session.sessionInfo
			}
			clnt.getReservations(getPrms, this.handleLoadOrders);
		}
	},
	//загрузка данных активной закладки
	loadActiveTab: function (force) {
		switch(this.state.activeReviewsTab) {
			//меня бронировали
			case(ProfileReviewsTabs[0]): {
				if((!this.state.reviewsIn.loaded)||(force)) this.loadReviewsIn();
				break;
			}
			//я бронировал
			case(ProfileReviewsTabs[1]): {
				if((!this.state.reviewsOut.loaded)||(force)) this.loadReviewsOut();
				break;
			}
			//запросы
			case(ProfileReviewsTabs[2]): {
				if((!this.state.orders.loaded)||(force)) this.loadOrders();
				break;
			}
			default: {}
		}
	},
	//подтверждение/отклонение заявки на бронирование
	processReservation: function (reservId, status) {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var processPrms = {
				language: this.props.language, 
				session: this.props.session.sessionInfo,
				reservId: reservId,
				status: status
			}
			clnt.acceptDeclineReservation(processPrms, this.handleProcessReservation);
		}		
	},
	//добавление отзыва
	addReview: function (reservId, rating, text) {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var addPrms = {
				language: this.props.language, 
				session: this.props.session.sessionInfo,
				data: {
					resId: reservId,
					rating: rating,
					text: text
				}				
			}
			clnt.addReview(addPrms, this.handleAddReview);
		}
	},
	//смена пароля
	changePassword: function (currentPassword, password, passwordConfirm) {
		if(this.props.session.loggedIn) {
			if(
				(currentPassword)&&
				(password)&&
				(passwordConfirm)&&
				(password == passwordConfirm)
			) {
				this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
				var addPrms = {
					language: this.props.language, 
					session: this.props.session.sessionInfo,
					data: {
						currentPassword: currentPassword,
						password: password
					}				
				}
				clnt.changePassword(addPrms, this.handleChangePassword);
			} else {
				var message;
				if(!currentPassword) {
					message = Utils.getStrResource({lang: this.props.language, code: "SRV_USER_REQUIRED", values: ["UI_FLD_PASS"], searchVals: true});
				} else {
					if(!password) {
						message = Utils.getStrResource({lang: this.props.language, code: "SRV_USER_REQUIRED", values: ["UI_FLD_NEW_PASS"], searchVals: true});
					} else {
						if(!passwordConfirm) {
							message = Utils.getStrResource({lang: this.props.language, code: "SRV_USER_REQUIRED", values: ["UI_FLD_NEW_PASS_CONF"], searchVals: true});
						} else {
							if(password != passwordConfirm) {
								message = Utils.getStrResource({lang: this.props.language, code: "CLNT_PASS_NOT_CONF"});
							}
						}						
					}
				}				
				if(message) {
					this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), message);
				}
			}
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
	//нажатие на кнопку смены пароля
	handleChPwdClick: function () {
		this.setState({displayChPwd: true});
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
		if((postId)&&(postId != "")) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var delPrms = {
				language: this.props.language, 
				postId: postId,
				session: this.props.session.sessionInfo
			}
			clnt.removeAdvert(delPrms, this.handleDeletePostResult);
		}
	},
	//запрос подтверждения удаления объявления
	askRemoveAdvert: function (postId) {
		this.setState({confirmDeletePost: true, deletingPostItemId: postId});
	},
	//подтверждение удаления объявления получено
	doRemoveAdvert: function () {
		this.setState({confirmDeletePost: false}, function () {
			this.handleDeletePostClick(this.state.deletingPostItemId);
		});		
	},
	//отмена удаления обявления
	doNotRemoveAdvert: function () {
		this.setState({confirmDeletePost: false, deletingPostItemId: ""});
	},
	//обработка нажатия на закладку отзыва/запроса
	handleReviewsTabClick: function (tab) {
		this.setState({activeReviewsTab: tab}, this.loadActiveTab);
	},
	//обоработка нажатия на отправку отзыва
	handleAddReviewClick: function (item) {
		this.setState({currentReviewItem: item, displayAddReview: true});
	},
	//обработка нажатия на подтверждение заявки
	handleAcceptReservation: function (item) {
		this.processReservation(item.id, ProfileOrdersStates.accepted);
	},
	//обработка нажатия на отклонение заявки
	handleDeclineReservation: function (item) {
		this.processReservation(item.id, ProfileOrdersStates.declined);
	},
	//обработка результата загрузки изображения пользователя
	handleUploadProfilePictureResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({notifyApp: true}, function () {
				this.loadProfile();
				if(this.state.activeReviewsTab == ProfileReviewsTabs[2]) this.loadActiveTab(true);
			});
		}
	},
	//обработка нажатия на изменение изображения пользователя
	handleUploadProfilePicture: function (error, result) {
		if(error) {
			if(error.message != ImageUpLoaderErrs.CLOSED)
				this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), error.message);
		} else {
			if(result) {
				if(this.props.session.loggedIn) {
					this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
					var uplPrms = {
						language: this.props.language, 
						session: this.props.session.sessionInfo,
						profileId: this.state.profile.id,
						picture: {
							name: result[0].path, 
							cloudinaryPublicId: result[0].public_id
						}
					}
					clnt.uploadProfilePicture(uplPrms, this.handleUploadProfilePictureResult);
				}			
			}
		}
	},
	//обработка результата удаления изображения пользователя
	handleDeleteProfilePictureResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({notifyApp: true}, function () {
				this.loadProfile();
				if(this.state.activeReviewsTab == ProfileReviewsTabs[2]) this.loadActiveTab(true);
			});
		}
	},
	//обработка нажатия на удаления изображения пользователя
	handleDeleteProfilePicture: function () {
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var delPrms = {
				language: this.props.language, 
				session: this.props.session.sessionInfo,
				profileId: this.state.profile.id
			}
			clnt.removeProfilePicture(delPrms, this.handleDeleteProfilePictureResult);
		}
	},
	componentDidUpdate: function () {
		fixFooter();		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.buildReviewForm(this.props);
		this.buildChPwdForm(this.props);
		this.loadProfile();	
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.language != this.props.language) {
			this.buildReviewForm(newProps);
			this.buildChPwdForm(newProps);
		}
	},
	//генерация представления страницы профиля
	render: function () {
		//содержимое профиля
		var content;
		if(this.props.session.loggedIn) {
			if(this.state.profileReady) {
				//форма отзыва
				var addReviewForm;
				if(this.state.displayAddReview) {
					addReviewForm =	<FormBuilder form={this.state.addReviewForm} 
						onOK={this.onAddReviewFormOK} 
						onChancel={this.onAddReviewFormChancel} 
						onShowError={this.props.onShowError}
						language={this.props.language}/>
				}
				//форма смены пароля
				var chPwdForm;
				if(this.state.displayChPwd) {
					chPwdForm =	<FormBuilder form={this.state.chPwdForm} 
						onOK={this.onChPwdFormOK} 
						onChancel={this.onChPwdFormChancel} 
						onShowError={this.props.onShowError}
						language={this.props.language}/>
				}
				//подтверждение удаления объявления профиля
				var confDeleteDlg;
				if(this.state.confirmDeletePost) {
					confDeleteDlg = <MessageConf language={this.props.language}
										title={Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_CONFIRM"})}
										text={Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_CONFIRM_REMOVE"})}
										onOk={this.doRemoveAdvert}
										onCancel={this.doNotRemoveAdvert}/>
				}
				//аватар
				var userPictureEditor;
				if(this.state.modeEdit) {
					var uploadBtnCaption;
					var delBtn;
					if(this.state.profile.picture.url != config.defaultProfilePictureUrl) {
						delBtn =	<span>
										&nbsp;&nbsp;
										<a href="javascript:void(0);"
											className="u-lnk-norm"
											onClick={this.handleDeleteProfilePicture}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_DEL"})}
										</a>
									</span>
						uploadBtnCaption = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_UPD"});
					} else {
						uploadBtnCaption = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD"});
					}
					userPictureEditor =	<div className="w-row u-row-descr">												
											<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
												<div>{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_USERPIC"})}</div>
											</div>
											<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
												<ImageUpLoader language={this.props.language}
													onUpLoaded={this.handleUploadProfilePicture}
													style={ImageUpLoaderStyles.ANCOR}
													caption={uploadBtnCaption}
													single={true}/>
												{delBtn}										
											</div>
										</div>
				}
				//имя пользователя
				var userName;
				if(this.state.modeEdit) {
					userName = <div className="w-row u-row-descr">												
								<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
									<div>{Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FIRST_NAME"})}  <span className="text-danger">*</span></div>
								</div>
								<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
									<input className="w-input u-form-field rel"
										type="text"
										ref="firstName"
										id="firstName"
										value={this.state.profileTmp.firstName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FIRST_NAME"})}
										onChange={this.handleFormItemChange}/>
									<input className="w-input u-form-field rel"
										type="text"
										ref="lastName"
										id="lastName"
										value={this.state.profileTmp.lastName}
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_LAST_NAME"})}
										onChange={this.handleFormItemChange}/>
								</div>
							</div>
				} else {
					userName =	<div className="u-block-owner addition2">
								<div className="u-t-center">
									{this.state.profile.lastName} {this.state.profile.firstName}
									<Rater total={5} rating={this.state.profile.rating}/>
								</div>
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
														options: profileGender})}
											language={this.props.language}
											defaultOptionsState={this.state.profileTmp.gender}
											appendEmptyOption={true}
											emptyOptionLabel={Utils.makeEmptyOptionLabel(Utils.getStrResource({lang: this.props.language, code: "UI_FLD_GENDER"}))}
											onOptionChanged={Utils.bind(function (value) {this.handleFormItemChange({target: {id: "gender", value: value}})}, this)}/>
									</div>
				} else {
					userGender = <div><strong>{Utils.getStrResource({lang: this.props.language, code: this.state.profile.gender, searchUndefined: false})}</strong></div>
				}
				//почта
				var userMail;
				if(this.state.modeEdit) {
					userMail =	<div>
									<input className="w-input u-form-field"
										type="text"
										ref="email"
										id="email"
										disabled="disabled"
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
										onClick={this.askRemoveAdvert.bind(this, item.id)}>
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
										<button type="button" className="w-button u-btn-regular" onClick={this.handleChPwdClick}>
											{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CHPWD"})}
										</button>
									</div>
				} else {
					editControl = 	<a className="u-t-right u-lnk-norm" href="javascript:void(0);" onClick={this.handleEditClick}>
										{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_EDIT"})}
									</a>
				}
				//табы отзывов/запросов
				var reviewsTabsItems;
				if((this.state.reviewsIn.loaded)||(this.state.reviewsOut.loaded)||(this.state.orders.loaded)) {
					reviewsTabsItems = ProfileReviewsTabs.map(function (item, i) {
						var cTabItem = React.addons.classSet;
						var classesTabItem = cTabItem({
							"w-tab-link": true,
							"w-inline-block": true,
							"w--current": (this.state.activeReviewsTab == item)
						});
						return (
								<a className={classesTabItem} onClick={this.handleReviewsTabClick.bind(this, item)}>
									<div>{Utils.getStrResource({lang: this.props.language, code: item})}</div>
								</a>	
						);
					}, this);
				}
				var reviewsTabsMenu = <div className="w-tab-menu">{reviewsTabsItems}</div>
				//содержимое активного таба отзывов/запросов
				var activeReviewsTabContent;
				if((this.state.reviewsIn.loaded)||(this.state.reviewsOut.loaded)||(this.state.orders.loaded)) {
					var tmpTabContent;
					switch(this.state.activeReviewsTab) {
						//меня бронировали
						case(ProfileReviewsTabs[0]): {
							if(this.state.reviewsIn.count > 0) {
								var tabHeader =	<div className="w-row w-hidden-small w-hidden-tiny u-row-underline header">
													<div className="w-col w-col-2 w-col-medium-4 w-col-small-4">
														<div className="u-block-author-reviewlst">
															<div className="u-block-spacer"></div>
														</div>
													</div>
													<div className="w-col w-col-5 w-col-medium-4 w-col-small-4">
														<div>
															<p><strong>
																{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_PROFILE_REVIEW_TO_ME"})}
															</strong></p>
														</div>
													</div>
													<div className="w-col w-col-5 w-col-medium-4 w-col-small-4">
														<div>
															<p><strong>
																{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_PROFILE_REVIEW_FROM_ME"})}
															</strong></p>
														</div>
													</div>
												</div>
								var tabItems = this.state.reviewsIn.list.map(function (item, i) {
									var reviewToMe;
									if(item.renterReview) {
										reviewToMe =	<div className="w-col w-col-5 w-clearfix">
															<div>
																<Rater total={5} rating={item.renterReview.rating} align={"left"}/>
																<p>{item.renterReview.text}</p>
															</div>
															<div className="u-t-small u-t-right u-t-rel">
																{Utils.formatDate({lang: this.props.language, 
																	date: item.renterReview.createdAt})}
															</div>
														</div>
									} else {
										reviewToMe =	<div className="w-col w-col-5">
															<p className="u-t-light">
																{Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_POST"})}
															</p>
														</div>
									}
									var myReview;
									if(item.ownerReview) {
										myReview =	<div className="w-col w-col-5 w-clearfix">
														<div>
															<Rater total={5} rating={item.ownerReview.rating} align={"left"}/>
															<p>{item.ownerReview.text}</p>
														</div>
														<div className="u-t-small u-t-right u-t-rel">
															{Utils.formatDate({lang: this.props.language, 
																	date: item.ownerReview.createdAt})}
														</div>
													</div>
									} else {
										if(item.canResponse) {
											myReview =	<div className="w-col w-col-5">
															<a className="u-btn btn-sm" href="javascript:void(0);" onClick={this.handleAddReviewClick.bind(this, item)}>
																{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD_REVIEW"})}
															</a>
														</div>
										} else {
											myReview =	<div className="w-col w-col-5">
															<p className="u-t-light">
																{Utils.getStrResource({lang: this.props.language, code: "CLNT_CAN_NOT_ADD_REVIEW"})}
															</p>
														</div>											
										}
									}
									return (
										<div className="w-row u-row-underline">
											<div className="w-col w-col-2">
												<div className="u-block-author-reviewlst">
													<img className="u-img-author-review" 
														src={item.reservation.user.picture.large} 
														width="76"/>
													<div>{item.reservation.user.firstName + " " + item.reservation.user.lastName}</div>
													<div className="u-t-small date1">
														{Utils.formatDate({lang: this.props.language, 
															date: item.reservation.dateFrom}) + " - " + 
														Utils.formatDate({lang: this.props.language, 
															date: item.reservation.dateTo})}
													</div>
												</div>
											</div>
											{reviewToMe}
											{myReview}
										</div>				
									);
								}, this);
								tmpTabContent = <div>
													{tabHeader}
													{tabItems}
												</div>
							} else {
								tmpTabContent = <InLineMessage type={Utils.getMessageTypeErr()}
													message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA"})}/>
							}
							break;
						}
						//я бронировал
						case(ProfileReviewsTabs[1]): {
							if(this.state.reviewsOut.count > 0) {
								var tabHeader =	<div className="w-row w-hidden-tiny u-row-underline header">
													<div className="w-col w-col-4 w-col-small-4">
														<div>
															<p><strong>
																{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_PROFILE_REVIEW_POST"})}
															</strong></p>
														</div>
													</div>
													<div className="w-col w-col-4 w-col-small-4">
														<div>
															<p><strong>
																{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_PROFILE_REVIEW_TO_ME"})}
															</strong></p>
														</div>
													</div>
													<div className="w-col w-col-4 w-col-small-4">
														<div>
															<p><strong>
																{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_PROFILE_REVIEW_FROM_ME"})}
															</strong></p>
														</div>
													</div>
												</div>
								var tabItems = this.state.reviewsOut.list.map(function (item, i) {
									var reviewToMe;
									if(item.ownerReview) {
										reviewToMe =	<div className="w-col w-col-4 w-col-small-4 w-clearfix">
															<div>
																<Rater total={5} rating={item.ownerReview.rating} align={"left"}/>
																<p>{item.ownerReview.text}</p>
															</div>
															<div className="u-t-small u-t-right u-t-rel">
																{Utils.formatDate({lang: this.props.language, 
																		date: item.ownerReview.createdAt})}
															</div>
														</div>
									} else {
										reviewToMe =	<div className="w-col w-col-4 w-col-small-4">
															<p className="u-t-light">
																{Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_POST"})}
															</p>
														</div>
									}
									var myReview;
									if(item.renterReview) {
										myReview =	<div className="w-col w-col-4 w-col-small-4 w-clearfix">
														<div>
															<Rater total={5} rating={item.renterReview.rating} align={"left"}/>
															<p>{item.renterReview.text}</p>
														</div>
														<div className="u-t-small u-t-right u-t-rel">
															{Utils.formatDate({lang: this.props.language, 
																date: item.renterReview.createdAt})}
														</div>
													</div>
									} else {
										if(item.canResponse) {
											myReview =	<div className="w-col w-col-4 w-col-small-4">
															<a className="u-btn btn-sm" href="javascript:void(0);"  onClick={this.handleAddReviewClick.bind(this, item)}>
																{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD_REVIEW"})}
															</a>
														</div>
										} else {
											myReview =	<div className="w-col w-col-4 w-col-small-4">
															<p className="u-t-light">
																{Utils.getStrResource({lang: this.props.language, code: "CLNT_CAN_NOT_ADD_REVIEW"})}
															</p>
														</div>
										}
									}									
									return (
										<div className="w-row u-row-underline">
											<div className="w-col w-col w-col-4 w-col-small-4">
												<div className="w-row u-row-cardhist">
													<div className="w-col w-col-6 w-col-stack">
														<div>
															<img src={item.reservation.card.apartment.defaultPicture.url}/>
															<img className="u-img-author-sm sm"
																src={item.reservation.card.user.picture.small}/>
														</div>
													</div>
													<div className="w-col w-col-6 w-col-stack">
														<div className="u-block-card-desc">
															<p>
																{item.reservation.card.user.firstName + " " + item.reservation.card.user.lastName}
																<br/>
																{item.reservation.card.apartment.adress + ", " + Utils.getStrResource({lang: this.props.language, code: item.reservation.card.apartment.type})}
															</p>
															<div className="u-t-price price-sm">
																<strong>
																	{item.reservation.card.priceDay}&nbsp;
																	{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
																	{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
																</strong>
															</div>
														</div>
													</div>
												</div>
												<div className="w-row u-row-cardhist bottom">
													<div className="w-col w-col-6 w-col-stack u-col-cardhist">
														<div>
															<Rater total={5} rating={item.reservation.card.user.rating} ratingCount={item.reservation.card.user.ratingCount}/>
														</div>
													</div>
													<div className="w-col w-col-6 w-col-stack u-col-cardhist">
														<div className="u-t-small date1">
															{Utils.formatDate({lang: this.props.language, 
																date: item.reservation.dateFrom}) + " - " + 
															Utils.formatDate({lang: this.props.language, 
																date: item.reservation.dateTo})}
														</div>
													</div>
												</div>
											</div>
											{reviewToMe}
											{myReview}
										</div>				
									);
								}, this);
								tmpTabContent = <div>
													{tabHeader}
													{tabItems}
												</div>
							} else {
								tmpTabContent = <InLineMessage type={Utils.getMessageTypeErr()}
													message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA"})}/>
							}							
							break;
						}
						//запросы на бронирование
						case(ProfileReviewsTabs[2]): {
							if(this.state.orders.count > 0) {
								var tabItems = this.state.orders.list.map(function (item, i) {
									var arrow;
									if(item.type == ProfileOrdersTypes.owner) {
										arrow = <span className="glyphicon u-request-direct glyphicon-arrow-right"></span>
									} else {
										arrow = <span className="glyphicon u-request-direct glyphicon-arrow-left my"></span>
									}
									var orderState;
									if(item.type == ProfileOrdersTypes.owner) {
										if((item.status == ProfileOrdersStates.accepted)||(item.status == ProfileOrdersStates.declined)) {
											orderState = <span>
															{Utils.getStrResource({lang: this.props.language, code: item.status}) + " " +
																Utils.formatDate({lang: this.props.language, date: item.updatedAt})}
														 </span>
										} else {
											orderState =	<span>
																<a className="u-btn btn-sm" href="javascript:void(0);" onClick={this.handleAcceptReservation.bind(this, item)}>
																	{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ACCEPT"})}
																</a>
																<a className="u-btn-grey btn-sm" href="javascript:void(0);" onClick={this.handleDeclineReservation.bind(this, item)}>
																	{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_DECLINE"})}
																</a>
															</span>											
										}
									} else {
										if(item.status == ProfileOrdersStates.accepted) {
											orderState = <span>
															{Utils.getStrResource({lang: this.props.language, code: "CLNT_RESERVATION_ACCEPTED"}) + " " +
																Utils.formatDate({lang: this.props.language, date: item.updatedAt})}
														 </span>
										} else {
											if(item.status == ProfileOrdersStates.declined) {
												orderState =	<span>
																	{Utils.getStrResource({lang: this.props.language, code: "CLNT_RESERVATION_DECLINED"}) + " " +
																		Utils.formatDate({lang: this.props.language, date: item.updatedAt})}
														 		</span>
											} else {
												orderState =	<span>
																	{Utils.getStrResource({lang: this.props.language, code: item.status})}
														 		</span>
											}
										}
									}
									return (
										<div className="w-row u-row-underline">
											<div className="w-col w-col-1 u-col-query">
												{arrow}
											</div>
											<div className="w-col w-col-1 u-col-query">
												<div className="u-block-author-reviewlst">
													<img className="u-img-author-m"
														src={item.user.picture.large}/>
												</div>
											</div>
											<div className="w-col w-col-2 u-col-query u-t-center">
												<div>{item.user.firstName + " " + item.user.lastName}</div>
												<Rater total={5} rating={item.user.rating}/>
											</div>
											<div className="w-col w-col-3 u-col-query u-t-center">
													{Utils.formatDate({lang: this.props.language, 
														date: item.dateFrom}) + " - " + 
													Utils.formatDate({lang: this.props.language, 
														date: item.dateTo})}
											</div>
											<div className="w-col w-col-5 w-clearfix u-col-query u-t-center">
												{orderState}
											</div>
										</div>										
									);
								}, this);
								tmpTabContent = <div>
													{tabItems}
												</div>
							} else {
								tmpTabContent = <InLineMessage type={Utils.getMessageTypeErr()}
													message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA"})}/>
							}							
							break;
						}
						default: {}
					}
					activeReviewsTabContent = <div className="w-tab-content u-tab-cont1">{tmpTabContent}</div>
				}
				//непосредственно профиль с объявлениями отзывами и запросами
				content =	<section className="w-container">
								{addReviewForm}
								{chPwdForm}
								{confDeleteDlg}
								<div className="w-section u-sect-card">
									<div className="w-row">
										<div className="w-col w-col-6 u-col-card">
											<div className="u-block-underline h3">
												<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PROFILE"})}</h3>
											</div>
											<div className="u-block-owner addition2">
												<img className="u-img-author-m large" src={this.state.profile.picture.url}/>										
											</div>
											{userPictureEditor}													
											{userName}																						
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
								<div className="w-tabs u-block-tabs" data-duration-in="300" data-duration-out="100">
									{reviewsTabsMenu}
								</div>
								{activeReviewsTabContent}
								<div className="u-block-spacer"></div>
							</section>
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