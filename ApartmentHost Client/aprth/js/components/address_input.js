/*
	Поле ввода адреса
*/
var AddressInput = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			value: "" //значение
		};
	},
	//установка значений состояния
	initState: function (props) {
		this.setState({value: props.value});
		var autocomplete = new google.maps.places.Autocomplete(React.findDOMNode(this.refs[this.props.name]));
		google.maps.event.addListener(autocomplete, "place_changed", Utils.bind(function() {
			var address = "";
			var place = autocomplete.getPlace();
			if(place) {
				if(place.formatted_address) {
					address = place.formatted_address					
				}
			} else {
				address = $("#" + this.props.name).val();
			}
			this.handleChange({target: {id: this.props.name, value: address}});			
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
	handleChange: function (e) {
		this.setState({value: e.target.value});
		if((this.props.onAddressChanged)&&(Utils.isFunction(this.props.onAddressChanged))) {
			this.props.onAddressChanged(e.target.value);
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
				value={this.state.value}
				placeholder={plh}
				onChange={this.handleChange}/>	
		);
	}
});