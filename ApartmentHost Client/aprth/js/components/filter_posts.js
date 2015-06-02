/*
	Фильтр объявлений
*/
var PostsFilter = React.createClass({
	//состояние фильтра
	getInitialState: function () {
		return {
			filterDisplay: false, //фоаг отображения/сокрытия заголовка фильтра
			filterToggle: false, //флаг отображения/сокрытия тела фильтра
			filterPriceFrom: 300, //нижняя граница фильтра по цене
			filterPriceTo: 500, //верхняя граница фильтра по цене
			noFilterSpecified: false, //флаг отсуствия фильтра
			dFrom: "", //дата начала периода бронирования
			dTo: "", //дата коночания периода бронирования
			sex: "" //пол постояльца	
		};
	},
	//сохранение и сборка фильтра
	saveFilterState: function () {
		var filterParams = {
			language: this.props.language
		}
		if(React.findDOMNode(this.refs.adress).value) {
			filterParams.adress = React.findDOMNode(this.refs.adress).value;			
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
		if((React.findDOMNode(this.refs.apartType).value)&&(React.findDOMNode(this.refs.apartType).value != "DVAL_ANY")) {
			filterParams.apartType = React.findDOMNode(this.refs.apartType).value;
		}
		if(React.findDOMNode(this.refs.price1).checked) {
			filterParams.priceTo = React.findDOMNode(this.refs.price1).value * 1 - 1;
		}
		if(React.findDOMNode(this.refs.price2).checked) {
			filterParams.priceFrom = React.findDOMNode(this.refs.price1).value * 1;
			filterParams.priceTo = React.findDOMNode(this.refs.price3).value * 1;
		}
		if(React.findDOMNode(this.refs.price3).checked) {
			filterParams.priceFrom = React.findDOMNode(this.refs.price3).value * 1 + 1;
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
			if("adress" in filterParams) React.findDOMNode(this.refs.adress).value = filterParams.adress;
			if("sex" in filterParams) this.setState({sex: filterParams.sex});
			if("dFrom" in filterParams) this.setState({dFrom: filterParams.dFrom});
			if("dTo" in filterParams) this.setState({dTo: filterParams.dTo});
			if("apartType" in filterParams) React.findDOMNode(this.refs.apartType).value = filterParams.apartType;
			if(("priceFrom" in filterParams)||("priceTo" in filterParams)) {
				if(filterParams.priceTo == React.findDOMNode(this.refs.price1).value * 1 - 1)
					React.findDOMNode(this.refs.price1).checked = true;
				if((filterParams.priceTo == React.findDOMNode(this.refs.price1).value * 1)
					&&(filterParams.priceFrom == React.findDOMNode(this.refs.price3).value * 1))
					React.findDOMNode(this.refs.price2).checked = true;
				if(filterParams.priceFrom == React.findDOMNode(this.refs.price3).value * 1 + 1)
					React.findDOMNode(this.refs.price3).checked = true;
			} else {
				React.findDOMNode(this.refs.priceAny).checked = true;
			}						
		}
		return filterParams;
	},
	//выбор пола
	handleSelectedSex: function (sex) {
		this.setState({sex: sex});
		console.log(sex);
	},
	//выбор даты в календаре
	handleDatePicked: function (datePickerName, date) {
		var stateObject = {};
		stateObject[datePickerName] = (date)?date.to_yyyy_mm_dd():"";
		this.setState(stateObject);
	},
	//обработка нажатия на кнопку "Фильтр" (сокрытие/отображение)
	handleFilterToggleClick: function () {
		this.setState({filterToggle: !this.state.filterToggle}, this.saveFilterState);		
	},
	//обработка нажатия на кнопку "Очистить"
	handleClearClick: function () {
		React.findDOMNode(this.refs.adress).value = "";
		React.findDOMNode(this.refs.apartType).value = "DVAL_ANY";
		React.findDOMNode(this.refs.priceAny).checked = true;
		React.findDOMNode(this.refs.price1).checked = false;
		React.findDOMNode(this.refs.price2).checked = false;
		React.findDOMNode(this.refs.price3).checked = false;
		this.setState(
			{
				filterDisplay: false, 
				filterToggle: false, 
				noFilterSpecified: false, 
				dFrom: "", 
				dTo: "",
				sex: ""
			},
			function () {
				var f = this.saveFilterState();
				this.props.onFilterChange(filterFactory.buildAdvertsFilter(f));
			}
		);		
	},
	//обработка нажатия на кнопку "Поиск"
	handleFindClick: function () {
		if(!React.findDOMNode(this.refs.adress).value) {
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
		var filterDisplay = {};
		if(this.props.filterIsSet) _.extend(filterDisplay, {display: "block"}); else _.extend(filterDisplay, {display: "none"});
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
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FILTER_ADRESS"})}/>
						<div className="w-row">
							<div className="w-col w-col-3">
								<label className="u-form-label">
									{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"})}:
								</label>
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
									onOptionChanged={this.handleSelectedSex}
									defaultOptionsState={this.state.sex}/>								
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
				<div className="w-clearfix u-block-underline" style={filterDisplay}>
					<h1 className="txt">
						{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_FILTER_RESULT"})} – {this.props.cntFound}
					</h1>
					<a className="u-lnk-norm h1" href="javascript:;" style={aStyle} onClick={this.handleFilterToggleClick}>
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
										<div className="w-radio">
											<input className="w-radio-input"
												id="priceAny"
												type="radio" 
												name="price"
												value=""
												ref="priceAny"
												onChange={this.handleFindClick}/>
											<label className="w-form-label" for="price-1" style={lblStale}>
												{Utils.getStrResource({lang: this.props.language, code: "UI_LBL_ANY_PRICE"})}									
											</label>
										</div>
										<div className="w-radio">
											<input className="w-radio-input"
												id="price-1"
												type="radio" 
												name="price"
												value={this.state.filterPriceFrom}
												ref="price1"
												onChange={this.handleFindClick}/>
											<label className="w-form-label" for="price-1" style={lblStale}>
												{Utils.getStrResource({
													lang: this.props.language, 
													code: "UI_LBL_LESS",
													values: [
														this.state.filterPriceFrom,
														Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
													]
												})}									
											</label>
										</div>
										<div className="w-radio">
											<input className="w-radio-input"
												id="price-2"
												type="radio"
												name="price"
												value={this.state.filterPriceFrom + "-" + this.state.filterPriceTo}
												ref="price2"
												onChange={this.handleFindClick}/>
											<label className="w-form-label" for="price-2" style={lblStale}>
												{Utils.getStrResource({
													lang: this.props.language, 
													code: "UI_LBL_BETWEEN",
													values: [
														this.state.filterPriceFrom,
														this.state.filterPriceTo,
														Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
													]
												})}
											</label>
										</div>
										<div className="w-radio">
											<input className="w-radio-input"
												id="price-3"
												type="radio"
												name="price"
												value={this.state.filterPriceTo}
												ref="price3"
												onChange={this.handleFindClick}/>
											<label className="w-form-label" for="price-3" style={lblStale}>
												{Utils.getStrResource({
													lang: this.props.language, 
													code: "UI_LBL_MORE",
													values: [
														this.state.filterPriceTo,
														Utils.getStrResource({lang: this.props.language, code: "CURRENCY"})
													]
												})}
											</label>
										</div>
									</div>
								</div>
								<div className="w-row">
									<div className="w-col w-col-4">
										<label className="u-form-label n1">
											{Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"})}:
										</label>
									</div>
									<div className="w-col w-col-8">
										<select className="w-select u-form-field" ref="apartType" onChange={this.handleFindClick}>
											<option value="DVAL_ANY">{Utils.getStrResource({lang: this.props.language, code: "DVAL_ANY"})}</option>
											<option value="DVAL_HOUSE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_HOUSE"})}</option>
											<option value="DVAL_ROOM">{Utils.getStrResource({lang: this.props.language, code: "DVAL_ROOM"})}</option>
											<option value="DVAL_OFFICE">{Utils.getStrResource({lang: this.props.language, code: "DVAL_OFFICE"})}</option>
											<option value="DVAL_FLAT">{Utils.getStrResource({lang: this.props.language, code: "DVAL_FLAT"})}</option>
											<option value="DVAL_HOTEL_ROOM">{Utils.getStrResource({lang: this.props.language, code: "DVAL_HOTEL_ROOM"})}</option>
										</select>
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