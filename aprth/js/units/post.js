/*
	Карточка объявления
*/
var Post = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},
	//состояние объявления
	getInitialState: function () {
		return {			
			postId: "", //идентификатор объявления
			post: {}, //данные объявления
			postReady: false, //объявление готово к отображению
			postBooked: false, //состояние отправки запроса на бронирование
			showPhone: false, //признак отображения телефона владельца
			priceCat: "", //категория цены для бронирования
			dFrom: "", //дата начала периода бронирования
			dTo: "", //дата коночания периода бронирования
			displaySendComplaint: false, //признак отображения формы жалобы
			sendComplaintForm: {} //форма жалобы
		}
	},
	//сборка формы жалобы
	buildComplaintForm: function (props) {
		var formTmp = formFactory.buildForm({
			language: props.language,
			title: Utils.getStrResource({lang: props.language, code: "UI_TITLE_COMPLAINT"})
		});
		var nameItemTmp;
		if(props.session.loggedIn) {
			nameItemTmp = formFactory.buildFormItem({
				language: props.language,
				label: Utils.getStrResource({lang: props.language, code: "UI_FLD_FIRST_NAME"}),
				name: "userName",
				dataType: formFactory.itemDataType.STR,
				inputType: formFactory.itemInputType.LBL,
				required: true,
				value: props.session.sessionInfo.user.profile.firstName
			});
		} else {
			nameItemTmp = formFactory.buildFormItem({
				language: props.language,
				label: Utils.getStrResource({lang: props.language, code: "UI_FLD_FIRST_NAME"}),
				name: "userName",
				dataType: formFactory.itemDataType.STR,
				inputType: formFactory.itemInputType.MANUAL,
				required: true,
				value: ""
			});
		}
		var textItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_COMPLAINT_TEXT"}),
			name: "complaintText",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.TEXT,
			required: true,
			value: ""
		});
		formFactory.appedFormItem(formTmp, nameItemTmp);
		formFactory.appedFormItem(formTmp, textItemTmp);
		this.setState({sendComplaintForm: formTmp});
	},
	//расчет "цены за период" объявлений по датам
	calcAdvertPricePeriod: function (advert) {
		var tmp = {};
		_.extend(tmp, advert);
		if((this.state.dFrom)&&(this.state.dTo)&&(this.state.priceCat)) {
			var dFrom = new Date(this.state.dFrom);
			var dTo = new Date(this.state.dTo);
			var pr = _.findWhere(tmp.genders, {name: this.state.priceCat});
			if(pr) {
				tmp.priceDay = pr.price;
				tmp.pricePeriod = pr.price * 1 * Utils.daysBetween(dFrom, dTo);
			} else {
				tmp.priceDay = _.min(_.pluck(tmp.genders, "price"));
				tmp.pricePeriod = 0;
			}			
		} else {
			if((this.state.dFrom)&&(this.state.dTo)) {
				var dFrom = new Date(this.state.dFrom);
				var dTo = new Date(this.state.dTo);
				tmp.priceDay = _.min(_.pluck(tmp.genders, "price"));
				tmp.pricePeriod = tmp.priceDay * 1 * Utils.daysBetween(dFrom, dTo);
			} else {
				if(this.state.priceCat) {
					var pr = _.findWhere(tmp.genders, {name: this.state.priceCat});
					tmp.priceDay = pr.price;
					tmp.pricePeriod = 0;
				} else {
					tmp.priceDay = _.min(_.pluck(tmp.genders, "price"));
					tmp.pricePeriod = 0;
				}
			}
		}
		return tmp;	
	},
	//отправка жалобы
	onComplaintFormOK: function (values) {
		if(
			(_.find(values, {name: "userName"}))&&
			(_.find(values, {name: "complaintText"})) 
		) {
			var userName = _.find(values, {name: "userName"}).value;
			var text = _.find(values, {name: "complaintText"}).value;
			this.sendComplaint(userName, text);
		}		
	},
	//отмена отправки жалобы
	onComplaintFormChancel: function () {
		this.setState({displaySendComplaint: false}, function() {this.buildComplaintForm(this.props);});
	},
	//обработка результата отправки жалобы
	handleSendComplaint: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({displaySendComplaint: false}, function() {this.buildComplaintForm(this.props);});
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_COMPLAINT_ADDED"}));
		}
	},
	//отправка жалобы
	sendComplaint: function (userName, text) {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var sendPrms = {
			language: this.props.language,
			session: this.props.session.sessionInfo,
			data: {
				userName: userName,
				abuserId: this.state.post.user.id,
				userId: this.props.session.sessionInfo.user.profile.id,
				type: "ABUSE",
				text: text,
				answerByEmail: false
			}
		}
		clnt.feedBack(sendPrms, this.handleSendComplaint);
	},
	//обработка загруженных данных объявления
	handleLoadPostResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var postTmp = this.calcAdvertPricePeriod(resp.MESSAGE[0]);	
			this.setState({post: postTmp, postReady: true});
		}
	},
	//загрузка данных объявления
	loadPost: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var getPrms = {
			language: this.props.language,
			filter: {id: this.state.postId},
			session: this.props.session.sessionInfo
		}
		if(this.props.session.loggedIn) _.extend(getPrms, {session: this.props.session.sessionInfo});
		clnt.getAdverts(getPrms, this.handleLoadPostResult);
	},
	//обработка результатов бронирования
	handleBookingResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({postBooked: true});
		}
	},
	//выполнение бронирования
	makeBooking: function () {
		if((this.state.dFrom)&&(this.state.dTo)&&(this.state.priceCat)) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var resPrms = {
				language: this.props.language, 
				postId: this.state.postId,
				dateFrom: new Date(this.state.dFrom).to_yyyy_mm_dd(),
				dateTo: new Date(this.state.dTo).to_yyyy_mm_dd(),
				gender: this.state.priceCat
			}
			if(this.props.session.loggedIn) _.extend(resPrms, {session: this.props.session.sessionInfo});
			clnt.makeReservation(resPrms, this.handleBookingResult);
		} else {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_BOOKING_NO_DATES"}));
		}
	},
	//выполнение добавления жалобы
	makeComplaint: function () {
		this.buildComplaintForm(this.props);
		this.setState({displaySendComplaint: true});
	},
	//обработка смены категории цены
	handlePriceCatChange: function (value) {
		this.setState({priceCat: value}, function () {
			var postTmp = this.calcAdvertPricePeriod(this.state.post);
			this.setState({post: postTmp});
		});
	},
	//обработка смены дат
	handleDateChange: function (datePickerName, date) {
		var stateObject = {};
		stateObject[datePickerName] = (date)?date:"";
		this.setState(stateObject, function () {
			var postTmp = this.calcAdvertPricePeriod(this.state.post);
			this.setState({post: postTmp});
		});
	},
	//нажатие на бронирование
	handleBookClick: function () {
		if(this.props.session.loggedIn)
			this.makeBooking();
		else
			this.props.onLogIn({
				actionType: AppAfterAuthActionTypes.CALLBACK, 
				actionPrms: {callBack: this.makeBooking}
			});		
	},
	//нажатие на запрос телефона
	handleShowPhoneClick: function () {
		if(this.props.session.loggedIn)
			this.setState({showPhone: true});
		else
			this.props.onLogIn({
				actionType: AppAfterAuthActionTypes.CALLBACK, 
				actionPrms: {callBack: Utils.bind(function () {this.setState({showPhone: true});}, this)}
			});			
	},
	//получение ответа о смене статуса в избранном
	handleFavorChange: function (resp) {
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			var postTmp = _.extend({}, this.state.post);
			postTmp.isFavorite = resp.MESSAGE.data[0];
			this.setState({post: postTmp});			
		}
	},
	//смена статуса в избранном
	toggleAdvertFavor: function () {
		var togglePrms = {
			language: this.props.language, 
			postId: this.state.post.id, 
			session: this.props.session.sessionInfo
		}
		clnt.toggleAdvertFavor(togglePrms, this.handleFavorChange);
	},
	//обработка нажатия на "Избранное"
	handleFavorClick: function () {
		if(this.props.session.loggedIn)
			this.toggleAdvertFavor();
		else
			this.props.onLogIn({
				actionType: AppAfterAuthActionTypes.CALLBACK, 
				actionPrms: {callBack: this.toggleAdvertFavor}
			});		
	},
	//обработка нажатия на "Пожаловаться"
	handleSendComplaintClick: function () {
		if(this.props.session.loggedIn)
			this.makeComplaint();
		else
			this.props.onLogIn({
				actionType: AppAfterAuthActionTypes.CALLBACK, 
				actionPrms: {callBack: this.makeComplaint}
			});		
	},
	//обработка нажатия на владельца объявления
	handleOwnerClick: function () {
		this.context.router.transitionTo("user", {userId: this.state.post.userId});
	},
	//обработка нажатия на владельца объявления
	handleReviewAuthorClick: function (authorUserId) {
		this.context.router.transitionTo("user", {userId: authorUserId});
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.buildComplaintForm(this.props);
		if(this.context.router.getCurrentQuery().dFrom) this.setState({dFrom: this.context.router.getCurrentQuery().dFrom});
		if(this.context.router.getCurrentQuery().dTo) this.setState({dTo: this.context.router.getCurrentQuery().dTo});
		if(this.context.router.getCurrentQuery().priceCat) this.setState({priceCat: this.context.router.getCurrentQuery().priceCat});
		this.setState({postId: this.context.router.getCurrentParams().postId}, this.loadPost);
	},
	//завершение генерации/обновления представления компонента
	componentDidUpdate: function (prevProps, prevState) {
		Utils.fixFooter();
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.language != this.props.language) {
			this.buildComplaintForm(newProps);
		}
	},
	//проверка на "своё" обявления
	isMyPost: function () {
		var res = false;
		try {
			if(this.props.session.loggedIn) {
				if(this.state.post.apartment.userId == this.props.session.sessionInfo.user.profile.id)
					res = true;
			}
		} catch (e) {}
		return res;
	},
	//генерация представления объявления
	render: function () {
		//дополнительные стили
		var aStyle = {textDecoration: "none"};
		var ulOptions = {paddingLeft: "14px"};
		var btnRate = {textDecoration: "none", float: "none"};
		var cDateInput = React.addons.classSet;
		var classesDateInput = cDateInput({
			"w-input": true,
			"u-form-field": true,
			"rel": true,
			"dtcard": true
		});	
		var cDateInputR = React.addons.classSet;
		var classesDateInputR = cDateInputR({
			"w-input": true,
			"u-form-field": true,
			"rel": true,
			"dtcard": true,
			"right": true
		});
		//содержимое объявления
		var content;
		if(this.state.postReady) {
			//форма жалобы
			var complaintForm;
			if(this.state.displaySendComplaint) {
				complaintForm =	<FormBuilder form={this.state.sendComplaintForm} 
						onOK={this.onComplaintFormOK} 
						onChancel={this.onComplaintFormChancel} 
						onShowError={this.props.onShowError}
						language={this.props.language}/>
			}
			//форма бронирования
			var bookFrm;
			if(!this.state.postBooked) {
				bookFrm =	<div className="w-form u-form-wrapper-simple">
								<form className="w-clearfix">
									<OptionsSelector view={OptionsSelectorView.SELECT}
										appendEmptyOption={true}
										emptyOptionLabel={Utils.makeEmptyOptionLabel(Utils.getStrResource({lang: this.props.language, code: "MD_ITM_PET_TYPE"}))}
										options={optionsFactory.buildOptions({
													language: this.props.language, 
													id: "priceCat",
													options: _.pluck(this.state.post.genders, "name")})}
										language={this.props.language}
										defaultOptionsState={this.state.priceCat}
										onOptionChanged={this.handlePriceCatChange}
										selectorStyles={{borderRadius: "0px", marginBottom: "0px"}}/>
									<Calendar name="dFrom" 
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}
										defaultValue={(this.state.dFrom)?(new Date(this.state.dFrom)):""}
										onDatePicked={this.handleDateChange}
										language={this.props.language}
										inputClasses={classesDateInput}
										disabledDates={Utils.buildDaysList({lang: this.props.language, dates: this.state.post.dates})}/>
									<Calendar name="dTo" 
										placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}
										defaultValue={(this.state.dTo)?(new Date(this.state.dTo)):""}
										onDatePicked={this.handleDateChange}
										language={this.props.language}
										inputClasses={classesDateInputR}
										disabledDates={Utils.buildDaysList({lang: this.props.language, dates: this.state.post.dates})}/>
								</form>
							</div>
			}
			//кнопка бронирования
			var bookBtn;
			if(!this.state.postBooked) {
				if(!this.isMyPost()) {
					bookBtn =	<a className="u-btn query" href="javascript:void(0);" onClick={this.handleBookClick} style={aStyle}>
									{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REQ_RENT"})}
								</a>
				}
			} else {
				bookBtn =	<a className="u-btn query booked" href="javascript:void(0);" style={aStyle}>
								<span className="glyphicon glyphicon-ok btn" aria-hidden="true"></span>
								{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_BOOKED"})}
							</a>
			}
			//цена
			var pricePeriod;
			if(this.state.post.pricePeriod * 1 > 0) {
				pricePeriod =	<span>
									{this.state.post.pricePeriod}&nbsp;
									{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
									{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD"})}
								</span>
			} else {
				pricePeriod = <span>{Utils.getStrResource({lang: this.props.language, code: "CLNT_PRICE_CATEGORY_CALC_ERR"})}</span>
			}			
			//телефон владельца
			var phone;
			if(!this.state.showPhone) {
				phone =	<a className="u-btn tel" href="javascript:void(0);" onClick={this.handleShowPhoneClick} style={aStyle}>
							{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SHOW_PHONE"})}
						</a>
			} else {
				phone = <div><strong>{this.state.post.user.phone}</strong></div>
			}
			//картинки
			var galery;
			if(Array.isArray(this.state.post.apartment.pictures)) {
				if(!_.findWhere(this.state.post.apartment.pictures, {id: "default"})) {
					galery = <Galery images={this.state.post.apartment.pictures}/>
				} else {
					galery = <center><img width={256} src={this.state.post.apartment.pictures[0].url}/></center>
				}
			}
			//отзыв
			var rate;
			if((this.state.postBooked)&&(false)) {
				rate =	<a className="w-button u-btn-primary" href="javascript:void(0);" style={btnRate}>
							{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_RATE"})}
						</a>
			} else {
				rate =	<span>
							{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_CAN_RATE_AFTER_BOOKING"})}
						</span>
			}
			//блок отзывов, телефона и жалоб
			var phoneAndComplaint;
			if(!this.isMyPost()) {
				phoneAndComplaint = <div>
										<div className="u-block-owner addition">
											<div>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_MAKE_CALL"})}</div>
											{phone}
										</div>
										<div className="u-block-owner addition2">
											<div>
												{rate}										
											</div>
											<div className="u-t-small center">
												<a className="u-lnk-norm" href="javascript:void(0);" onClick={this.handleSendComplaintClick}>
													{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SEND_COMPLAINT"})}
												</a>
											</div>
										</div>
									</div>
			}
			//кнопка управления избранным
			var favorText;
			if(this.state.post.isFavorite) {
				favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_RM"});
			} else {
				favorText = Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FAVOR_ADD"});	
			}
			var cFavorBtn = React.addons.classSet;
			var classesFavorBtn = cFavorBtn({
				"u-btn": true,
				"btn-sm": true,
				"right": true,
				"fav": !(this.state.post.isFavorite)
			});
			var favorBtn;
			if(this.state.post.isFavorite) {
				favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
								<span className="glyphicon glyphicon-heart btn" aria-hidden="true"></span>
								{favorText}
							</a>
			} else {
				if(!this.isMyPost())
					favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
									<span className="glyphicon glyphicon-heart-empty btn" aria-hidden="true"></span>
									{favorText}
								</a>				
			}	
			//дополнительные опции объявления
			var advOptions;
			if(this.state.post.apartment.options) {
				if(!optionsFactory.isParseble(this.state.post.apartment.options)) {
					advOptions =	<div>{this.state.post.apartment.options}</div>
				} else {
					advOptions =	<OptionsParser language={this.props.language}
										options={optionsFactory.parse(this.state.post.apartment.options)}
										convertOptions={OptionsParserConvert.NO_CONVERT}
										view={OptionsParserView.LIST}
										listStyle={ulOptions}/>				
				}
			}
			//отзывы
			var advReviews;
			if((this.state.post.reviews)&&(Array.isArray(this.state.post.reviews))) {
				var advReviewsItems = this.state.post.reviews.map(function (item, i) {
					return (
						<div className="w-row">
							<div className="w-col w-col-3">
								<div className="u-block-author-reviewlst">
									<a className="u-lnk-norm" 
										href="javascript:void(0);"
										onClick={this.handleReviewAuthorClick.bind(this, item.fromUser.id)}>
										<img className="u-img-author-review" 
											src={item.fromUser.picture.url}
											width="76"/>
										<div>{item.fromUser.firstName}<br/>{item.fromUser.lastName}</div>
									</a>
								</div>
							</div>
							<div className="w-col w-col-9">
								<div>
									<Rater total={5} rating={item.rating} align={"left"}/>
									<div className="u-t-small date1">{Utils.formatDate({lang: this.props.language, date: item.createdAt})}</div>
									<p>{item.text}</p>
								</div>
							</div>
						</div>						
					);
				}, this);
				advReviews =	<section className="w-section u-sect-card-reviewlst">
									<div className="w-container">
										{advReviewsItems}
									</div>
								</section>
			}
			//объявление
			content =	<div>
							<section className="w-section u-sect-card">
								{complaintForm}
								<div className="w-container">
									<div className="w-row">							    
										<div className="w-col w-col-5 u-col-card">											 
											<div className="u-block-owner">
												<a className="u-lnk-norm" 
													href="javascript:void(0);"
													onClick={this.handleOwnerClick}>
													<img className="u-img-author-m" src={this.state.post.user.picture.xlarge}/>
													<div>{this.state.post.user.lastName} {this.state.post.user.firstName}</div>													
												</a>
												<Rater total={5} rating={this.state.post.user.rating}/>
											</div>											
											<div className="u-block-cardprice">
												<div className="u-block-ownertext">
													<div className="u-t-price">
														<strong>
															{this.state.post.priceDay}&nbsp;
															{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
															{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
														</strong>
													</div>
													<div className="u-t-price2">
														{pricePeriod}														
													</div>
												</div>
												{bookFrm}
												{bookBtn}											
											</div>
											{phoneAndComplaint}
											<div className="empty"></div>
											<div className="u-block-spacer"></div>
										</div>
										<div className="w-col w-col-7 w-clearfix u-col-card">							
											{galery}
											<div>
												<div className="w-row u-row-descr head">
													<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
														<h3>
															{Utils.getStrResource({lang: this.props.language, code: this.state.post.apartment.type})}
														</h3>
													</div>
													<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6 w-clearfix">
														{favorBtn}
													</div>
												</div>
												<div className="w-row u-row-descr">
													<div className="w-col w-col-4 w-col-small-6 w-col-tiny-6">
														<div>
															{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_EXTRAS"})}
														</div>
													</div>
													<div className="w-col w-col-8 w-col-small-6 w-col-tiny-6">
														{advOptions}
													</div>
												</div>
												<div className="w-row u-row-descr">
													<div className="w-col w-col-4">
														<div>
															<div>{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_ADRESS"})}</div>
														</div>
													</div>
													<div className="w-col w-col-8">
														<div>{this.state.post.apartment.adress}</div>
													</div>
												</div>
												<div className="w-row u-row-descr">
													<div className="w-col w-col-4">
														<div>
															<div>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_DESCR"})}</div>
														</div>
													</div>
													<div className="w-col w-col-8">
														<div>{this.state.post.description}</div>
													</div>
												</div>
												<div className="w-row u-row-descr">
													<div className="w-col w-col-4">
														<div>
															<div>{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ABOUT_OWNER"})}</div>
														</div>
													</div>
													<div className="w-col w-col-8">
														<div>{this.state.post.user.description}</div>
													</div>
												</div>
											</div>
										</div>								
									</div>
								</div>
							</section>
							<section className="w-section u-sect-card-map">
								<Map mode={mapModes.modeSignle}
									zoom={config.postMapZoom}
									scrollWheel={false}
									title={this.state.post.apartment.name}
									latitude={this.state.post.apartment.latitude} 
									longitude={this.state.post.apartment.longitude}
									address={this.state.post.apartment.adress}/>
							</section>
							{advReviews}
						</div>
		}
		//генератор		
		return (
			<div className="content-center">
				{content}
 			</div>
		);
	}
});