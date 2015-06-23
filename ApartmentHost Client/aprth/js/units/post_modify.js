/*
	Редактор объявления
*/
//режимы работы
var ModifyPostModes = {
	ADD: "add", //добавление
	EDIT: "edit" //исправление
}
//редактор объявлений
var ModifyPost = React.createClass({
	//переменные окружения
	contextTypes: {
		router: React.PropTypes.func //ссылка на роутер
	},	
	//состояние
	getInitialState: function () {
		return {
			mode: ModifyPostModes.ADD, //режим работы
			post: { //объявление
				phone: "", //телефон
				sex: "", //пол постояльца
				apartType: "", //тип жилья
				address: "", //адрес
				dFrom: "", //дата начала периода недоступности
				dTo: "", //дата коночания периода недоступности
				dates: [], //набор периодов недоступности
				description: "", //описание жилья
				options: "", //дополнительные параметры с разделителем
				price: 0 //цена
			}
		}
	},	
	//зачистка формы
	clearAddRentForm: function () {		
		this.setState({post: {phone: "", sex: "", apartType: "", address: "", dFrom: "", dTo: "", dates: [], description: "", options: "", price: 0}});		
	},
	//обработка результата добавления/исправления объявления
	handleModifyRent: function (resp) {
		this.props.onHideProgress();
		if(resp.STATE == clnt.respStates.ERR) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), resp.MESSAGE);
		} else {
			this.props.onShowMessage(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_SUCCESS"}), 
				Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_DONE"}));
			this.context.router.transitionTo("profile");
		}
	},
	//добавление/исправление объявления
	modifyRent: function () {
		var price = this.state.post.price * 1;
		if(price.toString().indexOf(".") == -1) price += ".0";
		var modifyRentPrms = {
			language: this.props.language,
			session: this.props.session.sessionInfo,
			data: {
				phone: this.state.post.phone,
				apartment: {
					adress: this.state.post.address,
					Name: this.state.post.description,
					type: this.state.post.apartType,
					options: this.state.post.options
				},
				Name: this.state.post.description,
				dates: this.state.post.dates,
				description: this.state.post.description,
				residentGender: this.state.post.sex,
				priceDay: price,
				pricePeriod: price * 10				
			}
		}
		this.props.onDisplayProgress(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_PROGRESS"}));
		clnt.addAdvert(modifyRentPrms, this.handleModifyRent);
	},
	//проверка обязательных параметров
	checkRequredValues: function () {
		var res = "";
		if(!this.state.post.phone) {
			res = Utils.getStrResource({lang: this.props.language, code: "CLNT_ADVER_NO_PHONE"});
			return res;
		}		
		if(!this.state.post.sex) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})]});
			return res;
		}
		if(!this.state.post.apartType) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})]});
			return res;
		}
		if(!this.state.post.address) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_ADRESS"})]});
			return res;
		}
		if(!this.state.post.description) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_APARTMENT_DESC"})]});
			return res;
		}
		if((!this.state.post.price)||(isNaN(this.state.post.price))||(this.state.post.price <= 0)) {
			res = Utils.getStrResource({lang: this.props.language, code: "SRV_APARTMENT_REQUIRED", values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PRICE"})]});
			return res;
		}
		return res;
	},
	//обработка изменения поля формы объявления
	handleFormItemChange: function (e) {
		var tmp = {};
		_.extend(tmp, this.state.post);
		tmp[e.target.id] = e.target.value;
		this.setState({post: tmp});
	},
	//нажатие на кнопку добавления нового периода недоступности
	handleAppendPeriodClick: function () {
		if((!this.state.post.dFrom)&&(!this.state.post.dTo)) {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), 
				Utils.getStrResource({lang: this.props.language, 
					code: "SRV_APARTMENT_REQUIRED", 
					values: [Utils.getStrResource({lang: this.props.language, code: "UI_FLD_UNAVAILABLE"})]
				})
			);
		} else {
			var dF;
			var dT;
			if((this.state.post.dFrom)&&(this.state.post.dTo)) {
				dF = this.state.post.dFrom;
				dT = this.state.post.dTo;
			} else {
				if(!this.state.post.dTo) {
					dF = this.state.post.dFrom;
					dT = this.state.post.dFrom;
				} else {
					dF = this.state.post.dTo;
					dT = this.state.post.dTo;
				}
			}
			var tmp = {};
			_.extend(tmp, this.state.post);
			tmp.dates.push({dateFrom: dF, dateTo: dT});
			tmp.dFrom = "";
			tmp.dTo = "";
			this.setState({post: tmp});
		}
	},
	//нажатие на кнопку удаления периода недоступности
	handleDeletePeriodClick: function (index) {
		var tmp = {};
		_.extend(tmp, this.state.post);
		tmp.dates.splice(index, 1);
		this.setState({post: tmp});
	},
	//нажатие на кнопку добавления/исправления объявления
	handleModifyRentClick: function () {
		var msg = this.checkRequredValues();
		if(!msg) {
			this.modifyRent();
		} else {
			this.props.onShowError(Utils.getStrResource({lang: this.props.language, code: "CLNT_COMMON_ERROR"}), msg);
		}
	},
	//инициализация карточки объявления
	initRent: function () {
		if(this.props.session.sessionInfo.user.profile.phone) {
			var tmp = {};
			_.extend(tmp, this.state.post);
			tmp.phone = this.props.session.sessionInfo.user.profile.phone;
			this.setState({post: tmp});
		}
	},
	//инициализация при подключении компонента к странице
	componentDidMount: function () {		
		this.setState({mode: this.context.router.getCurrentParams().mode}, this.initRent);
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
		//периоды недоступности жилья
		var dates;
		if(Array.isArray(this.state.post.dates)) {
			dates = this.state.post.dates.map(function (item, i) {
				var period;
				if(item.dateFrom != item.dateTo) {
					period = Utils.formatDate({lang: this.props.language, date: item.dateFrom}) + " - " + Utils.formatDate({lang: this.props.language, date: item.dateTo});
				} else {
					period = Utils.formatDate({lang: this.props.language, date: item.dateFrom});
				}
				return (
					<div key={i}>
						{period}
						<button type="button" className="w-button u-btn-regular-no-float" onClick={this.handleDeletePeriodClick.bind(this, i)}>
							{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_DEL"})}										
						</button>
					</div>
				);
			}, this);
		}
		//содержимое формы
		var content;
		if(this.props.session.loggedIn) {
			content =	<div className="w-section">
							<div className="w-container">
								<div className="u-block-underline h3">
									<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_ADD_RENT_POST"})}</h3>
								</div>
								<div className="w-form">
									<form className="w-clearfix" id="modifyPostForm">
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PHONE"})}:</label>
												<div className="u-t-small">{Utils.getStrResource({lang: this.props.language, code: "UI_NOTE_PHONE"})}</div>
											</div>
											<div className="w-col w-col-9">
												<input className="w-input u-form-field" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_PHONE"})}
													type="text" 
													ref="phone" 
													id="phone"
													disabled={(this.props.session.sessionInfo.user.profile.phone)?"disabled":""}
													value={this.state.post.phone}
													onChange={this.handleFormItemChange}/>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}:</label>
											</div>
											<div className="w-col w-col-9">
												<OptionsSelector view={OptionsSelectorView.CHECK}
													options={optionsFactory.buildOptions({
																language: this.props.language, 
																id: "sex",
																options: ["DVAL_ANY", "DVAL_MALE", "DVAL_FEMALE", "DVAL_THING", "DVAL_ALIEN"]})}
													language={this.props.language}													
													defaultOptionsState={this.state.post.sex}
													onOptionChanged={Utils.bind(function (value) {this.handleFormItemChange({target: {id: "sex", value: value}})}, this)}/>
											</div>
										</div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">
													{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}:
												</label>
											</div>
											<div className="w-col w-col-9">
												<OptionsSelector view={OptionsSelectorView.SELECT}
													options={optionsFactory.buildOptions({
																language: this.props.language, 
																id: "apartType",
																options: ["DVAL_HOUSE", "DVAL_ROOM", "DVAL_OFFICE", "DVAL_FLAT", "DVAL_HOTEL_ROOM"]})}
													language={this.props.language}
													defaultOptionsState={this.state.post.apartType}
													onOptionChanged={Utils.bind(function (value) {this.handleFormItemChange({target: {id: "apartType", value: value}})}, this)}
													appendEmptyOption={true}
													emptyOptionLabel={Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}/>
											</div>
										</div>
										<div className="u-block">
											<label className="u-form-label n1" for="address">
												{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_ADRESS"})}:
											</label>
											<input className="w-input" 
												type="text"
												placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_ADRESS"})}
												ref="address"
												id="address"
												value={this.state.post.address}
												onChange={this.handleFormItemChange}/>
										</div>
										<div className="u-block-spacer2"></div>
										<div className="w-row">
											<div className="w-col w-col-3">
												<label className="u-form-label n1">{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_UNAVAILABLE"})}:</label>
												<div className="u-t-small">{Utils.getStrResource({lang: this.props.language, code: "UI_NOTE_UNAVAILABLE"})}</div>
											</div>
											<div className="w-col w-col-9">
												{dates}
												<Calendar name="dFrom" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}
													defaultValue={(this.state.post.dFrom)?(new Date(this.state.post.dFrom)):""}
													onDatePicked={Utils.bind(function (datePickerName, date) {this.handleFormItemChange({target: {id: datePickerName, value: date}})}, this)}
													language={this.props.language}
													inputClasses={classesDateInput}/>
												<Calendar name="dTo" 
													placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}
													defaultValue={(this.state.post.dTo)?(new Date(this.state.post.dTo)):""}
													onDatePicked={Utils.bind(function (datePickerName, date) {this.handleFormItemChange({target: {id: datePickerName, value: date}})}, this)}
													language={this.props.language}
													inputClasses={classesDateInput}/>
												<button type="button" className="w-button u-btn-regular-no-float" onClick={this.handleAppendPeriodClick}>
													{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD"})}
												</button>
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
													ref="description"
													id="description"
													value={this.state.post.description}
													onChange={this.handleFormItemChange}>
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
													ref="options"
													id="options"
													value={this.state.post.options}
													onChange={this.handleFormItemChange}>
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
													placeholder={Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})}
													ref="price"
													id="price"
													value={this.state.post.price}
													onChange={this.handleFormItemChange}/>
											</div>
										</div>
										<input className="w-button u-btn-primary"
											type="button"
											value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_ADD_RENT_POST"})}
											onClick={this.handleModifyRentClick}/>
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