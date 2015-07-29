/*
	Карта
*/
//режимы отображения данны
var mapModes = {
	modeSignle: "post", //режим отображения одного объекта
	modeGroup: "search" //режим отображения группы объектов
}
//карта
var Map = React.createClass({
	//состояние
	getInitialState: function () {
		return {
			latitude: "", //широта маркера
			longitude: "", //долгота маркера
			swLat: "", //широта ЮВ угла области поиска
			swLong: "", //долгота ЮВ угла области поиска
			neLat: "", //широта СЗ угла области поиска
			neLong: "", //долгота СЗ угла области поиска
			address: "", //адрес маркера
			title: "", //заголовок маркера
			map: {}, //карта
			markers: [], //маркеры
			radius: 0, //радиус поиска
			centerIsChanged: false //признак изменения центра карты
		};
	},
	//установка маркера и центра карты
	setMapCenterAndMarkers: function () {
		var point = new google.maps.LatLng(this.state.latitude, this.state.longitude);
		if(this.props.mode == mapModes.modeSignle) {
			var marker = new google.maps.Marker({
				position: point,
				map: this.state.map,
				title: this.state.title
			});
		}
		if(this.props.mode == mapModes.modeGroup) {
			if((this.state.markers)&&(Array.isArray(this.state.markers))) {
				this.state.markers.map(function (mrk, i) {					
					if((mrk.latitude)&&(mrk.longitude)&&(mrk.title)&&(mrk.content)) {
						var p = new google.maps.LatLng(mrk.latitude, mrk.longitude);
						var m = new google.maps.Marker({
							position: p,
							map: this.state.map,
							title: mrk.title
						});
						var infowindow = new google.maps.InfoWindow({
							content: mrk.content
						});
						google.maps.event.addListener(m, "click", Utils.bind(function() {
							infowindow.open(this.state.map, m);
						}, this));
					}
				}, this);
			}
			if((this.state.radius)&&(this.state.radius > 0)) {
				var cO = {
					fillColor: "#FF0000",
					fillOpacity: 0.35,
					strokeWeight: 0,
					map: this.state.map,
					center: point,
					radius: this.state.radius
				};
    			var c = new google.maps.Circle(cO);
			}
		}
		this.setState({centerIsChanged: true}, this.state.map.setCenter(point));
	},
	//инициализация маркера и центра карты
	initMapCenterAndMarkers: function () {
		if(
			((this.state.latitude)&&(this.state.longitude))
			||(this.state.address)
			||((this.state.swLat)&&(this.state.swLong)&&(this.state.neLat)&&(this.state.neLong))
		) {
			if((this.state.latitude)&&(this.state.longitude)) {
				this.setMapCenterAndMarkers();
			} else {
				if((this.state.swLat)&&(this.state.swLong)&&(this.state.neLat)&&(this.state.neLong)) {
					var sw = new google.maps.LatLng(this.state.swLat, this.state.swLong);
					var ne = new google.maps.LatLng(this.state.neLat, this.state.neLong);
					var b = new google.maps.LatLngBounds(sw, ne);
					var r = google.maps.geometry.spherical.computeDistanceBetween(sw, ne, 0) / 2;
					console.log(r);
					this.setState({latitude: b.getCenter().lat(), longitude: b.getCenter().lng(), radius: r}, this.setMapCenterAndMarkers);
				} else {
					var geocoder = new google.maps.Geocoder();
					geocoder.geocode({"address": this.state.address}, Utils.bind(function(results, status) {
						if (status == google.maps.GeocoderStatus.OK) {
							this.setState({latitude: results[0].geometry.location.lat(), longitude: results[0].geometry.location.lng()}, this.setMapCenterAndMarkers);
						} else {
							this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarkers);
						}
					}, this));
				}
			}
		} else {
			this.setState({latitude: config.latitude, longitude: config.longitude}, this.setMapCenterAndMarkers);
		}
	},
	//оповещение родителя о смене центра карты
	notifyParentCenterCange: function () {
		if((this.props.onCenterCange)&&(Utils.isFunction(this.props.onCenterCange))) {
			this.props.onCenterCange(this.state.map.getBounds());
		}
	},
	//обработка завершения перерисовки карты
	handleMapIdle: function () {
		if(this.state.centerIsChanged) {
			this.setState({centerIsChanged: false}, this.notifyParentCenterCange);
		}
	},	
	//установка значений состояния
	initState: function (props) {
		var mapTmp = new google.maps.Map(React.findDOMNode(this.refs.mapCanvas), {zoom: (props.zoom)?props.zoom:15});
		google.maps.event.addListener(mapTmp, "idle", Utils.bind(function () {this.handleMapIdle();}, this));
		this.setState({
			latitude: props.latitude,
			longitude: props.longitude,
			swLat: props.swLat,
			swLong: props.swLong,
			neLat: props.neLat,
			neLong: props.neLong,
			address: props.address,
			title: props.title,
			map: mapTmp,
			markers: props.markers
		}, this.initMapCenterAndMarkers);
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
			witdh: (this.props.witdh)?this.props.witdh:"100%",
			height: (this.props.height)?this.props.height:"300px"
		}
		//представление
		return (
			<div ref="mapCanvas" style={mapStyle}></div>	
		);
	}
});