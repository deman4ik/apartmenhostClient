/*
	Размещение объявления
*/
var AddPost = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			dFrom: "", //дата начала периода бронирования
			dTo: "", //дата коночания периода бронирования
			sex: "" //пол постояльца
		}
	},	
	//зачистка формы
	clearAddRentForm: function () {		
		React.findDOMNode(this.refs.apartType).value = "";
		React.findDOMNode(this.refs.address).value = "";
		this.setState({dFrom: "", dTo: "", sex: ""});
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
				dateFrom: this.state.dFrom + "T00:00:00Z",
				dateTo: this.state.dTo + "T00:00:00Z",
				description: React.findDOMNode(this.refs.apartAddition).value,
				residentGender: this.state.sex,
				priceDay: price,
				pricePeriod: price * 10
			}
		}
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		clnt.addAdvert(addPrms, this.handleAddRent);
	},
	//проверка обязательных параметров
	checkRequredValues: function () {
		var res = "";
		if(!React.findDOMNode(this.refs.tel).value) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PHONE"})]});
			return res;
		}		
		if(!this.state.sex) {
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
		if((!this.state.dFrom)||(!this.state.dTo)) {
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
	//выбор пола
	handleSelectedSex: function (sex) {
		this.setState({sex: sex});
	},
	//выбор даты в календаре
	handleDatePicked: function (datePickerName, date) {
		var stateObject = {};
		stateObject[datePickerName] = (date)?date.to_yyyy_mm_dd():"";
		this.setState(stateObject);
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
		//дополнительные стили и классы
		var cCont = React.addons.classSet;
		var classesCont = cCont({
			"empty-unit": (!this.props.session.loggedIn)
		});
		var cDateInput = React.addons.classSet;
		var classesDateInput = cDateInput({
			"w-input": true,
			"u-form-field": true,
			"rel": true
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
												<OptionsSelector options={[
														{
															label: Utils.getStrResource({lang: this.props.language, code: "DVAL_ANY"}),
															value: "DVAL_ANY"
														}, 
														{
															label: Utils.getStrResource({lang: this.props.language, code: "DVAL_MALE"}),
															value: "DVAL_MALE"
														},
														{
															label: Utils.getStrResource({lang: this.props.language, code: "DVAL_FEMALE"}),
															value: "DVAL_FEMALE"
														},
														{
															label: Utils.getStrResource({lang: this.props.language, code: "DVAL_THING"}),
															value: "DVAL_THING"
														},
														{
															label: Utils.getStrResource({lang: this.props.language, code: "DVAL_ALIEN"}),
															value: "DVAL_ALIEN"
														}]}
													language={this.props.language}
													onOptionChanged={this.handleSelectedSex}
													defaultOptionsState={this.state.sex}/>
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
												<Calendar name="dFrom" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}
													defaultValue={(this.state.dFrom)?(new Date(this.state.dFrom)):""}
													onDatePicked={this.handleDatePicked}
													language={this.props.language}
													inputClasses={classesDateInput}/>
												<Calendar name="dTo" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}
													defaultValue={(this.state.dTo)?(new Date(this.state.dTo)):""}
													onDatePicked={this.handleDatePicked}
													language={this.props.language}
													inputClasses={classesDateInput}/>
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