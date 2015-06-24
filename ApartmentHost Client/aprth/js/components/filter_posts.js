/*
	Фильтр объявлений
*/
var PostsFilter = React.createClass({
	//состояние фильтра
	getInitialState: function () {
		return {
			filterToggle: false, //флаг отображения/сокрытия тела фильтра
			filterPriceFrom: 300, //нижняя граница фильтра по цене
			filterPriceTo: 500, //верхняя граница фильтра по цене
			noFilterSpecified: false, //флаг отсуствия фильтра
			adress: "", //адрес жилья
			dFrom: "", //дата начала периода бронирования
			dTo: "", //дата коночания периода бронирования
			sex: "", //пол постояльца
			apartType: "", //тип жилья
			price: "" //цена
		};
	},
	//сохранение и сборка фильтра
	saveFilterState: function () {
		var filterParams = {
			language: this.props.language
		}
		if(this.state.adress) {
			filterParams.adress = this.state.adress;			
		}
		if(this.state.sex) {
			filterParams.sex = this.state.sex;
		}
		if(this.state.dFrom) {
			filterParams.dFrom = this.state.dFrom;
		}
		if(this.state.dTo) {
			filterParams.dTo = this.state.dTo;
		}
		if(this.state.apartType) {
			filterParams.apartType = this.state.apartType;
		}
		if(this.state.price) {
			if(this.state.price == this.state.filterPriceFrom) {
				filterParams.priceTo = this.state.filterPriceFrom * 1 - 1;
			} else {
				if(this.state.price == this.state.filterPriceTo) {
					filterParams.priceFrom = this.state.filterPriceTo * 1 + 1;
				} else {
					filterParams.priceFrom = this.state.filterPriceFrom * 1;
					filterParams.priceTo = this.state.filterPriceTo * 1;
				}
			}			
		}
		filterParams.filterToggle = this.state.filterToggle;
		Utils.saveObjectState("filterParams", filterParams);
		console.log("SAVED FILTER: ");
		console.log(filterParams);
		return filterParams;
	},
	//загрузка сохраненного фильтра
	loadFilterState: function () {
		var filterParams = Utils.loadObjectState("filterParams");
		console.log("LOADED FILTER: ");
		console.log(filterParams);
		if(filterParams) {
			if("adress" in filterParams) this.setState({adress: filterParams.adress});
			if("sex" in filterParams) this.setState({sex: filterParams.sex});
			if("dFrom" in filterParams)	this.setState({dFrom: filterParams.dFrom});
			if("dTo" in filterParams) this.setState({dTo: filterParams.dTo});
			if("apartType" in filterParams) this.setState({apartType: filterParams.apartType});;
			if(("priceFrom" in filterParams)||("priceTo" in filterParams)) {
				if(filterParams.priceTo == this.state.filterPriceFrom) {
					this.setState({price: this.state.filterPriceFrom});
				} else {
					if(filterParams.priceFrom == this.state.filterPriceTo) {
						 this.setState({price: this.state.filterPriceTo});
					} else {
						this.setState({price: this.state.filterPriceFrom + "-" + this.state.filterPriceTo});
					}
				}
			} else {
				this.setState({price: ""});
			}						
		}
		return filterParams;
	},
	//ввод адреса
	handleAddrChange: function (e) {
		this.setState({adress: e.target.value});
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
		this.setState({price: price}, this.handleFindClick);
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
				noFilterSpecified: false, 
				adress: "",
				dFrom: "", 
				dTo: "",
				sex: "",
				apartType: "",
				price: ""
			},
			function () {
				var f = this.saveFilterState();
				this.props.onFilterChange(filterFactory.buildAdvertsFilter(f));
			}
		);		
	},
	//обработка нажатия на кнопку "Поиск"
	handleFindClick: function () {
		if(!this.state.adress) {
			this.setState({noFilterSpecified: true});
		} else {
			this.setState({noFilterSpecified: false});
			var f = this.saveFilterState();			
			this.props.onFilterChange(filterFactory.buildAdvertsFilter(f));
		}
	},
	//инициализация фильтра
	componentDidMount: function () {
		var f = this.loadFilterState();
		if(f) {
			this.setState({filterToggle: f.filterToggle});
			this.props.onFilterChange(filterFactory.buildAdvertsFilter(f));
		}
	},
	//обновление параметров фильра
	componentWillReceiveProps: function (newProps) {
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
			"errstate": this.state.noFilterSpecified	
		});
		var cDateInput = React.addons.classSet;
		var classesDateInput = cDateInput({
			"w-input": true,
			"u-form-field": true,
			"rel": true
		});		  
		//представление фильтра
		return (
			<div>
				<div className="w-form u-form-wrapper" style={formWrapperStyle}>
					<form className="w-clearfix u-form-body">
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_ADVERTS_FILER"})}</h3>
						<input className={classesAdrInput}
							type="text"
							ref="adress"
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FILTER_ADRESS"})}
							onChange={this.handleAddrChange}
							value={this.state.adress}/>
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
														options: ["", this.state.filterPriceFrom, this.state.filterPriceFrom + "-" + this.state.filterPriceTo, this.state.filterPriceTo],
														labels: [Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ANY_PRICE"}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_LESS",
																	values: [
																		this.state.filterPriceFrom,
																		Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
																	]
																}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_BETWEEN",
																	values: [
																		this.state.filterPriceFrom,
																		this.state.filterPriceTo,
																		Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
																	]
																}),
																Utils.getStrResource({
																	lang: this.props.language, 
																	code: "UI_LBL_MORE",
																	values: [
																		this.state.filterPriceTo,
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
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
});