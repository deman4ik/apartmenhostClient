/*
	Карта
*/
var Map = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			latitude: "", //широта маркера
			longitude: "", //долгота маркера
			address: "", //адрес маркера
			title: "", //заголовок маркера
			map: {} //карта
		};
	},
	//установка маркера и центра карты
	setMapCenterAndMarker: function () {
		var point = new google.maps.LatLng(this.state.latitude, this.state.longitude);
		var marker = new google.maps.Marker({
			position: point,
			map: this.state.map,
			title: this.state.title
		});
		this.state.map.setCenter(point);
	},
	//инициализация маркера и центра карты
	initMapCenterAndMarker: function () {
		if(((this.state.latitude)&&(this.state.longitude))||(this.state.address)) {
			if((this.state.latitude)&&(this.state.longitude)) {
				this.setMapCenterAndMarker();
			} else {				
				var geocoder = new google.maps.Geocoder();
				geocoder.geocode({"address": this.state.address}, Utils.bind(function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						this.setState({latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()}, this.setMapCenterAndMarker);
					} else {
						this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarker);
					}
				}, this));				
			}
		} else {
			this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarker);
		}
	},
	//установка значений состояния
	initState: function (props) {		
		var mapTmp = new google.maps.Map(React.findDOMNode(this.refs.mapCanvas), {zoom: 15});
		this.setState({
			latitude: props.latitude,
			longitude: props.longitude,
			address: props.address,
			title: props.title,
			map: mapTmp
		}, this.initMapCenterAndMarker);
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
	//генерация представления
	render: function () {
		//дополнительные стили карты
		mapStyle = {
			witdh: "100%",
			height: "300px"
		}
		//представление
		return (
			<div ref="mapCanvas" style={mapStyle}></div>	
		);
	}
});