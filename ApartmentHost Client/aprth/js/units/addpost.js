/*
	Размещение объявления
*/
var AddPost = React.createClass({
	//состояние
	getInitialState: function () {
		return {
		}
	},
	//зачистка формы
	clearAddRentForm: function () {
		React.findDOMNode(this.refs.sex).value = "";
		React.findDOMNode(this.refs.apartType).value = "";
		React.findDOMNode(this.refs.address).value = "";
		React.findDOMNode(this.refs.dfrom).value = "";
		React.findDOMNode(this.refs.dto).value = "";
		React.findDOMNode(this.refs.apartAddition).value = "";
		React.findDOMNode(this.refs.rentAddition).value = "";
		React.findDOMNode(this.refs.price).value = "";	
	},
	//обработка результата добалвения объявления
	handleAddRent: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_DONE"}));
			this.clearAddRentForm();
		}
	},
	//добалвение объявления
	addRent: function () {
		var price = React.findDOMNode(this.refs.price).value * 1;
		if(price.toString().indexOf(".") == -1) price += ".0";
		var addPrms = {
			language: this.props.language,
			session: this.props.session.sessionInfo,
			data: {
				apartment: {
					adress: React.findDOMNode(this.refs.address).value,
					Name: React.findDOMNode(this.refs.apartAddition).value,
					type: React.findDOMNode(this.refs.apartType).value,
				},
				Name: React.findDOMNode(this.refs.apartAddition).value,
				dateFrom: React.findDOMNode(this.refs.dfrom).value + "T00:00:00Z",
				dateTo: React.findDOMNode(this.refs.dto).value + "T00:00:00Z",
				description: React.findDOMNode(this.refs.apartAddition).value,
				residentGender: React.findDOMNode(this.refs.sex).value,
				priceDay: price,
				pricePeriod: price * 10
			}
		}
		clnt.addAdvert(addPrms, this.handleAddRent);
	},
	//проверка обязательных параметров
	checkRequredValues: function () {
		var res = "";
		if(!React.findDOMNode(this.refs.tel).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PHONE"})]});
			return res;
		}		
		if(!React.findDOMNode(this.refs.sex).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})]});
			return res;
		}
		if(!React.findDOMNode(this.refs.apartType).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})]});
			return res;
		}
		if(!React.findDOMNode(this.refs.address).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_ADRESS"})]});
			return res;
		}
		if((!React.findDOMNode(this.refs.dfrom).value)||(!React.findDOMNode(this.refs.dto).value)) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_UNAVAILABLE"})]});
			return res;
		}
		if(!React.findDOMNode(this.refs.apartAddition).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_APARTMENT_DESC"})]});
			return res;
		}
		if((!React.findDOMNode(this.refs.price).value)||(isNaN(React.findDOMNode(this.refs.price).value))||(React.findDOMNode(this.refs.price).value <= 0)) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PRICE"})]});
			return res;
		}
		return res;
	},
	//нажатие на кнопку добавления объявления
	handleAddRentClick: function () {
		var msg = this.checkRequredValues();
		if(!msg) {
			this.addRent();
		} else {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), msg);
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {
	},
	//генерация представления страницы размещения объявления
	render: function () {
		//классы контейнера		
		var cCont = React.addons.classSet;
		var classesCont = cCont({
			"empty-unit": (!this.props.session.loggedIn)
		});
		//содержимое формы
		var content;
		if(this.props.session.loggedIn) {
			content =	<div className="w-section">
							<div className="w-container">
								<div className="u-block-underline h3">
									<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_ADD_RENT_POST"})}</h3>
								</div>
								<div className="w-form">
									<form className="w-clearfix" id="addPostForm">
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PHONE"})}:</label>
												<div className="u-t-small">{Utils.getStrResource({lang: this.props.language, code: "UI_NOTE_PHONE"})}</div>
											</div>
											<div className="w-col w-col-9">
												<input className="w-input u-form-field" type="text" ref="tel" value={this.props.session.sessionInfo.user.profile.phone}/>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}:</label>
											</div>
											<div className="w-col w-col-9">
												<select className="w-select u-form-field" ref="sex">
													<option value="">{Utils.getStrResource({lang: this.props.language, code: "DVAL_ANY"})}</option>
													<option value="DVAL_MALE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_MALE"})}</option>
													<option value="DVAL_FEMALE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_FEMALE"})}</option>
												</select>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">
													{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}:
												</label>
											</div>
											<div className="w-col w-col-9">
												<select className="w-select u-form-field" ref="apartType">
													<option value="" selected>{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}</option>
													<option value="DVAL_HOUSE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_HOUSE"})}</option>
													<option value="DVAL_ROOM">{Utils.getStrResource({lang: this.props.language, code: "DVAL_ROOM"})}</option>
													<option value="DVAL_OFFICE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_OFFICE"})}</option>
													<option value="DVAL_FLAT">{Utils.getStrResource({lang: this.props.language, code: "DVAL_FLAT"})}</option>
													<option value="DVAL_HOTEL_ROOM">{Utils.getStrResource({lang: this.props.language, code: "DVAL_HOTEL_ROOM"})}</option>
												</select>
											</div>
										</div>
										<div className="u-block">
											<label className="u-form-label n1" for="address">
												{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_ADRESS"})}:
											</label>
											<input className="w-input" 
												id="address"
												type="email"
												placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_ADRESS"})}
												ref="address"/>
										</div>
										<div className="u-block-spacer2"></div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_UNAVAILABLE"})}:</label>
												<div className="u-t-small">{Utils.getStrResource({lang: this.props.language, code: "UI_NOTE_UNAVAILABLE"})}</div>
											</div>
											<div className="w-col w-col-9">
												<input className="w-input u-form-field rel" 
													type="date"
													ref="dfrom"
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}/>
												<input className="w-input u-form-field rel" 
													type="date"
													ref="dto"
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}/>
											</div>
										</div>
										<div className="u-block-spacer2"></div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_APARTMENT_DESC"})}:</label>
											</div>
											<div className="w-col w-col-9">
												<textarea className="w-input" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_APARTMENT_DESC"})}
													ref="apartAddition">
												</textarea>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_RENT_EXTRA"})}:</label>
												<div className="u-t-small">
													{Utils.getStrResource({lang: this.props.language, code: "UI_NOTE_RENT_EXTRA"})}
												</div>
											</div>
											<div className="w-col w-col-9">
												<textarea className="w-input"
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_RENT_EXTRA"})}
													ref="rentAddition">
												</textarea>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PRICE"})}:</label>
											</div>
											<div className="w-col w-col-9">
												<input className="w-input u-form-field" 
													type="number"
													ref="price"
													placeholder={Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}/>
											</div>
										</div>
										<input className="w-button u-btn-primary"
											type="button"
											value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD_RENT_POST"})}
											onClick={this.handleAddRentClick}/>
									</form>						
								</div>
							</div>
						</div>		
		} else {			
			content = <InLineMessage type={Utils.getMessageTypeErr()} message={Utils.getStrResource({lang: this.props.language, code: "SRV_UNAUTH"})}/>
		}
		//генератор
		return (
			<div className={classesCont}>
				<div className="content-center">
					{content}
				</div>
			</div>
		);
	}
});