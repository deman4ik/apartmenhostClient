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
		var textItemTmp = formFactory.buildFormItem({
			language: props.language,
			label: Utils.getStrResource({lang: props.language, code: "UI_FLD_COMPLAINT_TEXT"}),
			name: "complaintText",
			dataType: formFactory.itemDataType.STR,
			inputType: formFactory.itemInputType.TEXT,
			required: true
		});
		formFactory.appedFormItem(formTmp, textItemTmp);
		this.setState({sendComplaintForm: formTmp});
	},
	//расчет "цены за период" объявлений по датам
	calcAdvertPricePeriod: function (advert) {
		var tmp = {};
		_.extend(tmp, advert);
		if((this.state.dFrom)&&(this.state.dTo)) {
			var dFrom = new Date(this.state.dFrom);
			var dTo = new Date(this.state.dTo);
			tmp.pricePeriod = tmp.priceDay * 1 * Utils.daysBetween(dFrom, dTo);
		} else {
			tmp.pricePeriod = 0;
		}
		return tmp;	
	},
	//отправка жалобы
	onComplaintFormOK: function (values) {
		this.setState({displaySendComplaint: false});
		this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
			Utils.getStrResource({lang: this.props.language, code: "CLNT_COMPLAINT_ADDED"}));
	},
	//отмена отправки жалобы
	onComplaintFormChancel: function () {
		this.setState({displaySendComplaint: false});
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
		if((this.state.dFrom)&&(this.state.dTo)) {
			this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
			var resPrms = {
				language: this.props.language, 
				postId: this.state.postId,
				dateFrom: new Date(this.state.dFrom).to_yyyy_mm_dd(),
				dateTo: new Date(this.state.dTo).to_yyyy_mm_dd()
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
		this.setState({displaySendComplaint: true});
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
		this.setState({showPhone: true});
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
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		this.buildComplaintForm(this.props);
		if(this.context.router.getCurrentQuery().dFrom) this.setState({dFrom: this.context.router.getCurrentQuery().dFrom});
		if(this.context.router.getCurrentQuery().dTo) this.setState({dTo: this.context.router.getCurrentQuery().dTo});
		this.setState({postId: this.context.router.getCurrentParams().postId}, this.loadPost);
	},
	//завершение генерации/обновления представления компонента
	componentDidUpdate: function (prevProps, prevState) {
		fixFooter();
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
		if(newProps.language != this.props.language) {
			this.buildComplaintForm(newProps);
		}
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
		var pricePeriodStyle;
		if(this.state.post.pricePeriod > this.state.post.priceDay) pricePeriodStyle = {display: "inline"}; else pricePeriodStyle = {display: "none"};
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
				bookBtn =	<a className="u-btn query" href="javascript:void(0);" onClick={this.handleBookClick} style={aStyle}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REQ_RENT"})}
							</a>											
			} else {
				bookBtn =	<a className="u-btn query booked" href="javascript:void(0);" style={aStyle}>
								<span className="glyphicon glyphicon-ok btn" aria-hidden="true"></span>
								{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_BOOKED"})}
							</a>
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
				"btn-done": (this.state.post.isFavorite)
			});
			var favorBtn;
			if(this.state.post.isFavorite) {
				favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
								<span className="glyphicon glyphicon-ok btn" aria-hidden="true"></span>
								{favorText}
							</a>
			} else {
				favorBtn =	<a className={classesFavorBtn} href="javascript:void(0);" style={aStyle} onClick={this.handleFavorClick}>
								<span className="glyphicon glyphicon-heart btn" aria-hidden="true"></span>
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
									<img className="u-img-author-review" 
										src={item.fromUser.picture.url}
										width="76"/>
									<div>{item.fromUser.firstName}<br/>{item.fromUser.lastName}</div>
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
												<img className="u-img-author-m" src={this.state.post.user.picture.url} width="96"/>
												<div>{this.state.post.user.lastName} {this.state.post.user.firstName}</div>
												<Rater total={5} rating={this.state.post.user.rating}/>
											</div>
											<div className="u-block-cardprice">
												<div className="u-t-label-cardprice">
													<OptionsParser language={this.props.language}								
														options={optionsFactory.parse(this.state.post.residentGender)}
														view={OptionsParserView.ROW}/>
												</div>
												<div className="u-block-ownertext">
													<div className="u-t-price">
														<strong>
															{this.state.post.priceDay}&nbsp;
															{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
															{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
														</strong>
													</div>
													<div className="u-t-price2" style={pricePeriodStyle}>
														{this.state.post.pricePeriod}&nbsp;
														{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
														{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD"})}
													</div>
												</div>
												{bookFrm}
												{bookBtn}											
											</div>
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
											<div className="empty"></div>
											<div className="u-block-spacer"></div>
										</div>
										<div className="w-col w-col-7 w-clearfix u-col-card">							
											<Galery images={this.state.post.apartment.pictures}/>
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
							{advReviews}
						</div>
		} else {
			content =	<InLineMessage type={Utils.getMessageTypeErr()}
							message={Utils.getStrResource({lang: this.props.language, code: "UI_NO_DATA"})}/>
		}
		//генератор		
		return (
			<div className="content-center">
				{content}
 			</div>
		);
	}
});