/*
	Редактор профиля пользователя
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
//редактор профиля пользователя
var Profile = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},	
	//состояние редактора
	getInitialState: function () {
		return {
			profileLoaded: false, //флаг загруженности профиля
			adverts: [], //объявления профиля
			advertsCount: 0, //счетчик объявлений профиля
			advertsLoaded: false, //флаг загруженности объявлений профиля
			confirmDeletePost: false, //флаг отображения подтверждения удаления объявления
			displayAddReview: false, //флаг отображения формы добавления отзыва
			addReviewForm: {}, //форма добавления отзыва
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
			deletingPostItemId: "", //удаляемое объявление
			ordersTypeFilter: "" //значение фильтра по типам в закладке "Запросы"
		}
	},
	//оповещение родитлея о смене профиля
	notifyParentProfileChanged: function (newProfile) {
		if((this.props.onProfileChange)&&(Utils.isFunction(this.props.onProfileChange))) {
			this.props.onProfileChange(newProfile);
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
	//обработка результатов удаления объявления
	handleDeletePostResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.loadProfilePosts();
		}
	},
	//обработка результатов загрузки объявлений
	handleLoadProfilePostsResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({adverts: resp.MESSAGE, advertsCount: resp.MESSAGE.length, advertsLoaded: true}, this.loadActiveTab);			
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
	//загрузка данных объявлений профиля
	loadProfilePosts: function () {		
		if(this.props.session.loggedIn) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var getAdvertsPrms = {
				language: this.props.language, 
				filter: {userId: this.props.session.sessionInfo.user.profile.id},
				session: this.props.session.sessionInfo
			}
			clnt.getAdverts(getAdvertsPrms, this.handleLoadProfilePostsResult);
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
	//переход на страницу объявления
	goToPost: function (postId) {
		this.context.router.transitionTo("post", {postId: postId}, {});
	},
	//обработка нажатия на карточку объявления
	handlePostClick: function (post) {
		this.goToPost(post.id);
	},
	//обработка нажатия на кнопку редактирования карточки объявления
	handlePostEditClick: function (post) {
		this.context.router.transitionTo("modifypost", {mode: ModifyPostModes.EDIT}, {postId: post.id});
	},
	//обработка нажатия на кнопку создания объявления
	handleAddPostClick: function () {
		if(this.props.session.sessionInfo.user.profile.phoneStatus == ProfilePhoneState.confirmed)
			this.context.router.transitionTo("modifypost", {mode: ModifyPostModes.ADD});
		else
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), 
				Utils.getStrResource({lang: this.props.language, code: "SRV_CARD_PHONE_UNCONF"}));
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
	askRemoveAdvert: function (post) {
		this.setState({confirmDeletePost: true, deletingPostItemId: post.id});
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
	//обработка нажатий на ссылки на пользователей
	handleUserClick: function (userId) {
		this.context.router.transitionTo("user", {userId: userId});
	},
	//обработка нажатия на пост в закладке отзывов
	handleReviewPostClick: function (item) {
		this.goToPost(item.reservation.card.id);
	},
	//обработка изменения профиля
	handleProfileChange: function (newProfile) {		
		this.notifyParentProfileChanged(newProfile);		
		if(this.state.activeReviewsTab == ProfileReviewsTabs[2]) {
			this.loadActiveTab(true);
		} else {
			if(this.state.orders.loaded) this.setState({orders: {loaded: false, count: 0, list: []}});		
		}
	},	
	//обработка загрузки профиля
	handleProfileLoad: function (newProfile) {
		if(!this.state.profileLoaded) this.setState({profileLoaded: true, advertsLoaded: false}, this.loadProfilePosts);
	},
	//обработка изменения фильтра типа запросов
	handleOrdersTypeFilterChange: function (value) {
		this.setState({ordersTypeFilter: value});
	},
	//обновление компонента
	componentDidUpdate: function () {
		Utils.fixFooter();		
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.buildReviewForm(this.props);			
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.language != this.props.language) {
			this.buildReviewForm(newProps);
		}
	},
	//генерация представления страницы редактора профиля
	render: function () {
		//содержимое страницы
		var content;		
		//работаем если залогинены
		if(this.props.session.loggedIn) {			
			//форма отзыва
			var addReviewForm;
			if(this.state.displayAddReview) {
				addReviewForm =	<FormBuilder form={this.state.addReviewForm} 
					onOK={this.onAddReviewFormOK} 
					onChancel={this.onAddReviewFormChancel} 
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
			//профиль пользователя
			var userProfile =	<UserProfile language={this.props.language}
									session={this.props.session}
									editable={true}
									profileId={this.props.session.sessionInfo.user.profile.id}
									onProfileChange={this.handleProfileChange}
									onProfileLoaded={this.handleProfileLoad}
									onDisplayProgress={this.props.onDisplayProgress}
									onHideProgress={this.props.onHideProgress}
									onShowError={this.props.onShowError}
									onShowMessage={this.props.onShowMessage}/>
			//объявления
			var adverts;
			if((this.state.advertsLoaded)&&(this.state.profileLoaded)) {
				adverts =	<ProfilePostsList language={this.props.language}
								title={Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ADVERT"})}
								noAdvertsMessage={Utils.getStrResource({lang: this.props.language, code: "CLNT_NO_ADVERTS"})}
								showAddButton={true}
								showEditButtons={true}
								adverts={this.state.adverts}
								onItemClick={this.handlePostClick}
								onItemAddClick={this.handleAddPostClick}
								onItemEditClick={this.handlePostEditClick}
								onItemDeleteClick={this.askRemoveAdvert}/>
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
											<a href="javascript:void(0);" onClick={this.handleReviewPostClick.bind(this, item)}>
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
											</a>
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
						}					
						break;
					}
					//запросы на бронирование
					case(ProfileReviewsTabs[2]): {
						if(this.state.orders.count > 0) {
							var tabItems = this.state.orders.list.map(function (item, i) {
								var arrow;
								if(item.type != ProfileOrdersTypes.owner) {
									arrow = <span className="glyphicon u-request-direct glyphicon-arrow-right"></span>
								} else {
									arrow = <span className="glyphicon u-request-direct glyphicon-arrow-left my"></span>
								}
								var orderState;
								var userLeft;
								var userRight;
								var userRightInfo;
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
									userLeft =	<div className="u-block-author-reviewlst">
													<img className="u-img-author-m" src={item.card.user.picture.mid}/>
												</div>
									userRight = <a className="u-lnk-small" href="javascript:void(0);" onClick={this.handleUserClick.bind(this, item.user.id)}>
													<div className="u-block-author-reviewlst">
														<img className="u-img-author-m" src={item.user.picture.mid}/>
														<div>{item.user.firstName + " " + item.user.lastName}</div>		
													</div>
												</a>
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
									userLeft =	<div className="u-block-author-reviewlst">
													<img className="u-img-author-m" src={item.user.picture.mid}/>
												</div>
									userRight = <a className="u-lnk-small" href="javascript:void(0);" onClick={this.handleUserClick.bind(this, item.card.user.id)}>
													<div className="u-block-author-reviewlst">
														<img className="u-img-author-m" src={item.card.user.picture.mid}/>
														<div>{item.card.user.firstName + " " + item.card.user.lastName}</div>		
													</div>
												</a>
								}
								if((this.state.ordersTypeFilter == "")||(item.type == this.state.ordersTypeFilter))
									return (															
										<div className="w-row u-row-underline">
											<div className="w-col w-col-2 u-col-query u-t-center">
											  {Utils.formatDate({lang: this.props.language, date: item.createdAt})}
											</div>											
											<div className="w-col w-col-1 u-col-query w-col-tiny-5">
												{userLeft}
											</div>
											<div className="w-col w-col-1 u-col-query w-col-tiny-3">
												{arrow}
											</div>
											<div className="w-col w-col-1 u-col-query w-col-tiny-4">
												{userRight}
											</div>								
											<div className="w-col w-col-3 u-col-query u-t-center">
													{Utils.formatDate({lang: this.props.language, 
														date: item.dateFrom}) + " - " + 
													Utils.formatDate({lang: this.props.language, 
														date: item.dateTo})}
											</div>
											<div className="w-col w-col-4 w-clearfix u-col-query u-t-center">
												{orderState}
											</div>
										</div>
									);
							}, this);
							tmpTabContent = <div>
												<br/>
												<OptionsSelector view={OptionsSelectorView.SELECT}
													appendEmptyOption={true}
													emptyOptionLabel={Utils.makeEmptyOptionLabel(Utils.getStrResource({lang: this.props.language, code: "MD_ITM_ORDER_TYPE"}))}
													options={optionsFactory.buildOptions({
														language: this.props.language, 
														id: "ordersTypes",
														options: ordersTypes})}
													language={this.props.language}
													defaultOptionsState={this.state.ordersTypeFilter}
													onOptionChanged={this.handleOrdersTypeFilterChange}/>
												<div className="w-row w-hidden-small w-hidden-tiny u-row-underline header">
													<div className="w-col w-col-2 u-t-center">
														<p><strong>
															{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_ORDERS_ORDER_DATE"})}															
														</strong></p>
													</div>
													<div className="w-col w-col-3 u-t-center">
													</div>
													<div className="w-col w-col-3 u-t-center">
														<p><strong>
															{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_ORDERS_ORDER_PERIOD"})}															
														</strong></p>
													</div>
													<div className="w-col w-col-4 u-t-center">
														<p><strong>
															{Utils.getStrResource({lang: this.props.language, code: "UI_TBL_HDR_ORDERS_ORDER_STATE"})}															
														</strong></p>
													</div>	
												</div>	
												{tabItems}
											</div>
						} 					
						break;
					}
					default: {}
				}
				activeReviewsTabContent =	<div className="w-tab-content u-tab-cont1">
												{tmpTabContent}
											</div>
			}
			//непосредственно профиль с объявлениями отзывами и запросами
			content =	<section className="w-container">
							{addReviewForm}								
							{confDeleteDlg}
							<div className="w-section u-sect-card">
								<div className="w-row">
									<div className="w-col w-col-6 u-col-card">
										{userProfile}
									</div>
									<div className="w-col w-col-6 u-col-card">										
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