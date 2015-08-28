/*
	Форма поиска объявлений
*/
//Поиск объявлений
var PostsFindForm = React.createClass({
	//состояние поиска
	getInitialState: function () {
		return {
			noAddressFilterSpecified: false, //флаг отсуствия фильтра по адресу
			noDateFromFilterSpecified: false, //флаг отсуствия фильтра по дате начала периода бронирования
			noDateToFilterSpecified: false, //флаг отсуствия фильтра по дате окончания периода бронирования
			find: { //параметры поиска
				latitude: "", //широта выбранной точки поиска
				longitude: "", //долгота выбранной точки поиска
				address: "", //адрес жилья		
				dFrom: "", //дата начала периода бронирования
				dTo: "", //дата коночания периода бронирования
				sex: "" //пол постояльца
			}
		};
	},
	//оповещение родителя о смене данных поиска
	notifyParent: function () {
		if((this.props.onFindChange)&&(Utils.isFunction(this.props.onFindChange))) {
			this.props.onFindChange(this.state.find);
		}
	},
	//оповещение родителя о необходимости поиска
	notifyParentFind: function () {
		if((this.props.onFind)&&(Utils.isFunction(this.props.onFind))) {
			this.props.onFind(this.state.find);
		}
	},
	//оповещение родителя о необходимости сброка параметров поиска
	notifyParentFindClear: function () {
		if((this.props.onFindClear)&&(Utils.isFunction(this.props.onFindClear))) {
			this.props.onFindClear();
		}
	},
	//ввод адреса
	handleAddrChange: function (val) {
		var tmp = {};
		_.extend(tmp, this.state.find);
		tmp.latitude = val.latitude;
		tmp.longitude = val.longitude;		
		tmp.address = val.address;
		this.setState({find: tmp}, this.notifyParent);
	},	
	//выбор пола
	handleSelectedSex: function (sex) {
		var tmp = {};
		_.extend(tmp, this.state.find);
		tmp.sex = sex;
		this.setState({find: tmp}, this.notifyParent);
	},
	//выбор даты в календаре
	handleDatePicked: function (datePickerName, date) {
		var tmp = {};
		_.extend(tmp, this.state.find);
		tmp[datePickerName] = (date)?date:"";
		this.setState({find: tmp}, this.notifyParent);
	},	
	//обработка нажатия на кнопку "Поиск"
	handleFindClick: function () {
		var canFilter = true;
		if(!this.state.find.address) {
			this.setState({noAddressFilterSpecified: true});
			canFilter = false;
		} else {
			this.setState({noAddressFilterSpecified: false});
		}
		if((!this.state.find.dFrom)&&(this.state.find.dTo)) {
			this.setState({noDateFromFilterSpecified: true, noDateToFilterSpecified: false});
			canFilter = false;
		} else {
			this.setState({noDateFromFilterSpecified: false, noDateToFilterSpecified: false});
		}
		if((this.state.find.dFrom)&&(this.state.find.dTo)) {
			var dF = new Date(this.state.find.dFrom);
			var dT = new Date(this.state.find.dTo);
			if(dF.getTime() > dT.getTime()) {
				this.setState({noDateFromFilterSpecified: true, noDateToFilterSpecified: true});
				canFilter = false;
			} else {
				this.setState({noDateFromFilterSpecified: false, noDateToFilterSpecified: false});
			}
		}
		if(canFilter) {
			var tmp = {};
			_.extend(tmp, this.state.find);
			if((tmp.dFrom)&&(!tmp.dTo)) {
				var tmpD = new Date(this.state.find.dFrom);
				tmp.dTo = tmpD.addDays(1);				
			}
			if((tmp.address)&&((!tmp.latitude)||(!tmp.longitude))) {
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({"address": tmp.address}, Utils.bind(function (results, status) {				
					if (status == google.maps.GeocoderStatus.OK) {
						tmp.latitude = results[0].geometry.location.lat();
						tmp.longitude = results[0].geometry.location.lng();
					}
					this.setState({find: tmp}, this.notifyParentFind);			
				}, this));			
			} else {
				this.setState({find: tmp}, this.notifyParentFind);			
			}
		}
	},
	//обработка нажатия кнопки "Очистить"
	handleClearClick: function () {
		var tmp = {};
		_.extend(tmp, this.state.find);
		tmp.latitude = "";
		tmp.longitude = "";
		tmp.address = "";
		tmp.dFrom =  "";
		tmp.dTo =  "";
		tmp.sex = "";
		this.setState({find: tmp}, this.notifyParentFindClear);
	},
	//инициализация состояния
	initState: function (props) {
		var tmpFind = {};
		_.extend(tmpFind, this.state.find);
		tmpFind.latitude = props.latitude;
		tmpFind.longitude = props.longitude;
		tmpFind.address = props.address;
		tmpFind.dFrom = props.dFrom;
		tmpFind.dTo = props.dTo;
		tmpFind.sex = props.sex;
		this.setState({find: tmpFind});
	},
	//инициализация формы поиска
	componentDidMount: function () {
		this.initState(this.props);
	},
	//обновление параметров формы поиска
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);
	},
	//генерация представления формы поиска
	render: function () {
		//дополнительные стили
		var lblStale = {paddingLeft: "5px"};
		var aStyle = {textDecoration: "none"};		
		var cAdrInput = React.addons.classSet;
		var classesAdrInput = cAdrInput({
			"w-input": true,
			"u-form-field": true,
			"rel2": true,
			"address": true,
			"has-error": this.state.noAddressFilterSpecified	
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
		//представление поиска
		return (
			<div>
				<div className="w-form u-form-wrapper">
					<form className="w-clearfix u-form-body">
						<h3>{Utils.getStrResource({lang: this.props.language, code: "UI_TITLE_ADVERTS_FILER"})}</h3>
						<AddressInput classes={classesAdrInput}
							name="address"
							value={this.state.find.address}
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_FILTER_ADRESS"})}
							onAddressChanged={this.handleAddrChange}/>
						<Calendar name="dFrom" 
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_FROM"})}
							defaultValue={(this.state.find.dFrom)?(new Date(this.state.find.dFrom)):""}
							onDatePicked={this.handleDatePicked}
							language={this.props.language}
							inputClasses={classesDateInputFrom}/>
						<Calendar name="dTo" 
							placeholder={Utils.getStrResource({lang: this.props.language, code: "UI_PLH_DATE_TO"})}
							defaultValue={(this.state.find.dTo)?(new Date(this.state.find.dTo)):""}
							onDatePicked={this.handleDatePicked}
							language={this.props.language}
							inputClasses={classesDateInputTo}/>		
						<OptionsSelector view={OptionsSelectorView.SELECT}
							classes="w-select u-form-field rel2"
							language={this.props.language}
							options={optionsFactory.buildOptions({
										language: this.props.language, 
										id: "sex",
										options: priceCats})}
							onOptionChanged={this.handleSelectedSex}
							defaultOptionsState={this.state.find.sex}
							appendEmptyOption={true}
							emptyOptionLabel={Utils.makeEmptyOptionLabel(Utils.getStrResource({lang: this.props.language, code: "MD_ITM_GUEST_SEX"}))}/>
						<input className="w-button u-btn-primary nofloat"
							type="button"
							onClick={this.handleFindClick}
							value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_SEARCH"})}/>
						<input className="w-button u-btn-regular" style={{display: "none"}}
							type="button"
							onClick={this.handleClearClick}
							value={Utils.getStrResource({lang: this.props.language, code: "UI_BTN_CLEAR"})}/>
					</form>					
				</div>				
			</div>
		);
	}
});