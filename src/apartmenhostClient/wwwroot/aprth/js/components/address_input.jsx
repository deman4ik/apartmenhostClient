/*
	Поле ввода адреса
*/
var AddressInput = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			latitude: "", //широта
			longitude: "", //долгота
			address: "" //адрес
		};
	},
	//установка значений состояния
	initState: function (props) {
		this.setState({address: props.value});
		var autocomplete = new google.maps.places.Autocomplete(React.findDOMNode(this.refs[this.props.name]));
		google.maps.event.addListener(autocomplete, "place_changed", Utils.bind(function () {			
			this.handlePlacePick(autocomplete.getPlace());						
		}, this));
	},
	//инициализация
	componentDidMount: function () {
		this.initState(this.props);
	},
	//завершение генерации/обновления представления
	componentDidUpdate: function (prevProps, prevState) {		
	},
	//обновление параметров
	componentWillReceiveProps: function (newProps) {
		this.initState(newProps);
	},
	//отработка выбора точки из подсказки
	handlePlacePick: function (place) {
		var tmp = {address: "", latitude: "", longitude: ""}
		if((place)&&(place.geometry)) {
			tmp.address = $("#" + this.props.name).val();
			tmp.latitude = place.geometry.location.lat();
			tmp.longitude = place.geometry.location.lng();
			this.setState({address: tmp.address, latitude: tmp.latitude, longitude: tmp.longitude}, this.notifyParent);
		}
	},
	//отработка ручного изменения адреса
	handleChange: function (e) {
		this.setState({address: e.target.value, latitude: "", longitude: ""}, this.notifyParent);
	},
	//отработка потери фокуса
	handleBlur: function () {		
	},
	//оповещение родителя о смене состояния адреса
	notifyParent: function () {
		if((this.props.onAddressChanged)&&(Utils.isFunction(this.props.onAddressChanged))) {
			this.props.onAddressChanged({
				address: this.state.address, 
				latitude: this.state.latitude, 
				longitude: this.state.longitude
			});
		}
	},
	//генерация представления
	render: function () {
		//классы стилей
		var clName;
		if(this.props.classes) {
			clName = this.props.classes;
		} else {
			clName = "w-input";
		}
		//плэйсхолдер
		var plh;
		if(this.props.placeholder) {
			plh = this.props.placeholder;
		}
		//представление
		return (
			<input type="text"
				className={clName}
				id={this.props.name}
				ref={this.props.name}
				value={this.state.address}
				placeholder={plh}
				onChange={this.handleChange}
				onBlur={this.handleBlur}/>	
		);
	}
});