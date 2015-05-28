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
			dTo: "" //дата коночания периода бронирования
		}
	},
	//обработка загруженных данных объявления
	handleLoadPostResult: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.setState({post: resp.MESSAGE, postReady: true});
		}
	},
	//загрузка данных объявления
	loadPost: function () {
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		var getPrms = {
			language: this.props.language, 
			postId: this.state.postId
		}
		if(this.props.session.loggedIn) _.extend(getPrms, {session: this.props.session.sessionInfo});
		clnt.getAdvert(getPrms, this.handleLoadPostResult);
	},
	//выполнение бронирования
	makeBooking: function () {
		if((React.findDOMNode(this.refs.dfrom).value)&&(React.findDOMNode(this.refs.dto).value)) {
			this.setState({postBooked: true});	
		} else {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_BOOKING_NO_DATES"}));
		}
	},
	//обработка смены дат
	handleDateChange: function (formInput, event) {
		var stateObject = {};
		stateObject[formInput] = event.target.value;
		this.setState(stateObject);
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
		console.log(resp);
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
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
		if(this.context.router.getCurrentQuery().dFrom) this.setState({dFrom: this.context.router.getCurrentQuery().dFrom});
		if(this.context.router.getCurrentQuery().dTo) this.setState({dTo: this.context.router.getCurrentQuery().dTo});
		this.setState({postId: this.context.router.getCurrentParams().postId}, this.loadPost);
	},
	//обновление свойств компонента
	componentWillReceiveProps: function (newProps) {
	},
	//генерация представления объявления
	render: function () {
		//дополнительные стили
		var aStyle = {textDecoration: "none"};
		var ulOptions = {paddingLeft: "14px"};
		var btnRate = {textDecoration: "none", float: "none"};
		//содержимое объявления
		var content;
		if(this.state.postReady) {
			//кнопка бронирования
			var bookBtn;
			if(!this.state.postBooked) {
				bookBtn =	<a className="u-btn query" href="javascript:;" onClick={this.handleBookClick} style={aStyle}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_REQ_RENT"})}
							</a>											
			} else {
				bookBtn =	<a className="u-btn-booked u-btn" href="javascript:;" style={aStyle}>
								{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_BOOKED"})}
							</a>
			}
			//телефон владельца
			var phone;
			if(!this.state.showPhone) {
				phone =	<a className="u-btn tel" href="javascript:;" onClick={this.handleShowPhoneClick} style={aStyle}>
							{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SHOW_PHONE"})}
						</a>
			} else {
				phone = <div><strong>{this.state.post.user.phone}</strong></div>
			}
			//отзыв
			var rate;
			if((this.state.postBooked)&&(false)) {
				rate =	<a className="w-button u-btn-primary" href="javascript:;" style={btnRate}>
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
				"btn-done": (this.state.post.isFavorite)
			});
			var favorBtn =	<a className={classesFavorBtn} href="javascript:;" style={aStyle} onClick={this.handleFavorClick}>
								{favorText}
							</a>			
			//дополнительные опции объявления
			var advOptions;
			if(this.state.post.apartment.options) {			 
				var advOptionsItems = this.state.post.apartment.options.split(";").map(function (option, i) {
					return (
						<li>
							{Utils.getStrResource({lang: this.props.language, code: option})}
						</li>
					);
				}, this);
				advOptions = <ul className="descr" style={ulOptions}>{advOptionsItems}</ul>
			}
			//объявление
			content =	<div className="w-section u-sect-card">
							<div className="w-container">
								<div className="w-row">							    
									<div className="w-col w-col-5 u-col-card">
										<div className="u-block-owner">
											<img className="u-img-author-m" src={this.state.post.user.img} width="96"/>
											<div>{this.state.post.user.lastName} {this.state.post.user.firstName}</div>
										</div>
										<div className="u-block-cardprice">
											<div className="u-t-label-cardprice">
												{Utils.getStrResource({lang: this.props.language, code: this.state.post.residentGender})}
											</div>
											<div className="u-block-ownertext">
												<div className="u-t-price">
													<strong>
														{this.state.post.priceDay}&nbsp;
														{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
														{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_DAY"})}
													</strong>
												</div>
												<div className="u-t-price2">
													{this.state.post.pricePeriod}&nbsp;
													{Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}&nbsp;/&nbsp;
													{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_PERIOD_WEEK"})}
												</div>
											</div>
											<div className="w-form u-form-wrapper-simple">
												<form className="w-clearfix">
													<input className="w-input u-form-field rel dtcard"
														type="date"
														ref="dfrom"
														value={this.state.dFrom}
														onChange={this.handleDateChange.bind(this, "dFrom")}
														placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}/>
													<input className="w-input u-form-field rel dtcard right"
														type="date"
														ref="dto"
														value={this.state.dTo}
														onChange={this.handleDateChange.bind(this, "dTo")}
														placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}/>
												</form>
											</div>
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
												<a className="u-lnk-norm" href="javascript:;">
													{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SEND_COMPLAINT"})}
												</a>
											</div>
										</div>
										<div className="empty"></div>
									</div>
									<div className="w-col w-col-7 w-clearfix u-col-card">
										<div>
											<a className="w-lightbox w-inline-block" href="#">
												<img src={this.state.post.apartment.img}/>
											</a>
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