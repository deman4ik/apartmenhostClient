/*
	Фильтр объявлений
*/
//границы фильтра по цене
var PostsFilterPriceLimits = {
	from: 300, //нижняя граница фильтра по цене
	to: 500, //верхняя граница фильтра по цене
}
//фильтр объявлений
var PostsFilter = React.createClass({
	//состояние фильтра
	getInitialState: function () {
		return {
			filterToggle: false, //флаг отображения/сокрытия тела фильтра
			noAdressFilterSpecified: false, //флаг отсуствия фильтра по адресу
			noDateFromFilterSpecified: false, //флаг отсуствия фильтра по дате начала периода бронирования
			noDateToFilterSpecified: false, //флаг отсуствия фильтра по дате окончания периода бронирования
			radius: config.searchRadius, //радиус поиска по карте
			latitude: "", //широта выбранной точки поиска
			longitude: "", //долгота выбранной точки поиска
			adress: "", //адрес жилья		
			swLat: "", //широта ЮВ угла квадрата поиска по выбранной точке
			swLong: "", //долгота ЮВ угла квадрата поиска по выбранной точке
			neLat: "", //широта СЗ угла квадрата поиска по выбранной точке
			neLong: "", //долгота СЗ угла квадрата поиска по выбранной точке
			dFrom: "", //дата начала периода бронирования
			dTo: "", //дата коночания периода бронирования
			sex: "", //пол постояльца
			apartType: "", //тип жилья
			priceFrom: "", //цена с
			priceTo: "", //цена по
			price: "" //цена (сводное состояние)
		};
	},
	//сохранение и сборка фильтра
	saveFilterState: function () {
		var filterParams = {language: this.props.language};
		if(this.state.radius) filterParams.radius = this.state.radius;
		if(this.state.latitude) filterParams.latitude = this.state.latitude;
		if(this.state.longitude) filterParams.longitude = this.state.longitude;
		if(this.state.adress) filterParams.adress = this.state.adress;
		if(this.state.swLat) filterParams.swLat = this.state.swLat;
		if(this.state.swLong) filterParams.swLong = this.state.swLong;
		if(this.state.neLat) filterParams.neLat = this.state.neLat;
		if(this.state.neLong) filterParams.neLong = this.state.neLong;
		if(this.state.sex) filterParams.sex = this.state.sex;
		if(this.state.dFrom) filterParams.dFrom = this.state.dFrom;
		if(this.state.dTo) filterParams.dTo = this.state.dTo;
		if(this.state.apartType) filterParams.apartType = this.state.apartType;
		if(this.state.priceFrom) filterParams.priceFrom = this.state.priceFrom * 1;
		if(this.state.priceTo) filterParams.priceTo = this.state.priceTo * 1;
		filterParams.price = this.state.price;
		filterParams.filterToggle = this.state.filterToggle;
		Utils.saveObjectState("filterParams", filterParams);
		return filterParams;
	},
	//загрузка сохраненного фильтра
	loadFilterState: function (callBack) {
		var filterParams = Utils.loadObjectState("filterParams");
		if(filterParams) {
			this.setState({
				radius: filterParams.radius,
				latitude: filterParams.latitude,
				longitude: filterParams.longitude,
				adress: filterParams.adress,
				swLat: filterParams.swLat,
				swLong: filterParams.swLong,
				neLat: filterParams.neLat,
				neLong: filterParams.neLong,
				sex: filterParams.sex,
				dFrom: filterParams.dFrom,
				dTo: filterParams.dTo,
				apartType: filterParams.apartType,
				priceFrom: filterParams.priceFrom,
				priceTo: filterParams.priceTo,
				price: filterParams.price,
				filterToggle: filterParams.filterToggle
			}, callBack);
		}		
	},
	//формирование фильтра для передачи на сервер
	buildSrvAdvertsFilter: function () {
		var serverFilter = {};
		if(this.state.adress) serverFilter.adress = this.state.adress;
		if(this.state.swLat) serverFilter.swLat = this.state.swLat;
		if(this.state.swLong) serverFilter.swLong = this.state.swLong;
		if(this.state.neLat) serverFilter.neLat = this.state.neLat;
		if(this.state.neLong) serverFilter.neLong = this.state.neLong;
		if(this.state.sex) serverFilter.residentGender = [this.state.sex];
		if(this.state.dFrom) serverFilter.availableDateFrom = this.state.dFrom;
		if(this.state.dFrom) serverFilter.availableDateTo = this.state.dTo;
		if(this.state.priceFrom) serverFilter.priceDayFrom = this.state.priceFrom;
		if(this.state.priceTo) serverFilter.priceDayTo = this.state.priceTo;
		if(this.state.apartType) serverFilter.type = [this.state.apartType];
		return serverFilter;
	},
	//вывполнение фильтрации
	doFilter: function () {
		this.saveFilterState();			
		this.props.onFilterChange({
			radius: this.state.radius,
			latitude: this.state.latitude,
			longitude: this.state.longitude,
			filter: this.buildSrvAdvertsFilter()
		});
	},
	//проверка корректности установки фильтра и выполнение фильтрации в случае успеха
	checkAndDoFilter: function () {
		var canFilter = true;
		if(!this.state.adress) {
			this.setState({noAdressFilterSpecified: true});
			canFilter = false;
		} else {
			this.setState({noAdressFilterSpecified: false});
		}
		if((!this.state.dFrom)&&(this.state.dTo)) {
			this.setState({noDateFromFilterSpecified: true, noDateToFilterSpecified: false});
			canFilter = false;
		} else {
			this.setState({noDateFromFilterSpecified: false, noDateToFilterSpecified: false});
		}
		if((this.state.dFrom)&&(this.state.dTo)) {
			var dF = new Date(this.state.dFrom);
			var dT = new Date(this.state.dTo);
			if(dF.getTime() > dT.getTime()) {
				this.setState({noDateFromFilterSpecified: true, noDateToFilterSpecified: true});
				canFilter = false;
			} else {
				this.setState({noDateFromFilterSpecified: false, noDateToFilterSpecified: false});
			}
		}
		if(canFilter) {
			if((this.state.dFrom)&&(!this.state.dTo)) {
				var tmpD = new Date(this.state.dFrom);
				this.setState({dTo: tmpD.addDays(1)}, this.doFilter);
			} else {
				this.doFilter();
			}
		}
	},
	//ввод адреса
	handleAddrChange: function (val) {
		if((val.latitude)&&(val.longitude)) {
			var c = new google.maps.Circle({
				center: new google.maps.LatLng(val.latitude, val.longitude),
				radius: this.state.radius
			});
			var bounds = c.getBounds();			
			this.setState({
				adress: val.address,
				latitude: val.latitude,
				longitude: val.longitude,
				swLat: bounds.getSouthWest().lat(),
				swLong: bounds.getSouthWest().lng(),
				neLat: bounds.getNorthEast().lat(),
				neLong: bounds.getNorthEast().lng()
			}, function () {
				if(val.notifyParent) this.handleFindClick()
			});
		} else {
			this.setState({
				adress: val.address,
				latitude: "",
				longitude: "",
				swLat: "",
				swLong: "",
				neLat: "",
				neLong: ""
			});
		}
	},
	//смена радиуса поиска
	handleRadiusChanged: function (radius) {
		this.setState({radius: radius}, function () {
			if((this.state.adress)&&(this.state.latitude)&&(this.state.longitude)) {
				this.handleAddrChange({
					address: this.state.adress,
					latitude: this.state.latitude,
					longitude: this.state.longitude,
					notifyParent: true
				});
			}
		});		
	},
	//выбор пола
	handleSelectedSex: function (sex) {
		this.setState({sex: sex});
	},
	//выбор даты в календаре
	handleDatePicked: function (datePickerName, date) {
		var stateObject = {};
		stateObject[datePickerName] = (date)?date:"";
		this.setState(stateObject);
	},
	//выбор типа недвижимости в фильтре
	handleSelectedApartType: function (apartType) {
		this.setState({apartType: apartType}, this.handleFindClick);		
	},
	//выбор цены в фильтре
	handleSelectedPrice: function (price) {		
		var prices = {
			from: "",
			to: ""
		}
		if(price) {
			if(price == PostsFilterPriceLimits.from) {
				prices.to = PostsFilterPriceLimits.from;
			} else {
				if(price == PostsFilterPriceLimits.to) {
					prices.from = PostsFilterPriceLimits.to;
				} else {
					prices.from = PostsFilterPriceLimits.from;
					prices.to = PostsFilterPriceLimits.to;
				}
			}
		}
		this.setState({priceFrom: prices.from, priceTo: prices.to, price: price}, this.handleFindClick);
	},
	//обработка нажатия на кнопку "Фильтр" (сокрытие/отображение)
	handleFilterToggleClick: function () {
		this.setState({filterToggle: !this.state.filterToggle}, this.saveFilterState);		
	},
	//обработка нажатия на кнопку "Очистить"
	handleClearClick: function () {
		this.setState(
			{
				filterToggle: false, 
				noAdressFilterSpecified: false,
				noDateFromFilterSpecified: false,
				noDateToFilterSpecified: false,
				radius: config.searchRadius,
				latitude: "",
				longitude: "",
				adress: "",
				swLat: "",
				swLong: "",
				neLat: "",
				neLong: "",
				dFrom: "", 
				dTo: "",
				sex: "",
				apartType: "",
				price: ""
			},
			this.doFilter
		);		
	},
	//обработка нажатия на кнопку "Поиск"
	handleFindClick: function () {
		this.checkAndDoFilter();
	},
	//инициализация фильтра
	componentDidMount: function () {
		this.loadFilterState(this.doFilter);
	},
	//обновление параметров фильра
	componentWillReceiveProps: function (newProps) {
		if((newProps.radius)&&(newProps.radius != this.state.radius)) {
			this.handleRadiusChanged(newProps.radius);
		}
		if((newProps.latitude)&&(newProps.longitude)&&((newProps.latitude != this.state.latitude)||(newProps.longitude != this.state.longitude))) {
			var geocoder = new google.maps.Geocoder();
			var latlng = new google.maps.LatLng(newProps.latitude, newProps.longitude);
			geocoder.geocode({"location": latlng}, Utils.bind(function(results, status) {
				var address;
				if (status == google.maps.GeocoderStatus.OK) {
					if (results[1]) {
						address = results[1].formatted_address;
					} else {
						address = Utils.getStrResource({lang: this.props.language, code: "CLNT_UNKNOWN_ADDRESS"});
					}				
				} else {
					address = Utils.getStrResource({lang: this.props.language, code: "CLNT_UNKNOWN_ADDRESS"});
				}
				this.handleAddrChange({
					address: address,
					latitude: newProps.latitude,
					longitude: newProps.longitude,
					notifyParent: true
				});
			}, this));
		}
	},
	//генерация представления фильтра
	render: function () {
		//дополнительные стили
		var formWrapperStyle = {maxWidth: "none"};
		var lblStale = {paddingLeft: "5px"};
		var aStyle = {textDecoration: "none"};		
		var counterDisplay = {};
		if(this.props.filterIsSet) _.extend(counterDisplay, {display: "block"}); else _.extend(counterDisplay, {display: "none"});
		var filterDisplay = {};
		if(((this.props.filterIsSet)&&(this.props.cntFound > 0))||(this.state.filterToggle)) _.extend(filterDisplay, {display: "block"}); else _.extend(filterDisplay, {display: "none"});
		var filterToggle = {};
		if(this.state.filterToggle) _.extend(filterToggle, {display: "block"}); else _.extend(filterToggle, {display: "none"});
		var cAdrInput = React.addons.classSet;
		var classesAdrInput = cAdrInput({
			"w-input": true,
			"u-form-field": true,
			"has-error": this.state.noAdressFilterSpecified	
		});
		var cDateInput = React.addons.classSet;
		var classesDateInputFrom = cDateInput({
			"w-input": true,
			"u-form-field": true,
			"rel": true,
			"has-error": this.state.noDateFromFilterSpecified
		});
		var classesDateInputTo = cDateInput({
			"w-input": true,
			"u-form-field": true,
			"rel": true,
			"has-error": this.state.noDateToFilterSpecified
		});		
		//представление фильтра
		return (
			<div>
				<div className="w-form u-form-wrapper" style={formWrapperStyle}>
					<form className="w-clearfix u-form-body">
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_ADVERTS_FILER"})}</h3>
						<AddressInput classes={classesAdrInput}
							name="adress"
							value={this.state.adress}
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FILTER_ADRESS"})}
							onAddressChanged={this.handleAddrChange}/>
						<div className="w-row">
							<div className="w-col w-col-3">
								<label className="u-form-label">
									{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}:
								</label>
							</div>
							<div className="w-col w-col-9">
								<OptionsSelector view={OptionsSelectorView.SELECT}
									language={this.props.language}
									options={optionsFactory.buildOptions({
												language: this.props.language, 
												id: "sex",
												options: ["DVAL_ANY", "DVAL_MALE", "DVAL_FEMALE", "DVAL_THING", "DVAL_ALIEN"]})}
									onOptionChanged={this.handleSelectedSex}
									defaultOptionsState={this.state.sex}
									appendEmptyOption={true}
									emptyOptionLabel={Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}/>
							</div>
						</div>
						<div className="w-row">
							<div className="w-col w-col-3">
								<label className="u-form-label">
									{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_DATE"})}:
								</label>
							</div>
							<div className="w-col w-col-9">
								<Calendar name="dFrom" 
									placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}
									defaultValue={(this.state.dFrom)?(new Date(this.state.dFrom)):""}
									onDatePicked={this.handleDatePicked}
									language={this.props.language}
									inputClasses={classesDateInputFrom}/>
								<Calendar name="dTo" 
									placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}
									defaultValue={(this.state.dTo)?(new Date(this.state.dTo)):""}
									onDatePicked={this.handleDatePicked}
									language={this.props.language}
									inputClasses={classesDateInputTo}/>									
							</div>
						</div>
						<div className="u-block-spacer2"></div>
						<input className="w-button u-btn-primary"
							type="button"
							onClick={this.handleFindClick}
							value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SEARCH"})}/>
						<input className="w-button u-btn-regular"
							type="button"
							onClick={this.handleClearClick}
							value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CLEAR"})}/>
					</form>					
				</div>				
				<div style={counterDisplay}>
					<h1 className="txt search-result">
						{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_FILTER_RESULT"})} – {this.props.cntFound}
					</h1>
				</div>
				<div className="w-clearfix u-block-underline" style={filterDisplay}>
					<a className="u-lnk-norm h1" href="javascript:void(0);" style={aStyle} onClick={this.handleFilterToggleClick}>
						{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FILTER"})}
					</a>
				</div>
				<div style={filterDisplay}>
					<div className="u-block-filter-add u-block-underline" style={filterToggle}>
						<div className="w-form">
							<form className="u-form-body">								
								<div className="w-row">
									<div className="w-col w-col-4">
										<label className="u-form-label n1">
											{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_PRICE"})}:
										</label>
									</div>
									<div className="w-col w-col-8">
										<OptionsSelector view={OptionsSelectorView.RADIO}
											language={this.props.language}
											name="price"
											options={optionsFactory.buildOptions({
														language: this.props.language, 
														id: "price",
														options: ["", PostsFilterPriceLimits.from, PostsFilterPriceLimits.from + "-" + PostsFilterPriceLimits.to, PostsFilterPriceLimits.to],
														labels: [Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ANY_PRICE"}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_LESS",
																	values: [
																		PostsFilterPriceLimits.from,
																		Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
																	]
																}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_BETWEEN",
																	values: [
																		PostsFilterPriceLimits.from,
																		PostsFilterPriceLimits.to,
																		Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
																	]
																}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_MORE",
																	values: [
																		PostsFilterPriceLimits.to,
																		Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
																	]
																})]})}
											onOptionChanged={this.handleSelectedPrice}
											defaultOptionsState={[this.state.price]}/>				
									</div>
								</div>
								<div className="w-row">
									<div className="w-col w-col-4">
										<label className="u-form-label n1">
											{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}:
										</label>
									</div>
									<div className="w-col w-col-8">
										<OptionsSelector view={OptionsSelectorView.SELECT}
											language={this.props.language}
											options={optionsFactory.buildOptions({
														language: this.props.language,
														id: "apartType",
														options: ["DVAL_HOUSE", "DVAL_ROOM", "DVAL_OFFICE", "DVAL_FLAT", "DVAL_HOTEL_ROOM"]})}
											onOptionChanged={this.handleSelectedApartType}
											defaultOptionsState={this.state.apartType}
											appendEmptyOption={true}
											emptyOptionLabel={Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}/>
									</div>
								</div>
								<div className="w-row">
									<div className="w-col w-col-4">
										<label className="u-form-label n1">
											{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_SEARCH_RADIUS"})}:
										</label>
									</div>
									<div className="w-col w-col-8">
										<Slider step={config.searchRadiusStep}
											curVal={this.state.radius}
											minVal={config.searchRadiusMin}
											maxVal={config.searchRadiusMax}
											meas={Utils.getStrResource({lang: this.props.language, code: "METER"})}
											onStep={this.handleRadiusChanged}/>
									</div>
								</div>
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
});