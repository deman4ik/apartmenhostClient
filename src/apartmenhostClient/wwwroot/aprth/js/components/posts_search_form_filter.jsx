/*
	Форма фильтра найденных объявлений
*/
//границы фильтра по цене
var PostsFilterPriceLimits = {
	from: 300, //нижняя граница фильтра по цене
	to: 500, //верхняя граница фильтра по цене
}
//параметры состояний фильтра
var PostsFilterPrms = {
	postFilterUseRadius: "CLNT_ON_OFF" //состояние использования радиуса поиска
}
//фильтр объявлений
var PostsFilterForm = React.createClass({
	//состояние фильтра
	getInitialState: function () {
		return {
			filterToggle: true, //флаг отображения/сокрытия тела фильтра
			filter: { //параметры фильтра
				useRadius: PostsFilterPrms.postFilterUseRadius, //искать в радиусе
				radius: config.searchRadius, //радиус поиска по карте
				apartType: "", //тип жилья
				priceFrom: "", //цена с
				priceTo: "", //цена по
				price: "" //цена (сводное состояние)
			}
		};
	},	
	//оповещение родителя о смене данных фильтра
	notifyParent: function () {
		if((this.props.onFilterChange)&&(Utils.isFunction(this.props.onFilterChange))) {
			this.props.onFilterChange(this.state.filter);
		}
	},	
	//смена радиуса в фильтре
	handleRadiusChanged: function (radius) {
		var tmp = {};
		_.extend(tmp, this.state.filter);
		tmp.radius = radius;
		this.setState({filter: tmp}, this.notifyParent);		
	},
	//выбор типа недвижимости в фильтре
	handleSelectedApartType: function (apartType) {
		var tmp = {};
		_.extend(tmp, this.state.filter);
		tmp.apartType = apartType;
		this.setState({filter: tmp}, this.notifyParent);		
	},
	//выбор цены в фильтре
	handleSelectedPrice: function (price) {		
		var tmp = {};
		_.extend(tmp, this.state.filter);
		tmp.priceFrom = "";
		tmp.priceTo = "";
		tmp.price = price;
		if(price) {
			if(price == PostsFilterPriceLimits.from) {
				tmp.priceTo = PostsFilterPriceLimits.from;
			} else {
				if(price == PostsFilterPriceLimits.to) {
					tmp.priceFrom = PostsFilterPriceLimits.to;
				} else {
					tmp.priceFrom = PostsFilterPriceLimits.from;
					tmp.priceTo = PostsFilterPriceLimits.to;
				}
			}
		}
		this.setState({filter: tmp}, this.notifyParent);
	},
	//обработка выбора использования радиуса поиска
	handleUseRadiusChecked: function (useRadius) {
		var tmp = {};
		_.extend(tmp, this.state.filter);
		tmp.useRadius = useRadius;
		tmp.radius = config.searchRadius;
		this.setState({filter: tmp}, this.notifyParent);
	},
	//обработка нажатия на кнопку "Фильтр" (сокрытие/отображение)
	handleFilterToggleClick: function () {
		this.setState({filterToggle: !this.state.filterToggle});
	},	
	//инициализация состояния
	initState: function (props) {
		var tmpFilter = {};
		_.extend(tmpFilter, this.state.filter);
		tmpFilter.useRadius = props.useRadius;
		tmpFilter.radius = props.radius;
		tmpFilter.apartType = props.apartType;
		tmpFilter.priceFrom = props.priceFrom;
		tmpFilter.priceTo = props.priceTo;
		tmpFilter.price =props.price;
		this.setState({filter: tmpFilter});
	},
	//инициализация фильтра
	componentDidMount: function () {
		this.initState(this.props);
	},
	//обновление параметров фильра
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);		
	},
	//генерация представления фильтра
	render: function () {
		//дополнительные стили
		var aStyle = {textDecoration: "none"};		
		var filterToggle = {};
		if(this.state.filterToggle) _.extend(filterToggle, {display: "block"}); else _.extend(filterToggle, {display: "none"});		
		//контроллер радиуса поиска
		var searchRadius;
		if(config.useSearchRadar) {
			var searchRadiusCheck;
			var searchRadiusRadar;
			searchRadiusCheck = <div className="w-row">
									<div className="w-col w-col-4">
										<label className="u-form-label n1">
											{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_SEARCH_RADIUS_CHECK"})}:
										</label>									
									</div>
									<div className="w-col w-col-8">
										<OptionsSelector view={OptionsSelectorView.CHECK}
											language={this.props.language}
											options={optionsFactory.buildOptions({
														language: this.props.language,
														id: "useRadius",
														options: [PostsFilterPrms.postFilterUseRadius]})}
											onOptionChanged={this.handleUseRadiusChecked}
											defaultOptionsState={this.state.filter.useRadius}/>
									</div>
								</div>
			if(this.state.filter.useRadius == PostsFilterPrms.postFilterUseRadius) {
				searchRadiusRadar =	<div className="w-row">
										<div className="w-col w-col-4">
											<label className="u-form-label n1">
												{Utils.getStrResource({lang: this.props.language, code: "UI_FLD_SEARCH_RADIUS"})}:
											</label>
										</div>
										<div className="w-col w-col-8">
											<Slider step={config.searchRadiusStep}
												curVal={this.state.filter.radius}
												minVal={config.searchRadiusMin}
												maxVal={config.searchRadiusMax}
												meas={Utils.getStrResource({lang: this.props.language, code: "METER"})}
												onStep={this.handleRadiusChanged}/>
										</div>
									</div>
			}
			searchRadius = <div>{searchRadiusCheck}{searchRadiusRadar}</div>
		}
		//представление фильтра
		return (
			<div>		
				<div className="w-clearfix u-block-underline">
					<a className="u-lnk-norm h1" href="javascript:void(0);" style={aStyle} onClick={this.handleFilterToggleClick}>
						{Utils.getStrResource({lang: this.props.language, code: "UI_BTN_FILTER"})}
					</a>
				</div>
				<div>
					<div className="u-block-filter-add u-block-underline" style={filterToggle}>
						<div className="w-form">
							<form className="u-form-body">		
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
														options: postObjType})}
											onOptionChanged={this.handleSelectedApartType}
											defaultOptionsState={this.state.filter.apartType}
											appendEmptyOption={true}
											emptyOptionLabel={Utils.makeEmptyOptionLabel(Utils.getStrResource({lang: this.props.language, code: "MD_ITM_APARTMENTTYPE"}))}/>
									</div>
								</div>													
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
											defaultOptionsState={[this.state.filter.price]}/>				
									</div>
								</div>
								{searchRadius}
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
});